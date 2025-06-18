import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from './entities/organisation.entity';
import { GeneralStatus } from '../lib/enums/status.enums';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class OrganisationService {
	constructor(
		@InjectRepository(Organisation)
		private organisationRepository: Repository<Organisation>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	private readonly CACHE_PREFIX = 'organisation';
	private readonly ALL_ORGS_CACHE_KEY = `${this.CACHE_PREFIX}:all`;
	private getOrgCacheKey(ref: string): string {
		return `${this.CACHE_PREFIX}:${ref}`;
	}

	// Default cache TTL (in seconds)
	private readonly DEFAULT_CACHE_TTL = 3600; // 1 hour

	private async clearOrganisationCache(ref?: string): Promise<void> {
		// Clear the all organisations cache
		await this.cacheManager.del(this.ALL_ORGS_CACHE_KEY);

		// If a specific ref is provided, clear that organisation's cache
		if (ref) {
			await this.cacheManager.del(this.getOrgCacheKey(ref));
		}
	}

	async create(createOrganisationDto: CreateOrganisationDto, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			// For organisation creation, we might not always have org scoping
			// but we can still validate permissions based on the authenticated user
			const organisation = await this.organisationRepository.save(createOrganisationDto);

			if (!organisation) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Clear cache after creating a new organisation
			await this.clearOrganisationCache();

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async findAll(orgId?: number, branchId?: number): Promise<{ organisations: Organisation[] | null; message: string }> {
		try {
			// Generate cache key that includes org/branch context
			const contextCacheKey = `${this.ALL_ORGS_CACHE_KEY}_${orgId || 'global'}_${branchId || 'all'}`;
			
			// Try to get from cache first
			const cachedOrganisations = await this.cacheManager.get<Organisation[]>(contextCacheKey);

			if (cachedOrganisations) {
				return {
					organisations: cachedOrganisations,
					message: process.env.SUCCESS_MESSAGE,
				};
			}

			// Build query with org/branch filtering
			const queryBuilder = this.organisationRepository
				.createQueryBuilder('organisation')
				.leftJoinAndSelect('organisation.branches', 'branches')
				.where('organisation.isDeleted = :isDeleted', { isDeleted: false });

			// If orgId is provided, scope to that organization
			// This ensures users can only see their own organization
			if (orgId) {
				queryBuilder.andWhere('organisation.uid = :orgId', { orgId });
			}

			const organisations = await queryBuilder
				.select([
					'organisation.uid',
					'organisation.name',
					'organisation.email',
					'organisation.phone',
					'organisation.contactPerson',
					'organisation.website',
					'organisation.logo',
					'organisation.ref',
					'organisation.createdAt',
					'organisation.updatedAt',
					'organisation.isDeleted',
					'branches.uid',
					'branches.name',
					'branches.phone',
					'branches.email',
					'branches.website',
				])
				.getMany();

			if (!organisations || organisations.length === 0) {
				return {
					organisations: [],
					message: 'No organisations found at the moment. Please check back later or contact support.',
				};
			}

			// Store in cache with context
			await this.cacheManager.set(contextCacheKey, organisations, {
				ttl: this.DEFAULT_CACHE_TTL,
			});

			return {
				organisations,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				organisations: null,
				message: error?.message || 'Unable to retrieve organisations at this time. Please try again later.',
			};
		}
	}

	async findOne(ref: string, orgId?: number, branchId?: number): Promise<{ organisation: Organisation | null; message: string }> {
		try {
			// Generate context-aware cache key
			const contextCacheKey = `${this.getOrgCacheKey(ref)}_${orgId || 'global'}_${branchId || 'all'}`;
			
			// Try to get from cache first
			const cachedOrganisation = await this.cacheManager.get<Organisation>(contextCacheKey);

			if (cachedOrganisation) {
				return {
					organisation: cachedOrganisation,
					message: process.env.SUCCESS_MESSAGE,
				};
			}

			// Build query with org/branch scoping
			const queryBuilder = this.organisationRepository
				.createQueryBuilder('organisation')
				.leftJoinAndSelect('organisation.branches', 'branches')
				.leftJoinAndSelect('organisation.settings', 'settings')
				.leftJoinAndSelect('organisation.appearance', 'appearance')
				.leftJoinAndSelect('organisation.hours', 'hours')
				.leftJoinAndSelect('organisation.assets', 'assets')
				.leftJoinAndSelect('organisation.products', 'products')
				.leftJoinAndSelect('organisation.clients', 'clients')
				.leftJoinAndSelect('organisation.users', 'users')
				.leftJoinAndSelect('organisation.resellers', 'resellers')
				.leftJoinAndSelect('organisation.leaves', 'leaves')
				.where('organisation.ref = :ref', { ref })
				.andWhere('organisation.isDeleted = :isDeleted', { isDeleted: false });

			// Scope to authenticated user's organization
			if (orgId) {
				queryBuilder.andWhere('organisation.uid = :orgId', { orgId });
			}

			const organisation = await queryBuilder.getOne();

			if (!organisation) {
				return {
					organisation: null,
					message: 'Organisation not found. Please verify the reference code and try again.',
				};
			}

			// Check if organisation has no products
			if (organisation.products && organisation.products.length === 0) {
				// Enhance the response message for empty products
				organisation['productsMessage'] = 'No new products available at the moment. Check back soon for updates!';
			}

			// Store in cache with context
			await this.cacheManager.set(contextCacheKey, organisation, {
				ttl: this.DEFAULT_CACHE_TTL,
			});

			return {
				organisation,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				organisation: null,
				message: error?.message || 'Unable to retrieve organisation details. Please try again later.',
			};
		}
	}

	async update(ref: string, updateOrganisationDto: UpdateOrganisationDto, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			// First verify the organisation belongs to the authenticated user's org
			if (orgId) {
				const existingOrg = await this.organisationRepository.findOne({
					where: { ref, isDeleted: false, uid: orgId },
				});

				if (!existingOrg) {
					return {
						message: 'Organisation not found or you do not have permission to modify it.',
					};
				}
			}

			await this.organisationRepository.update({ ref }, updateOrganisationDto);

			const updatedOrganisation = await this.organisationRepository.findOne({
				where: { ref, isDeleted: false },
			});

			if (!updatedOrganisation) {
				return {
					message: 'Organisation not found or could not be updated. Please verify the reference code.',
				};
			}

			// Clear cache after updating
			await this.clearOrganisationCache(ref);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message || 'Unable to update organisation. Please try again later.',
			};
		}
	}

	async remove(ref: string, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			// Build query with org scoping
			const whereClause: any = { ref, isDeleted: false };
			
			// Scope to authenticated user's organization
			if (orgId) {
				whereClause.uid = orgId;
			}

			const organisation = await this.organisationRepository.findOne({
				where: whereClause,
			});

			if (!organisation) {
				return {
					message: 'Organisation not found, has already been removed, or you do not have permission to delete it.',
				};
			}

			await this.organisationRepository.update({ ref }, { isDeleted: true });

			// Clear cache after removing
			await this.clearOrganisationCache(ref);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message || 'Unable to remove organisation. Please try again later.',
			};
		}
	}

	async restore(ref: string, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			// Build query with org scoping
			const whereClause: any = { ref };
			
			// Scope to authenticated user's organization
			if (orgId) {
				whereClause.uid = orgId;
			}

			// First check if the organisation exists and user has permission
			const organisation = await this.organisationRepository.findOne({
				where: whereClause,
			});

			if (!organisation) {
				return {
					message: 'Organisation not found or you do not have permission to restore it.',
				};
			}

			await this.organisationRepository.update(
				{ ref },
				{
					isDeleted: false,
					status: GeneralStatus.ACTIVE,
				},
			);

			// Clear cache after restoring
			await this.clearOrganisationCache(ref);

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message || 'Unable to restore organisation. Please try again later.',
			};

			return response;
		}
	}
}
