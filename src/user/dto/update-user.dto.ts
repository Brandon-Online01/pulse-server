import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { AccessLevel, Status } from 'src/lib/enums/enums';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
    photoURL?: string;
    accessLevel?: AccessLevel;
    updatedAt?: Date;
    deletedAt?: Date;
    status?: Status;
    username?: string;
    password?: string;
}
