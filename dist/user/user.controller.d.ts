import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        users: import("./entities/user.entity").User[] | null;
        message: string;
    }>;
    findOne(searchParameter: string): Promise<{
        user: import("./entities/user.entity").User | null;
        message: string;
    }>;
    update(ref: number, updateUserDto: UpdateUserDto): Promise<{
        message: string;
    }>;
    restore(ref: number): Promise<{
        message: string;
    }>;
    remove(ref: number): Promise<{
        message: string;
    }>;
}
