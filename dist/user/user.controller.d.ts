import { UserService } from './user.service';
import { AccessLevel } from '../lib/enums/user.enums';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccountStatus } from '../lib/enums/status.enums';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<{
        message: string;
    }>;
    findAll(page?: number, limit?: number, status?: AccountStatus, accessLevel?: AccessLevel, search?: string, branchId?: number, organisationId?: number): Promise<import("../lib/interfaces/product.interfaces").PaginatedResponse<import("./entities/user.entity").User>>;
    findOne(searchParameter: number): Promise<{
        user: Omit<import("./entities/user.entity").User, "password"> | null;
        message: string;
    }>;
    update(ref: number, updateUserDto: UpdateUserDto): Promise<{
        message: string;
    }>;
    restore(ref: number): Promise<{
        message: string;
    }>;
    remove(ref: string): Promise<{
        message: string;
    }>;
}
