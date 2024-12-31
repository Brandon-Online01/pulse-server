import * as bcrypt from 'bcrypt';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { NewSignUp } from '../lib/types/user';
import { AccountStatus } from 'src/lib/enums/status.enums';
import { AccessLevel } from 'src/lib/enums/user.enums';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) { }

	async create(createUserDto: CreateUserDto): Promise<{ message: string }> {
		try {
			const user = await this.userRepository.save(createUserDto);

			if (!user) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

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

	async findAll(): Promise<{ users: User[] | null, message: string }> {
		try {
			const users = await this.userRepository.find({ where: { isDeleted: false } });

			if (!users) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				users: users,
				message: process.env.SUCCESS_MESSAGE,
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
					{ uid: Number(searchParameter), isDeleted: false },
				],
				relations: [
					'userProfile',
					'userEmployeementProfile',
					'userAttendances',
					'userClaims',
					'userDocs',
					'leads',
					'journals',
					'tasks',
					'articles',
					'assets',
					'trackings',
					'orders',
					'notifications',
					'branch'
				]
			});

			if (!user) {
				return {
					user: null,
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			const response = {
				user: user,
				message: process.env.SUCCESS_MESSAGE,
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

	async findOneForAuth(searchParameter: string): Promise<{ user: User | null, message: string }> {
		try {
			const user = await this.userRepository.findOne({
				where: [
					{ username: searchParameter, isDeleted: false },
				],
				relations: [
					'branch'
				]
			});

			if (!user) {
				return {
					user: null,
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			const response = {
				user: user,
				message: process.env.SUCCESS_MESSAGE,
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

	async getUsersByRole(recipients: string[]): Promise<{ users: User[] | null, message: string }> {
		try {
			const users = await this.userRepository.find({
				where: { email: In(recipients) },
			});

			if (!users) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				users: users,
				message: process.env.SUCCESS_MESSAGE,
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

	async update(ref: number, updateUserDto: UpdateUserDto): Promise<{ message: string }> {
		try {
			await this.userRepository.update(ref, updateUserDto);

			const updatedUser = await this.userRepository.findOne({
				where: { userref: ref.toString(), isDeleted: false }
			});

			if (!updatedUser) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

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

	async remove(ref: number): Promise<{ message: string }> {
		try {
			const user = await this.userRepository.findOne({
				where: { userref: ref.toString(), isDeleted: false }
			});

			if (!user) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			};

			await this.userRepository.update(
				{ userref: ref.toString() },
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
				status: userData?.status as AccountStatus
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

	async restore(ref: number): Promise<{ message: string }> {
		try {
			await this.userRepository.update(
				{ uid: ref },
				{
					isDeleted: false,
					status: AccountStatus.ACTIVE
				}
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
}
