import { Injectable, Inject, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Report } from './entities/report.entity';
import { ReportType } from './constants/report-types.enum';
import { ReportParamsDto } from './dto/report-params.dto';
import { MainReportGenerator } from './generators/main-report.generator';
import { QuotationReportGenerator } from './generators/quotation-report.generator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { UserDailyReportGenerator } from './generators/user-daily-report.generator';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { User } from '../user/entities/user.entity';
import { CommunicationService } from '../communication/communication.service';
import { EmailType } from '../lib/enums/email.enums';
import { Cron } from '@nestjs/schedule';
import { LiveOverviewReportGenerator } from './generators/live-overview-report.generator';
import { MapDataReportGenerator } from './generators/map-data-report.generator';

@Injectable()
export class ReportsService implements OnModuleInit {
	private readonly logger = new Logger(ReportsService.name);
	private readonly CACHE_PREFIX = 'reports:';
	private readonly LIVE_OVERVIEW_CACHE_TTL = 120; // 2 minutes
	private readonly CACHE_TTL: number;
	private reportCache = new Map<string, any>();

	constructor(
		@InjectRepository(Report)
		private reportRepository: Repository<Report>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private mainReportGenerator: MainReportGenerator,
		private quotationReportGenerator: QuotationReportGenerator,
		private userDailyReportGenerator: UserDailyReportGenerator,
		@Inject(CACHE_MANAGER)
		private cacheManager: Cache,
		private readonly configService: ConfigService,
		private eventEmitter: EventEmitter2,
		private communicationService: CommunicationService,
		private readonly liveOverviewReportGenerator: LiveOverviewReportGenerator,
		private readonly mapDataReportGenerator: MapDataReportGenerator,
	) {
		this.CACHE_TTL = this.configService.get<number>('CACHE_EXPIRATION_TIME') || 300;
	}

	onModuleInit() {
		this.logger.log('Reports service initialized');
	}

	// Run every day at 18:00 (6:00 PM)
	@Cron('0 0 18 * * *')
	async generateEndOfDayReports() {
		try {
			this.logger.log('Starting automated end-of-day report generation');
			
			// Find users with active attendance records (who haven't checked out yet)
			const queryBuilder = this.userRepository
				.createQueryBuilder('user')
				.innerJoinAndSelect('user.organisation', 'organisation')
				.innerJoin(
					'attendance', 
					'attendance', 
					'attendance.ownerUid = user.uid AND (attendance.status = :statusPresent OR attendance.status = :statusBreak) AND attendance.checkOut IS NULL',
					{ statusPresent: 'present', statusBreak: 'on break' }
				)
				.where('user.email IS NOT NULL');
				
			const usersWithActiveShifts = await queryBuilder.getMany();
			
			this.logger.log(`Found ${usersWithActiveShifts.length} users with active shifts for daily reports`);
			
			if (usersWithActiveShifts.length === 0) {
				this.logger.log('No users with active shifts found, skipping report generation');
				return;
			}
			
			// Generate reports only for users with active shifts
			const results = await Promise.allSettled(
				usersWithActiveShifts.map(async (user) => {
					try {
						if (!user.organisation) {
							return { userId: user.uid, success: false, reason: 'No organisation found' };
						}
						
						// Check if report already generated today for this user
						const today = new Date();
						today.setHours(0, 0, 0, 0);
						
						const existingReport = await this.reportRepository.findOne({
							where: {
								owner: { uid: user.uid },
								reportType: ReportType.USER_DAILY,
								generatedAt: MoreThanOrEqual(today),
							},
						});
						
						if (existingReport) {
							return { 
								userId: user.uid, 
								success: false, 
								reason: 'Report already generated today',
							};
						}
						
						const params: ReportParamsDto = {
							type: ReportType.USER_DAILY,
							organisationId: user.organisation.uid,
							filters: { userId: user.uid },
						};
						
						await this.generateUserDailyReport(params);
						this.logger.log(`Successfully generated end-of-day report for user ${user.uid} with active shift`);
						return { userId: user.uid, success: true };
					} catch (error) {
						return { 
							userId: user.uid, 
							success: false, 
							reason: error.message,
						};
					}
				}),
			);
			
			// Log results
			const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
			const failed = results.length - successful;
			
			this.logger.log(`End-of-day reports completed: ${successful} successful, ${failed} failed`);
		} catch (error) {
			this.logger.error(`Error during scheduled report generation: ${error.message}`, error.stack);
		}
	}

