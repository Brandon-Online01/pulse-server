import { Injectable } from '@nestjs/common';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Claim } from './entities/claim.entity';
import { IsNull, Repository, Not, DeepPartial } from 'typeorm';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Claim)
    private claimsRepository: Repository<Claim>
  ) { }

  async create(createClaimDto: CreateClaimDto) {
    try {
      const claim = this.claimsRepository.create(createClaimDto as unknown as DeepPartial<Claim>);

      await this.claimsRepository.save(claim);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll() {
    try {
      const claims = await this.claimsRepository.find({
        where: {
          deletedAt: IsNull()
        }
      });

      if (!claims) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: claims
      }

      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(referenceCode: number) {
    try {
      const claim = await this.claimsRepository.findOne({
        where: {
          uid: referenceCode,
          deletedAt: IsNull()
        }
      });

      if (!claim) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: claim
      }

      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(referenceCode: number, updateClaimDto: UpdateClaimDto) {
    try {
      await this.claimsRepository.update(referenceCode, updateClaimDto as unknown as DeepPartial<Claim>);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(referenceCode: number) {
    try {
      const claim = await this.claimsRepository.findOne({
        where: {
          uid: referenceCode,
          deletedAt: IsNull()
        }
      });

      if (!claim) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      await this.claimsRepository.softDelete(referenceCode);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  async restore(referenceCode: number) {
    try {
      const claim = await this.claimsRepository.findOne({
        where: {
          uid: referenceCode,
          deletedAt: Not(IsNull())
        },
        withDeleted: true
      });

      if (!claim) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      await this.claimsRepository.restore(referenceCode);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

      return response;
    } catch (error) {
      throw new Error(error);
    }
  }
}
