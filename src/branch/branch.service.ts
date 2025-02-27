import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BranchService {
	constructor(
		@InjectRepository(Branch)
		private branchRepository: Repository<Branch>,
	) {}

	async create(createBranchDto: CreateBranchDto): Promise<{ message: string }> {
		try {
			const branch = await this.branchRepository.save(createBranchDto);

			if (!branch) {
				throw new NotFoundException(process.env.CREATE_ERROR_MESSAGE);
			}

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async findAll(): Promise<{ branches: Branch[] | null; message: string }> {
		try {
			const branches = await this.branchRepository.find({
				where: { isDeleted: false },
			});

			if (!branches) {
				throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
			}

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

	async findOne(ref: string): Promise<{ branch: Branch | null; message: string }> {
		try {
			const branch = await this.branchRepository.findOne({
				where: { ref, isDeleted: false },
				relations: ['news', 'docs', 'assets', 'organisation', 'trackings', 'banners', 'routes', 'users'],
			});

			if (!branch) {
				throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
			}

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

	async update(ref: string, updateBranchDto: UpdateBranchDto): Promise<{ message: string }> {
		try {
			await this.branchRepository.update({ ref }, updateBranchDto);

			const updatedBranch = await this.branchRepository.findOne({
				where: { ref, isDeleted: false },
			});

			if (!updatedBranch) {
				throw new NotFoundException(process.env.UPDATE_ERROR_MESSAGE);
			}

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
			const branch = await this.branchRepository.findOne({
				where: { ref, isDeleted: false },
			});

			if (!branch) {
				throw new NotFoundException(process.env.DELETE_ERROR_MESSAGE);
			}

			await this.branchRepository.update({ ref }, { isDeleted: true });

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
