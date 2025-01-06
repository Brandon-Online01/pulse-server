import * as bcrypt from 'bcrypt';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { NewSignUp } from '../lib/types/user';
import { AccountStatus } from '../lib/enums/status.enums';

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

	async findOneByEmail(email: string): Promise<{ user: User | null, message: string }> {
		try {
			const user = await this.userRepository.findOne({ where: { email } });

			if (!user) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
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

	async findByVerificationToken(token: string): Promise<User | null> {
		try {
			const user = await this.userRepository.findOne({
				where: { verificationToken: token, isDeleted: false }
			});

			return user;
		} catch (error) {
			return null;
		}
	}

	async findByResetToken(token: string): Promise<User | null> {
		try {
			const user = await this.userRepository.findOne({
				where: { resetToken: token, isDeleted: false }
			});

			return user;
		} catch (error) {
			return null;
		}
	}

	async markEmailAsVerified(uid: number): Promise<void> {
		await this.userRepository.update(
			{ uid },
			{
				status: AccountStatus.ACTIVE,
				verificationToken: null,
				tokenExpires: null
			}
		);
	}

	async setPassword(uid: number, hashedPassword: string): Promise<void> {
		await this.userRepository.update(
			{ uid },
			{
				password: hashedPassword,
				verificationToken: null,
				tokenExpires: null,
				status: AccountStatus.ACTIVE
			}
		);
	}

	async setResetToken(uid: number, token: string): Promise<void> {
		await this.userRepository.update(
			{ uid },
			{
				resetToken: token,
				tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
			}
		);
	}

	async resetPassword(uid: number, hashedPassword: string): Promise<void> {
		await this.userRepository.update(
			{ uid },
			{
				password: hashedPassword,
				resetToken: null,
				tokenExpires: null
			}
		);
	}
}
