import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Asset } from './entities/asset.entity';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
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
    restore(ref: number): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
}
