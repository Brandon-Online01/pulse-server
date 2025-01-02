import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
export declare class BranchController {
    private readonly branchService;
    constructor(branchService: BranchService);
    create(createBranchDto: CreateBranchDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        branches: import("./entities/branch.entity").Branch[] | null;
        message: string;
    }>;
    findOne(ref: string): Promise<{
        branch: import("./entities/branch.entity").Branch | null;
        message: string;
    }>;
    update(ref: string, updateBranchDto: UpdateBranchDto): Promise<{
        message: string;
    }>;
    remove(ref: string): Promise<{
        message: string;
    }>;
}
