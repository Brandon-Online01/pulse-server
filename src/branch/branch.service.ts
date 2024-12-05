import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BranchService {
	constructor(
		@InjectRepository(Branch)
		private branchRepository: Repository<Branch>
	) { }

	async create(createBranchDto: CreateBranchDto): Promise<{ message: string }> {
		try {
			const branch = await this.branchRepository.save(createBranchDto);

			if (!branch) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
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

	async findAll(): Promise<{ branches: Branch[] | null, message: string }> {
		try {
			const branches = await this.branchRepository.find({
				where: { isDeleted: false }
			});

			if (!branches) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			return {
				branches,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
				branches: null
			};
		}
	}

	async findOne(referenceCode: string): Promise<{ branch: Branch | null, message: string }> {
		try {
			const branch = await this.branchRepository.findOne({
				where: { referenceCode, isDeleted: false },
				relations: [
					'organisation',
					'trackings',
					'tasks',
					'news',
					'leads',
					'journals',
					'docs',
					'claims',
					'attendances',
					'assets'
				]
			});

			if (!branch) {
				return {
					branch: null,
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			return {
				branch,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
				branch: null
			};
		}
	}

	async update(referenceCode: string, updateBranchDto: UpdateBranchDto): Promise<{ message: string }> {
		try {
			await this.branchRepository.update(
				{ referenceCode },
				updateBranchDto
			);

			const updatedBranch = await this.branchRepository.findOne({
				where: { referenceCode, isDeleted: false }
			});

			if (!updatedBranch) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
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

	async remove(referenceCode: string): Promise<{ message: string }> {
		try {
			const branch = await this.branchRepository.findOne({
				where: { referenceCode, isDeleted: false }
			});

			if (!branch) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			await this.branchRepository.update(
				{ referenceCode },
				{ isDeleted: true }
			);

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
