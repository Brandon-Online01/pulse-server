import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AppService {
	private readonly logger = new Logger(AppService.name);

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
		try {
			if (!this.dataSource.isInitialized) {
				this.logger.warn('Database connection not initialized');
				return;
			}

			// Simple health check query
			await this.dataSource.query('SELECT 1');
			this.logger.debug('Database health check passed');
		} catch (error) {
			this.logger.error(`Database health check failed: ${error.message}`);
			
			// Try to reconnect if connection is lost
			if (error.message.includes('ECONNRESET') || error.message.includes('Connection lost')) {
				this.logger.log('Attempting to reconnect to database...');
				try {
					if (this.dataSource.isInitialized) {
						await this.dataSource.destroy();
					}
					await this.dataSource.initialize();
					this.logger.log('Database reconnection successful');
				} catch (reconnectError) {
					this.logger.error(`Failed to reconnect to database: ${reconnectError.message}`);
				}
			}
		}
	}

	/**
	 * Get database connection status
	 */
	getDatabaseStatus(): { connected: boolean; initialized: boolean } {
		return {
			connected: this.dataSource?.isInitialized || false,
			initialized: this.dataSource?.isInitialized || false,
		};
	}
}
