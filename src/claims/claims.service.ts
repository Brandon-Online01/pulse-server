import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Claim } from './entities/claim.entity';
import { IsNull, Repository, DeepPartial, Not, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { endOfDay } from 'date-fns';
import { startOfDay } from 'date-fns';
import { ClaimCategory, ClaimStatus } from '../lib/enums/finance.enums';
import { AccessLevel } from '../lib/enums/user.enums';
import { NotificationStatus, NotificationType } from '../lib/enums/notification.enums';
import { ConfigService } from '@nestjs/config';
import { RewardsService } from '../rewards/rewards.service';
import { XP_VALUES_TYPES } from '../lib/constants/constants';
import { XP_VALUES } from '../lib/constants/constants';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ClaimsService {
	private readonly currencyLocale: string;
	private readonly currencyCode: string;
	private readonly currencySymbol: string;

	constructor(
		@InjectRepository(Claim)
		private claimsRepository: Repository<Claim>,
		private rewardsService: RewardsService,
		private eventEmitter: EventEmitter2,
		private readonly configService: ConfigService,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {
		this.currencyLocale = this.configService.get<string>('CURRENCY_LOCALE') || 'en-ZA';
		this.currencyCode = this.configService.get<string>('CURRENCY_CODE') || 'ZAR';
		this.currencySymbol = this.configService.get<string>('CURRENCY_SYMBOL') || 'R';
	}

	// Helper method to invalidate claims cache
	private invalidateClaimsCache(claim: Claim) {
		// Emit events for cache invalidation
		this.eventEmitter.emit('claims.cache.invalidate', {
			keys: [
				'claims.all',
				`claims.single.${claim.uid}`,
				`claims.user.${claim.owner?.uid}`,
				'claims.stats',
				'claims.report',
			],
		});
	}

	private formatCurrency(amount: number): string {
		return new Intl.NumberFormat(this.currencyLocale, {
			style: 'currency',
			currency: this.currencyCode,
		})
			.format(amount)
			.replace(this.currencyCode, this.currencySymbol);
	}

	private calculateStats(claims: Claim[]): {
		total: number;
		pending: number;
		approved: number;
		declined: number;
		paid: number;
	} {
		return {
			total: claims?.length || 0,
			pending: claims?.filter((claim) => claim?.status === ClaimStatus.PENDING)?.length || 0,
			approved: claims?.filter((claim) => claim?.status === ClaimStatus.APPROVED)?.length || 0,
			declined: claims?.filter((claim) => claim?.status === ClaimStatus.DECLINED)?.length || 0,
			paid: claims?.filter((claim) => claim?.status === ClaimStatus.PAID)?.length || 0,
		};
	}

	async create(createClaimDto: CreateClaimDto): Promise<{ message: string }> {
		try {
			// Get user with organization and branch info
			const user = await this.userRepository.findOne({
				where: { uid: createClaimDto.owner },
				relations: ['organisation', 'branch'],
			});

			if (!user) {
				throw new NotFoundException('User not found');
			}

			// Append organization and branch to claim data
			const claimData = {
				...createClaimDto,
				amount: createClaimDto.amount.toString(),
				organisation: user.organisation,
				branch: user.branch,
			} as DeepPartial<Claim>;

			const claim = await this.claimsRepository.save(claimData);

			if (!claim) {
				throw new NotFoundException(process.env.CREATE_ERROR_MESSAGE);
			}

			// Invalidate cache after creation
			this.invalidateClaimsCache(claim);

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			const notification = {
				type: NotificationType.USER,
				title: 'New Claim',
				message: `A new claim has been created`,
				status: NotificationStatus.UNREAD,
				owner: claim?.owner,
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
				owner: createClaimDto.owner,
				amount: XP_VALUES.CLAIM,
				action: XP_VALUES_TYPES.CLAIM,
				source: {
					id: String(createClaimDto?.owner),
					type: XP_VALUES_TYPES.CLAIM,
					details: 'Claim reward',
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
			status?: ClaimStatus;
			clientId?: number;
			startDate?: Date;
			endDate?: Date;
			search?: string;
			assigneeId?: number;
		},
		page: number = 1,
		limit: number = 25,
	): Promise<PaginatedResponse<Claim>> {
		try {
			const queryBuilder = this.claimsRepository
				.createQueryBuilder('claim')
				.leftJoinAndSelect('claim.owner', 'owner')
				.leftJoinAndSelect('claim.branch', 'branch')
				.where('claim.isDeleted = :isDeleted', { isDeleted: false });

			if (filters?.status) {
				queryBuilder.andWhere('claim.status = :status', { status: filters.status });
			}

			if (filters?.startDate && filters?.endDate) {
				queryBuilder.andWhere('claim.createdAt BETWEEN :startDate AND :endDate', {
					startDate: filters.startDate,
					endDate: filters.endDate,
				});
			}

			if (filters?.search) {
				queryBuilder.andWhere(
					'(owner.name ILIKE :search OR owner.surname ILIKE :search OR claim.amount ILIKE :search OR claim.category ILIKE :search)',
					{ search: `%${filters.search}%` },
				);
			}

			// Add pagination
			queryBuilder
				.skip((page - 1) * limit)
				.take(limit)
				.orderBy('claim.createdAt', 'DESC');

			const [claims, total] = await queryBuilder.getManyAndCount();

			if (!claims) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const formattedClaims = claims?.map((claim) => ({
				...claim,
				amount: this.formatCurrency(Number(claim?.amount) || 0),
			}));

			return {
				data: formattedClaims,
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

	async findOne(ref: number): Promise<{ message: string; claim: Claim | null; stats: any }> {
		try {
			const claim = await this.claimsRepository.findOne({
				where: {
					uid: ref,
					isDeleted: false,
				},
				relations: ['owner'],
			});

			if (!claim) {
				throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
			}

			const allClaims = await this.claimsRepository.find();
			const stats = this.calculateStats(allClaims);

			const formattedClaim = {
				...claim,
				amount: this.formatCurrency(Number(claim?.amount) || 0),
			};

			return {
				message: process.env.SUCCESS_MESSAGE,
				claim: formattedClaim,
				stats,
			};
		} catch (error) {
			return {
				message: error?.message,
				claim: null,
				stats: null,
			};
		}
	}

	public async claimsByUser(ref: number): Promise<{
		message: string;
		claims: Claim[];
		stats: {
			total: number;
			pending: number;
			approved: number;
			declined: number;
			paid: number;
		};
	}> {
		try {
			const claims = await this.claimsRepository.find({
				where: { owner: { uid: ref } },
			});

			if (!claims) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const formattedClaims = claims?.map((claim) => ({
				...claim,
				amount: this.formatCurrency(Number(claim?.amount) || 0),
			}));

			const stats = this.calculateStats(claims);

			return {
				message: process.env.SUCCESS_MESSAGE,
				claims: formattedClaims,
				stats,
			};
		} catch (error) {
			return {
				message: `could not get claims by user - ${error?.message}`,
				claims: null,
				stats: null,
			};
		}
	}

	async getClaimsForDate(date: Date): Promise<{
		message: string;
		claims: {
			pending: Claim[];
			approved: Claim[];
			declined: Claim[];
			paid: Claim[];
			totalValue: string;
		};
	}> {
		try {
			const claims = await this.claimsRepository.find({
				where: { createdAt: Between(startOfDay(date), endOfDay(date)) },
			});

			if (!claims) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Group claims by status
			const groupedClaims = {
				pending: claims.filter((claim) => claim.status === ClaimStatus.PENDING),
				approved: claims.filter((claim) => claim.status === ClaimStatus.APPROVED),
				declined: claims.filter((claim) => claim.status === ClaimStatus.DECLINED),
				paid: claims.filter((claim) => claim.status === ClaimStatus.PAID),
			};

			return {
				message: process.env.SUCCESS_MESSAGE,
				claims: {
					...groupedClaims,
					totalValue: this.formatCurrency(
						claims?.reduce((sum, claim) => sum + (Number(claim?.amount) || 0), 0),
					),
				},
			};
		} catch (error) {
			return {
				message: error?.message,
				claims: null,
			};
		}
	}

	async update(ref: number, updateClaimDto: UpdateClaimDto): Promise<{ message: string }> {
		try {
			const claim = await this.claimsRepository.findOne({
				where: { uid: ref, isDeleted: false },
				relations: ['owner', 'branch'],
			});

			if (!claim) {
				throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
			}

			// Convert the DTO to the correct types for the entity
			const baseData = {
				comments: updateClaimDto.comment,
				amount: updateClaimDto.amount?.toString(),
				category: updateClaimDto.category,
				status: updateClaimDto.status,
				documentUrl: updateClaimDto.documentUrl,
			};

			const updatedClaim = await this.claimsRepository.update(ref, baseData as DeepPartial<Claim>);

			// Invalidate cache after update
			this.invalidateClaimsCache(claim);

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			const notification = {
				type: NotificationType.USER,
				title: 'Claim Updated',
				message: `A claim has been updated`,
				status: NotificationStatus.UNREAD,
				owner: claim.owner,
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
				owner: claim.owner.uid,
				amount: XP_VALUES.CLAIM,
				action: XP_VALUES_TYPES.CLAIM,
				source: {
					id: String(claim.owner.uid),
					type: XP_VALUES_TYPES.CLAIM,
					details: 'Claim reward',
				},
			});

			return response;
		} catch (error) {
			const response = {
				message: error?.message || 'Failed to update claim',
			};

			return response;
		}
	}

	async remove(ref: number): Promise<{ message: string }> {
		try {
			const claim = await this.claimsRepository.findOne({
				where: { uid: ref, isDeleted: false },
				relations: ['owner'], // Add relations to ensure we have owner data for cache invalidation
			});

			if (!claim) {
				throw new NotFoundException(process.env.DELETE_ERROR_MESSAGE);
			}

			await this.claimsRepository.update({ uid: ref }, { isDeleted: true });

			// Invalidate cache after deletion
			this.invalidateClaimsCache(claim);

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

	async restore(ref: number): Promise<{ message: string }> {
		try {
			const claim = await this.claimsRepository.findOne({
				where: { uid: ref },
				relations: ['owner'], // Add relations to ensure we have owner data for cache invalidation
			});

			if (!claim) {
				throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
			}

			await this.claimsRepository.update(
				{ uid: ref },
				{
					isDeleted: false,
					status: ClaimStatus.DELETED,
				},
			);

			// Invalidate cache after restoration
			this.invalidateClaimsCache(claim);

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

	async getTotalClaimsStats(): Promise<{
		totalClaims: number;
		totalValue: string;
		byCategory: Record<ClaimCategory, number>;
	}> {
		try {
			const claims = await this.claimsRepository.find({
				where: {
					deletedAt: IsNull(),
					status: Not(ClaimStatus.DELETED),
				},
			});

			const byCategory: Record<ClaimCategory, number> = {
				[ClaimCategory.GENERAL]: 0,
				[ClaimCategory.PROMOTION]: 0,
				[ClaimCategory.EVENT]: 0,
				[ClaimCategory.ANNOUNCEMENT]: 0,
				[ClaimCategory.OTHER]: 0,
				[ClaimCategory.HOTEL]: 0,
				[ClaimCategory.TRAVEL]: 0,
				[ClaimCategory.TRANSPORT]: 0,
				[ClaimCategory.OTHER_EXPENSES]: 0,
				[ClaimCategory.ACCOMMODATION]: 0,
				[ClaimCategory.MEALS]: 0,
				[ClaimCategory.TRANSPORTATION]: 0,
				[ClaimCategory.ENTERTAINMENT]: 0,
			};

			claims.forEach((claim) => {
				if (claim?.category) byCategory[claim?.category]++;
			});

			return {
				totalClaims: claims.length,
				totalValue: this.formatCurrency(claims.reduce((sum, claim) => sum + (Number(claim.amount) || 0), 0)),
				byCategory,
			};
		} catch (error) {
			return {
				totalClaims: 0,
				totalValue: this.formatCurrency(0),
				byCategory: {
					[ClaimCategory.GENERAL]: 0,
					[ClaimCategory.PROMOTION]: 0,
					[ClaimCategory.EVENT]: 0,
					[ClaimCategory.ANNOUNCEMENT]: 0,
					[ClaimCategory.OTHER]: 0,
					[ClaimCategory.HOTEL]: 0,
					[ClaimCategory.TRAVEL]: 0,
					[ClaimCategory.TRANSPORT]: 0,
					[ClaimCategory.OTHER_EXPENSES]: 0,
					[ClaimCategory.ACCOMMODATION]: 0,
					[ClaimCategory.MEALS]: 0,
					[ClaimCategory.TRANSPORTATION]: 0,
					[ClaimCategory.ENTERTAINMENT]: 0,
				},
			};
		}
	}

	async getClaimsReport(filter: any) {
		try {
			const claims = await this.claimsRepository.find({
				where: {
					...filter,
					isDeleted: false,
					deletedAt: IsNull(),
					status: Not(ClaimStatus.DELETED),
				},
				relations: ['owner', 'branch'],
			});

			if (!claims) {
				throw new NotFoundException('No claims found for the specified period');
			}

			const groupedClaims = {
				paid: claims.filter((claim) => claim?.status === ClaimStatus.PAID),
				pending: claims.filter((claim) => claim?.status === ClaimStatus.PENDING),
				approved: claims.filter((claim) => claim?.status === ClaimStatus.APPROVED),
				declined: claims.filter((claim) => claim?.status === ClaimStatus.DECLINED),
			};

			const totalValue = claims.reduce((sum, claim) => sum + Number(claim?.amount), 0);
			const totalClaims = claims.length;
			const approvedClaims = groupedClaims.approved.length;
			const avgProcessingTime = this.calculateAverageProcessingTime(claims);
			const categoryBreakdown = this.analyzeCategoryBreakdown(claims);
			const topClaimants = this.analyzeTopClaimants(claims);

			return {
				...groupedClaims,
				total: totalClaims,
				totalValue,
				metrics: {
					totalClaims,
					averageClaimValue: totalValue / totalClaims || 0,
					approvalRate: `${((approvedClaims / totalClaims) * 100).toFixed(1)}%`,
					averageProcessingTime: `${avgProcessingTime} days`,
					categoryBreakdown,
					topClaimants,
					claimValueDistribution: this.analyzeClaimValueDistribution(claims),
					monthlyTrends: this.analyzeMonthlyTrends(claims),
					branchPerformance: this.analyzeBranchPerformance(claims),
				},
			};
		} catch (error) {
			return null;
		}
	}

	private calculateAverageProcessingTime(claims: Claim[]): number {
		const processedClaims = claims.filter(
			(claim) =>
				claim?.status === ClaimStatus.PAID ||
				claim?.status === ClaimStatus.APPROVED ||
				claim?.status === ClaimStatus.DECLINED,
		);

		if (processedClaims.length === 0) return 0;

		const totalProcessingTime = processedClaims.reduce((sum, claim) => {
			const processingTime = claim.updatedAt.getTime() - claim?.createdAt?.getTime();
			return sum + processingTime;
		}, 0);

		// Convert from milliseconds to days
		return Number((totalProcessingTime / (processedClaims.length * 24 * 60 * 60 * 1000)).toFixed(1));
	}

	private analyzeCategoryBreakdown(claims: Claim[]): Array<{
		category: ClaimCategory;
		count: number;
		totalValue: string;
		averageValue: string;
	}> {
		const categoryStats = new Map<
			ClaimCategory,
			{
				count: number;
				totalValue: number;
			}
		>();

		claims.forEach((claim) => {
			if (!categoryStats.has(claim.category)) {
				categoryStats.set(claim.category, {
					count: 0,
					totalValue: 0,
				});
			}

			const stats = categoryStats.get(claim.category);
			stats.count++;
			stats.totalValue += Number(claim.amount);
		});

		return Array.from(categoryStats.entries())
			.map(([category, stats]) => ({
				category,
				count: stats.count,
				totalValue: this.formatCurrency(stats.totalValue),
				averageValue: this.formatCurrency(stats.totalValue / stats.count),
			}))
			.sort((a, b) => b.count - a.count);
	}

	private analyzeTopClaimants(claims: Claim[]): Array<{
		userId: number;
		userName: string;
		totalClaims: number;
		totalValue: string;
		approvalRate: string;
	}> {
		const claimantStats = new Map<
			number,
			{
				name: string;
				claims: number;
				totalValue: number;
				approved: number;
			}
		>();

		claims.forEach((claim) => {
			const userId = claim.owner?.uid;
			const userName = claim.owner?.username;

			if (userId && userName) {
				if (!claimantStats.has(userId)) {
					claimantStats.set(userId, {
						name: userName,
						claims: 0,
						totalValue: 0,
						approved: 0,
					});
				}

				const stats = claimantStats.get(userId);
				stats.claims++;
				stats.totalValue += Number(claim.amount);
				if (claim.status === ClaimStatus.APPROVED || claim.status === ClaimStatus.PAID) {
					stats.approved++;
				}
			}
		});

		return Array.from(claimantStats.entries())
			.map(([userId, stats]) => ({
				userId,
				userName: stats.name,
				totalClaims: stats.claims,
				totalValue: this.formatCurrency(stats.totalValue),
				approvalRate: `${((stats.approved / stats.claims) * 100).toFixed(1)}%`,
			}))
			.sort((a, b) => b.totalClaims - a.totalClaims)
			.slice(0, 10);
	}

	private analyzeClaimValueDistribution(claims: Claim[]): Record<string, number> {
		const ranges = {
			'Under 1000': 0,
			'1000-5000': 0,
			'5000-10000': 0,
			'10000-50000': 0,
			'Over 50000': 0,
		};

		claims.forEach((claim) => {
			const amount = Number(claim.amount);
			if (amount < 1000) ranges['Under 1000']++;
			else if (amount < 5000) ranges['1000-5000']++;
			else if (amount < 10000) ranges['5000-10000']++;
			else if (amount < 50000) ranges['10000-50000']++;
			else ranges['Over 50000']++;
		});

		return ranges;
	}

	private analyzeMonthlyTrends(claims: Claim[]): Array<{
		month: string;
		totalClaims: number;
		totalValue: string;
		approvalRate: string;
	}> {
		const monthlyStats = new Map<
			string,
			{
				claims: number;
				totalValue: number;
				approved: number;
			}
		>();

		claims.forEach((claim) => {
			const month = claim.createdAt.toISOString().slice(0, 7); // YYYY-MM format

			if (!monthlyStats.has(month)) {
				monthlyStats.set(month, {
					claims: 0,
					totalValue: 0,
					approved: 0,
				});
			}

			const stats = monthlyStats.get(month);
			stats.claims++;
			stats.totalValue += Number(claim.amount);
			if (claim.status === ClaimStatus.APPROVED || claim.status === ClaimStatus.PAID) {
				stats.approved++;
			}
		});

		return Array.from(monthlyStats.entries())
			.map(([month, stats]) => ({
				month,
				totalClaims: stats.claims,
				totalValue: this.formatCurrency(stats.totalValue),
				approvalRate: `${((stats.approved / stats.claims) * 100).toFixed(1)}%`,
			}))
			.sort((a, b) => a.month.localeCompare(b.month));
	}

	private analyzeBranchPerformance(claims: Claim[]): Array<{
		branchId: number;
		branchName: string;
		totalClaims: number;
		totalValue: string;
		averageProcessingTime: string;
		approvalRate: string;
	}> {
		const branchStats = new Map<
			number,
			{
				name: string;
				claims: number;
				totalValue: number;
				approved: number;
				totalProcessingTime: number;
				processedClaims: number;
			}
		>();

		claims.forEach((claim) => {
			const branchId = claim.branch?.uid;
			const branchName = claim.branch?.name;

			if (branchId && branchName) {
				if (!branchStats.has(branchId)) {
					branchStats.set(branchId, {
						name: branchName,
						claims: 0,
						totalValue: 0,
						approved: 0,
						totalProcessingTime: 0,
						processedClaims: 0,
					});
				}

				const stats = branchStats.get(branchId);
				stats.claims++;
				stats.totalValue += Number(claim.amount);

				if (claim.status === ClaimStatus.APPROVED || claim.status === ClaimStatus.PAID) {
					stats.approved++;
				}

				if (claim.status !== ClaimStatus.PENDING) {
					stats.processedClaims++;
					stats.totalProcessingTime += claim.updatedAt.getTime() - claim.createdAt.getTime();
				}
			}
		});

		return Array.from(branchStats.entries())
			.map(([branchId, stats]) => ({
				branchId,
				branchName: stats.name,
				totalClaims: stats.claims,
				totalValue: this.formatCurrency(stats.totalValue),
				averageProcessingTime: `${(stats.processedClaims > 0
					? stats.totalProcessingTime / (stats.processedClaims * 24 * 60 * 60 * 1000)
					: 0
				).toFixed(1)} days`,
				approvalRate: `${((stats.approved / stats.claims) * 100).toFixed(1)}%`,
			}))
			.sort((a, b) => b.totalClaims - a.totalClaims);
	}
}
