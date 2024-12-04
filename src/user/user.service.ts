import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Status } from '../lib/enums/enums';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Injectable } from '@nestjs/common';
import { NewSignUp } from '../lib/types/user';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
      const response = {
        message: error?.message,
      }

      return response;
    }
  }

  async findAll(): Promise<{ users: User[] | null, message: string }> {
    try {
      const users = await this.userRepository.find({ where: { isDeleted: false } });

      if (!users) {
        return {
          users: null,
          message: 'users not found',
        };
      }

      const response = {
        users: users,
        message: 'users found',
      };

      return response;

    } catch (error) {
      const response = {
        message: error?.message,
        users: null
      }

      return response;
    }
  }

  async findOne(searchParameter: string): Promise<{ user: User | null, message: string }> {
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

      if (!user) {
        return {
          user: null,
          message: 'user not found',
        };
      }

      const response = {
        user: user,
        message: 'user found',
      };

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        user: null
      }

      return response;
    }
  }

  async update(referenceCode: number, updateUserDto: UpdateUserDto): Promise<{ message: string }> {
    try {
      await this.userRepository.update(referenceCode, updateUserDto);

      const updatedUser = await this.userRepository.findOne({
        where: { userReferenceCode: referenceCode.toString(), isDeleted: false }
      });

      if (!updatedUser) {
        return {
          message: 'user not found',
        };
      }

      const response = {
        message: 'user updated',
      };

      return response;

    } catch (error) {
      const response = {
        message: error?.message,
      }

      return response;
    }
  }

  async remove(referenceCode: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { userReferenceCode: referenceCode.toString(), isDeleted: false }
      });

      if (!user) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      };

      await this.userRepository.update(
        { userReferenceCode: referenceCode.toString() },
        { isDeleted: true }
      );

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      };

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
      }

      return response;
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
      throw new Error(error?.message);
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

  async restore(referenceCode: number): Promise<{ message: string }> {
    try {
      await this.userRepository.update(
        { userReferenceCode: referenceCode.toString() },
        {
          isDeleted: false,
          status: Status.ACTIVE
        }
      );

      const response = {
        message: 'user restored',
      };

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
      }

      return response;
    }
  }
}