	private getCacheKey(params: ReportParamsDto): string {
		const { type, organisationId, branchId, dateRange, filters } = params;

		// For quotation reports, include clientId in the cache key
		const clientIdStr = type === ReportType.QUOTATION && filters?.clientId ? `_client${filters.clientId}` : '';

		// For live overview reports, include force refresh flag in key if present
		const forceRefreshStr = type === ReportType.LIVE_OVERVIEW && filters?.forceFresh ? '_fresh' : '';

		const dateStr = dateRange ? `_${dateRange.start.toISOString()}_${dateRange.end.toISOString()}` : '';

		return `${this.CACHE_PREFIX}${type}_org${organisationId}${
			branchId ? `_branch${branchId}` : ''
		}${clientIdStr}${forceRefreshStr}${dateStr}`;
	}

	async create(createReportDto: CreateReportDto) {
		return 'This action adds a new report';
	}

	async findAll() {
		return this.reportRepository.find();
	}

	async findOne(id: number) {
		return this.reportRepository.findOne({
			where: { uid: id },
			relations: ['organisation', 'branch', 'owner'],
		});
	}

	async update(id: number, updateReportDto: UpdateReportDto) {
		return `This action updates a #${id} report`;
	}

	async remove(id: number) {
		return this.reportRepository.delete(id);
	}

	@OnEvent('daily-report')
	async handleDailyReport(payload: { userId: number }) {
		try {
			if (!payload || !payload.userId) {
				this.logger.error('Invalid payload for daily report event');
				return;
			}

			const { userId } = payload;
			this.logger.log(`Handling daily report event for user ${userId}`);

			// Get user to find their organization
			const user = await this.userRepository.findOne({
				where: { uid: userId },
				relations: ['organisation'],
			});

			if (!user || !user.organisation) {
				this.logger.error(`User ${userId} not found or has no organization`);
				return;
			}

			// Create report parameters
			const params: ReportParamsDto = {
				type: ReportType.USER_DAILY,
				organisationId: user.organisation.uid,
				filters: {
					userId: userId,
					// Use default date range (today)
				},
			};

			// Generate and save the report
			await this.generateUserDailyReport(params);

			this.logger.log(`Successfully generated daily report for user ${userId}`);
		} catch (error) {
			this.logger.error(`Error handling daily report event: ${error.message}`, error.stack);
		}
	}

	async generateUserDailyReport(params: ReportParamsDto): Promise<Report> {
		try {
			const { userId } = params.filters || {};

			if (!userId) {
				throw new Error('User ID is required for generating a daily user report');
			}

			// Get user data
			const user = await this.userRepository.findOne({
				where: { uid: userId },
				relations: ['organisation'],
			});

			if (!user) {
				throw new NotFoundException(`User with ID ${userId} not found`);
			}

			// Generate report data
			const reportData = await this.userDailyReportGenerator.generate(params);

			// Create a new report record
			const newReport = new Report();
			newReport.name = `Daily Report - ${user.name} - ${new Date().toISOString().split('T')[0]}`;
			newReport.description = `Daily activity report for ${user.name}`;
			newReport.reportType = ReportType.USER_DAILY;
			newReport.filters = params.filters;
			newReport.reportData = reportData;
			newReport.generatedAt = new Date();
			newReport.owner = user;
			newReport.organisation = user.organisation;

			// Save the report
			const savedReport = await this.reportRepository.save(newReport);

			// Send email directly to ensure delivery
			await this.sendUserDailyReportEmail(user.uid, reportData.emailData).catch((error) => {
				this.logger.error(`Failed to send email directly: ${error.message}`, error.stack);
				// Update report with error info
				newReport.notes = `Email delivery attempted directly: ${error.message}`;
				this.reportRepository
					.save(newReport)
					.catch((err) => this.logger.error(`Failed to update report with notes: ${err.message}`));
			});

			// Also emit event as a backup mechanism
			this.eventEmitter.emit('report.generated', {
				reportType: ReportType.USER_DAILY,
				reportId: savedReport.uid,
				userId: user.uid,
				emailData: reportData.emailData,
			});

			this.logger.log(`Daily report generated and email sending initiated for user ${userId}`);

			return savedReport;
		} catch (error) {
			this.logger.error(`Error generating user daily report: ${error.message}`, error.stack);
			throw error;
		}
	}

