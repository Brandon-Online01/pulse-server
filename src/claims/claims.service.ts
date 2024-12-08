import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Claim } from './entities/claim.entity';
import { IsNull, Repository, DeepPartial } from 'typeorm';
import { ClaimStatus } from 'src/lib/enums/enums';

@Injectable()
export class ClaimsService {
	constructor(
		@InjectRepository(Claim)
		private claimsRepository: Repository<Claim>
	) { }

	async create(createClaimDto: CreateClaimDto): Promise<{ message: string }> {
		try {
			const claim = await this.claimsRepository.save(createClaimDto as unknown as DeepPartial<Claim>);

			if (!claim) {
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

	async findAll(): Promise<{ message: string, claims: Claim[] | null }> {
		try {
			const claims = await this.claimsRepository.find({
				where: {
					deletedAt: IsNull()
				}
			});

			if (!claims) {
				throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				claims: claims
			}

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				claims: null
			}

			return response;
		}
	}

	async findOne(ref: number): Promise<{ message: string, claim: Claim | null }> {
		try {
			const claim = await this.claimsRepository.findOne({
				where: {
					uid: ref,
					deletedAt: IsNull()
				},
				relations: ['user']
			});

			if (!claim) {
				throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				claim: claim
			}

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				claim: null
			}

			return response;
		}
	}

	public async claimsByUser(ref: number): Promise<{ message: string, claims: Claim[] }> {
		try {
			const claims = await this.claimsRepository.find({
				where: { owner: { uid: ref } }
			});

			if (!claims) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				claims
			};

			return response;
		} catch (error) {
			const response = {
				message: `could not get claims by user - ${error?.message}`,
				claims: null
			}

			return response;
		}
	}

	async update(ref: number, updateClaimDto: UpdateClaimDto): Promise<{ message: string }> {
		try {
			await this.claimsRepository.update(ref, updateClaimDto as unknown as DeepPartial<Claim>);

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
}
