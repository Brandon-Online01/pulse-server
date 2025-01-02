import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignInInput, SignUpInput } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { SignInResponse, SignUpResponse } from '../lib/types/auth';
import { ProfileData } from '../lib/types/auth';
import { RewardsService } from '../rewards/rewards.service';
import { XP_VALUES, XP_VALUES_TYPES } from '../lib/constants/constants';
import { EmailType } from '../lib/enums/email.enums';
import { AccessLevel } from '../lib/enums/user.enums';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		private userService: UserService,
		private rewardsService: RewardsService,
		private eventEmitter: EventEmitter2,
	) { }

	async signIn(signInInput: SignInInput): Promise<SignInResponse> {
		try {
			const { username, password } = signInInput;

			const authProfile = await this.userService.findOneForAuth(username);

			if (!authProfile?.user) {
				throw new BadRequestException('Invalid credentials provided');
			}

			const { password: userPassword } = authProfile?.user;

			const isPasswordValid = await bcrypt.compare(password, userPassword);

			if (!isPasswordValid) {
				return {
					message: 'Invalid credentials provided',
					accessToken: null,
					refreshToken: null,
					profileData: null,
				};
			}

			const { uid, accessLevel, name, ...restOfUser } = authProfile?.user;

			const profileData: ProfileData = {
				uid: uid.toString(),
				accessLevel,
				name,
				...restOfUser
			};

			const tokenRole = accessLevel?.toLowerCase();

			const payload = { uid: uid?.toString(), role: tokenRole };

			const accessToken = await this.jwtService.signAsync(payload, { expiresIn: `${process.env.JWT_ACCESS_EXPIRES_IN}` });
			const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: `${process.env.JWT_REFRESH_EXPIRES_IN}` });

			await this.rewardsService.awardXP({
				owner: uid,
				amount: XP_VALUES.DAILY_LOGIN,
				action: 'DAILY_LOGIN',
				source: {
					id: uid.toString(),
					type: XP_VALUES_TYPES.LOGIN,
					details: 'Daily login reward'
				}
			});

			return {
				profileData,
				accessToken,
				refreshToken,
				message: `Welcome ${profileData.name}!`,
			};
		} catch (error) {
			throw new HttpException(
				error.message || 'Authentication failed',
				error.status || HttpStatus.BAD_REQUEST
			);
		}
	}

	async signUp(signUpInput: SignUpInput): Promise<SignUpResponse> {
		try {
			const { email } = signUpInput;

			const isEmailTaken = await this.userService.findOne(email);

			if (isEmailTaken) {
				throw new HttpException('email already taken, please try another one.', HttpStatus.BAD_REQUEST);
			}

			const verificationToken = await this.generateShortToken();
			const verificationUrl = `${process.env.SIGNUP_DOMAIN}/verify/${verificationToken}`;

			await this.userService.createPendingUser({
				...signUpInput,
				verificationToken,
				status: 'pending',
				tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
			});

			this.eventEmitter.emit('send.email',
				EmailType.VERIFICATION,
				[AccessLevel.USER],
				{
					name: email?.split('@')[0],
					verificationLink: verificationUrl,
					expiryHours: 24
				}
			);

			return {
				message: 'please check your email and verify your account within the next 24 hours.',
			};
		} catch (error) {
			throw new HttpException(
				error.message || 'Failed to create profile',
				error.status || HttpStatus.BAD_REQUEST
			);
		}
	}

	private async generateShortToken(length: number = 8): Promise<string> {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let token = '';

		for (let i = 0; i < length; i++) {
			token += chars.charAt(Math.floor(Math.random() * chars.length));
		}

		return token;
	}
}
