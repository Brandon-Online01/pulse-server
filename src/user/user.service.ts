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

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.userRepository.save(createUserDto as unknown as User);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: user
      };

      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(): Promise<MultipleSearchResponse> {
    try {
      const cachedUsers = await this.cacheManager.get<User[]>('all_users');

      if (cachedUsers) {
        const response = {
          users: cachedUsers,
          message: process.env.SUCCESS_MESSAGE,
        };

        return response;
      }

      const users = await this.userRepository.find({ where: { isDeleted: false } });

      if (users?.length > 0) {
        await this.cacheManager.set('all_users', users, 3600000);
      }

      const response = {
        users: users || null,
        message: users ? process.env.SUCCESS_MESSAGE : 'users not found',
      };

      return response;

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

      const response = {
        user: user || null,
        message: user ? process.env.SUCCESS_MESSAGE : 'user not found',
      };

      return response;
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

      const response = {
        message: updatedUser ? process.env.SUCCESS_MESSAGE : 'user not found',
      };

      return response;

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

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      };

      return response;
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

  async restore(referenceCode: number) {
    try {
      const user = await this.userRepository.update(
        { userReferenceCode: referenceCode.toString() },
        {
          isDeleted: false,
          status: Status.ACTIVE
        }
      );

      await this.cacheManager.del('all_users');

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: user
      };

      return response;
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
