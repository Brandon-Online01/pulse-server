import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Asset } from './entities/asset.entity';
import { Repository } from 'typeorm';
export declare class AssetsService {
    private assetRepository;
    constructor(assetRepository: Repository<Asset>);
    create(createAssetDto: CreateAssetDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        assets: Asset[];
        message: string;
    }>;
    findOne(ref: number): Promise<{
        asset: Asset;
        message: string;
    }>;
    findBySearchTerm(query: string): Promise<{
        assets: Asset[];
        message: string;
    }>;
    assetsByUser(ref: number): Promise<{
        message: string;
        assets: Asset[];
    }>;
    update(ref: number, updateAssetDto: UpdateAssetDto): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
    restore(ref: number): Promise<{
        message: string;
    }>;
}
