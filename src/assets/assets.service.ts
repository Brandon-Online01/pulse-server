import { Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Asset } from './entities/asset.entity';
import { Repository } from 'typeorm';
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
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      return { message: process.env.SUCCESS_MESSAGE };
    } catch (error) {
      throw new Error(process.env.ERROR_MESSAGE);
    }
  }

  async findAll(): Promise<{ message: string }> {
    try {
      const assets = await this.assetRepository.find({ where: { isDeleted: false } });

      if (!assets) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      return { message: process.env.SUCCESS_MESSAGE };
    } catch (error) {
      throw new Error(process.env.ERROR_MESSAGE);
    }
  }

  async findOne(referenceCode: number): Promise<{ message: string }> {
    try {
      const asset = await this.assetRepository.findOne({ where: { uid: referenceCode, isDeleted: false } });

      if (!asset) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      return { message: process.env.SUCCESS_MESSAGE };
    } catch (error) {
      throw new Error(process.env.ERROR_MESSAGE);
    }
  }

  async findByBrand(queryTerm: string): Promise<{ message: string }> {
    try {
      const assets = await this.assetRepository.find({
        where: {
          brand: queryTerm,
          isDeleted: false
        }
      });

      if (!assets) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      return { message: process.env.SUCCESS_MESSAGE };
    } catch (error) {
      throw new Error(process.env.ERROR_MESSAGE);
    }
  }

  async update(referenceCode: number, updateAssetDto: UpdateAssetDto): Promise<{ message: string }> {
    try {
      const asset = await this.assetRepository.update(referenceCode, updateAssetDto);

      if (!asset) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      return { message: process.env.SUCCESS_MESSAGE };
    } catch (error) {
      throw new Error(process.env.ERROR_MESSAGE);
    }
  }

  async remove(referenceCode: number): Promise<{ message: string }> {
    try {
      const asset = await this.assetRepository.update(referenceCode, { isDeleted: true });

      if (!asset) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      return { message: process.env.SUCCESS_MESSAGE };
    } catch (error) {
      throw new Error(process.env.ERROR_MESSAGE);
    }
  }

  async restore(referenceCode: number): Promise<{ message: string }> {
    try {
      await this.assetRepository.update(
        { uid: referenceCode },
        {
          isDeleted: false,
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
