import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AppService {
	private readonly logger = new Logger(AppService.name);
	private healthCheckRunning = false;

	constructor(
		@InjectDataSource()
		private dataSource: DataSource,
	) {}

	getHello(): string {
		return 'Hello World!';
	}

	/**
	 * Database health check - runs every 5 minutes
	 */
	@Cron('*/5 * * * *')
	async checkDatabaseHealth(): Promise<void> {
		// Prevent overlapping health checks
		if (this.healthCheckRunning) {
			this.logger.warn('Health check already running, skipping...');
			return;
		}

		this.healthCheckRunning = true;
		
		try {
			if (!this.dataSource.isInitialized) {
				this.logger.warn('Database connection not initialized, attempting to initialize...');
				await this.initializeDatabase();
				return;
			}

			// Simple health check query with timeout
			const startTime = Date.now();
			await Promise.race([
				this.dataSource.query('SELECT 1 as health_check'),
				new Promise((_, reject) => 
					setTimeout(() => reject(new Error('Health check timeout')), 5000)
				)
			]);
			
			const duration = Date.now() - startTime;
			this.logger.debug(`Database health check passed in ${duration}ms`);
			
		} catch (error) {
			this.logger.error(`Database health check failed: ${error.message}`);
			
			// Handle different types of connection errors
			await this.handleConnectionError(error);
			
		} finally {
			this.healthCheckRunning = false;
		}
	}

	/**
	 * Handle database connection errors with appropriate recovery
	 */
	private async handleConnectionError(error: any): Promise<void> {
		const errorMessage = error.message?.toLowerCase() || '';
		
		if (errorMessage.includes('pool is closed') || 
			errorMessage.includes('connection lost') || 
			errorMessage.includes('econnreset')) {
			
			this.logger.warn('Pool connection issue detected, attempting recovery...');
			await this.recoverDatabaseConnection();
			
		} else if (errorMessage.includes('timeout')) {
			this.logger.warn('Database timeout detected, connection may be slow');
			
		} else {
			this.logger.error('Unknown database error:', error);
		}
	}

	/**
	 * Attempt to recover database connection
	 */
	private async recoverDatabaseConnection(): Promise<void> {
		try {
			this.logger.log('Starting database connection recovery...');
			
			// Destroy existing connection if possible
			if (this.dataSource.isInitialized) {
				await this.dataSource.destroy();
				this.logger.log('Existing connection destroyed');
			}
			
			// Wait a moment before reconnecting
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			// Re-initialize the connection
			await this.initializeDatabase();
			
		} catch (recoveryError) {
			this.logger.error(`Database recovery failed: ${recoveryError.message}`);
		}
	}

	/**
	 * Initialize database connection
	 */
	private async initializeDatabase(): Promise<void> {
		try {
			await this.dataSource.initialize();
			this.logger.log('Database connection initialized successfully');
		} catch (initError) {
			this.logger.error(`Database initialization failed: ${initError.message}`);
			throw initError;
		}
	}

	/**
	 * Get database connection status
	 */
	getDatabaseStatus(): { 
		connected: boolean; 
		initialized: boolean; 
		poolSize?: number;
		activeConnections?: number;
	} {
		try {
			const driver = this.dataSource?.driver as any;
			const pool = driver?.pool;
			
			return {
				connected: this.dataSource?.isInitialized || false,
				initialized: this.dataSource?.isInitialized || false,
				poolSize: pool?.config?.connectionLimit || 'unknown',
				activeConnections: pool?._allConnections?.length || 'unknown',
			};
		} catch (error) {
			return {
				connected: false,
				initialized: false,
			};
		}
	}

	/**
	 * Manual database reconnection endpoint
	 */
	async forceReconnect(): Promise<{ success: boolean; message: string }> {
		try {
			await this.recoverDatabaseConnection();
			return { success: true, message: 'Database reconnection successful' };
		} catch (error) {
			return { success: false, message: `Reconnection failed: ${error.message}` };
		}
	}
}
