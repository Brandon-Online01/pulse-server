import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class BranchService {
	constructor(
		@InjectRepository(Branch)
		private branchRepository: Repository<Branch>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	private readonly CACHE_PREFIX = 'branch';
	private readonly ALL_BRANCHES_CACHE_KEY = `${this.CACHE_PREFIX}:all`;
	private getBranchCacheKey(ref: string): string {
		return `${this.CACHE_PREFIX}:${ref}`;
	}

	// Default cache TTL (in seconds)
	private readonly DEFAULT_CACHE_TTL = 3600; // 1 hour

	private async clearBranchCache(ref?: string): Promise<void> {
		// Clear the all branches cache
		await this.cacheManager.del(this.ALL_BRANCHES_CACHE_KEY);
		
		// If a specific ref is provided, clear that branch's cache
		if (ref) {
			await this.cacheManager.del(this.getBranchCacheKey(ref));
		}
	}

	async create(createBranchDto: CreateBranchDto, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			const branchData = {
				...createBranchDto,
				organisation: { uid: orgId },
			};

			const branch = await this.branchRepository.save(branchData);

			if (!branch) {
				throw new NotFoundException(process.env.CREATE_ERROR_MESSAGE);
			}

			// Clear cache after creating a new branch
			await this.clearBranchCache();

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async findAll(orgId?: number, branchId?: number): Promise<{ branches: Branch[] | null; message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			// Create org-specific cache key
			const cacheKey = `${this.ALL_BRANCHES_CACHE_KEY}:org:${orgId}${branchId ? `:branch:${branchId}` : ''}`;
			
			// Try to get from cache first
			const cachedBranches = await this.cacheManager.get<Branch[]>(cacheKey);
			
			if (cachedBranches) {
				return {
					branches: cachedBranches,
					message: process.env.SUCCESS_MESSAGE,
				};
			}

			const whereClause: any = {
				isDeleted: false,
				organisation: { uid: orgId },
			};

			if (branchId) {
				whereClause.uid = branchId;
			}

			// If not in cache, fetch from database
			const branches = await this.branchRepository.find({
				where: whereClause,
				relations: ['organisation'],
			});

			if (!branches || branches.length === 0) {
				return {
					branches: [],
					message: 'No branches found for this organization',
				};
			}

			// Store in cache
			await this.cacheManager.set(cacheKey, branches, {
				ttl: this.DEFAULT_CACHE_TTL
			});

			return {
				branches,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
				branches: null,
			};
		}
	}

	async findOne(ref: string, orgId?: number, branchId?: number): Promise<{ branch: Branch | null; message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			// Create org-specific cache key
			const cacheKey = `${this.getBranchCacheKey(ref)}:org:${orgId}`;
			const cachedBranch = await this.cacheManager.get<Branch>(cacheKey);
			
			if (cachedBranch) {
				return {
					branch: cachedBranch,
					message: process.env.SUCCESS_MESSAGE,
				};
			}

			const whereClause: any = {
				ref,
				isDeleted: false,
				organisation: { uid: orgId },
			};

			// If not in cache, fetch from database
			const branch = await this.branchRepository.findOne({
				where: whereClause,
				relations: ['news', 'docs', 'assets', 'organisation', 'trackings', 'banners', 'routes', 'users', 'leaves'],
			});

			if (!branch) {
				return {
					branch: null,
					message: 'Branch not found or does not belong to your organization',
				};
			}

			// Store in cache
			await this.cacheManager.set(cacheKey, branch, {
				ttl: this.DEFAULT_CACHE_TTL
			});

			return {
				branch,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
				branch: null,
			};
		}
	}

	async update(ref: string, updateBranchDto: UpdateBranchDto, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			// First verify the branch belongs to the org
			const existingBranch = await this.findOne(ref, orgId, branchId);
			if (!existingBranch.branch) {
				return {
					message: 'Branch not found or does not belong to your organization',
				};
			}

			await this.branchRepository.update({ ref }, updateBranchDto);

			const updatedBranch = await this.branchRepository.findOne({
				where: { 
					ref, 
					isDeleted: false,
					organisation: { uid: orgId },
				},
			});

			if (!updatedBranch) {
				throw new NotFoundException(process.env.UPDATE_ERROR_MESSAGE);
			}

			// Clear cache after updating
			await this.clearBranchCache(ref);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async remove(ref: string, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			// First verify the branch belongs to the org
			const existingBranch = await this.findOne(ref, orgId, branchId);
			if (!existingBranch.branch) {
				return {
					message: 'Branch not found or does not belong to your organization',
				};
			}

			const branch = await this.branchRepository.findOne({
				where: { 
					ref, 
					isDeleted: false,
					organisation: { uid: orgId },
				},
			});

			if (!branch) {
				throw new NotFoundException(process.env.DELETE_ERROR_MESSAGE);
			}

			await this.branchRepository.update({ ref }, { isDeleted: true });

			// Clear cache after removing
			await this.clearBranchCache(ref);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}
}
