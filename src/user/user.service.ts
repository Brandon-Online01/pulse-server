import * as bcrypt from 'bcrypt';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { NewSignUp } from '../lib/types/user';
import { AccountStatus } from '../lib/enums/status.enums';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
import { AccessLevel } from '../lib/enums/user.enums';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
	private readonly CACHE_PREFIX = 'users:';
	private readonly CACHE_TTL: number;

	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@Inject(CACHE_MANAGER)
		private cacheManager: Cache,
		private readonly eventEmitter: EventEmitter2,
		private readonly configService: ConfigService,
	) {
		this.CACHE_TTL = this.configService.get<number>('CACHE_EXPIRATION_TIME') || 30;
	}

	private getCacheKey(key: string | number): string {
		return `${this.CACHE_PREFIX}${key}`;
	}

	private async invalidateUserCache(user: User) {
		try {
			// Get all cache keys
			const keys = await this.cacheManager.store.keys();
			
			// Keys to clear
			const keysToDelete = [];

			// Add user-specific keys
			keysToDelete.push(
				this.getCacheKey(user.uid),
				this.getCacheKey(user.email),
				this.getCacheKey(user.username),
				`${this.CACHE_PREFIX}all`,
				`${this.CACHE_PREFIX}stats`
			);

			// Add organization and branch specific keys
			if (user.organisation?.uid) {
				keysToDelete.push(`${this.CACHE_PREFIX}org_${user.organisation.uid}`);
			}
			if (user.branch?.uid) {
				keysToDelete.push(`${this.CACHE_PREFIX}branch_${user.branch.uid}`);
			}

			// Add access level specific keys
			if (user.accessLevel) {
				keysToDelete.push(`${this.CACHE_PREFIX}access_${user.accessLevel}`);
			}

			// Add status specific keys
			if (user.status) {
				keysToDelete.push(`${this.CACHE_PREFIX}status_${user.status}`);
			}

			// Clear all pagination and filtered user list caches
			const userListCaches = keys.filter(key => 
				key.startsWith(`${this.CACHE_PREFIX}page`) || 
				key.includes('_limit') ||
				key.includes('_filter')
			);
			keysToDelete.push(...userListCaches);

			// Clear all caches
			await Promise.all(keysToDelete.map(key => this.cacheManager.del(key)));

			// Emit event for other services that might be caching user data
			this.eventEmitter.emit('users.cache.invalidate', {
				userId: user.uid,
				keys: keysToDelete
			});
		} catch (error) {
			console.error('Error invalidating user cache:', error);
		}
	}

	private excludePassword(user: User): Omit<User, 'password'> {
		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	async create(createUserDto: CreateUserDto): Promise<{ message: string }> {
		try {
			if (createUserDto.password) {
				createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
			}

			const user = await this.userRepository.save(createUserDto);

			if (!user) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Invalidate cache after creation
			await this.invalidateUserCache(user);

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

	async findAll(
		filters?: {
			status?: AccountStatus;
			accessLevel?: AccessLevel;
			search?: string;
			branchId?: number;
			organisationId?: number;
		},
		page: number = 1,
		limit: number = Number(process.env.DEFAULT_PAGE_LIMIT)
	): Promise<PaginatedResponse<Omit<User, 'password'>>> {
		try {
			const queryBuilder = this.userRepository
				.createQueryBuilder('user')
				.leftJoinAndSelect('user.branch', 'branch')
				.leftJoinAndSelect('user.organisation', 'organisation')
				.where('user.isDeleted = :isDeleted', { isDeleted: false });

			if (filters?.status) {
				queryBuilder.andWhere('user.status = :status', { status: filters.status });
			}

			if (filters?.accessLevel) {
				queryBuilder.andWhere('user.accessLevel = :accessLevel', { accessLevel: filters.accessLevel });
			}

			if (filters?.branchId) {
				queryBuilder.andWhere('branch.uid = :branchId', { branchId: filters.branchId });
			}

			if (filters?.organisationId) {
				queryBuilder.andWhere('organisation.uid = :organisationId', { organisationId: filters.organisationId });
			}

			if (filters?.search) {
				queryBuilder.andWhere(
					'(user.name ILIKE :search OR user.surname ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search)',
					{ search: `%${filters.search}%` }
				);
			}

			// Add pagination
			queryBuilder
				.skip((page - 1) * limit)
				.take(limit)
				.orderBy('user.createdAt', 'DESC');

			const [users, total] = await queryBuilder.getManyAndCount();

			if (!users) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			return {
				data: users.map(user => this.excludePassword(user)),
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

	async findOne(searchParameter: number): Promise<{ user: Omit<User, 'password'> | null; message: string }> {
		try {
			const user = await this.userRepository.findOne({
				where: [{ uid: searchParameter, isDeleted: false }],
				select: {
					uid: true,
					name: true,
					surname: true,
					email: true,
					username: true,
					accessLevel: true,
					organisationRef: true,
					createdAt: true,
					updatedAt: true,
					isDeleted: true,
					status: true,
					verificationToken: true,
					resetToken: true,
					tokenExpires: true
				},
				relations: [
					'userProfile',
					'userEmployeementProfile', 
					'userAttendances',
					'userClaims',
					'userDocs',
					'leads',
					'journals',
					'tasks',
					'articles', 
					'assets',
					'trackings',
					'orders',
					'notifications',
					'branch',
					'clients',
					'checkIns',
					'reports',
					'rewards',
					'organisation'
				]
			});

			if (!user) {
				return {
					user: null,
					message: process.env.NOT_FOUND_MESSAGE
				};
			}

			return {
				user,
				message: process.env.SUCCESS_MESSAGE
			};
		} catch (error) {
			return {
				message: error?.message,
				user: null
			};
		}
	}

	async findOneByEmail(email: string): Promise<{ user: Omit<User, 'password'> | null; message: string }> {
		try {
			const user = await this.userRepository.findOne({ where: { email } });

			if (!user) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				user: this.excludePassword(user),
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				user: null,
			};

			return response;
		}
	}

	async findOneForAuth(searchParameter: string): Promise<{ user: User | null; message: string }> {
		try {
			const user = await this.userRepository.findOne({
				where: [
					{
						username: searchParameter,
						isDeleted: false,
						status: AccountStatus.ACTIVE,
					},
				],
				relations: ['branch', 'rewards'],
			});

			if (!user) {
				return {
					user: null,
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			return {
				user,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			const response = {
				message: error?.message,
				user: null,
			};

			return response;
		}
	}

	async findOneByUid(searchParameter: number): Promise<{ user: Omit<User, 'password'> | null; message: string }> {
		try {
			const user = await this.userRepository.findOne({
				where: [{ uid: searchParameter, isDeleted: false }],
				relations: ['branch', 'rewards'],
			});

			if (!user) {
				return {
					user: null,
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			return {
				user: this.excludePassword(user),
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			const response = {
				message: error?.message,
				user: null,
			};

			return response;
		}
	}

	async getUsersByRole(recipients: string[]): Promise<{ users: Omit<User, 'password'>[] | null; message: string }> {
		try {
			const users = await this.userRepository.find({
				where: { email: In(recipients) },
			});

			if (!users) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			return {
				users: users.map(user => this.excludePassword(user)),
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			const response = {
				message: error?.message,
				users: null,
			};

			return response;
		}
	}

	async update(ref: string, updateUserDto: UpdateUserDto): Promise<{ message: string }> {
		try {
			const user = await this.userRepository.findOne({
				where: { userref: ref, isDeleted: false },
				relations: ['organisation', 'branch']
			});

			if (!user) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.userRepository.update(ref, updateUserDto);

			// Invalidate cache after update
			await this.invalidateUserCache(user);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async remove(ref: string): Promise<{ message: string }> {
		try {
			const user = await this.userRepository.findOne({
				where: { userref: ref, isDeleted: false },
				relations: ['organisation', 'branch']
			});

			if (!user) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.userRepository.update(
				{ userref: ref },
				{
					isDeleted: true,
					status: AccountStatus.INACTIVE,
				},
			);

			// Invalidate cache after deletion
			await this.invalidateUserCache(user);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async createPendingUser(userData: NewSignUp): Promise<void> {
		try {
			if (userData?.password) {
				userData.password = await bcrypt.hash(userData.password, 10);
			}

			const user = await this.userRepository.save({
				...userData,
				status: userData?.status as AccountStatus,
			});

			// Invalidate cache after creating pending user
			await this.invalidateUserCache(user);

			this.schedulePendingUserCleanup(userData?.email, userData?.tokenExpires);
		} catch (error) {
			throw new Error(error?.message);
		}
	}

	private schedulePendingUserCleanup(email: string, expiryDate: Date): void {
		const timeUntilExpiry = expiryDate.getTime() - Date.now();

		setTimeout(async () => {
			const user = await this.userRepository.findOne({ where: { email } });

			if (user && user?.status === 'pending') {
				await this.userRepository.update({ email }, { isDeleted: true });
			}
		}, timeUntilExpiry);
	}

	async restore(ref: number): Promise<{ message: string }> {
		try {
			const user = await this.userRepository.findOne({
				where: { uid: ref },
				relations: ['organisation', 'branch']
			});

			if (!user) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.userRepository.update(
				{ uid: ref },
				{
					isDeleted: false,
					status: AccountStatus.ACTIVE,
				},
			);

			// Invalidate cache after restoration
			await this.invalidateUserCache(user);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async findByVerificationToken(token: string): Promise<User | null> {
		try {
			return await this.userRepository.findOne({
				where: { verificationToken: token, isDeleted: false },
			});
		} catch (error) {
			return null;
		}
	}

	async findByResetToken(token: string): Promise<User | null> {
		try {
			return await this.userRepository.findOne({
				where: { resetToken: token, isDeleted: false },
			});
		} catch (error) {
			return null;
		}
	}

	async markEmailAsVerified(uid: number): Promise<void> {
		const user = await this.userRepository.findOne({
			where: { uid },
			relations: ['organisation', 'branch']
		});

		if (user) {
			await this.userRepository.update(
				{ uid },
				{
					status: AccountStatus.ACTIVE,
					verificationToken: null,
					tokenExpires: null,
				},
			);

			// Invalidate cache after email verification
			await this.invalidateUserCache(user);
		}
	}

	async setPassword(uid: number, hashedPassword: string): Promise<void> {
		const user = await this.userRepository.findOne({
			where: { uid },
			relations: ['organisation', 'branch']
		});

		if (user) {
			await this.userRepository.update(
				{ uid },
				{
					password: hashedPassword,
					verificationToken: null,
					tokenExpires: null,
					status: AccountStatus.ACTIVE,
				},
			);

			// Invalidate cache after password change
			await this.invalidateUserCache(user);
		}
	}

	async setResetToken(uid: number, token: string): Promise<void> {
		const user = await this.userRepository.findOne({
			where: { uid },
			relations: ['organisation', 'branch']
		});

		if (user) {
			await this.userRepository.update(
				{ uid },
				{
					resetToken: token,
					tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
				},
			);

			// Invalidate cache after setting reset token
			await this.invalidateUserCache(user);
		}
	}

	async resetPassword(uid: number, hashedPassword: string): Promise<void> {
		const user = await this.userRepository.findOne({
			where: { uid },
			relations: ['organisation', 'branch']
		});

		if (user) {
			await this.userRepository.update(
				{ uid },
				{
					password: hashedPassword,
					resetToken: null,
					tokenExpires: null,
				},
			);

			// Invalidate cache after password reset
			await this.invalidateUserCache(user);
		}
	}
}
