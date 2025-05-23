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
import { LeadStatus } from '../lib/enums/lead.enums';
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

			const savedLead = await this.leadRepository.save(lead);

			// Populate the lead with full relation data
			const populatedLead = await this.populateLeadRelations(savedLead);

			// Send email notification to assignees
			if (populatedLead.assignees && populatedLead.assignees.length > 0) {
				const assigneeIds = populatedLead.assignees.map((assignee: User) => assignee.uid);
				const creatorName = populatedLead.owner?.name || populatedLead.owner?.username || 'System';

				// Use unified notification service for both email and push notifications
				try {
					await this.unifiedNotificationService.sendTemplatedNotification(
						NotificationEvent.LEAD_ASSIGNED,
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
								name: 'Team Member', // This will be overridden per recipient
								assigneeName: 'Team Member',
								leadId: populatedLead.uid,
								leadName: populatedLead.name,
								leadCreatorName: creatorName,
								leadDetails: populatedLead.notes,
								leadLink: `${this.configService.get<string>('DASHBOARD_URL')}/leads/${populatedLead.uid}`,
							}
						}
					);

					this.logger.log(`Lead assignment notifications sent for lead ${populatedLead.uid}`);
				} catch (notificationError) {
					this.logger.error(
						`Failed to send lead assignment notifications for lead ${populatedLead.uid}: ${notificationError.message}`,
						notificationError.stack,
					);
				}

				// Legacy email notification fallback (in case unified notification fails)
				for (const assignee of populatedLead.assignees as User[]) {
					if (assignee.email) {
						const emailData: LeadAssignedToUserData = {
							assigneeName: assignee.name || assignee.username,
							leadId: populatedLead.uid,
							leadName: populatedLead.name,
							leadCreatorName: populatedLead.owner?.name || populatedLead.owner?.username || 'System',
							leadDetails: populatedLead.notes,
							leadLink: `${this.configService.get<string>('DASHBOARD_URL')}/leads/${populatedLead.uid}`,
							name: assignee.name || assignee.username,
						};
						try {
							await this.communicationService.sendEmail(
								EmailType.LEAD_ASSIGNED_TO_USER,
								[assignee.email],
								emailData,
							);
							this.logger.log(
								`Fallback lead assignment email sent to ${assignee.email} for lead ${populatedLead.uid}`,
							);
						} catch (emailError) {
							this.logger.error(
								`Failed to send fallback lead assignment email to ${assignee.email}: ${emailError.message}`,
								emailError.stack,
							);
						}
					}
				}
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				data: populatedLead,
			};

			await this.rewardsService.awardXP({
				owner: createLeadDto.owner.uid,
				amount: 10,
				action: 'LEAD',
				source: {
					id: createLeadDto.owner.uid.toString(),
					type: 'lead',
					details: 'Lead reward',
				},
			});

			const notification = {
				type: NotificationType.USER,
				title: 'Lead Created',
				message: `A lead has been created`,
				status: NotificationStatus.UNREAD,
				owner: populatedLead?.owner,
			};

			const recipients = [
				AccessLevel.ADMIN,
				AccessLevel.MANAGER,
				AccessLevel.OWNER,
				AccessLevel.SUPERVISOR,
				AccessLevel.USER,
			];

			this.eventEmitter.emit('send.notification', notification, recipients);

			await this.rewardsService.awardXP({
				owner: createLeadDto.owner.uid,
				amount: XP_VALUES.LEAD,
				action: XP_VALUES_TYPES.LEAD,
				source: {
					id: createLeadDto.owner.uid.toString(),
					type: XP_VALUES_TYPES.LEAD,
					details: 'Lead reward',
				},
			});

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

			if (filters?.startDate && filters?.endDate) {
				queryBuilder.andWhere('lead.createdAt BETWEEN :startDate AND :endDate', {
					startDate: filters.startDate,
					endDate: filters.endDate,
				});
			}

			if (filters?.search) {
				queryBuilder.andWhere(
					'(lead.name ILIKE :search OR lead.email ILIKE :search OR lead.phone ILIKE :search OR owner.name ILIKE :search OR owner.surname ILIKE :search)',
					{ search: `%${filters.search}%` },
				);
			}

			queryBuilder
				.skip((page - 1) * limit)
				.take(limit)
				.orderBy('lead.createdAt', 'DESC');

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
				relations: ['owner', 'organisation', 'branch'],
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
				relations: ['owner', 'organisation', 'branch'], // Load relations if needed
			});

			if (!lead) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const oldStatus = lead.status;
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

			await this.leadRepository.update(ref, dataToSave);

			// Emit notification if status changed to CONVERTED
			if (updateLeadDto.status === LeadStatus.CONVERTED && oldStatus !== LeadStatus.CONVERTED) {
				const populatedLead = await this.populateLeadRelations(lead);
				
				// Send unified notification for lead conversion
				try {
					const allUserIds = [
						populatedLead.owner?.uid,
						...(populatedLead.assignees?.map((assignee: User) => assignee.uid) || [])
					].filter(Boolean);

					if (allUserIds.length > 0) {
						await this.unifiedNotificationService.sendTemplatedNotification(
							NotificationEvent.LEAD_CONVERTED,
							allUserIds,
							{
								leadId: populatedLead.uid,
								leadName: populatedLead.name || `#${ref}`,
								convertedBy: 'System', // Could be enhanced to track who converted it
							},
							{
								priority: NotificationPriority.HIGH
							}
						);
					}
				} catch (notificationError) {
					this.logger.error(
						`Failed to send lead conversion notifications for lead ${ref}: ${notificationError.message}`,
						notificationError.stack,
					);
				}

				// Legacy system notification
				const notification = {
					type: NotificationType.USER,
					title: 'Lead Converted',
					message: `Lead ${populatedLead.name || '#' + ref} has been converted to a client!`,
					status: NotificationStatus.UNREAD,
					owner: populatedLead?.owner,
				};

				const recipients = [
					AccessLevel.ADMIN,
					AccessLevel.MANAGER,
					AccessLevel.OWNER,
					AccessLevel.SUPERVISOR,
					AccessLevel.USER,
				];

				this.eventEmitter.emit('send.notification', notification, recipients);
			}

			// Handle lead assignment email if assignees changed
			if (updateLeadDto.assignees) {
				const populatedLead = await this.populateLeadRelations({ ...lead, ...dataToSave });

				if (populatedLead.assignees && populatedLead.assignees.length > 0) {
					const assigneeIds = populatedLead.assignees.map((assignee: User) => assignee.uid);
					const creatorName = populatedLead.owner?.name || populatedLead.owner?.username || 'System';

					// Use unified notification service for both email and push notifications
					try {
						await this.unifiedNotificationService.sendTemplatedNotification(
							NotificationEvent.LEAD_UPDATED,
							assigneeIds,
							{
								leadId: populatedLead.uid,
								leadName: populatedLead.name,
								updatedBy: creatorName,
								leadDetails: populatedLead.notes,
								leadCreatorName: creatorName,
							},
							{
								sendEmail: true,
								emailTemplate: EmailType.LEAD_ASSIGNED_TO_USER,
								emailData: {
									name: 'Team Member', // This will be overridden per recipient
									assigneeName: 'Team Member',
									leadId: populatedLead.uid,
									leadName: populatedLead.name,
									leadCreatorName: creatorName,
									leadDetails: populatedLead.notes,
									leadLink: `${this.configService.get<string>('DASHBOARD_URL')}/leads/${populatedLead.uid}`,
								}
							}
						);

						this.logger.log(`Lead assignment update notifications sent for lead ${populatedLead.uid}`);
					} catch (notificationError) {
						this.logger.error(
							`Failed to send lead assignment update notifications for lead ${populatedLead.uid}: ${notificationError.message}`,
							notificationError.stack,
						);
					}

					// Legacy email notification fallback
					for (const assignee of populatedLead.assignees as User[]) {
						if (assignee.email) {
							const emailData: LeadAssignedToUserData = {
								assigneeName: assignee.name || assignee.username,
								leadId: populatedLead.uid,
								leadName: populatedLead.name,
								leadCreatorName: populatedLead.owner?.name || populatedLead.owner?.username || 'System',
								leadDetails: populatedLead.notes,
								leadLink: `${this.configService.get<string>('DASHBOARD_URL')}/leads/${
									populatedLead.uid
								}`,
								name: assignee.name || assignee.username,
							};
							try {
								await this.communicationService.sendEmail(
									EmailType.LEAD_ASSIGNED_TO_USER,
									[assignee.email],
									emailData,
								);
								this.logger.log(
									`Fallback lead assignment update email sent to ${assignee.email} for lead ${populatedLead.uid}`,
								);
							} catch (emailError) {
								this.logger.error(
									`Failed to send fallback lead assignment update email to ${assignee.email}: ${emailError.message}`,
									emailError.stack,
								);
							}
						}
					}
				}
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

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
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
}
