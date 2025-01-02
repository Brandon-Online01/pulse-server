import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    create(createAssetDto: CreateAssetDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        assets: import("./entities/asset.entity").Asset[];
        message: string;
    }>;
    findOne(ref: number): Promise<{
        asset: import("./entities/asset.entity").Asset;
        message: string;
    }>;
    findBySearchTerm(query: string): Promise<{
        assets: import("./entities/asset.entity").Asset[];
        message: string;
    }>;
    assetsByUser(ref: number): Promise<{
        message: string;
        assets: import("./entities/asset.entity").Asset[];
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
