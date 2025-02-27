import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { Cache } from 'cache-manager';
export declare class BranchService {
    private branchRepository;
    private cacheManager;
    constructor(branchRepository: Repository<Branch>, cacheManager: Cache);
    private readonly CACHE_PREFIX;
    private readonly ALL_BRANCHES_CACHE_KEY;
    private getBranchCacheKey;
    private clearBranchCache;
    create(createBranchDto: CreateBranchDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        branches: Branch[] | null;
        message: string;
    }>;
    findOne(ref: string): Promise<{
        branch: Branch | null;
        message: string;
    }>;
    update(ref: string, updateBranchDto: UpdateBranchDto): Promise<{
        message: string;
    }>;
    remove(ref: string): Promise<{
        message: string;
    }>;
}
