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
	) {
		this.currencyLocale = this.configService.get<string>('CURRENCY_LOCALE') || 'en-ZA';
		this.currencyCode = this.configService.get<string>('CURRENCY_CODE') || 'ZAR';
		this.currencySymbol = this.configService.get<string>('CURRENCY_SYMBOL') || 'R';
	}

	private formatCurrency(amount: number): string {
		return new Intl.NumberFormat(this.currencyLocale, {
			style: 'currency',
			currency: this.currencyCode
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
			pending: claims?.filter(claim => claim?.status === ClaimStatus.PENDING)?.length || 0,
			approved: claims?.filter(claim => claim?.status === ClaimStatus.APPROVED)?.length || 0,
			declined: claims?.filter(claim => claim?.status === ClaimStatus.DECLINED)?.length || 0,
			paid: claims?.filter(claim => claim?.status === ClaimStatus.PAID)?.length || 0,
		};
	}

	async create(createClaimDto: CreateClaimDto): Promise<{ message: string }> {
		try {
			const claim = await this.claimsRepository.save(createClaimDto as unknown as DeepPartial<Claim>);

			if (!claim) {
				throw new NotFoundException(process.env.CREATE_ERROR_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			}

			const notification = {
				type: NotificationType.USER,
				title: 'New Claim',
				message: `A new claim has been created`,
				status: NotificationStatus.UNREAD,
				owner: claim?.owner
			}

			const recipients = [AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.OWNER, AccessLevel.SUPERVISOR, AccessLevel.USER]

			this.eventEmitter.emit('send.notification', notification, recipients);

			await this.rewardsService.awardXP({
				owner: createClaimDto.owner.uid,
				amount: XP_VALUES.CLAIM,
				action: XP_VALUES_TYPES.CLAIM,
				source: {
					id: createClaimDto.owner.uid.toString(),
					type: XP_VALUES_TYPES.CLAIM,
					details: 'Claim reward'
				}
			});

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}

			return response;
		}
	}

	async findAll(): Promise<{
		message: string, claims: Claim[] | null, stats: any
	}> {
		try {
			const claims = await this.claimsRepository.find({
				where: {
					isDeleted: false,
					deletedAt: IsNull(),
					status: Not(ClaimStatus.DELETED)
				},
				relations: ['owner']
			});

			if (!claims) {
				throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
			}

			const formattedClaims = claims?.map(claim => ({
				...claim,
				amount: this.formatCurrency(Number(claim?.amount) || 0)
			}));

			const stats = this.calculateStats(claims);

			const response = {
				stats: {
					total: stats?.total,
					pending: stats?.pending,
					approved: stats?.approved,
					declined: stats?.declined,
					paid: stats?.paid,
				},
				claims: formattedClaims,
			}

			return {
				message: process.env.SUCCESS_MESSAGE,
				claims: formattedClaims,
				stats: response
			};
		} catch (error) {
			return {
				message: error?.message,
				claims: null,
				stats: null
			};
		}
	}

	async findOne(ref: number): Promise<{ message: string, claim: Claim | null, stats: any }> {
		try {
			const claim = await this.claimsRepository.findOne({
				where: {
					uid: ref,
					isDeleted: false
				},
				relations: ['owner']
			});

			if (!claim) {
				throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
			}

			const allClaims = await this.claimsRepository.find();
			const stats = this.calculateStats(allClaims);

			const formattedClaim = {
				...claim,
				amount: this.formatCurrency(Number(claim?.amount) || 0)
			};

			return {
				message: process.env.SUCCESS_MESSAGE,
				claim: formattedClaim,
				stats
			};
		} catch (error) {
			return {
				message: error?.message,
				claim: null,
				stats: null
			};
		}
	}

	public async claimsByUser(ref: number): Promise<{
		message: string,
		claims: Claim[],
		stats: {
			total: number;
			pending: number;
			approved: number;
			declined: number;
			paid: number;
		}
	}> {
		try {
			const claims = await this.claimsRepository.find({
				where: { owner: { uid: ref, isDeleted: false } }
			});

			if (!claims) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const formattedClaims = claims?.map(claim => ({
				...claim,
				amount: this.formatCurrency(Number(claim?.amount) || 0)
			}));

			const stats = this.calculateStats(claims);

			return {
				message: process.env.SUCCESS_MESSAGE,
				claims: formattedClaims,
				stats
			};
		} catch (error) {
			return {
				message: `could not get claims by user - ${error?.message}`,
				claims: null,
				stats: null
			};
		}
	}

	async getClaimsForDate(date: Date): Promise<{
		message: string,
		claims: {
			pending: Claim[],
			approved: Claim[],
			declined: Claim[],
			paid: Claim[],
			totalValue: string
		}
	}> {
		try {
			const claims = await this.claimsRepository.find({
				where: { createdAt: Between(startOfDay(date), endOfDay(date)) }
			});

			if (!claims) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Group claims by status
			const groupedClaims = {
				pending: claims.filter(claim => claim.status === ClaimStatus.PENDING),
				approved: claims.filter(claim => claim.status === ClaimStatus.APPROVED),
				declined: claims.filter(claim => claim.status === ClaimStatus.DECLINED),
				paid: claims.filter(claim => claim.status === ClaimStatus.PAID),
			};

			return {
				message: process.env.SUCCESS_MESSAGE,
				claims: {
					...groupedClaims,
					totalValue: this.formatCurrency(claims?.reduce((sum, claim) => sum + (Number(claim?.amount) || 0), 0))
				}
			};
		} catch (error) {
			return {
				message: error?.message,
				claims: null
			};
		}
	}

	async update(ref: number, updateClaimDto: UpdateClaimDto): Promise<{ message: string }> {
		try {
			const claim = await this.claimsRepository.findOne({
				where: { uid: ref, isDeleted: false },
				relations: ['owner']
			});

			if (!claim) {
				throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
			}

			await this.claimsRepository.update(ref, updateClaimDto as unknown as DeepPartial<Claim>);

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			}

			const notification = {
				type: NotificationType.USER,
				title: 'Claim Updated',
				message: `A claim has been updated`,
				status: NotificationStatus.UNREAD,
				owner: claim?.owner
			}

			const recipients = [AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.OWNER, AccessLevel.SUPERVISOR, AccessLevel.USER]

			this.eventEmitter.emit('send.notification', notification, recipients);

			await this.rewardsService.awardXP({
				owner: updateClaimDto.owner.uid,
				amount: XP_VALUES.CLAIM,
				action: XP_VALUES_TYPES.CLAIM,
				source: {
					id: updateClaimDto.owner.uid.toString(),
					type: XP_VALUES_TYPES.CLAIM,
					details: 'Claim reward'
				}
			});

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}

			return response;
		}
	}

	async remove(ref: number): Promise<{ message: string }> {
		try {
			const claim = await this.claimsRepository.findOne({
				where: { uid: ref, isDeleted: false }
			});

			if (!claim) {
				throw new NotFoundException(process.env.DELETE_ERROR_MESSAGE);
			};

			await this.claimsRepository.update(
				{ uid: ref },
				{ isDeleted: true }
			);

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}

			return response;
		}
	}

	async restore(ref: number): Promise<{ message: string }> {
		try {
			await this.claimsRepository.update(
				{ uid: ref },
				{
					isDeleted: false,
					status: ClaimStatus.DELETED
				}
			);

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}

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
					status: Not(ClaimStatus.DELETED)
				}
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
				[ClaimCategory.ENTERTAINMENT]: 0
			};

			claims.forEach(claim => {
				if (claim?.category) byCategory[claim?.category]++;
			});

			return {
				totalClaims: claims.length,
				totalValue: this.formatCurrency(claims.reduce((sum, claim) => sum + (Number(claim.amount) || 0), 0)),
				byCategory
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
					[ClaimCategory.ENTERTAINMENT]: 0
				}
			};
		}
	}
}