	async generateReport(params: ReportParamsDto, currentUser: any): Promise<Record<string, any>> {
		// Determine appropriate cache TTL based on report type
		const cacheTtl = params.type === ReportType.LIVE_OVERVIEW ? this.LIVE_OVERVIEW_CACHE_TTL : this.CACHE_TTL;
		
		// Check if this is a forced fresh request (for live overview)
		const forceFresh = params.type === ReportType.LIVE_OVERVIEW && params.filters?.forceFresh === true;
		
		// Check cache first (skip if forceFresh is true)
		const cacheKey = this.getCacheKey(params);
		
		if (!forceFresh) {
			const cachedReport = await this.cacheManager.get<Record<string, any>>(cacheKey);
			
			if (cachedReport) {
				this.logger.log(`Serving ${params.type} report from cache for org ${params.organisationId}`);
				return {
					...cachedReport,
					fromCache: true,
					cachedAt: cachedReport.generatedAt,
					currentTime: new Date().toISOString(),
				};
			}
		}

		// Log cache miss or forced refresh
		if (forceFresh) {
			this.logger.log(`Force refreshing ${params.type} report for org ${params.organisationId}`);
		} else {
			this.logger.log(`Cache miss for ${params.type} report for org ${params.organisationId}`);
		}

		// Generate report data based on type
		let reportData: Record<string, any>;

		switch (params.type) {
			case ReportType.MAIN:
				reportData = await this.mainReportGenerator.generate(params);
				break;
			case ReportType.QUOTATION:
				reportData = await this.quotationReportGenerator.generate(params);
				break;
			case ReportType.USER_DAILY:
				reportData = await this.userDailyReportGenerator.generate(params);
				break;
			case ReportType.LIVE_OVERVIEW:
				reportData = await this.liveOverviewReportGenerator.generate(params);
				break;
			case ReportType.USER:
				// Will be implemented later
				throw new Error('User report type not implemented yet');
			case ReportType.SHIFT:
				// Will be implemented later
				throw new Error('Shift report type not implemented yet');
			default:
				throw new Error(`Unknown report type: ${params.type}`);
		}

		// Prepare the report response with metadata
		const report = {
			name: params.name || `${params.type} Report`,
			type: params.type,
			generatedAt: new Date(),
			filters: {
				organisationId: params.organisationId,
				branchId: params.branchId,
				dateRange: params.dateRange,
				...params.filters, // Include any additional filters
			},
			generatedBy: {
				uid: currentUser.uid,
			},
			...reportData,
		};

		// Cache the report with appropriate TTL
		await this.cacheManager.set(cacheKey, report, cacheTtl);

		// Return the report data directly without saving to database
		return report;
	}

	@OnEvent('report.generated')
	async handleReportGenerated(payload: { reportType: ReportType; reportId: number; userId: number; emailData: any }) {
		try {
			this.logger.log(
				`Handling report generated event for report ${payload.reportId}, type ${payload.reportType}`,
			);

			if (payload.reportType === ReportType.USER_DAILY) {
				await this.sendUserDailyReportEmail(payload.userId, payload.emailData);
			}
		} catch (error) {
			this.logger.error(`Error handling report generated event: ${error.message}`, error.stack);
		}
	}

	private async sendUserDailyReportEmail(userId: number, emailData: any) {
		try {
			// Get user with full profile
			const user = await this.userRepository.findOne({
				where: { uid: userId },
				relations: ['organisation'],
			});

			if (!user || !user.email) {
				this.logger.error(`Cannot send email for user ${userId}: user not found or has no email`);
				return;
			}

			// Ensure emailData has the correct format
			if (!emailData || !emailData.name || !emailData.date || !emailData.metrics) {
				this.logger.error(`Invalid email data format for user ${userId}`);
				throw new Error('Invalid email data format');
			}

			// Validate required fields for the email template
			if (!emailData.metrics.attendance) {
				emailData.metrics.attendance = {
					status: 'NOT_PRESENT',
					totalHours: 0,
				};
			}

			// Make sure all required fields are present
			if (!emailData.metrics.totalQuotations) {
				emailData.metrics.totalQuotations = 0;
			}

			if (!emailData.metrics.totalRevenue) {
				emailData.metrics.totalRevenue = 'R0.00';
			}

			// Create tracking section if missing
			if (!emailData.tracking) {
				emailData.tracking = {
					totalDistance: '0 km',
					locations: [],
					averageTimePerLocation: '0 min',
				};
			}

			// Log email preparation
			this.logger.log(`Preparing daily report email for user ${userId} (${user.email})`);

			// Use a direct cast to any to work around typing issues
			const emailService = this.communicationService as any;
			try {
				const result = await emailService.sendEmail(EmailType.USER_DAILY_REPORT, [user.email], emailData);

				if (result && result.success) {
					this.logger.log(`Daily report email sent successfully to user ${userId} (${user.email})`);
				} else {
					this.logger.warn(`Email service returned non-success result for user ${userId}`);
				}
			} catch (emailError) {
				// Catch and log email service specific errors without throwing
				this.logger.error(`Email service error for user ${userId}: ${emailError.message}`, emailError.stack);
			}
		} catch (error) {
			this.logger.error(`Error sending daily report email: ${error.message}`, error.stack);
			// Record the error in the report record
			try {
				const report = await this.reportRepository.findOne({
					where: { owner: { uid: userId }, reportType: ReportType.USER_DAILY },
					order: { generatedAt: 'DESC' },
				});

				if (report) {
					report.notes = `Email delivery failed: ${error.message}`;
					await this.reportRepository.save(report);
				}
			} catch (dbError) {
				this.logger.error(`Failed to update report record: ${dbError.message}`);
			}
		}
	}

