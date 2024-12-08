import { Injectable, NotFoundException } from '@nestjs/common';
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

	async create(createAssetDto: CreateAssetDto): Promise<{ message: string }> {
		try {
			const asset = await this.assetRepository.save(createAssetDto);

			if (!asset) {
				throw new NotFoundException(process.env.CREATE_ERROR_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			}

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}

			return response;
		}
	}

	async findAll(): Promise<{ assets: Asset[], message: string }> {
		try {
			const assets = await this.assetRepository.find({ where: { isDeleted: false }, relations: ['owner', 'branch'] });

			if (!assets || assets?.length === 0) {
				const response = {
					message: process.env.SEARCH_ERROR_MESSAGE,
					assets: null
				}

				return response;
			}

			const response = {
				assets: assets,
				message: process.env.SUCCESS_MESSAGE
			};

			return response
		} catch (error) {
			const response = {
				message: error?.message,
				assets: null
			}

			return response;
		}
	}

	async findOne(ref: number): Promise<{ asset: Asset, message: string }> {
		try {
			const asset = await this.assetRepository.findOne({ where: { uid: ref, isDeleted: false }, relations: ['owner', 'branch'] });

			if (!asset) {
				throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
			}

			const response = {
				asset: asset,
				message: process.env.SUCCESS_MESSAGE
			}

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				asset: null
			}

			return response;
		}
	}

	async findBySearchTerm(query: string): Promise<{ assets: Asset[], message: string }> {
		try {
			const assets = await this.assetRepository.find({
				where: [
					{ brand: Like(`%${query}%`), isDeleted: false },
					{ serialNumber: Like(`%${query}%`), isDeleted: false },
					{ modelNumber: Like(`%${query}%`), isDeleted: false },
					{ owner: { name: Like(`%${query}%`) }, isDeleted: false },
					{ branch: { name: Like(`%${query}%`) }, isDeleted: false }
				],
				relations: ['owner', 'branch']
			});

			if (!assets || assets?.length === 0) {
				throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
			}

			const response = {
				assets: assets,
				message: process.env.SUCCESS_MESSAGE
			}

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				assets: null
			}

			return response;
		}
	}

	public async assetsByUser(ref: number): Promise<{ message: string, assets: Asset[] }> {
		try {
			const assets = await this.assetRepository.find({
				where: { owner: { uid: ref } }
			});

			if (!assets) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				assets
			};

			return response;
		} catch (error) {
			const response = {
				message: `could not get assets by user - ${error?.message}`,
				assets: null
			}

			return response;
		}
	}

	async update(ref: number, updateAssetDto: UpdateAssetDto): Promise<{ message: string }> {
		try {
			const asset = await this.assetRepository.update(ref, updateAssetDto);

			if (!asset) {
				throw new NotFoundException(process.env.UPDATE_ERROR_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			}

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
			const asset = await this.assetRepository.update(ref, { isDeleted: true });

			if (!asset) {
				throw new NotFoundException(process.env.DELETE_ERROR_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			}

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
			const asset = await this.assetRepository.update(
				{ uid: ref },
				{
					isDeleted: false,
				}
			);

			if (!asset) {
				throw new NotFoundException(process.env.RESTORE_ERROR_MESSAGE);
			}

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
}
