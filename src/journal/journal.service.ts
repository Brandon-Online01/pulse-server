import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Journal } from './entities/journal.entity';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { NotificationType, NotificationStatus } from '../lib/enums/notification.enums';
import { AccessLevel } from '../lib/enums/user.enums';
import { JournalStatus } from '../lib/enums/journal.enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { endOfDay, startOfDay } from 'date-fns';
import { RewardsService } from '../rewards/rewards.service';
import { XP_VALUES, XP_VALUES_TYPES } from '../lib/constants/constants';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';

@Injectable()
export class JournalService {
	constructor(
		@InjectRepository(Journal)
		private journalRepository: Repository<Journal>,
		private readonly eventEmitter: EventEmitter2,
		private readonly rewardsService: RewardsService,
	) {}

	private calculateStats(journals: Journal[]): {
		total: number;
	} {
		return {
			total: journals?.length || 0,
		};
	}

	async create(createJournalDto: CreateJournalDto, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			// Add organization and branch information
			const journalData = {
				...createJournalDto,
				organisation: orgId ? { uid: orgId } : undefined,
				branch: branchId ? { uid: branchId } : undefined,
			};

			const journal = await this.journalRepository.save(journalData);

			if (!journal) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			const notification = {
				type: NotificationType.USER,
				title: 'Journal Created',
				message: `A journal has been created`,
				status: NotificationStatus.UNREAD,
				owner: journal?.owner,
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
				owner: createJournalDto.owner.uid,
				amount: 10,
				action: 'JOURNAL',
				source: {
					id: createJournalDto.owner.uid.toString(),
					type: 'journal',
					details: 'Journal reward',
				},
			});

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			};

			return response;
		}
	}

	async findAll(
		filters?: {
			status?: JournalStatus;
			authorId?: number;
			startDate?: Date;
			endDate?: Date;
			search?: string;
			categoryId?: number;
		},
		page: number = 1,
		limit: number = Number(process.env.DEFAULT_PAGE_LIMIT),
		orgId?: number,
		branchId?: number,
	): Promise<PaginatedResponse<Journal>> {
		try {
			const queryBuilder = this.journalRepository
				.createQueryBuilder('journal')
				.leftJoinAndSelect('journal.owner', 'owner')
				.leftJoinAndSelect('journal.branch', 'branch')
				.leftJoinAndSelect('journal.organisation', 'organisation')
				.where('journal.isDeleted = :isDeleted', { isDeleted: false });

			// Add organization filter if provided
			if (orgId) {
				queryBuilder.andWhere('organisation.uid = :orgId', { orgId });
			}

			// Add branch filter if provided
			if (branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			if (filters?.status) {
				queryBuilder.andWhere('journal.status = :status', { status: filters.status });
			}

			if (filters?.authorId) {
				queryBuilder.andWhere('owner.uid = :authorId', { authorId: filters.authorId });
			}

			if (filters?.startDate && filters?.endDate) {
				queryBuilder.andWhere('journal.createdAt BETWEEN :startDate AND :endDate', {
					startDate: filters.startDate,
					endDate: filters.endDate,
				});
			}

			if (filters?.search) {
				queryBuilder.andWhere(
					'(journal.clientRef ILIKE :search OR journal.comments ILIKE :search OR owner.name ILIKE :search)',
					{ search: `%${filters.search}%` },
				);
			}

			// Add pagination
			queryBuilder
				.skip((page - 1) * limit)
				.take(limit)
				.orderBy('journal.createdAt', 'DESC');

			const [journals, total] = await queryBuilder.getManyAndCount();

			if (!journals) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			return {
				data: journals,
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
	): Promise<{ message: string; journal: Journal | null; stats: any }> {
		try {
			const queryBuilder = this.journalRepository
				.createQueryBuilder('journal')
				.leftJoinAndSelect('journal.owner', 'owner')
				.leftJoinAndSelect('journal.organisation', 'organisation')
				.leftJoinAndSelect('journal.branch', 'branch')
				.where('journal.uid = :ref', { ref })
				.andWhere('journal.isDeleted = :isDeleted', { isDeleted: false });

			// Add organization filter if provided
			if (orgId) {
				queryBuilder.andWhere('organisation.uid = :orgId', { orgId });
			}

			// Add branch filter if provided
			if (branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			const journal = await queryBuilder.getOne();

			if (!journal) {
				return {
					message: process.env.NOT_FOUND_MESSAGE,
					journal: null,
					stats: null,
				};
			}

			// Get stats with organization/branch filtering
			const statsQueryBuilder = this.journalRepository
				.createQueryBuilder('journal')
				.leftJoinAndSelect('journal.organisation', 'organisation')
				.leftJoinAndSelect('journal.branch', 'branch');

			if (orgId) {
				statsQueryBuilder.andWhere('organisation.uid = :orgId', { orgId });
			}

			if (branchId) {
				statsQueryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			const allJournals = await statsQueryBuilder.getMany();
			const stats = this.calculateStats(allJournals);

			return {
				journal,
				message: process.env.SUCCESS_MESSAGE,
				stats,
			};
		} catch (error) {
			return {
				message: error?.message,
				journal: null,
				stats: null,
			};
		}
	}

	public async journalsByUser(
		ref: number,
		orgId?: number,
		branchId?: number,
	): Promise<{ message: string; journals: Journal[]; stats: { total: number } }> {
		try {
			const queryBuilder = this.journalRepository
				.createQueryBuilder('journal')
				.leftJoinAndSelect('journal.owner', 'owner')
				.leftJoinAndSelect('journal.organisation', 'organisation')
				.leftJoinAndSelect('journal.branch', 'branch')
				.where('owner.uid = :ref', { ref })
				.andWhere('journal.isDeleted = :isDeleted', { isDeleted: false });

			// Add organization filter if provided
			if (orgId) {
				queryBuilder.andWhere('organisation.uid = :orgId', { orgId });
			}

			// Add branch filter if provided
			if (branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			const journals = await queryBuilder.getMany();

			if (!journals) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const stats = this.calculateStats(journals);

			return {
				message: process.env.SUCCESS_MESSAGE,
				journals,
				stats,
			};
		} catch (error) {
			return {
				message: `could not get journals by user - ${error?.message}`,
				journals: null,
				stats: null,
			};
		}
	}

	async getJournalsForDate(
		date: Date,
		orgId?: number,
		branchId?: number,
	): Promise<{ message: string; journals: Journal[] }> {
		try {
			const queryBuilder = this.journalRepository
				.createQueryBuilder('journal')
				.leftJoinAndSelect('journal.owner', 'owner')
				.leftJoinAndSelect('journal.organisation', 'organisation')
				.leftJoinAndSelect('journal.branch', 'branch')
				.where('journal.createdAt BETWEEN :startOfDay AND :endOfDay', {
					startOfDay: startOfDay(date),
					endOfDay: endOfDay(date),
				});

			// Add organization filter if provided
			if (orgId) {
				queryBuilder.andWhere('organisation.uid = :orgId', { orgId });
			}

			// Add branch filter if provided
			if (branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			const journals = await queryBuilder.getMany();

			if (!journals) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				journals,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				journals: null,
			};

			return response;
		}
	}

	async update(ref: number, updateJournalDto: UpdateJournalDto, orgId?: number, branchId?: number) {
		try {
			// First verify the journal belongs to the org/branch
			const journalResult = await this.findOne(ref, orgId, branchId);

			if (!journalResult || !journalResult.journal) {
				return {
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			const journal = journalResult.journal;

			await this.journalRepository.update(ref, updateJournalDto);

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			const notification = {
				type: NotificationType.USER,
				title: 'Journal Created',
				message: `A journal has been created`,
				status: NotificationStatus.UNREAD,
				owner: journal?.owner,
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
				owner: updateJournalDto.owner.uid,
				amount: XP_VALUES.JOURNAL,
				action: XP_VALUES_TYPES.JOURNAL,
				source: {
					id: updateJournalDto.owner.uid.toString(),
					type: XP_VALUES_TYPES.JOURNAL,
					details: 'Journal reward',
				},
			});

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			};

			return response;
		}
	}

	async remove(ref: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			// First verify the journal belongs to the org/branch
			const journalResult = await this.findOne(ref, orgId, branchId);

			if (!journalResult || !journalResult.journal) {
				return {
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			await this.journalRepository.update(ref, { isDeleted: true });

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			};

			return response;
		}
	}

	async restore(ref: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			// Find the deleted journal specifically
			const queryBuilder = this.journalRepository
				.createQueryBuilder('journal')
				.leftJoinAndSelect('journal.organisation', 'organisation')
				.leftJoinAndSelect('journal.branch', 'branch')
				.where('journal.uid = :ref', { ref })
				.andWhere('journal.isDeleted = :isDeleted', { isDeleted: true });

			// Add organization filter if provided
			if (orgId) {
				queryBuilder.andWhere('organisation.uid = :orgId', { orgId });
			}

			// Add branch filter if provided
			if (branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			const journal = await queryBuilder.getOne();

			if (!journal) {
				return {
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			await this.journalRepository.update(ref, { isDeleted: false });

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			};

			return response;
		}
	}

	async count(orgId?: number, branchId?: number): Promise<{ total: number }> {
		try {
			const queryBuilder = this.journalRepository
				.createQueryBuilder('journal')
				.leftJoinAndSelect('journal.organisation', 'organisation')
				.leftJoinAndSelect('journal.branch', 'branch');

			// Add organization filter if provided
			if (orgId) {
				queryBuilder.andWhere('organisation.uid = :orgId', { orgId });
			}

			// Add branch filter if provided
			if (branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			const total = await queryBuilder.getCount();

			return {
				total,
			};
		} catch (error) {
			return {
				total: 0,
			};
		}
	}

	async getJournalsReport(filter: any, orgId?: number, branchId?: number) {
		try {
			const queryBuilder = this.journalRepository
				.createQueryBuilder('journal')
				.leftJoinAndSelect('journal.owner', 'owner')
				.leftJoinAndSelect('journal.branch', 'branch')
				.leftJoinAndSelect('journal.organisation', 'organisation')
				.where('journal.isDeleted = :isDeleted', { isDeleted: false });

			// Add filter conditions from the filter object
			if (filter) {
				Object.keys(filter).forEach((key) => {
					if (filter[key] !== undefined && filter[key] !== null) {
						queryBuilder.andWhere(`journal.${key} = :${key}`, { [key]: filter[key] });
					}
				});
			}

			// Add organization filter if provided
			if (orgId) {
				queryBuilder.andWhere('organisation.uid = :orgId', { orgId });
			}

			// Add branch filter if provided
			if (branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId });
			}

			queryBuilder.orderBy('journal.timestamp', 'DESC');

			const journals = await queryBuilder.getMany();

			if (!journals) {
				throw new NotFoundException('No journals found for the specified period');
			}

			const totalEntries = journals.length;
			const categories = this.analyzeJournalCategories(journals);
			const entriesPerDay = this.calculateEntriesPerDay(journals);
			const completionRate = this.calculateCompletionRate(journals);

			return {
				entries: journals,
				metrics: {
					totalEntries,
					averageEntriesPerDay: entriesPerDay,
					topCategories: categories,
					completionRate: `${completionRate}%`,
				},
			};
		} catch (error) {
			return null;
		}
	}

	private analyzeJournalCategories(journals: Journal[]): Array<{ category: string; count: number }> {
		const categoryCounts = journals.reduce((acc, journal) => {
			// Extract category from comments or clientRef if available
			const category = this.extractCategory(journal);
			acc[category] = (acc[category] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return Object.entries(categoryCounts)
			.map(([category, count]) => ({ category, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5); // Return top 5 categories
	}

	private extractCategory(journal: Journal): string {
		// Try to extract category from comments
		const comments = journal.comments.toLowerCase();
		if (comments.includes('meeting')) return 'Meeting';
		if (comments.includes('call')) return 'Call';
		if (comments.includes('report')) return 'Report';
		if (comments.includes('follow')) return 'Follow-up';
		return 'Other';
	}

	private calculateEntriesPerDay(journals: Journal[]): number {
		if (journals.length === 0) return 0;

		const dates = journals.map((j) => j.timestamp.toISOString().split('T')[0]);
		const uniqueDates = new Set(dates).size;
		return Number((journals.length / uniqueDates).toFixed(1));
	}

	private calculateCompletionRate(journals: Journal[]): number {
		if (journals.length === 0) return 0;

		const completedEntries = journals.filter(
			(journal) => journal.fileURL && journal.comments && journal.comments.length > 10,
		).length;

		return Number(((completedEntries / journals.length) * 100).toFixed(1));
	}
}