	/**
	 * Clears all cached reports for a specific organization
	 * @param organisationId The organization ID
	 * @param reportType Optional specific report type to clear
	 * @returns Number of cache keys cleared
	 */
	async clearOrganizationReportCache(organisationId: number, reportType?: ReportType): Promise<number> {
		try {
			const cacheKeyPattern = reportType 
				? `${this.CACHE_PREFIX}${reportType}_org${organisationId}*` 
				: `${this.CACHE_PREFIX}*_org${organisationId}*`;
				
			// For redis-based cache this would use a scan/delete pattern
			// For the built-in cache we can only delete specific keys
			// Since we don't know what cache implementation is being used, we'll log this
			this.logger.log(`Clearing organization cache with pattern: ${cacheKeyPattern}`);
			
			// For now, we'll specifically clear the live overview cache
			if (!reportType || reportType === ReportType.LIVE_OVERVIEW) {
				const liveOverviewKey = `${this.CACHE_PREFIX}${ReportType.LIVE_OVERVIEW}_org${organisationId}`;
				await this.cacheManager.del(liveOverviewKey);
				
				// If branch ID was specified, clear those too
				const branchIds = await this.getBranchIdsForOrganization(organisationId);
				for (const branchId of branchIds) {
					const branchKey = `${this.CACHE_PREFIX}${ReportType.LIVE_OVERVIEW}_org${organisationId}_branch${branchId}`;
					await this.cacheManager.del(branchKey);
				}
				
				return 1 + branchIds.length;
			}
			
			return 0;
		} catch (error) {
			this.logger.error(`Error clearing organization cache: ${error.message}`, error.stack);
			return 0;
		}
	}

	/**
	 * Gets all branch IDs for an organization
	 * @param organisationId The organization ID
	 * @returns Array of branch IDs
	 */
	private async getBranchIdsForOrganization(organisationId: number): Promise<number[]> {
		try {
			// This assumes there's a branch repository with a findByOrganisation method
			const branches = await this.reportRepository
				.createQueryBuilder('r')
				.select('DISTINCT r.branchUid', 'branchId')
				.where('r.organisationUid = :organisationId', { organisationId })
				.andWhere('r.branchUid IS NOT NULL')
				.getRawMany();
				
			return branches.map(b => b.branchId);
		} catch (error) {
			this.logger.error(`Error getting branch IDs: ${error.message}`, error.stack);
			return [];
		}
	}

	// Event handlers for cache invalidation
	@OnEvent('task.created')
	@OnEvent('task.updated')
	@OnEvent('task.deleted')
	async handleTaskChange(payload: { organisationId: number; branchId?: number }) {
		if (!payload || !payload.organisationId) return;
		await this.clearOrganizationReportCache(payload.organisationId, ReportType.LIVE_OVERVIEW);
		this.logger.log(`Cleared live overview cache due to task change in org ${payload.organisationId}`);
	}

	@OnEvent('lead.created')
	@OnEvent('lead.updated')
	@OnEvent('lead.deleted')
	async handleLeadChange(payload: { organisationId: number; branchId?: number }) {
		if (!payload || !payload.organisationId) return;
		await this.clearOrganizationReportCache(payload.organisationId, ReportType.LIVE_OVERVIEW);
		this.logger.log(`Cleared live overview cache due to lead change in org ${payload.organisationId}`);
	}

	@OnEvent('quotation.created')
	@OnEvent('quotation.updated')
	@OnEvent('quotation.deleted')
	async handleQuotationChange(payload: { organisationId: number; branchId?: number }) {
		if (!payload || !payload.organisationId) return;
		await this.clearOrganizationReportCache(payload.organisationId, ReportType.LIVE_OVERVIEW);
		this.logger.log(`Cleared live overview cache due to quotation change in org ${payload.organisationId}`);
	}

	/* ---------------------------------------------------------
	 * MAP-DATA helper (live map screen)
	 * -------------------------------------------------------*/
	async generateMapData(params: { organisationId: number; branchId?: number }): Promise<any> {
		const cacheKey = `${this.CACHE_PREFIX}mapdata_org${params.organisationId}_${params.branchId || 'all'}`;

		// Try cache first
		const cached = await this.cacheManager.get(cacheKey);
		if (cached) {
			return cached;
		}

		const data = await this.mapDataReportGenerator.generate(params);

		// Basic summary counts to match previous response structure
		const summary = {
			totalWorkers: data.workers.length,
			totalClients: data.clients.length,
			totalCompetitors: data.competitors.length,
			totalQuotations: data.quotations.length,
		};

		const finalPayload = { data, summary };

		await this.cacheManager.set(cacheKey, finalPayload, this.CACHE_TTL);

		return finalPayload;
	}
}
