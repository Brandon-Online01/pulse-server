import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Branch } from './entities/branch.entity';
export declare class BranchController {
    private readonly branchService;
    constructor(branchService: BranchService);
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
