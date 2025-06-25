/**
 * UserService - Comprehensive User Management Service
 *
 * This service handles all user-related operations including:
 * - User CRUD operations with organization and branch scoping
 * - Authentication and authorization management
 * - User target setting and progress tracking
 * - Email verification and password reset workflows
 * - User invitation and re-invitation functionality
 * - Advanced caching and performance optimization
 * - User metrics and analytics calculation
 *
 * Features:
 * - Multi-tenant support with organization and branch isolation
 * - Redis caching for improved performance
 * - Event-driven architecture for real-time updates
 * - Comprehensive logging and error handling
 * - Role-based access control (RBAC) integration
 * - Bulk operations support
 * - Email notification integration
 *
 * @author Loro Development Team
 * @version 1.0.0
 * @since 1.0.0
 */

import * as bcrypt from 'bcrypt';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { NewSignUp } from '../lib/types/user';
import { AccountStatus } from '../lib/enums/status.enums';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
import { AccessLevel } from '../lib/enums/user.enums';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { CreateUserTargetDto } from './dto/create-user-target.dto';
import { UpdateUserTargetDto } from './dto/update-user-target.dto';
import { UserTarget } from './entities/user-target.entity';
import { Quotation } from '../shop/entities/quotation.entity';
import { OrderStatus } from '../lib/enums/status.enums';
import { Lead } from '../leads/entities/lead.entity';
import { Client } from '../clients/entities/client.entity';
import { CheckIn } from '../check-ins/entities/check-in.entity';
import { Between } from 'typeorm';
import { EmailType } from '../lib/enums/email.enums';
import { NewUserWelcomeData } from '../lib/types/email-templates.types';
import { ExternalTargetUpdateDto, TargetUpdateMode } from './dto/external-target-update.dto';

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);
	private readonly CACHE_PREFIX = 'users:';
	private readonly CACHE_TTL: number;

	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(Quotation)
		private quotationRepository: Repository<Quotation>,
		@InjectRepository(Lead)
		private leadRepository: Repository<Lead>,
		@InjectRepository(Client)
		private clientRepository: Repository<Client>,
		@InjectRepository(CheckIn)
		private checkInRepository: Repository<CheckIn>,
		@Inject(CACHE_MANAGER)
		private cacheManager: Cache,
		private readonly eventEmitter: EventEmitter2,
		private readonly configService: ConfigService,
	) {
		this.CACHE_TTL = this.configService.get<number>('CACHE_EXPIRATION_TIME') || 30;
		this.logger.log('UserService initialized with cache TTL: ' + this.CACHE_TTL + 'ms');
	}

	/**
	 * Generate cache key with consistent prefix
	 * @param key - The key identifier (uid, email, username, etc.)
	 * @returns Formatted cache key with prefix
	 */
	private getCacheKey(key: string | number): string {
		return `${this.CACHE_PREFIX}${key}`;
	}

	/**
	 * Comprehensive cache invalidation for user-related data
	 * Clears all relevant cache entries when user data changes
	 * @param user - User entity to invalidate cache for
	 */
	private async invalidateUserCache(user: User) {
		try {
			this.logger.debug(`Invalidating cache for user: ${user.uid} (${user.email})`);

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
				`${this.CACHE_PREFIX}stats`,
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
			const userListCaches = keys.filter(
				(key) =>
					key.startsWith(`${this.CACHE_PREFIX}page`) || key.includes('_limit') || key.includes('_filter'),
			);
			keysToDelete.push(...userListCaches);

			// Clear all caches
			await Promise.all(keysToDelete.map((key) => this.cacheManager.del(key)));

			this.logger.debug(`Cache invalidated for user ${user.uid}. Cleared ${keysToDelete.length} cache keys`);

			// Emit event for other services that might be caching user data
			this.eventEmitter.emit('users.cache.invalidate', {
				userId: user.uid,
				keys: keysToDelete,
			});
		} catch (error) {
			this.logger.error(`Error invalidating user cache for user ${user.uid}:`, error.message);
		}
	}

	/**
	 * Remove password from user object for safe return to client
	 * @param user - User entity with password
	 * @returns User entity without password field
	 */
	private excludePassword(user: User): Omit<User, 'password'> {
		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	/**
	 * Create a new user with optional organization and branch assignment
	 * Includes password hashing, cache invalidation, and welcome email
	 * @param createUserDto - User creation data
	 * @param orgId - Optional organization ID to assign user
	 * @param branchId - Optional branch ID to assign user
	 * @returns Success message or error details
	 */
	async create(createUserDto: CreateUserDto, orgId?: number, branchId?: number): Promise<{ message: string }> {
		const startTime = Date.now();
		this.logger.log(
			`Creating new user: ${createUserDto.email} ${orgId ? `in org: ${orgId}` : ''} ${
				branchId ? `in branch: ${branchId}` : ''
			}`,
		);

		try {
			// Hash password if provided
			if (createUserDto.password) {
				this.logger.debug('Hashing user password');
				createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
			}

			// Add organization and branch data if provided
			const userData = {
				...createUserDto,
				...(orgId && { organisation: { uid: orgId } }),
				...(branchId && { branch: { uid: branchId } }),
			};

			this.logger.debug('Saving user to database');
			const user = await this.userRepository.save(userData);

			if (!user) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			this.logger.log(`User created successfully: ${user.uid} (${user.email})`);

			// Invalidate cache after creation
			await this.invalidateUserCache(user);

			// Send welcome email to the new user
			this.logger.debug('Sending welcome email to new user');
			await this.sendWelcomeEmail(user);

			const executionTime = Date.now() - startTime;
			this.logger.log(`User creation completed in ${executionTime}ms for user: ${user.email}`);

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to create user: ${createUserDto.email} after ${executionTime}ms. Error: ${error.message}`,
			);

			const response = {
				message: error?.message,
			};

			return response;
		}
	}

	/**
	 * Retrieve paginated list of users with advanced filtering capabilities
	 * Supports filtering by status, access level, organization, branch, and search terms
	 * @param filters - Optional filters for user search
	 * @param page - Page number for pagination (default: 1)
	 * @param limit - Number of users per page (default: from env)
	 * @returns Paginated response with user data and metadata
	 */
	async findAll(
		filters?: {
			status?: AccountStatus;
			accessLevel?: AccessLevel;
			search?: string;
			branchId?: number;
			organisationId?: number;
			orgId?: number;
			userBranchId?: number;
		},
		page: number = 1,
		limit: number = Number(process.env.DEFAULT_PAGE_LIMIT),
	): Promise<PaginatedResponse<Omit<User, 'password'>>> {
		const startTime = Date.now();
		this.logger.log(`Fetching users with filters: ${JSON.stringify(filters)}, page: ${page}, limit: ${limit}`);

		try {
			this.logger.debug('Building query with filters and pagination');
			const queryBuilder = this.userRepository
				.createQueryBuilder('user')
				.leftJoinAndSelect('user.branch', 'branch')
				.leftJoinAndSelect('user.organisation', 'organisation')
				.leftJoinAndSelect('user.userTarget', 'userTarget')
				.where('user.isDeleted = :isDeleted', { isDeleted: false });

			// Apply organization filter if provided
			if (filters?.orgId) {
				this.logger.debug(`Applying organization filter: ${filters.orgId}`);
				queryBuilder.andWhere('organisation.uid = :orgId', { orgId: filters.orgId });
			}

			// Only apply branch filter if user has a branch and no specific branch filter is provided
			if (filters?.userBranchId && !filters?.branchId) {
				this.logger.debug(`Applying user branch filter: ${filters.userBranchId}`);
				queryBuilder.andWhere('branch.uid = :userBranchId', { userBranchId: filters.userBranchId });
			}

			if (filters?.status) {
				this.logger.debug(`Applying status filter: ${filters.status}`);
				queryBuilder.andWhere('user.status = :status', { status: filters.status });
			}

			if (filters?.accessLevel) {
				this.logger.debug(`Applying access level filter: ${filters.accessLevel}`);
				queryBuilder.andWhere('user.accessLevel = :accessLevel', { accessLevel: filters.accessLevel });
			}

			if (filters?.branchId) {
				this.logger.debug(`Applying branch filter: ${filters.branchId}`);
				queryBuilder.andWhere('branch.uid = :branchId', { branchId: filters.branchId });
			}

			if (filters?.organisationId) {
				this.logger.debug(`Applying organisation filter: ${filters.organisationId}`);
				queryBuilder.andWhere('organisation.uid = :organisationId', { organisationId: filters.organisationId });
			}

			if (filters?.search) {
				this.logger.debug(`Applying search filter: ${filters.search}`);
				queryBuilder.andWhere(
					'(user.name ILIKE :search OR user.surname ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search)',
					{ search: `%${filters.search}%` },
				);
			}

			// Add pagination
			queryBuilder
				.skip((page - 1) * limit)
				.take(limit)
				.orderBy('user.createdAt', 'DESC');

			this.logger.debug('Executing query to fetch users');
			const [users, total] = await queryBuilder.getManyAndCount();

			if (!users) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const executionTime = Date.now() - startTime;
			this.logger.log(`Successfully fetched ${users.length} users out of ${total} total in ${executionTime}ms`);

			return {
				data: users.map((user) => this.excludePassword(user)),
				meta: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
				},
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(`Failed to fetch users after ${executionTime}ms. Error: ${error.message}`);

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

	/**
	 * Find a single user by ID with optional organization and branch scoping
	 * Includes caching for improved performance
	 * @param searchParameter - User ID to search for
	 * @param orgId - Optional organization ID for scoping
	 * @param branchId - Optional branch ID for scoping
	 * @returns User data without password or null with message
	 */
	async findOne(
		searchParameter: number,
		orgId?: number,
		branchId?: number,
	): Promise<{ user: Omit<User, 'password'> | null; message: string }> {
		const startTime = Date.now();
		this.logger.log(
			`Finding user: ${searchParameter} ${orgId ? `in org: ${orgId}` : ''} ${
				branchId ? `in branch: ${branchId}` : ''
			}`,
		);

		try {
			const cacheKey = this.getCacheKey(searchParameter);
			this.logger.debug(`Checking cache for user: ${searchParameter}`);
			const cachedUser = await this.cacheManager.get<User>(cacheKey);

			if (cachedUser) {
				this.logger.debug(`Cache hit for user: ${searchParameter}`);

				// If org/branch filters are provided, verify cached user belongs to them
				if (orgId && cachedUser.organisation?.uid !== orgId) {
					this.logger.warn(`User ${searchParameter} found in cache but doesn't belong to org ${orgId}`);
					throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
				}
				if (branchId && cachedUser.branch?.uid !== branchId) {
					this.logger.warn(`User ${searchParameter} found in cache but doesn't belong to branch ${branchId}`);
					throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
				}

				const executionTime = Date.now() - startTime;
				this.logger.log(`User ${searchParameter} retrieved from cache in ${executionTime}ms`);

				return {
					user: this.excludePassword(cachedUser),
					message: process.env.SUCCESS_MESSAGE,
				};
			}

			this.logger.debug(`Cache miss for user: ${searchParameter}, querying database`);

			// Build where conditions
			const whereConditions: any = {
				uid: searchParameter,
				isDeleted: false,
			};

			// Add organization filter if provided
			if (orgId) {
				whereConditions.organisation = { uid: orgId };
			}

			// Add branch filter if provided
			if (branchId) {
				whereConditions.branch = { uid: branchId };
			}

			const user = await this.userRepository.findOne({
				where: whereConditions,
				relations: ['organisation', 'branch', 'userProfile', 'userEmployeementProfile', 'userTarget'],
			});

			if (!user) {
				this.logger.warn(`User ${searchParameter} not found in database`);
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			this.logger.debug(`User ${searchParameter} found in database, caching result`);
			// Cache the user data
			await this.cacheManager.set(cacheKey, user, this.CACHE_TTL);

			const executionTime = Date.now() - startTime;
			this.logger.log(`User ${searchParameter} (${user.email}) retrieved from database in ${executionTime}ms`);

			return {
				user: this.excludePassword(user),
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to find user ${searchParameter} after ${executionTime}ms. Error: ${error.message}`,
			);

			return {
				user: null,
				message: error?.message,
			};
		}
	}

	/**
	 * Find user by email address
	 * @param email - Email address to search for
	 * @returns User data without password or null with message
	 */
	async findOneByEmail(email: string): Promise<{ user: Omit<User, 'password'> | null; message: string }> {
		const startTime = Date.now();
		this.logger.log(`Finding user by email: ${email}`);

		try {
			this.logger.debug(`Querying database for user with email: ${email}`);
			const user = await this.userRepository.findOne({ where: { email } });

			if (!user) {
				this.logger.warn(`User not found with email: ${email}`);
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const executionTime = Date.now() - startTime;
			this.logger.log(`User found by email: ${email} (${user.uid}) in ${executionTime}ms`);

			const response = {
				user: this.excludePassword(user),
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to find user by email: ${email} after ${executionTime}ms. Error: ${error.message}`,
			);

			const response = {
				message: error?.message,
				user: null,
			};

			return response;
		}
	}

	/**
	 * Find user for authentication purposes (includes password)
	 * Only returns active users for security
	 * @param searchParameter - Username to search for
	 * @returns User with password for authentication or null
	 */
	async findOneForAuth(searchParameter: string): Promise<{ user: User | null; message: string }> {
		const startTime = Date.now();
		this.logger.log(`Finding user for authentication: ${searchParameter}`);

		try {
			this.logger.debug(`Querying database for active user: ${searchParameter}`);
			const user = await this.userRepository.findOne({
				where: [
					{
						username: searchParameter,
						isDeleted: false,
						status: AccountStatus.ACTIVE,
					},
				],
				relations: ['branch', 'rewards', 'organisation'],
			});

			if (!user) {
				const executionTime = Date.now() - startTime;
				this.logger.warn(
					`Authentication attempt failed - user not found: ${searchParameter} (${executionTime}ms)`,
				);
				return {
					user: null,
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			const executionTime = Date.now() - startTime;
			this.logger.log(`User found for authentication: ${user.email} in ${executionTime}ms`);

			return {
				user,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to find user for authentication: ${searchParameter} after ${executionTime}ms. Error: ${error.message}`,
			);

			const response = {
				message: error?.message,
				user: null,
			};

			return response;
		}
	}

	/**
	 * Find user by UID with related data
	 * @param searchParameter - User UID to search for
	 * @returns User data without password or null with message
	 */
	async findOneByUid(searchParameter: number): Promise<{ user: Omit<User, 'password'> | null; message: string }> {
		const startTime = Date.now();
		this.logger.log(`Finding user by UID: ${searchParameter}`);

		try {
			this.logger.debug(`Querying database for user with UID: ${searchParameter}`);
			const user = await this.userRepository.findOne({
				where: [{ uid: searchParameter, isDeleted: false }],
				relations: ['branch', 'rewards', 'userTarget', 'organisation'],
			});

			if (!user) {
				const executionTime = Date.now() - startTime;
				this.logger.warn(`User not found with UID: ${searchParameter} (${executionTime}ms)`);
				return {
					user: null,
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			const executionTime = Date.now() - startTime;
			this.logger.log(`User found by UID: ${searchParameter} (${user.email}) in ${executionTime}ms`);

			return {
				user: this.excludePassword(user),
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to find user by UID: ${searchParameter} after ${executionTime}ms. Error: ${error.message}`,
			);

			const response = {
				message: error?.message,
				user: null,
			};

			return response;
		}
	}

	/**
	 * Get users by email addresses (for role-based operations)
	 * @param recipients - Array of email addresses to find users for
	 * @returns Array of users without passwords or null with message
	 */
	async getUsersByRole(recipients: string[]): Promise<{ users: Omit<User, 'password'>[] | null; message: string }> {
		const startTime = Date.now();
		this.logger.log(`Getting users by role for ${recipients.length} recipients`);

		try {
			this.logger.debug(`Querying database for users with emails: ${recipients.join(', ')}`);
			const users = await this.userRepository.find({
				where: { email: In(recipients) },
			});

			if (!users) {
				this.logger.warn(`No users found for provided email addresses`);
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const executionTime = Date.now() - startTime;
			this.logger.log(`Found ${users.length} users by role in ${executionTime}ms`);

			return {
				users: users.map((user) => this.excludePassword(user)),
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(`Failed to get users by role after ${executionTime}ms. Error: ${error.message}`);

			const response = {
				message: error?.message,
				users: null,
			};

			return response;
		}
	}

	/**
	 * Find all active admin users in the system
	 * @returns Array of admin users without passwords or null with message
	 */
	async findAdminUsers(): Promise<{ users: Omit<User, 'password'>[] | null; message: string }> {
		const startTime = Date.now();
		this.logger.log(`Finding all admin users`);

		try {
			this.logger.debug(`Querying database for active admin users`);
			const users = await this.userRepository.find({
				where: {
					accessLevel: AccessLevel.ADMIN,
					isDeleted: false,
					status: AccountStatus.ACTIVE,
				},
			});

			if (!users || users.length === 0) {
				const executionTime = Date.now() - startTime;
				this.logger.warn(`No admin users found in ${executionTime}ms`);
				return {
					users: null,
					message: 'No admin users found',
				};
			}

			const executionTime = Date.now() - startTime;
			this.logger.log(`Found ${users.length} admin users in ${executionTime}ms`);

			return {
				users: users.map((user) => this.excludePassword(user)),
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(`Failed to find admin users after ${executionTime}ms. Error: ${error.message}`);

			return {
				message: error?.message,
				users: null,
			};
		}
	}

	/**
	 * Update user information with optional organization and branch scoping
	 * Includes password hashing and comprehensive cache invalidation
	 * @param ref - User ID to update
	 * @param updateUserDto - Updated user data
	 * @param orgId - Optional organization ID for scoping
	 * @param branchId - Optional branch ID for scoping
	 * @returns Success message or error details
	 */
	async update(
		ref: number,
		updateUserDto: UpdateUserDto,
		orgId?: number,
		branchId?: number,
	): Promise<{ message: string }> {
		const startTime = Date.now();
		this.logger.log(
			`Updating user: ${ref} ${orgId ? `in org: ${orgId}` : ''} ${branchId ? `in branch: ${branchId}` : ''}`,
		);

		try {
			// Build where conditions
			const whereConditions: any = {
				uid: ref,
				isDeleted: false,
			};

			// Add organization filter if provided
			if (orgId) {
				whereConditions.organisation = { uid: orgId };
			}

			// Add branch filter if provided
			if (branchId) {
				whereConditions.branch = { uid: branchId };
			}

			this.logger.debug(`Finding user ${ref} with scope conditions`);
			const user = await this.userRepository.findOne({
				where: whereConditions,
				relations: ['organisation', 'branch'],
			});

			if (!user) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			this.logger.debug(`Found user: ${user.email}, preparing updates`);

			// Hash password if provided
			if (updateUserDto.password) {
				this.logger.debug('Hashing updated password');
				updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
			}

			// Update the user with the provided data
			this.logger.debug('Updating user in database');
			await this.userRepository.update(ref, updateUserDto);

			// Invalidate cache
			await this.invalidateUserCache(user);

			const executionTime = Date.now() - startTime;
			this.logger.log(`User ${ref} (${user.email}) updated successfully in ${executionTime}ms`);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(`Failed to update user ${ref} after ${executionTime}ms. Error: ${error.message}`);

			return {
				message: error?.message,
			};
		}
	}

	/**
	 * Soft delete a user by marking as deleted and inactive
	 * Includes organization and branch scoping for security
	 * @param ref - User ID to delete
	 * @param orgId - Optional organization ID for scoping
	 * @param branchId - Optional branch ID for scoping
	 * @returns Success message or error details
	 */
	async remove(ref: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
		const startTime = Date.now();
		this.logger.log(
			`Removing user: ${ref} ${orgId ? `in org: ${orgId}` : ''} ${branchId ? `in branch: ${branchId}` : ''}`,
		);

		try {
			// Build where conditions
			const whereConditions: any = {
				uid: ref,
				isDeleted: false,
			};

			// Add organization filter if provided
			if (orgId) {
				whereConditions.organisation = { uid: orgId };
			}

			// Add branch filter if provided
			if (branchId) {
				whereConditions.branch = { uid: branchId };
			}

			this.logger.debug(`Finding user ${ref} for deletion with scope conditions`);
			const user = await this.userRepository.findOne({
				where: whereConditions,
				relations: ['organisation', 'branch'],
			});

			if (!user) {
				this.logger.warn(`User ${ref} not found for deletion`);
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			this.logger.debug(`Soft deleting user: ${user.email} (${ref})`);
			await this.userRepository.update(ref, {
				isDeleted: true,
				status: AccountStatus.INACTIVE,
			});

			// Invalidate cache
			await this.invalidateUserCache(user);

			const executionTime = Date.now() - startTime;
			this.logger.log(`User ${ref} (${user.email}) soft deleted successfully in ${executionTime}ms`);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(`Failed to remove user ${ref} after ${executionTime}ms. Error: ${error.message}`);

			return {
				message: error?.message,
			};
		}
	}

	/**
	 * Create a pending user account that requires verification
	 * @param userData - New user signup data
	 */
	async createPendingUser(userData: NewSignUp): Promise<void> {
		const startTime = Date.now();
		this.logger.log(`Creating pending user: ${userData.email}`);

		try {
			if (userData?.password) {
				this.logger.debug(`Hashing password for pending user: ${userData.email}`);
				userData.password = await bcrypt.hash(userData.password, 10);
			}

			this.logger.debug(`Saving pending user to database: ${userData.email}`);
			const user = await this.userRepository.save({
				...userData,
				status: userData?.status as AccountStatus,
			});

			// Invalidate cache after creating pending user
			await this.invalidateUserCache(user);

			this.logger.debug(
				`Scheduling cleanup for pending user: ${userData.email} (expires: ${userData?.tokenExpires})`,
			);
			this.schedulePendingUserCleanup(userData?.email, userData?.tokenExpires);

			const executionTime = Date.now() - startTime;
			this.logger.log(`Pending user created successfully: ${userData.email} (${user.uid}) in ${executionTime}ms`);
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to create pending user: ${userData.email} after ${executionTime}ms. Error: ${error.message}`,
			);
			throw new Error(error?.message);
		}
	}

	/**
	 * Schedule automatic cleanup of pending user accounts that expire
	 * @param email - Email of pending user to cleanup
	 * @param expiryDate - Date when the pending user should be cleaned up
	 */
	private schedulePendingUserCleanup(email: string, expiryDate: Date): void {
		const timeUntilExpiry = expiryDate.getTime() - Date.now();
		this.logger.debug(
			`Scheduling cleanup for pending user: ${email} in ${timeUntilExpiry}ms (expires: ${expiryDate.toISOString()})`,
		);

		setTimeout(async () => {
			this.logger.debug(`Executing scheduled cleanup for pending user: ${email}`);

			try {
				const user = await this.userRepository.findOne({ where: { email } });

				if (user && user?.status === 'pending') {
					this.logger.log(`Cleaning up expired pending user: ${email} (${user.uid})`);
					await this.userRepository.update({ email }, { isDeleted: true });
					this.logger.log(`Expired pending user cleaned up successfully: ${email}`);
				} else {
					this.logger.debug(`No cleanup needed for user: ${email} - either not found or status changed`);
				}
			} catch (error) {
				this.logger.error(`Error during scheduled cleanup for pending user ${email}:`, error.message);
			}
		}, timeUntilExpiry);
	}

	/**
	 * Restore a soft-deleted user account
	 * @param ref - User ID to restore
	 * @param orgId - Optional organization ID for scoping
	 * @param branchId - Optional branch ID for scoping
	 * @returns Success message or error details
	 */
	async restore(ref: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
		const startTime = Date.now();
		this.logger.log(
			`Restoring user: ${ref} ${orgId ? `in org: ${orgId}` : ''} ${branchId ? `in branch: ${branchId}` : ''}`,
		);

		try {
			// Build where conditions for deleted users
			const whereConditions: any = {
				uid: ref,
				isDeleted: true, // Looking for deleted users to restore
			};

			// Add organization filter if provided
			if (orgId) {
				whereConditions.organisation = { uid: orgId };
			}

			// Add branch filter if provided
			if (branchId) {
				whereConditions.branch = { uid: branchId };
			}

			this.logger.debug(`Finding deleted user ${ref} for restoration`);
			const user = await this.userRepository.findOne({
				where: whereConditions,
				relations: ['organisation', 'branch'],
				withDeleted: true, // Include soft-deleted entries
			});

			if (!user) {
				this.logger.warn(`Deleted user ${ref} not found for restoration`);
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			this.logger.debug(`Restoring user: ${user.email} (${ref})`);
			await this.userRepository.update(ref, {
				isDeleted: false,
				status: AccountStatus.INACTIVE, // Set to inactive initially
			});

			// Invalidate cache
			await this.invalidateUserCache(user);

			const executionTime = Date.now() - startTime;
			this.logger.log(`User ${ref} (${user.email}) restored successfully in ${executionTime}ms`);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(`Failed to restore user ${ref} after ${executionTime}ms. Error: ${error.message}`);

			return {
				message: error?.message,
			};
		}
	}

	/**
	 * Find user by verification token
	 * @param token - Verification token to search for
	 * @returns User entity or null
	 */
	async findByVerificationToken(token: string): Promise<User | null> {
		const startTime = Date.now();
		this.logger.log(`Finding user by verification token`);

		try {
			this.logger.debug(`Querying database for user with verification token`);
			const user = await this.userRepository.findOne({
				where: { verificationToken: token, isDeleted: false },
			});

			const executionTime = Date.now() - startTime;
			if (user) {
				this.logger.log(`User found by verification token: ${user.email} (${user.uid}) in ${executionTime}ms`);
			} else {
				this.logger.warn(`No user found with verification token in ${executionTime}ms`);
			}

			return user;
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to find user by verification token after ${executionTime}ms. Error: ${error.message}`,
			);
			return null;
		}
	}

	/**
	 * Find user by password reset token
	 * @param token - Reset token to search for
	 * @returns User entity or null
	 */
	async findByResetToken(token: string): Promise<User | null> {
		const startTime = Date.now();
		this.logger.log(`Finding user by reset token`);

		try {
			this.logger.debug(`Querying database for user with reset token`);
			const user = await this.userRepository.findOne({
				where: { resetToken: token, isDeleted: false },
			});

			const executionTime = Date.now() - startTime;
			if (user) {
				this.logger.log(`User found by reset token: ${user.email} (${user.uid}) in ${executionTime}ms`);
			} else {
				this.logger.warn(`No user found with reset token in ${executionTime}ms`);
			}

			return user;
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(`Failed to find user by reset token after ${executionTime}ms. Error: ${error.message}`);
			return null;
		}
	}

	/**
	 * Mark user email as verified and activate account
	 * @param uid - User ID to verify
	 */
	async markEmailAsVerified(uid: number): Promise<void> {
		const startTime = Date.now();
		this.logger.log(`Marking email as verified for user: ${uid}`);

		try {
			const user = await this.userRepository.findOne({
				where: { uid },
				relations: ['organisation', 'branch'],
			});

			if (user) {
				this.logger.debug(`Activating user account: ${user.email} (${uid})`);
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

				const executionTime = Date.now() - startTime;
				this.logger.log(`Email verified and account activated for user: ${user.email} in ${executionTime}ms`);
			} else {
				this.logger.warn(`User ${uid} not found for email verification`);
			}
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to mark email as verified for user ${uid} after ${executionTime}ms. Error: ${error.message}`,
			);
			throw error;
		}
	}

	/**
	 * Set password for user (typically during account setup)
	 * @param uid - User ID
	 * @param password - New password to set
	 */
	async setPassword(uid: number, password: string): Promise<void> {
		const startTime = Date.now();
		this.logger.log(`Setting password for user: ${uid}`);

		try {
			const user = await this.userRepository.findOne({
				where: { uid },
				relations: ['organisation', 'branch'],
			});

			if (user) {
				this.logger.debug(`Hashing password for user: ${user.email} (${uid})`);
				const hashedPassword = await bcrypt.hash(password, 10);

				this.logger.debug(`Updating password and activating account for user: ${user.email} (${uid})`);
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

				const executionTime = Date.now() - startTime;
				this.logger.log(`Password set and account activated for user: ${user.email} in ${executionTime}ms`);
			} else {
				this.logger.warn(`User ${uid} not found for password setting`);
			}
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to set password for user ${uid} after ${executionTime}ms. Error: ${error.message}`,
			);
			throw error;
		}
	}

	/**
	 * Set password reset token for user
	 * @param uid - User ID
	 * @param token - Reset token to set
	 */
	async setResetToken(uid: number, token: string): Promise<void> {
		const startTime = Date.now();
		this.logger.log(`Setting reset token for user: ${uid}`);

		try {
			const user = await this.userRepository.findOne({
				where: { uid },
				relations: ['organisation', 'branch'],
			});

			if (user) {
				this.logger.debug(`Setting reset token for user: ${user.email} (${uid})`);
				await this.userRepository.update(
					{ uid },
					{
						resetToken: token,
						tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
					},
				);

				// Invalidate cache after setting reset token
				await this.invalidateUserCache(user);

				const executionTime = Date.now() - startTime;
				this.logger.log(`Reset token set for user: ${user.email} in ${executionTime}ms`);
			} else {
				this.logger.warn(`User ${uid} not found for reset token setting`);
			}
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to set reset token for user ${uid} after ${executionTime}ms. Error: ${error.message}`,
			);
			throw error;
		}
	}

	/**
	 * Reset user password using new password
	 * @param uid - User ID
	 * @param password - New password to set
	 */
	async resetPassword(uid: number, password: string): Promise<void> {
		const startTime = Date.now();
		this.logger.log(`Resetting password for user: ${uid}`);

		try {
			const user = await this.userRepository.findOne({
				where: { uid },
				relations: ['organisation', 'branch'],
			});

			if (user) {
				this.logger.debug(`Hashing new password for user: ${user.email} (${uid})`);
				const hashedPassword = await bcrypt.hash(password, 10);

				this.logger.debug(`Updating password in database for user: ${user.email} (${uid})`);
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

				const executionTime = Date.now() - startTime;
				this.logger.log(`Password reset completed for user: ${user.email} in ${executionTime}ms`);
			} else {
				this.logger.warn(`User ${uid} not found for password reset`);
			}
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to reset password for user ${uid} after ${executionTime}ms. Error: ${error.message}`,
			);
			throw error;
		}
	}

	/**
	 * Update user password (for existing users)
	 * @param uid - User ID
	 * @param password - New password to set
	 */
	async updatePassword(uid: number, password: string): Promise<void> {
		const startTime = Date.now();
		this.logger.log(`Updating password for user: ${uid}`);

		try {
			this.logger.debug(`Hashing new password for user: ${uid}`);
			const hashedPassword = await bcrypt.hash(password, 10);

			this.logger.debug(`Updating password in database for user: ${uid}`);
			await this.userRepository.update(uid, {
				password: hashedPassword,
				updatedAt: new Date(),
			});

			const executionTime = Date.now() - startTime;
			this.logger.log(`Password updated successfully for user: ${uid} in ${executionTime}ms`);
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to update password for user ${uid} after ${executionTime}ms. Error: ${error.message}`,
			);
			throw error;
		}
	}

	/**
	 * Get user targets for a specific user with caching
	 * @param userId - User ID to get targets for
	 * @returns User target data or null with message
	 */
	async getUserTarget(userId: number): Promise<{ userTarget: UserTarget | null; message: string }> {
		const startTime = Date.now();
		this.logger.log(`Getting user target for user: ${userId}`);

		try {
			const cacheKey = this.getCacheKey(`target_${userId}`);
			this.logger.debug(`Checking cache for user target: ${userId}`);
			const cachedTarget = await this.cacheManager.get(cacheKey);

			if (cachedTarget) {
				const executionTime = Date.now() - startTime;
				this.logger.log(`User target retrieved from cache for user: ${userId} in ${executionTime}ms`);
				return {
					userTarget: cachedTarget as UserTarget,
					message: process.env.SUCCESS_MESSAGE,
				};
			}

			this.logger.debug(`Cache miss for user target: ${userId}, querying database`);
			const user = await this.userRepository.findOne({
				where: { uid: userId, isDeleted: false },
				relations: ['userTarget'],
			});

			if (!user) {
				this.logger.warn(`User ${userId} not found when getting targets`);
				throw new NotFoundException(`User with ID ${userId} not found`);
			}

			if (!user.userTarget) {
				const executionTime = Date.now() - startTime;
				this.logger.log(`No targets set for user: ${userId} in ${executionTime}ms`);
				return {
					userTarget: null,
					message: 'No targets set for this user',
				};
			}

			this.logger.debug(`Caching user target for user: ${userId}`);
			await this.cacheManager.set(cacheKey, user.userTarget, this.CACHE_TTL);

			const executionTime = Date.now() - startTime;
			this.logger.log(`User target retrieved from database for user: ${userId} in ${executionTime}ms`);

			return {
				userTarget: user.userTarget,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to get user target for user ${userId} after ${executionTime}ms. Error: ${error.message}`,
			);

			return {
				userTarget: null,
				message: error?.message || 'Failed to get user target',
			};
		}
	}

	/**
	 * Set targets for a user (create new or update existing)
	 * @param userId - User ID to set targets for
	 * @param createUserTargetDto - Target data to set
	 * @returns Success message or error details
	 */
	async setUserTarget(userId: number, createUserTargetDto: CreateUserTargetDto): Promise<{ message: string }> {
		const startTime = Date.now();
		this.logger.log(`Setting user target for user: ${userId}`);

		try {
			this.logger.debug(`Finding user ${userId} for target setting`);
			const user = await this.userRepository.findOne({
				where: { uid: userId, isDeleted: false },
				relations: ['userTarget'],
			});

			if (!user) {
				this.logger.warn(`User ${userId} not found for target setting`);
				throw new NotFoundException(`User with ID ${userId} not found`);
			}

			// If user already has targets, update them
			if (user.userTarget) {
				this.logger.debug(`User ${userId} already has targets, updating existing targets`);
				await this.updateUserTarget(userId, createUserTargetDto);

				const executionTime = Date.now() - startTime;
				this.logger.log(`User targets updated for user: ${userId} in ${executionTime}ms`);

				return {
					message: 'User targets updated successfully',
				};
			}

			this.logger.debug(`Creating new user target for user: ${userId}`);
			// Create a new user target
			const userTarget = new UserTarget();

			// Map DTO properties to entity
			Object.assign(userTarget, createUserTargetDto);

			// Save the user target and update the user
			user.userTarget = userTarget;
			await this.userRepository.save(user);

			// Invalidate the cache
			await this.invalidateUserCache(user);
			await this.cacheManager.del(this.getCacheKey(`target_${userId}`));

			const executionTime = Date.now() - startTime;
			this.logger.log(`User targets set successfully for user: ${userId} in ${executionTime}ms`);

			return {
				message: 'User targets set successfully',
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to set user target for user ${userId} after ${executionTime}ms. Error: ${error.message}`,
			);

			return {
				message: error?.message || 'Failed to set user target',
			};
		}
	}

	/**
	 * Update targets for a user
	 * @param userId - User ID to update targets for
	 * @param updateUserTargetDto - Updated target data
	 * @returns Success message or error details
	 */
	async updateUserTarget(userId: number, updateUserTargetDto: UpdateUserTargetDto): Promise<{ message: string }> {
		const startTime = Date.now();
		this.logger.log(`Updating user target for user: ${userId}`);

		try {
			this.logger.debug(`Finding user ${userId} for target update`);
			const user = await this.userRepository.findOne({
				where: { uid: userId, isDeleted: false },
				relations: ['userTarget'],
			});

			if (!user) {
				this.logger.warn(`User ${userId} not found for target update`);
				throw new NotFoundException(`User with ID ${userId} not found`);
			}

			if (!user.userTarget) {
				this.logger.warn(`No targets found for user ${userId} to update`);
				throw new NotFoundException(`No targets found for user with ID ${userId}`);
			}

			this.logger.debug(`Updating target data for user: ${userId}`);
			const updatedUserTarget = {
				...user.userTarget,
				...updateUserTargetDto,
				periodStartDate: new Date(updateUserTargetDto.periodStartDate),
				periodEndDate: new Date(updateUserTargetDto.periodEndDate),
			};

			// Update the user target properties
			Object.assign(user.userTarget, updatedUserTarget);

			// Save the updated user (cascade will update the target)
			this.logger.debug(`Saving updated target for user: ${userId}`);
			await this.userRepository.save(user);

			// Invalidate the cache
			await this.invalidateUserCache(user);
			await this.cacheManager.del(this.getCacheKey(`target_${userId}`));

			const executionTime = Date.now() - startTime;
			this.logger.log(`User targets updated successfully for user: ${userId} in ${executionTime}ms`);

			return {
				message: 'User targets updated successfully',
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to update user target for user ${userId} after ${executionTime}ms. Error: ${error.message}`,
			);

			return {
				message: error?.message || 'Failed to update user target',
			};
		}
	}

	/**
	 * Delete targets for a user
	 * @param userId - User ID to delete targets for
	 * @returns Success message or error details
	 */
	async deleteUserTarget(userId: number): Promise<{ message: string }> {
		const startTime = Date.now();
		this.logger.log(`Deleting user target for user: ${userId}`);

		try {
			this.logger.debug(`Finding user ${userId} for target deletion`);
			const user = await this.userRepository.findOne({
				where: { uid: userId, isDeleted: false },
				relations: ['userTarget'],
			});

			if (!user) {
				this.logger.warn(`User ${userId} not found for target deletion`);
				throw new NotFoundException(`User with ID ${userId} not found`);
			}

			if (!user.userTarget) {
				const executionTime = Date.now() - startTime;
				this.logger.log(`No targets exist for user ${userId} to delete (${executionTime}ms)`);
				return {
					message: 'No targets exist for this user',
				};
			}

			this.logger.debug(`Removing target for user: ${userId}`);
			// Set the target to null
			user.userTarget = null;
			await this.userRepository.save(user);

			// Invalidate the cache
			await this.invalidateUserCache(user);
			await this.cacheManager.del(this.getCacheKey(`target_${userId}`));

			const executionTime = Date.now() - startTime;
			this.logger.log(`User targets deleted successfully for user: ${userId} in ${executionTime}ms`);

			return {
				message: 'User targets deleted successfully',
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to delete user target for user ${userId} after ${executionTime}ms. Error: ${error.message}`,
			);

			return {
				message: error?.message || 'Failed to delete user target',
			};
		}
	}

	/**
	 * Calculates the user's target progress based on related entities.
	 * Triggered by 'user.target.update.required' event.
	 * Currently calculates currentSalesAmount, currentNewLeads, currentNewClients, and currentCheckIns.
	 * @param payload - Event payload with userId
	 */
	@OnEvent('user.target.update.required')
	async calculateUserTargets(payload: { userId: number }): Promise<void> {
		const { userId } = payload;
		const startTime = Date.now();
		this.logger.log(`Calculating user targets for user: ${userId}`);

		try {
			this.logger.debug(`Finding user and target data for user: ${userId}`);
			const user = await this.userRepository.findOne({
				where: { uid: userId, isDeleted: false },
				relations: ['userTarget'],
			});

			if (!user) {
				this.logger.warn(`User ${userId} not found for target calculation`);
				return;
			}

			if (!user.userTarget) {
				this.logger.debug(`No target set for user ${userId}, skipping calculation`);
				return;
			}

			const { userTarget } = user;

			if (!userTarget.periodStartDate || !userTarget.periodEndDate) {
				this.logger.warn(`User ${userId} has incomplete target period dates, skipping calculation`);
				return;
			}

			this.logger.debug(
				`Calculating targets for user ${userId} from ${userTarget.periodStartDate} to ${userTarget.periodEndDate}`,
			);

			// --- Calculate currentSalesAmount ---
			this.logger.debug(`Calculating sales amount for user: ${userId}`);
			const quotations = await this.quotationRepository.find({
				where: {
					placedBy: { uid: userId },
					status: OrderStatus.COMPLETED,
					createdAt: Between(userTarget.periodStartDate, userTarget.periodEndDate),
				},
			});
			userTarget.currentSalesAmount = quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
			this.logger.debug(`Sales amount calculated: ${userTarget.currentSalesAmount} for user ${userId}`);

			// --- Calculate currentNewLeads ---
			this.logger.debug(`Calculating leads count for user: ${userId}`);
			const leadsCount = await this.leadRepository.count({
				where: {
					owner: { uid: userId },
					createdAt: Between(userTarget.periodStartDate, userTarget.periodEndDate),
				},
			});
			userTarget.currentNewLeads = leadsCount;
			this.logger.debug(`Leads count calculated: ${leadsCount} for user ${userId}`);

			// --- Calculate currentNewClients ---
			this.logger.debug(`Calculating clients count for user: ${userId}`);
			const clientsCount = await this.clientRepository.count({
				where: {
					assignedSalesRep: { uid: userId },
					createdAt: Between(userTarget.periodStartDate, userTarget.periodEndDate),
				},
			});
			userTarget.currentNewClients = clientsCount;
			this.logger.debug(`Clients count calculated: ${clientsCount} for user ${userId}`);

			// --- Calculate currentCheckIns ---
			this.logger.debug(`Calculating check-ins count for user: ${userId}`);
			const checkInsCount = await this.checkInRepository.count({
				where: {
					owner: { uid: userId },
					checkInTime: Between(userTarget.periodStartDate, userTarget.periodEndDate),
				},
			});
			userTarget.currentCheckIns = checkInsCount;
			this.logger.debug(`Check-ins count calculated: ${checkInsCount} for user ${userId}`);

			// --- TODO: Add calculations for currentHoursWorked, currentCalls ---

			// Save the updated target (via user cascade)
			this.logger.debug(`Saving updated targets for user: ${userId}`);
			await this.userRepository.save(user);

			// Invalidate the specific target cache
			await this.cacheManager.del(this.getCacheKey(`target_${userId}`));

			const executionTime = Date.now() - startTime;
			this.logger.log(`User targets calculated successfully for user: ${userId} in ${executionTime}ms`);
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Failed to calculate user targets for user ${userId} after ${executionTime}ms. Error: ${error.message}`,
			);
			return null;
		}
	}

	/**
	 * Re-invite all users in the organization/branch to use the Loro platform
	 * @param scope - Scope defining which users to invite (org, branch, etc.)
	 * @returns Statistics about the invitation process
	 */
	async reInviteAllUsers(scope: {
		orgId?: string;
		branchId?: string;
		userId: string;
		userRole?: string;
	}): Promise<{ invitedCount: number; totalUsers: number; excludedCount: number }> {
		const startTime = Date.now();
		this.logger.log(`Re-inviting all users with scope: ${JSON.stringify(scope)}`);

		try {
			this.logger.debug('Building query for eligible users');
			const queryBuilder = this.userRepository
				.createQueryBuilder('user')
				.leftJoinAndSelect('user.branch', 'branch')
				.leftJoinAndSelect('user.organisation', 'organisation')
				.where('user.isDeleted = :isDeleted', { isDeleted: false });

			// Apply organization filter if provided
			if (scope?.orgId) {
				this.logger.debug(`Applying organization filter: ${scope.orgId}`);
				queryBuilder.andWhere('organisation.uid = :orgId', { orgId: parseInt(scope.orgId) });
			}

			// Apply branch filter if provided
			if (scope?.branchId) {
				this.logger.debug(`Applying branch filter: ${scope.branchId}`);
				queryBuilder.andWhere('branch.uid = :branchId', { branchId: parseInt(scope.branchId) });
			}

			// Exclude users that shouldn't receive re-invitations
			queryBuilder.andWhere('user.status NOT IN (:...excludedStatuses)', {
				excludedStatuses: [AccountStatus.DELETED, AccountStatus.BANNED, AccountStatus.INACTIVE],
			});

			this.logger.debug('Fetching eligible users for re-invitation');
			const users = await queryBuilder.getMany();
			const totalUsers = users.length;
			let invitedCount = 0;
			let excludedCount = 0;

			this.logger.log(`Found ${totalUsers} eligible users for re-invitation`);

			// Send re-invitation emails to eligible users
			for (const user of users) {
				try {
					this.logger.debug(`Sending re-invitation email to user: ${user.email} (${user.uid})`);
					await this.sendReInvitationEmail(user);
					invitedCount++;
				} catch (error) {
					this.logger.error(`Failed to send re-invitation email to user ${user.uid}:`, error.message);
					excludedCount++;
				}
			}

			const executionTime = Date.now() - startTime;
			this.logger.log(
				`Re-invitation process completed in ${executionTime}ms. Invited: ${invitedCount}, Excluded: ${excludedCount}, Total: ${totalUsers}`,
			);

			return {
				invitedCount,
				totalUsers,
				excludedCount,
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(`Error re-inviting all users after ${executionTime}ms:`, error.message);
			throw error;
		}
	}

	/**
	 * Re-invite a specific user to use the Loro platform
	 * @param userId - ID of user to re-invite
	 * @param scope - Scope defining access permissions
	 * @returns User ID and email of re-invited user
	 */
	async reInviteUser(
		userId: string,
		scope: {
			orgId?: string;
			branchId?: string;
			userId: string;
			userRole?: string;
		},
	): Promise<{ userId: string; email: string }> {
		const startTime = Date.now();
		this.logger.log(`Re-inviting specific user: ${userId} with scope: ${JSON.stringify(scope)}`);

		try {
			this.logger.debug(`Building query for user ${userId} with scope restrictions`);
			const queryBuilder = this.userRepository
				.createQueryBuilder('user')
				.leftJoinAndSelect('user.branch', 'branch')
				.leftJoinAndSelect('user.organisation', 'organisation')
				.where('user.uid = :userId', { userId: parseInt(userId) })
				.andWhere('user.isDeleted = :isDeleted', { isDeleted: false });

			// Apply organization filter if provided
			if (scope?.orgId) {
				this.logger.debug(`Applying organization scope filter: ${scope.orgId}`);
				queryBuilder.andWhere('organisation.uid = :orgId', { orgId: parseInt(scope.orgId) });
			}

			// Apply branch filter if provided
			if (scope?.branchId) {
				this.logger.debug(`Applying branch scope filter: ${scope.branchId}`);
				queryBuilder.andWhere('branch.uid = :branchId', { branchId: parseInt(scope.branchId) });
			}

			this.logger.debug(`Executing query to find user ${userId}`);
			const user = await queryBuilder.getOne();

			if (!user) {
				this.logger.warn(`User ${userId} not found for re-invitation`);
				throw new NotFoundException('User not found');
			}

			// Check if user can be re-invited
			if (
				[AccountStatus.DELETED, AccountStatus.BANNED, AccountStatus.INACTIVE].includes(
					user.status as AccountStatus,
				)
			) {
				this.logger.warn(`User ${userId} (${user.email}) cannot be re-invited due to status: ${user.status}`);
				throw new Error('User cannot be re-invited due to account status');
			}

			this.logger.debug(`Sending re-invitation email to user: ${user.email} (${userId})`);
			// Send re-invitation email
			await this.sendReInvitationEmail(user);

			const executionTime = Date.now() - startTime;
			this.logger.log(`User ${userId} (${user.email}) re-invited successfully in ${executionTime}ms`);

			return {
				userId: user.uid.toString(),
				email: user.email,
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(`Error re-inviting user ${userId} after ${executionTime}ms:`, error.message);
			throw error;
		}
	}

	/**
	 * Send re-invitation email to a user
	 * @param user - User to send re-invitation email to
	 */
	private async sendReInvitationEmail(user: User): Promise<void> {
		const startTime = Date.now();
		this.logger.debug(`Preparing re-invitation email for user: ${user.email} (${user.uid})`);

		try {
			// Prepare re-invitation email data
			const reInvitationData = {
				userEmail: user.email,
				userName: `${user.name} ${user.surname}`,
				userFirstName: user.name,
				platformName: 'Loro',
				loginUrl: process.env.FRONTEND_URL || 'https://app.loro.com',
				supportEmail: process.env.SUPPORT_EMAIL || 'support@loro.com',
				organizationName: user.organisation?.name || 'your organization',
				branchName: user.branch?.name || 'your branch',
			};

			this.logger.debug(`Emitting re-invitation email event for user: ${user.email}`);
			// Emit email event for re-invitation
			this.eventEmitter.emit('send.email', EmailType.USER_RE_INVITATION, [user.email], reInvitationData);

			const executionTime = Date.now() - startTime;
			this.logger.log(`Re-invitation email sent to user: ${user.email} in ${executionTime}ms`);
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Error sending re-invitation email to ${user.email} after ${executionTime}ms:`,
				error.message,
			);
			throw error;
		}
	}

	/**
	 * Send welcome email to newly created user
	 * @param user - User to send welcome email to
	 */
	private async sendWelcomeEmail(user: User): Promise<void> {
		const startTime = Date.now();
		this.logger.debug(`Preparing welcome email for new user: ${user.email} (${user.uid})`);

		try {
			// Get organization and branch names for the email
			const organizationName = user.organisation?.name || process.env.COMPANY_NAME || 'Your Organization';
			const branchName = user.branch?.name || 'Main Branch';

			// Prepare email data
			const emailData: NewUserWelcomeData = {
				name: user.name || user.email,
				email: user.email,
				loginUrl: process.env.WEBSITE_DOMAIN || 'https://dashboard.loro.co.za/sign-in',
				supportEmail: process.env.SUPPORT_EMAIL || 'support@loro.africa',
				supportPhone: process.env.SUPPORT_PHONE || '+27 12 345 6789',
				organizationName,
				branchName,
				dashboardUrl: process.env.WEBSITE_DOMAIN || 'https://dashboard.loro.co.za',
			};

			this.logger.debug(`Emitting welcome email event for user: ${user.email}`);
			// Send the welcome email
			this.eventEmitter.emit('send.email', EmailType.NEW_USER_WELCOME, [user.email], emailData);

			const executionTime = Date.now() - startTime;
			this.logger.log(`Welcome email sent to user: ${user.email} in ${executionTime}ms`);
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`Error sending welcome email to user ${user.email} after ${executionTime}ms:`,
				error.message,
			);
			// Don't throw the error as user creation should still succeed even if email fails
		}
	}

	/**
	 * Update user targets from external ERP system with concurrency control
	 * Handles concurrent updates using optimistic locking and retry mechanism
	 * @param userId - User ID to update targets for
	 * @param externalUpdate - External update data from ERP system
	 * @param orgId - Organization ID for scoping
	 * @param branchId - Branch ID for scoping
	 * @returns Success message with updated values or conflict details
	 */
	async updateUserTargetsFromERP(
		userId: number,
		externalUpdate: ExternalTargetUpdateDto,
		orgId?: number,
		branchId?: number,
	): Promise<{
		message: string;
		updatedValues?: Partial<UserTarget>;
		conflictDetails?: any;
		validationErrors?: string[];
	}> {
		const startTime = Date.now();
		this.logger.log(`Updating user targets from ERP for user: ${userId}, source: ${externalUpdate.source}`);

		try {
			// Validate external update data
			const validationResult = await this.validateExternalTargetUpdate(userId, externalUpdate, orgId, branchId);
			if (!validationResult.isValid) {
				return {
					message: 'Validation failed',
					validationErrors: validationResult.errors,
				};
			}

			// Implement optimistic locking with retry mechanism
			const maxRetries = 3;
			let retryCount = 0;
			let lastError: any;

			while (retryCount < maxRetries) {
				try {
					// Start transaction
					const result = await this.userRepository.manager.transaction(async (transactionalEntityManager) => {
						// Get current user with target and version for optimistic locking
						const user = await transactionalEntityManager
							.createQueryBuilder(User, 'user')
							.leftJoinAndSelect('user.userTarget', 'userTarget')
							.leftJoinAndSelect('user.organisation', 'organisation')
							.leftJoinAndSelect('user.branch', 'branch')
							.where('user.uid = :userId', { userId })
							.andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
							.andWhere(orgId ? 'organisation.uid = :orgId' : '1=1', { orgId })
							.andWhere(branchId ? 'branch.uid = :branchId' : '1=1', { branchId })
							.setLock('pessimistic_write') // Use pessimistic locking for external updates
							.getOne();

						if (!user) {
							throw new NotFoundException(`User ${userId} not found or access denied`);
						}

						if (!user.userTarget) {
							throw new NotFoundException(`No targets found for user ${userId}`);
						}

						// Calculate new values based on update mode
						const updatedTarget = this.calculateTargetUpdates(user.userTarget, externalUpdate);

						// Update target with new values
						await transactionalEntityManager.update(
							UserTarget,
							{ uid: user.userTarget.uid },
							{
								...updatedTarget,
								updatedAt: new Date(),
							},
						);

						// Create audit trail
						await this.createTargetUpdateAuditLog(
							transactionalEntityManager,
							userId,
							externalUpdate.source,
							externalUpdate.transactionId,
							user.userTarget,
							updatedTarget,
						);

						return updatedTarget;
					});

					// Get updated user for cache invalidation
					const updatedUser = await this.userRepository.findOne({
						where: { uid: userId },
						relations: ['organisation', 'branch'],
					});

					if (updatedUser) {
						// Invalidate cache
						await this.invalidateUserCache(updatedUser);
						await this.cacheManager.del(this.getCacheKey(`target_${userId}`));
					}

					// Emit success event
					this.eventEmitter.emit('user.target.external.update.completed', {
						userId,
						source: externalUpdate.source,
						transactionId: externalUpdate.transactionId,
						updatedValues: result,
					});

					const executionTime = Date.now() - startTime;
					this.logger.log(
						`ERP target update completed for user ${userId} in ${executionTime}ms (attempt ${retryCount + 1})`,
					);

					return {
						message: 'User targets updated successfully from ERP',
						updatedValues: result,
					};
				} catch (error) {
					lastError = error;
					retryCount++;

					if (error.code === 'ER_LOCK_WAIT_TIMEOUT' || error.message.includes('concurrent')) {
						this.logger.warn(`Concurrent update conflict for user ${userId}, retry ${retryCount}/${maxRetries}`);

						if (retryCount < maxRetries) {
							// Exponential backoff
							await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 100));
							continue;
						}
					} else {
						// Non-recoverable error, don't retry
						break;
					}
				}
			}

			// All retries failed
			const executionTime = Date.now() - startTime;
			this.logger.error(
				`ERP target update failed for user ${userId} after ${retryCount} attempts in ${executionTime}ms`,
			);

			// Emit failure event
			this.eventEmitter.emit('user.target.external.update.failed', {
				userId,
				source: externalUpdate.source,
				transactionId: externalUpdate.transactionId,
				error: lastError.message,
				retryCount,
			});

			if (lastError.code === 'ER_LOCK_WAIT_TIMEOUT' || lastError.message.includes('concurrent')) {
				return {
					message: 'Concurrent update conflict detected',
					conflictDetails: {
						retryCount,
						error: lastError.message,
						suggestion: 'Please retry the update after a short delay',
					},
				};
			}

			return {
				message: lastError.message || 'Failed to update user targets from ERP',
			};
		} catch (error) {
			const executionTime = Date.now() - startTime;
			this.logger.error(`ERP target update error for user ${userId} after ${executionTime}ms: ${error.message}`);

			return {
				message: error.message || 'Failed to update user targets from ERP',
			};
		}
	}

	/**
	 * Calculate target updates based on update mode
	 * @private
	 */
	private calculateTargetUpdates(
		currentTarget: UserTarget,
		externalUpdate: ExternalTargetUpdateDto,
	): Partial<UserTarget> {
		const updates: Partial<UserTarget> = {};

		// Handle different update modes
		if (externalUpdate.updateMode === TargetUpdateMode.INCREMENT) {
			// Add to current values
			if (externalUpdate.updates.currentSalesAmount !== undefined) {
				updates.currentSalesAmount =
					(currentTarget.currentSalesAmount || 0) + externalUpdate.updates.currentSalesAmount;
			}
			if (externalUpdate.updates.currentNewLeads !== undefined) {
				updates.currentNewLeads = (currentTarget.currentNewLeads || 0) + externalUpdate.updates.currentNewLeads;
			}
			if (externalUpdate.updates.currentNewClients !== undefined) {
				updates.currentNewClients =
					(currentTarget.currentNewClients || 0) + externalUpdate.updates.currentNewClients;
			}
			if (externalUpdate.updates.currentCheckIns !== undefined) {
				updates.currentCheckIns = (currentTarget.currentCheckIns || 0) + externalUpdate.updates.currentCheckIns;
			}
			if (externalUpdate.updates.currentHoursWorked !== undefined) {
				updates.currentHoursWorked =
					(currentTarget.currentHoursWorked || 0) + externalUpdate.updates.currentHoursWorked;
			}
			if (externalUpdate.updates.currentCalls !== undefined) {
				updates.currentCalls = (currentTarget.currentCalls || 0) + externalUpdate.updates.currentCalls;
			}
		} else {
			// REPLACE mode - set absolute values
			Object.assign(updates, externalUpdate.updates);
		}

		return updates;
	}

	/**
	 * Validate external target update data
	 * @private
	 */
	private async validateExternalTargetUpdate(
		userId: number,
		externalUpdate: ExternalTargetUpdateDto,
		orgId?: number,
		branchId?: number,
	): Promise<{ isValid: boolean; errors: string[] }> {
		const errors: string[] = [];

		try {
			// Validate user exists and has targets
			const user = await this.userRepository.findOne({
				where: {
					uid: userId,
					isDeleted: false,
					...(orgId && { organisation: { uid: orgId } }),
					...(branchId && { branch: { uid: branchId } }),
				},
				relations: ['userTarget', 'organisation', 'branch'],
			});

			if (!user) {
				errors.push(`User ${userId} not found or access denied`);
			} else if (!user.userTarget) {
				errors.push(`No targets found for user ${userId}`);
			}

			// Validate update values are reasonable
			if (externalUpdate.updates.currentSalesAmount !== undefined && externalUpdate.updates.currentSalesAmount < 0) {
				errors.push('Sales amount cannot be negative');
			}

			if (externalUpdate.updates.currentNewLeads !== undefined && externalUpdate.updates.currentNewLeads < 0) {
				errors.push('New leads count cannot be negative');
			}

			if (
				externalUpdate.updates.currentNewClients !== undefined &&
				externalUpdate.updates.currentNewClients < 0
			) {
				errors.push('New clients count cannot be negative');
			}

			// Validate transaction ID for idempotency
			if (!externalUpdate.transactionId || externalUpdate.transactionId.trim() === '') {
				errors.push('Transaction ID is required for idempotency');
			}

			// Validate source system
			if (!externalUpdate.source || externalUpdate.source.trim() === '') {
				errors.push('Source system identifier is required');
			}

			return {
				isValid: errors.length === 0,
				errors,
			};
		} catch (error) {
			this.logger.error(`Error validating external target update for user ${userId}:`, error.message);
			errors.push('Error validating update data');
			return {
				isValid: false,
				errors,
			};
		}
	}

	/**
	 * Create audit trail for target updates
	 * @private
	 */
	private async createTargetUpdateAuditLog(
		transactionalEntityManager: any,
		userId: number,
		source: string,
		transactionId: string,
		beforeValues: UserTarget,
		afterValues: Partial<UserTarget>,
	): Promise<void> {
		try {
			// For now, just log the audit trail
			// In the future, this could be saved to a dedicated audit table
			this.logger.log(
				`Target update audit - User: ${userId}, Source: ${source}, Transaction: ${transactionId}, Before: ${JSON.stringify(
					{
						currentSalesAmount: beforeValues.currentSalesAmount,
						currentNewLeads: beforeValues.currentNewLeads,
						currentNewClients: beforeValues.currentNewClients,
					},
				)}, After: ${JSON.stringify(afterValues)}`,
			);
		} catch (error) {
			this.logger.error('Error creating target update audit log:', error.message);
			// Don't throw error as this shouldn't fail the main operation
		}
	}
}
