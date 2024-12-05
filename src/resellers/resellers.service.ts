import { Injectable } from '@nestjs/common';
import { CreateResellerDto } from './dto/create-reseller.dto';
import { UpdateResellerDto } from './dto/update-reseller.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reseller } from './entities/reseller.entity';
import { ResellerStatus } from 'src/lib/enums/enums';

@Injectable()
export class ResellersService {
  constructor(
    @InjectRepository(Reseller)
    private resellerRepository: Repository<Reseller>,
  ) { }

  async create(createResellerDto: CreateResellerDto): Promise<{ message: string }> {
    try {
      const reseller = await this.resellerRepository.save(createResellerDto);

      if (!reseller) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
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

  async findAll(): Promise<{ resellers: Reseller[] | null, message: string }> {
    try {
      const resellers = await this.resellerRepository.find({ where: { isDeleted: false } });

      if (!resellers) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      const response = {
        resellers: resellers,
        message: process.env.SUCCESS_MESSAGE,
      };

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        resellers: null
      }

      return response;
    }
  }

  async findOne(referenceCode: number): Promise<{ reseller: Reseller | null, message: string }> {
    try {
      const reseller = await this.resellerRepository.findOne({ where: { uid: referenceCode } });

      if (!reseller) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      const response = {
        reseller: reseller,
        message: process.env.SUCCESS_MESSAGE,
      };

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        reseller: null
      }

      return response;
    }
  }

  async update(referenceCode: number, updateResellerDto: UpdateResellerDto): Promise<{ message: string }> {
    try {
      const reseller = await this.resellerRepository.update(referenceCode, updateResellerDto);

      if (!reseller) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
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

  async remove(referenceCode: number): Promise<{ message: string }> {
    try {
      const reseller = await this.resellerRepository.update(referenceCode, { isDeleted: true });

      if (!reseller) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
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

  async restore(referenceCode: number): Promise<{ message: string }> {
    try {
      await this.resellerRepository.update(
        { uid: referenceCode },
        {
          isDeleted: false,
          status: ResellerStatus.ACTIVE
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
