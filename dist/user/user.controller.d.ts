import { UserService } from './user.service';
import { AccessLevel } from '../lib/enums/user.enums';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccountStatus } from '../lib/enums/status.enums';
import { AuthenticatedRequest } from '../lib/interfaces/authenticated-request.interface';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    findAll(req: AuthenticatedRequest, page?: number, limit?: number, status?: AccountStatus, accessLevel?: AccessLevel, search?: string, branchId?: number, organisationId?: number): Promise<import("../lib/interfaces/product.interfaces").PaginatedResponse<Omit<import("./entities/user.entity").User, "password">>>;
    findOne(ref: number, req: AuthenticatedRequest): Promise<{
        user: Omit<import("./entities/user.entity").User, "password"> | null;
        message: string;
    }>;
    update(ref: number, updateUserDto: UpdateUserDto, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    restore(ref: number, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    remove(ref: number, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
}
