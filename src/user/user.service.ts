import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Status } from 'src/lib/enums/enums';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { MultipleSearchResponse, NewSignUp, SingularSearchResponse } from 'src/lib/types/user';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(): Promise<MultipleSearchResponse> {
    try {
      const cachedUsers = await this.cacheManager.get<User[]>('all_users');

      if (cachedUsers) {
        return {
          users: cachedUsers,
          message: 'users found',
        };
      }

      const users = await this.userRepository.find({ where: { isDeleted: false } });

      if (users?.length > 0) {
        await this.cacheManager.set('all_users', users, 3600000);
      }

      return {
        users: users || null,
        message: users ? 'users found' : 'users not found',
      };

    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(searchParameter: string): Promise<SingularSearchResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: [
          { username: searchParameter, isDeleted: false },
          { email: searchParameter, isDeleted: false },
          { phone: searchParameter, isDeleted: false },
          { surname: searchParameter, isDeleted: false },
          { name: searchParameter, isDeleted: false }
        ]
      });

      return {
        user: user || null,
        message: user ? 'user found' : 'user not found',
      };
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(referenceCode: number, updateUserDto: UpdateUserDto) {
    try {
      await this.userRepository.update(referenceCode, updateUserDto);

      const updatedUser = await this.userRepository.findOne({
        where: { userReferenceCode: referenceCode.toString(), isDeleted: false }
      });

      await this.cacheManager.del('all_users');

      return {
        message: updatedUser ? 'user updated' : 'user not found',
      };

    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(referenceCode: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { userReferenceCode: referenceCode.toString(), isDeleted: false }
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      };

      await this.userRepository.update(
        { userReferenceCode: referenceCode.toString() },
        { isDeleted: true }
      );

      await this.cacheManager.del('all_users');

      return {
        message: 'user deactivated',
      };
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createPendingUser(userData: NewSignUp): Promise<void> {
    try {
      if (userData?.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      await this.userRepository.save({
        ...userData,
        status: userData?.status as Status
      });

      this.schedulePendingUserCleanup(userData?.email, userData?.tokenExpires);
    } catch (error) {
      throw new HttpException(
        'Failed to create pending user',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private schedulePendingUserCleanup(email: string, expiryDate: Date): void {
    const timeUntilExpiry = expiryDate.getTime() - Date.now();

    setTimeout(async () => {
      const user = await this.userRepository.findOne({ where: { email } });

      if (user && user?.status === 'pending') {
        await this.userRepository.update({ email }, { isDeleted: true });
      }

    }, timeUntilExpiry);
  }
}
