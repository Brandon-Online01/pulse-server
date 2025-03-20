import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Asset } from './entities/asset.entity';
import { Repository, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AssetsService {
	constructor(
		@InjectRepository(Asset)
		private assetRepository: Repository<Asset>
	) { }

	async create(createAssetDto: CreateAssetDto, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			const asset = await this.assetRepository.save({
				...createAssetDto,
				org: { uid: orgId },
				branch: branchId ? { uid: branchId } : null
			});

			if (!asset) {
				throw new NotFoundException(process.env.CREATE_ERROR_MESSAGE);
			}

			return { message: process.env.SUCCESS_MESSAGE };
		} catch (error) {
			return { message: error?.message };
		}
	}

	async findAll(orgId?: number, branchId?: number): Promise<{ assets: Asset[], message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			const whereClause: any = {
				isDeleted: false,
				org: { uid: orgId }
			};

			if (branchId) {
				whereClause.branch = { uid: branchId };
			}

			const assets = await this.assetRepository.find({
				where: whereClause,
				relations: ['owner', 'branch', 'org']
			});

			if (!assets || assets?.length === 0) {
				return {
					message: process.env.SEARCH_ERROR_MESSAGE,
					assets: null
				};
			}

			return {
				assets: assets,
				message: process.env.SUCCESS_MESSAGE
			};
		} catch (error) {
			return {
				message: error?.message,
				assets: null
			};
		}
	}

	async findOne(ref: number, orgId?: number, branchId?: number): Promise<{ asset: Asset, message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			const whereClause: any = {
				uid: ref,
				isDeleted: false,
				org: { uid: orgId }
			};

			if (branchId) {
				whereClause.branch = { uid: branchId };
			}

			const asset = await this.assetRepository.findOne({
				where: whereClause,
				relations: ['owner', 'branch', 'org']
			});

			if (!asset) {
				throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
			}

			return {
				asset: asset,
				message: process.env.SUCCESS_MESSAGE
			};
		} catch (error) {
			return {
				message: error?.message,
				asset: null
			};
		}
	}

	async findBySearchTerm(query: string, orgId?: number, branchId?: number): Promise<{ assets: Asset[], message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			const baseWhere = {
				isDeleted: false,
				org: { uid: orgId }
			};

			if (branchId) {
				baseWhere['branch'] = { uid: branchId };
			}

			const assets = await this.assetRepository.find({
				where: [
					{ ...baseWhere, brand: Like(`%${query}%`) },
					{ ...baseWhere, serialNumber: Like(`%${query}%`) },
					{ ...baseWhere, modelNumber: Like(`%${query}%`) },
					{ ...baseWhere, owner: { name: Like(`%${query}%`) } },
					{ ...baseWhere, branch: { name: Like(`%${query}%`) } }
				],
				relations: ['owner', 'branch', 'org']
			});

			if (!assets || assets?.length === 0) {
				throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
			}

			return {
				assets: assets,
				message: process.env.SUCCESS_MESSAGE
			};
		} catch (error) {
			return {
				message: error?.message,
				assets: null
			};
		}
	}

	async assetsByUser(ref: number, orgId?: number, branchId?: number): Promise<{ message: string, assets: Asset[] }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			const whereClause: any = {
				owner: { uid: ref },
				org: { uid: orgId },
				isDeleted: false
			};

			if (branchId) {
				whereClause.branch = { uid: branchId };
			}

			const assets = await this.assetRepository.find({
				where: whereClause,
				relations: ['owner', 'branch', 'org']
			});

			if (!assets) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			return {
				message: process.env.SUCCESS_MESSAGE,
				assets
			};
		} catch (error) {
			return {
				message: `could not get assets by user - ${error?.message}`,
				assets: null
			};
		}
	}

	async update(ref: number, updateAssetDto: UpdateAssetDto, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			// First verify the asset belongs to the org/branch
			const asset = await this.findOne(ref, orgId, branchId);
			if (!asset) {
				throw new NotFoundException('Asset not found in your organization');
			}

			const result = await this.assetRepository.update(ref, updateAssetDto);

			if (!result) {
				throw new NotFoundException(process.env.UPDATE_ERROR_MESSAGE);
			}

			return { message: process.env.SUCCESS_MESSAGE };
		} catch (error) {
			return { message: error?.message };
		}
	}

	async remove(ref: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			// First verify the asset belongs to the org/branch
			const asset = await this.findOne(ref, orgId, branchId);
			if (!asset) {
				throw new NotFoundException('Asset not found in your organization');
			}

			const result = await this.assetRepository.update(ref, { isDeleted: true });

			if (!result) {
				throw new NotFoundException(process.env.DELETE_ERROR_MESSAGE);
			}

			return { message: process.env.SUCCESS_MESSAGE };
		} catch (error) {
			return { message: error?.message };
		}
	}

	async restore(ref: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
		try {
			if (!orgId) {
				throw new BadRequestException('Organization ID is required');
			}

			// First verify the asset belongs to the org/branch
			const asset = await this.findOne(ref, orgId, branchId);
			if (!asset) {
				throw new NotFoundException('Asset not found in your organization');
			}

			const result = await this.assetRepository.update(
				{ uid: ref },
				{ isDeleted: false }
			);

			if (!result) {
				throw new NotFoundException(process.env.RESTORE_ERROR_MESSAGE);
			}

			return { message: process.env.SUCCESS_MESSAGE };
		} catch (error) {
			return { message: error?.message };
		}
	}
}
