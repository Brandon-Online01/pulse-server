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

  create(createAssetDto: CreateAssetDto) {
    return 'This action adds a new asset';
  }

  findAll() {
    return `This action returns all assets`;
  }

  findOne(referenceCode: string) {
    return `This action returns a #${referenceCode} asset`;
  }

  update(referenceCode: string, updateAssetDto: UpdateAssetDto) {
    return `This action updates a #${referenceCode} asset`;
  }

  remove(referenceCode: string) {
    return `This action removes a #${referenceCode} asset`;
  }
}
