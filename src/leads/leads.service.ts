import { Between, Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AccessLevel } from '../lib/enums/user.enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { endOfDay } from 'date-fns';
import { startOfDay } from 'date-fns';
import { NotificationStatus, NotificationType } from '../lib/enums/notification.enums';
import { LeadStatus, LeadTemperature, LeadLifecycleStage, LeadPriority } from '../lib/enums/lead.enums';
import { RewardsService } from '../rewards/rewards.service';
import { XP_VALUES } from '../lib/constants/constants';
import { XP_VALUES_TYPES } from '../lib/constants/constants';
import { PaginatedResponse } from 'src/lib/types/paginated-response';
import { Organisation } from '../organisation/entities/organisation.entity';
import { Branch } from '../branch/entities/branch.entity';
import { User } from '../user/entities/user.entity';
import { CommunicationService } from '../communication/communication.service';
import { ConfigService } from '@nestjs/config';
import { EmailType } from '../lib/enums/email.enums';
import { LeadAssignedToUserData } from '../lib/types/email-templates.types';
import { LeadStatusHistoryEntry } from './entities/lead.entity';
import { UnifiedNotificationService } from '../lib/services/unified-notification.service';
import { NotificationEvent, NotificationPriority } from '../lib/types/unified-notification.types';
import { LeadScoringService } from './lead-scoring.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class LeadsService {
	private readonly logger = new Logger(LeadsService.name);

	constructor(
		@InjectRepository(Lead)
		private leadRepository: Repository<Lead>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private readonly eventEmitter: EventEmitter2,
		private readonly rewardsService: RewardsService,
		private readonly communicationService: CommunicationService,
		private readonly configService: ConfigService,
		private readonly unifiedNotificationService: UnifiedNotificationService,
		private readonly leadScoringService: LeadScoringService,
	) {}

	async create(
		createLeadDto: CreateLeadDto,
		orgId?: number,
		branchId?: number,
	): Promise<{ message: string; data: Lead | null }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			// Create the lead entity
			const lead = this.leadRepository.create(createLeadDto as unknown as Lead);

			// Set organization
			if (orgId) {
				const organisation = { uid: orgId } as Organisation;
				lead.organisation = organisation;
			}

			// Set branch if provided
			if (branchId) {
				const branch = { uid: branchId } as Branch;
				lead.branch = branch;
			}

			// Handle assignees if provided
			if (createLeadDto.assignees?.length) {
				lead.assignees = createLeadDto.assignees.map((assignee) => ({ uid: assignee.uid }));
			} else {
				lead.assignees = [];
			}

			// Set intelligent defaults for new leads
			await this.setIntelligentDefaults(lead);

			const savedLead = await this.leadRepository.save(lead);

			// Populate the lead with full relation data
			const populatedLead = await this.populateLeadRelations(savedLead);

			// EVENT-DRIVEN AUTOMATION: Post-creation actions
			await this.handleLeadCreatedEvents(populatedLead);

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				data: populatedLead,
			};

			return response;
		} catch (error) {
			this.logger.error(`Error creating lead: ${error.message}`, error.stack);
			const response = {
				message: error?.message,
				data: null,
			};

			return response;
		}
	}

	async findAll(
		filters?: {
			status?: LeadStatus;
			search?: string;
			startDate?: Date;
			endDate?: Date;
			temperature?: LeadTemperature;
			minScore?: number;
			maxScore?: number;
		},
		page: number = 1,
		limit: number = 25,
		orgId?: number,
		branchId?: number,
	): Promise<PaginatedResponse<Lead>> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			const queryBuilder = this.leadRepository
				.createQueryBuilder('lead')
				.leftJoinAndSelect('lead.owner', 'owner')
				.leftJoinAndSelect('lead.branch', 'branch')
				.leftJoinAndSelect('lead.organisation', 'organisation')
				.where('lead.isDeleted = :isDeleted', { isDeleted: false })
				.andWhere('organisation.uid = :orgId', { orgId });

			// Add branch filter if provided
			if (branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			if (filters?.status) {
				queryBuilder.andWhere('lead.status = :status', { status: filters.status });
			}

			if (filters?.temperature) {
				queryBuilder.andWhere('lead.temperature = :temperature', { temperature: filters.temperature });
			}

			if (filters?.minScore !== undefined) {
				queryBuilder.andWhere('lead.leadScore >= :minScore', { minScore: filters.minScore });
			}

			if (filters?.maxScore !== undefined) {
				queryBuilder.andWhere('lead.leadScore <= :maxScore', { maxScore: filters.maxScore });
			}

			if (filters?.startDate && filters?.endDate) {
				queryBuilder.andWhere('lead.createdAt BETWEEN :startDate AND :endDate', {
					startDate: filters.startDate,
					endDate: filters.endDate,
				});
			}

			if (filters?.search) {
				queryBuilder.andWhere(
					'(lead.name ILIKE :search OR lead.email ILIKE :search OR lead.phone ILIKE :search OR lead.companyName ILIKE :search OR owner.name ILIKE :search OR owner.surname ILIKE :search)',
					{ search: `%${filters.search}%` },
				);
			}

			queryBuilder
				.skip((page - 1) * limit)
				.take(limit)
				.orderBy('lead.leadScore', 'DESC') // Order by lead score (highest priority first)
				.addOrderBy('lead.createdAt', 'DESC');

			const [leads, total] = await queryBuilder.getManyAndCount();

			if (!leads) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Populate leads with full assignee details
			const populatedLeads = await Promise.all(leads.map((lead) => this.populateLeadRelations(lead)));

			const stats = this.calculateStats(leads);

			return {
				data: populatedLeads,
				meta: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
				},
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				data: [],
				meta: {
					total: 0,
					page,
					limit,
					totalPages: 0,
				},
				message: error?.message,
			};
		}
	}

	async findOne(
		ref: number,
		orgId?: number,
		branchId?: number,
	): Promise<{ lead: Lead | null; message: string; stats: any }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			const whereClause: any = {
				uid: ref,
				isDeleted: false,
				organisation: { uid: orgId },
			};

			if (branchId) {
				whereClause.branch = { uid: branchId };
			}

			const lead = await this.leadRepository.findOne({
				where: whereClause,
				relations: ['owner', 'organisation', 'branch', 'interactions'],
			});

			if (!lead) {
				return {
					lead: null,
					message: process.env.NOT_FOUND_MESSAGE,
					stats: null,
				};
			}

			// Populate the lead with full assignee details
			const populatedLead = await this.populateLeadRelations(lead);

			// Update activity data when lead is viewed
			await this.leadScoringService.updateActivityData(ref);

			const allLeads = await this.leadRepository.find({
				where: {
					isDeleted: false,
					organisation: { uid: orgId },
				},
			});
			const stats = this.calculateStats(allLeads);

			const response = {
				lead: populatedLead,
				message: process.env.SUCCESS_MESSAGE,
				stats,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				lead: null,
				stats: null,
			};

			return response;
		}
	}

	public async leadsByUser(
		ref: number,
		orgId?: number,
		branchId?: number,
	): Promise<{ message: string; leads: Lead[]; stats: any }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			const whereClause: any = {
				owner: { uid: ref },
				isDeleted: false,
				organisation: { uid: orgId },
			};

			if (branchId) {
				whereClause.branch = { uid: branchId };
			}

			const leads = await this.leadRepository.find({
				where: whereClause,
				relations: ['owner', 'organisation', 'branch'],
				order: { leadScore: 'DESC', updatedAt: 'DESC' }, // Order by score and recency
			});

			if (!leads) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Populate all leads with full assignee details
			const populatedLeads = await Promise.all(leads.map((lead) => this.populateLeadRelations(lead)));

			const stats = this.calculateStats(leads);

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				leads: populatedLeads,
				stats,
			};

			return response;
		} catch (error) {
			const response = {
				message: `could not get leads by user - ${error?.message}`,
				leads: null,
				stats: null,
			};

			return response;
		}
	}

	async update(
		ref: number,
		updateLeadDto: UpdateLeadDto,
		orgId?: number,
		branchId?: number,
		userId?: number, // Optionally pass userId performing the update
	): Promise<{ message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			const lead = await this.leadRepository.findOne({
				where: { uid: ref, organisation: { uid: orgId }, branch: { uid: branchId } },
				relations: ['owner', 'organisation', 'branch', 'interactions'],
			});

			if (!lead) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const oldStatus = lead.status;
			const oldTemperature = lead.temperature;
			const oldPriority = lead.priority;
			
			// Ensure changeHistory is treated as an array of LeadStatusHistoryEntry
			const changeHistoryArray: LeadStatusHistoryEntry[] = Array.isArray(lead.changeHistory)
				? lead.changeHistory
				: [];
			const dataToSave: Partial<Lead> = {};

			// Build the data to save, excluding reason/description from UpdateLeadDto that are specific to status change
			for (const key in updateLeadDto) {
				if (key !== 'statusChangeReason' && key !== 'statusChangeDescription' && key !== 'nextStep') {
					dataToSave[key] = updateLeadDto[key];
				}
			}

			// If status is being updated, add a history entry
			if (updateLeadDto.status && updateLeadDto.status !== oldStatus) {
				const newHistoryEntry: LeadStatusHistoryEntry = {
					timestamp: new Date(),
					oldStatus: oldStatus,
					newStatus: updateLeadDto.status,
					reason: updateLeadDto.statusChangeReason,
					description: updateLeadDto.statusChangeDescription,
					nextStep: updateLeadDto.nextStep,
					userId: userId, // User who made the change
				};

				changeHistoryArray.push(newHistoryEntry);
				dataToSave.changeHistory = changeHistoryArray;
			}

			// Handle assignees update specifically
			if (updateLeadDto.assignees) {
				dataToSave.assignees = updateLeadDto.assignees.map((a) => ({ uid: a.uid }));
			} else if (updateLeadDto.hasOwnProperty('assignees')) {
				// If assignees key exists but is empty/null, clear it
				dataToSave.assignees = [];
			}

			// Apply intelligent updates based on data changes
			await this.applyIntelligentUpdates(lead, dataToSave);

			await this.leadRepository.update(ref, dataToSave);

			// EVENT-DRIVEN AUTOMATION: Post-update actions
			const updatedLead = await this.leadRepository.findOne({
				where: { uid: ref },
				relations: ['owner', 'organisation', 'branch', 'interactions']
			});
			
			if (updatedLead) {
				await this.handleLeadUpdatedEvents(updatedLead, {
					statusChanged: oldStatus !== updateLeadDto.status,
					temperatureChanged: oldTemperature !== updateLeadDto.temperature,
					priorityChanged: oldPriority !== updateLeadDto.priority,
					assigneesChanged: !!updateLeadDto.assignees,
				});
			}

			return { message: process.env.SUCCESS_MESSAGE };
		} catch (error) {
			this.logger.error(`Error updating lead ${ref}: ${error.message}`, error.stack);
			return {
				message: error?.message,
			};
		}
	}

	async remove(ref: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			const whereClause: any = {
				uid: ref,
				isDeleted: false,
				organisation: { uid: orgId },
			};

			if (branchId) {
				whereClause.branch = { uid: branchId };
			}

			const lead = await this.leadRepository.findOne({
				where: whereClause,
			});

			if (!lead) {
				return {
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			// Use soft delete by updating isDeleted flag
			await this.leadRepository.update(ref, { isDeleted: true });

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async restore(ref: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			const whereClause: any = {
				uid: ref,
				isDeleted: true,
				organisation: { uid: orgId },
			};

			if (branchId) {
				whereClause.branch = { uid: branchId };
			}

			const lead = await this.leadRepository.findOne({
				where: whereClause,
			});

			if (!lead) {
				return {
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			// Restore by setting isDeleted to false
			await this.leadRepository.update(ref, { isDeleted: false });

			// Recalculate score for restored lead
			await this.leadScoringService.calculateLeadScore(ref);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	/**
	 * AUTOMATED SCORING: Runs every hour to update lead scores
	 */
	@Cron('0 0 * * * *') // Every hour
	async hourlyLeadScoring(): Promise<void> {
		this.logger.log('Starting hourly lead scoring update...');
		
		try {
			// Get leads that need scoring (either never scored or score older than 4 hours)
			const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
			
			const leadsToScore = await this.leadRepository
				.createQueryBuilder('lead')
				.where('lead.isDeleted = false')
				.andWhere(
					'(lead.scoringData IS NULL OR ' +
					'CAST(lead.scoringData->>\'lastCalculated\' AS timestamp) < :fourHoursAgo)',
					{ fourHoursAgo }
				)
				.limit(500) // Process 500 leads per hour to avoid overload
				.getMany();

			this.logger.log(`Processing ${leadsToScore.length} leads for scoring update`);

			let processed = 0;
			for (const lead of leadsToScore) {
				try {
					await this.leadScoringService.calculateLeadScore(lead.uid);
					await this.leadScoringService.updateActivityData(lead.uid);
					
					// Update temperature based on new score
					await this.updateTemperatureBasedOnScore(lead.uid);
					
					processed++;
				} catch (error) {
					this.logger.error(`Failed to process lead ${lead.uid}: ${error.message}`);
				}
			}

			this.logger.log(`Hourly lead scoring completed. Processed ${processed}/${leadsToScore.length} leads.`);
		} catch (error) {
			this.logger.error(`Hourly lead scoring failed: ${error.message}`, error.stack);
		}
	}

	/**
	 * AUTOMATED FOLLOW-UPS: Check for overdue follow-ups every 30 minutes
	 */
	@Cron('0 */30 * * * *') // Every 30 minutes
	async checkOverdueFollowUps(): Promise<void> {
		this.logger.log('Checking for overdue follow-ups...');
		
		try {
			const now = new Date();
			const overdueLeads = await this.leadRepository.find({
				where: {
					isDeleted: false,
					nextFollowUpDate: Between(new Date('2020-01-01'), now), // Overdue
					status: In([LeadStatus.PENDING, LeadStatus.REVIEW]),
				},
				relations: ['owner', 'assignees'],
			});

			for (const lead of overdueLeads) {
				try {
					// Notify assigned users about overdue follow-up
					const userIds = [
						lead.owner?.uid,
						...(lead.assignees?.map((a: any) => a.uid) || [])
					].filter(Boolean);

					if (userIds.length > 0) {
						await this.unifiedNotificationService.sendTemplatedNotification(
							NotificationEvent.LEAD_FOLLOW_UP_OVERDUE,
							userIds,
							{
								leadId: lead.uid,
								leadName: lead.name || `Lead #${lead.uid}`,
								daysOverdue: Math.floor((now.getTime() - lead.nextFollowUpDate!.getTime()) / (24 * 60 * 60 * 1000)),
							},
							{
								priority: NotificationPriority.HIGH
							}
						);
					}

					// Update priority if significantly overdue
					const daysOverdue = Math.floor((now.getTime() - lead.nextFollowUpDate!.getTime()) / (24 * 60 * 60 * 1000));
					if (daysOverdue > 7 && lead.priority !== LeadPriority.CRITICAL) {
						await this.leadRepository.update(lead.uid, { 
							priority: LeadPriority.HIGH,
							daysSinceLastResponse: daysOverdue 
						});
					}
				} catch (error) {
					this.logger.error(`Failed to process overdue follow-up for lead ${lead.uid}: ${error.message}`);
				}
			}

			this.logger.log(`Processed ${overdueLeads.length} overdue follow-ups`);
		} catch (error) {
			this.logger.error(`Follow-up check failed: ${error.message}`, error.stack);
		}
	}

	private calculateStats(leads: Lead[]): {
		total: number;
		pending: number;
		approved: number;
		inReview: number;
		declined: number;
	} {
		return {
			total: leads?.length || 0,
			pending: leads?.filter((lead) => lead?.status === LeadStatus.PENDING)?.length || 0,
			approved: leads?.filter((lead) => lead?.status === LeadStatus.APPROVED)?.length || 0,
			inReview: leads?.filter((lead) => lead?.status === LeadStatus.REVIEW)?.length || 0,
			declined: leads?.filter((lead) => lead?.status === LeadStatus.DECLINED)?.length || 0,
		};
	}

	async getLeadsForDate(date: Date): Promise<{
		message: string;
		leads: {
			pending: Lead[];
			approved: Lead[];
			review: Lead[];
			declined: Lead[];
			total: number;
		};
	}> {
		try {
			const leads = await this.leadRepository.find({
				where: { createdAt: Between(startOfDay(date), endOfDay(date)) },
			});

			if (!leads) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Group leads by status
			const groupedLeads = {
				pending: leads.filter((lead) => lead.status === LeadStatus.PENDING),
				approved: leads.filter((lead) => lead.status === LeadStatus.APPROVED),
				review: leads.filter((lead) => lead.status === LeadStatus.REVIEW),
				declined: leads.filter((lead) => lead.status === LeadStatus.DECLINED),
				total: leads?.length,
			};

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				leads: groupedLeads,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				leads: null,
			};

			return response;
		}
	}

	async getLeadsReport(filter: any) {
		try {
			const leads = await this.leadRepository.find({
				where: {
					...filter,
					isDeleted: false,
				},
				relations: ['owner', 'branch', 'client'],
			});

			if (!leads) {
				throw new NotFoundException('No leads found for the specified period');
			}

			const groupedLeads = {
				review: leads.filter((lead) => lead.status === LeadStatus.REVIEW),
				pending: leads.filter((lead) => lead.status === LeadStatus.PENDING),
				approved: leads.filter((lead) => lead.status === LeadStatus.APPROVED),
				declined: leads.filter((lead) => lead.status === LeadStatus.DECLINED),
			};

			const totalLeads = leads.length;
			const approvedLeads = groupedLeads.approved.length;
			const avgResponseTime = this.calculateAverageResponseTime(leads);
			const sources = this.analyzeLeadSources(leads);
			const sourceEffectiveness = this.analyzeSourceEffectiveness(leads);
			const geographicDistribution = this.analyzeGeographicDistribution(leads);
			const leadQualityBySource = this.analyzeLeadQualityBySource(leads);
			const conversionTrends = this.analyzeConversionTrends(leads);
			const responseTimeDistribution = this.analyzeResponseTimeDistribution(leads);

			return {
				...groupedLeads,
				total: totalLeads,
				metrics: {
					conversionRate: `${((approvedLeads / totalLeads) * 100).toFixed(1)}%`,
					averageResponseTime: `${avgResponseTime} hours`,
					topSources: sources,
					qualityScore: this.calculateQualityScore(leads),
					sourceEffectiveness,
					geographicDistribution,
					leadQualityBySource,
					conversionTrends,
					responseTimeDistribution,
				},
			};
		} catch (error) {
			return null;
		}
	}

	private calculateAverageResponseTime(leads: Lead[]): number {
		const respondedLeads = leads.filter(
			(lead) => lead.status === LeadStatus.APPROVED || lead.status === LeadStatus.DECLINED,
		);

		if (respondedLeads.length === 0) return 0;

		const totalResponseTime = respondedLeads.reduce((sum, lead) => {
			const responseTime = lead.updatedAt.getTime() - lead.createdAt.getTime();
			return sum + responseTime;
		}, 0);

		// Convert from milliseconds to hours
		return Number((totalResponseTime / (respondedLeads.length * 60 * 60 * 1000)).toFixed(1));
	}

	private analyzeLeadSources(leads: Lead[]): Array<{ source: string; count: number }> {
		const sourceCounts = leads.reduce((acc, lead) => {
			const source = lead.client?.category || 'Direct';
			acc[source] = (acc[source] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return Object.entries(sourceCounts)
			.map(([source, count]) => ({ source, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5); // Return top 5 sources
	}

	private calculateQualityScore(leads: Lead[]): number {
		if (leads.length === 0) return 0;

		const approvedLeads = leads.filter((lead) => lead.status === LeadStatus.APPROVED).length;
		const responseTimeScore = this.calculateAverageResponseTime(leads) < 24 ? 1 : 0.5;
		const conversionRate = approvedLeads / leads.length;

		// Calculate score out of 100
		const score = (conversionRate * 0.6 + responseTimeScore * 0.4) * 100;
		return Number(score.toFixed(1));
	}

	private analyzeSourceEffectiveness(leads: Lead[]): Array<{
		source: string;
		totalLeads: number;
		convertedLeads: number;
		conversionRate: string;
		averageResponseTime: string;
		qualityScore: number;
	}> {
		const sourceStats = new Map<
			string,
			{
				total: number;
				converted: number;
				totalResponseTime: number;
				respondedLeads: number;
				qualityScores: number[];
			}
		>();

		leads.forEach((lead) => {
			const source = lead.client?.category || 'Direct';

			if (!sourceStats.has(source)) {
				sourceStats.set(source, {
					total: 0,
					converted: 0,
					totalResponseTime: 0,
					respondedLeads: 0,
					qualityScores: [],
				});
			}

			const stats = sourceStats.get(source);
			stats.total++;

			if (lead.status === LeadStatus.APPROVED) {
				stats.converted++;
			}

			if (lead.status !== LeadStatus.PENDING) {
				stats.respondedLeads++;
				stats.totalResponseTime += lead.updatedAt.getTime() - lead.createdAt.getTime();
			}

			stats.qualityScores.push(this.calculateIndividualLeadQualityScore(lead));
		});

		return Array.from(sourceStats.entries())
			.map(([source, stats]) => ({
				source,
				totalLeads: stats.total,
				convertedLeads: stats.converted,
				conversionRate: `${((stats.converted / stats.total) * 100).toFixed(1)}%`,
				averageResponseTime: `${(stats.respondedLeads > 0
					? stats.totalResponseTime / (stats.respondedLeads * 60 * 60 * 1000)
					: 0
				).toFixed(1)} hours`,
				qualityScore: Number(
					(stats.qualityScores.reduce((sum, score) => sum + score, 0) / stats.total).toFixed(1),
				),
			}))
			.sort((a, b) => b.convertedLeads - a.convertedLeads);
	}

	private analyzeGeographicDistribution(leads: Lead[]): Record<
		string,
		{
			total: number;
			converted: number;
			conversionRate: string;
		}
	> {
		const geoStats = new Map<
			string,
			{
				total: number;
				converted: number;
			}
		>();

		leads.forEach((lead) => {
			const region = lead?.client?.address?.city || 'Unknown';

			if (!geoStats.has(region)) {
				geoStats.set(region, {
					total: 0,
					converted: 0,
				});
			}

			const stats = geoStats.get(region);
			stats.total++;
			if (lead.status === LeadStatus.APPROVED) {
				stats.converted++;
			}
		});

		return Object.fromEntries(
			Array.from(geoStats.entries()).map(([region, stats]) => [
				region,
				{
					total: stats.total,
					converted: stats.converted,
					conversionRate: `${((stats.converted / stats.total) * 100).toFixed(1)}%`,
				},
			]),
		);
	}

	private analyzeLeadQualityBySource(leads: Lead[]): Array<{
		source: string;
		averageQualityScore: number;
		leadDistribution: {
			high: number;
			medium: number;
			low: number;
		};
	}> {
		const sourceQuality = new Map<
			string,
			{
				scores: number[];
				distribution: {
					high: number;
					medium: number;
					low: number;
				};
			}
		>();

		leads.forEach((lead) => {
			const source = lead.client?.category || 'Direct';
			const qualityScore = this.calculateIndividualLeadQualityScore(lead);

			if (!sourceQuality.has(source)) {
				sourceQuality.set(source, {
					scores: [],
					distribution: {
						high: 0,
						medium: 0,
						low: 0,
					},
				});
			}

			const stats = sourceQuality.get(source);
			stats.scores.push(qualityScore);

			if (qualityScore >= 80) stats.distribution.high++;
			else if (qualityScore >= 50) stats.distribution.medium++;
			else stats.distribution.low++;
		});

		return Array.from(sourceQuality.entries())
			.map(([source, stats]) => ({
				source,
				averageQualityScore: Number(
					(stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length).toFixed(1),
				),
				leadDistribution: stats.distribution,
			}))
			.sort((a, b) => b.averageQualityScore - a.averageQualityScore);
	}

	private analyzeConversionTrends(leads: Lead[]): Array<{
		date: string;
		totalLeads: number;
		convertedLeads: number;
		conversionRate: string;
	}> {
		const dailyStats = new Map<
			string,
			{
				total: number;
				converted: number;
			}
		>();

		leads.forEach((lead) => {
			const date = lead.createdAt.toISOString().split('T')[0];

			if (!dailyStats.has(date)) {
				dailyStats.set(date, {
					total: 0,
					converted: 0,
				});
			}

			const stats = dailyStats.get(date);
			stats.total++;
			if (lead.status === LeadStatus.APPROVED) {
				stats.converted++;
			}
		});

		return Array.from(dailyStats.entries())
			.map(([date, stats]) => ({
				date,
				totalLeads: stats.total,
				convertedLeads: stats.converted,
				conversionRate: `${((stats.converted / stats.total) * 100).toFixed(1)}%`,
			}))
			.sort((a, b) => a.date.localeCompare(b.date));
	}

	private analyzeResponseTimeDistribution(leads: Lead[]): Record<string, number> {
		const distribution = {
			'Under 1 hour': 0,
			'1-4 hours': 0,
			'4-12 hours': 0,
			'12-24 hours': 0,
			'Over 24 hours': 0,
		};

		leads.forEach((lead) => {
			if (lead.status === LeadStatus.PENDING) return;

			const responseTime = (lead.updatedAt.getTime() - lead.createdAt.getTime()) / (60 * 60 * 1000); // hours

			if (responseTime < 1) distribution['Under 1 hour']++;
			else if (responseTime < 4) distribution['1-4 hours']++;
			else if (responseTime < 12) distribution['4-12 hours']++;
			else if (responseTime < 24) distribution['12-24 hours']++;
			else distribution['Over 24 hours']++;
		});

		return distribution;
	}

	private calculateIndividualLeadQualityScore(lead: Lead): number {
		let score = 0;

		// Response time score (40%)
		if (lead.status !== LeadStatus.PENDING) {
			const responseTime = (lead.updatedAt.getTime() - lead.createdAt.getTime()) / (60 * 60 * 1000);
			if (responseTime < 1) score += 40;
			else if (responseTime < 4) score += 30;
			else if (responseTime < 12) score += 20;
			else if (responseTime < 24) score += 10;
		}

		// Status score (30%)
		if (lead.status === LeadStatus.APPROVED) score += 30;
		else if (lead.status === LeadStatus.REVIEW) score += 15;

		// Data completeness score (30%)
		if (lead.client) {
			if (lead.client.email) score += 10;
			if (lead.client.phone) score += 10;
			if (lead.client.address) score += 10;
		}

		return score;
	}

	/**
	 * Populates the assignees field of a lead with the full user objects
	 */
	private async populateLeadRelations(lead: Lead): Promise<Lead> {
		if (lead.assignees?.length > 0) {
			const assigneeIds = lead.assignees.map((a) => a.uid);
			const assigneeProfiles = await this.userRepository.find({
				where: { uid: In(assigneeIds) },
				select: ['uid', 'username', 'name', 'surname', 'email', 'phone', 'photoURL', 'accessLevel', 'status'],
			});
			lead.assignees = assigneeProfiles;
		}

		// Populate change history with user details
		await this.populateLeadChangeHistory(lead);

		return lead;
	}

	/**
	 * Populates the user details in the changeHistory array of a lead
	 */
	private async populateLeadChangeHistory(lead: Lead): Promise<Lead> {
		if (lead.changeHistory?.length > 0) {
			// Extract all userIds from change history
			const userIds = lead.changeHistory
				.filter((entry) => entry.userId)
				.map((entry) => (typeof entry.userId === 'string' ? parseInt(entry.userId) : entry.userId));

			if (userIds.length > 0) {
				// Find all user details in one query
				const users = await this.userRepository.find({
					where: { uid: In(userIds) },
					select: [
						'uid',
						'username',
						'name',
						'surname',
						'email',
						'phone',
						'photoURL',
						'accessLevel',
						'status',
					],
				});

				// Create a map for quick lookup
				const userMap = new Map(users.map((user) => [user.uid.toString(), user]));

				// Update the changeHistory entries with user details
				lead.changeHistory = lead.changeHistory.map((entry) => ({
					...entry,
					user: entry.userId ? userMap.get(entry.userId.toString()) || null : null,
				}));
			}
		}
		return lead;
	}

	/**
	 * Set intelligent defaults for new leads
	 */
	private async setIntelligentDefaults(lead: Lead): Promise<void> {
		// Set default temperature based on source
		if (!lead.temperature) {
			switch (lead.source) {
				case 'REFERRAL':
					lead.temperature = LeadTemperature.WARM;
					break;
				case 'WEBSITE':
				case 'ORGANIC_SEARCH':
					lead.temperature = LeadTemperature.COLD;
					break;
				case 'COLD_CALL':
				case 'EMAIL_CAMPAIGN':
					lead.temperature = LeadTemperature.COLD;
					break;
				default:
					lead.temperature = LeadTemperature.COLD;
			}
		}

		// Set default priority based on budget range
		if (!lead.priority && lead.budgetRange) {
			if (['OVER_1M', 'R500K_1M', 'R250K_500K'].includes(lead.budgetRange)) {
				lead.priority = LeadPriority.HIGH;
			} else if (['R100K_250K', 'R50K_100K'].includes(lead.budgetRange)) {
				lead.priority = LeadPriority.MEDIUM;
			}
		}

		// Set initial next follow-up date
		if (!lead.nextFollowUpDate) {
			const nextFollowUp = new Date();
			nextFollowUp.setDate(nextFollowUp.getDate() + 1); // Follow up tomorrow for new leads
			lead.nextFollowUpDate = nextFollowUp;
		}

		// Initialize scoring data
		lead.leadScore = 0;
		lead.totalInteractions = 0;
		lead.averageResponseTime = 0;
		lead.daysSinceLastResponse = 0;
	}

	/**
	 * Apply intelligent updates based on data changes
	 */
	private async applyIntelligentUpdates(lead: Lead, updates: Partial<Lead>): Promise<void> {
		// Update temperature if intent changed
		if (updates.intent && updates.intent !== lead.intent) {
			switch (updates.intent) {
				case 'PURCHASE':
					updates.temperature = LeadTemperature.HOT;
					updates.priority = LeadPriority.HIGH;
					break;
				case 'CONVERSION':
					updates.temperature = LeadTemperature.HOT;
					break;
				case 'LOST':
					updates.temperature = LeadTemperature.FROZEN;
					updates.priority = LeadPriority.LOW;
					break;
			}
		}

		// Auto-set next follow-up date based on temperature
		if (updates.temperature && updates.temperature !== lead.temperature) {
			const followUpDays = this.getFollowUpDaysForTemperature(updates.temperature);
			const nextFollowUp = new Date();
			nextFollowUp.setDate(nextFollowUp.getDate() + followUpDays);
			updates.nextFollowUpDate = nextFollowUp;
		}

		// Update lifecycle stage based on status
		if (updates.status && updates.status !== lead.status) {
			switch (updates.status) {
				case LeadStatus.APPROVED:
					updates.lifecycleStage = LeadLifecycleStage.SALES_QUALIFIED_LEAD;
					break;
				case LeadStatus.CONVERTED:
					updates.lifecycleStage = LeadLifecycleStage.CUSTOMER;
					break;
			}
		}
	}

	/**
	 * Handle events triggered after lead creation
	 */
	private async handleLeadCreatedEvents(lead: Lead): Promise<void> {
		try {
			// 1. Calculate initial lead score
			await this.leadScoringService.calculateLeadScore(lead.uid);
			await this.leadScoringService.updateActivityData(lead.uid);

			// 2. Send assignment notifications
			if (lead.assignees && lead.assignees.length > 0) {
				await this.sendAssignmentNotifications(lead, 'assigned');
			}

			// 3. Award XP to creator
			if (lead.owner?.uid) {
				await this.rewardsService.awardXP({
					owner: lead.owner.uid,
					amount: XP_VALUES.LEAD,
					action: XP_VALUES_TYPES.LEAD,
					source: {
						id: lead.uid.toString(),
						type: XP_VALUES_TYPES.LEAD,
						details: 'Lead created',
					},
				});
			}

			// 4. Send system notification
			const notification = {
				type: NotificationType.USER,
				title: 'New Lead Created',
				message: `Lead "${lead.name || `#${lead.uid}`}" has been created`,
				status: NotificationStatus.UNREAD,
				owner: lead.owner,
			};

			const recipients = [
				AccessLevel.ADMIN,
				AccessLevel.MANAGER,
				AccessLevel.OWNER,
				AccessLevel.SUPERVISOR,
			];

			this.eventEmitter.emit('send.notification', notification, recipients);

			this.logger.log(`Lead creation events completed for lead ${lead.uid}`);
		} catch (error) {
			this.logger.error(`Failed to handle lead creation events for lead ${lead.uid}: ${error.message}`, error.stack);
		}
	}

	/**
	 * Handle events triggered after lead updates
	 */
	private async handleLeadUpdatedEvents(
		lead: Lead, 
		changes: {
			statusChanged: boolean;
			temperatureChanged: boolean;
			priorityChanged: boolean;
			assigneesChanged: boolean;
		}
	): Promise<void> {
		try {
			// 1. Recalculate lead score if significant changes
			if (changes.statusChanged || changes.temperatureChanged || changes.priorityChanged) {
				await this.leadScoringService.calculateLeadScore(lead.uid);
				await this.leadScoringService.updateActivityData(lead.uid);
			}

			// 2. Handle status-specific events
			if (changes.statusChanged) {
				await this.handleStatusChangeEvents(lead);
			}

			// 3. Handle assignment changes
			if (changes.assigneesChanged) {
				await this.sendAssignmentNotifications(lead, 'updated');
			}

			// 4. Update temperature based on new score if needed
			if (changes.statusChanged || changes.priorityChanged) {
				await this.updateTemperatureBasedOnScore(lead.uid);
			}

			this.logger.log(`Lead update events completed for lead ${lead.uid}`);
		} catch (error) {
			this.logger.error(`Failed to handle lead update events for lead ${lead.uid}: ${error.message}`, error.stack);
		}
	}

	/**
	 * Handle status change specific events
	 */
	private async handleStatusChangeEvents(lead: Lead): Promise<void> {
		if (lead.status === LeadStatus.CONVERTED) {
			// Send conversion notifications
			const allUserIds = [
				lead.owner?.uid,
				...(lead.assignees?.map((assignee: any) => assignee.uid) || [])
			].filter(Boolean);

			if (allUserIds.length > 0) {
				await this.unifiedNotificationService.sendTemplatedNotification(
					NotificationEvent.LEAD_CONVERTED,
					allUserIds,
					{
						leadId: lead.uid,
						leadName: lead.name || `#${lead.uid}`,
						convertedBy: 'System',
					},
					{
						priority: NotificationPriority.HIGH
					}
				);
			}

			// Award bonus XP for conversion
			if (lead.owner?.uid) {
				await this.rewardsService.awardXP({
					owner: lead.owner.uid,
					amount: XP_VALUES.LEAD * 3, // Triple XP for conversion
					action: 'LEAD_CONVERSION',
					source: {
						id: lead.uid.toString(),
						type: 'lead_conversion',
						details: 'Lead converted to customer',
					},
				});
			}
		}
	}

	/**
	 * Send assignment notifications
	 */
	private async sendAssignmentNotifications(lead: Lead, action: 'assigned' | 'updated'): Promise<void> {
		const populatedLead = await this.populateLeadRelations(lead);

		if (populatedLead.assignees && populatedLead.assignees.length > 0) {
			const assigneeIds = populatedLead.assignees.map((assignee: User) => assignee.uid);
			const creatorName = populatedLead.owner?.name || populatedLead.owner?.username || 'System';

			try {
				await this.unifiedNotificationService.sendTemplatedNotification(
					action === 'assigned' ? NotificationEvent.LEAD_ASSIGNED : NotificationEvent.LEAD_UPDATED,
					assigneeIds,
					{
						leadId: populatedLead.uid,
						leadName: populatedLead.name,
						assignedBy: creatorName,
						leadDetails: populatedLead.notes,
						leadCreatorName: creatorName,
					},
					{
						sendEmail: true,
						emailTemplate: EmailType.LEAD_ASSIGNED_TO_USER,
						emailData: {
							name: 'Team Member',
							assigneeName: 'Team Member',
							leadId: populatedLead.uid,
							leadName: populatedLead.name,
							leadCreatorName: creatorName,
							leadDetails: populatedLead.notes,
							leadLink: `${this.configService.get<string>('DASHBOARD_URL')}/leads/${populatedLead.uid}`,
						}
					}
				);
			} catch (error) {
				this.logger.error(`Failed to send assignment notifications: ${error.message}`);
			}
		}
	}

	/**
	 * Update temperature based on lead score
	 */
	private async updateTemperatureBasedOnScore(leadId: number): Promise<void> {
		const lead = await this.leadRepository.findOne({ where: { uid: leadId } });
		if (!lead) return;

		let newTemperature = lead.temperature;

		// Auto-adjust temperature based on score
		if (lead.leadScore >= 80) {
			newTemperature = LeadTemperature.HOT;
		} else if (lead.leadScore >= 60) {
			newTemperature = LeadTemperature.WARM;
		} else if (lead.leadScore >= 30) {
			newTemperature = LeadTemperature.COLD;
		} else {
			newTemperature = LeadTemperature.FROZEN;
		}

		// Only update if temperature actually changed
		if (newTemperature !== lead.temperature) {
			await this.leadRepository.update(leadId, { temperature: newTemperature });
			this.logger.log(`Updated temperature for lead ${leadId} from ${lead.temperature} to ${newTemperature} based on score ${lead.leadScore}`);
		}
	}

	/**
	 * Get follow-up days based on temperature
	 */
	private getFollowUpDaysForTemperature(temperature: LeadTemperature): number {
		switch (temperature) {
			case LeadTemperature.HOT:
				return 1; // Daily follow-up
			case LeadTemperature.WARM:
				return 3; // Every 3 days
			case LeadTemperature.COLD:
				return 7; // Weekly
			case LeadTemperature.FROZEN:
				return 30; // Monthly
			default:
				return 7;
		}
	}
}
