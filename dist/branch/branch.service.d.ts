import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
export declare class BranchService {
    private branchRepository;
    constructor(branchRepository: Repository<Branch>);
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
