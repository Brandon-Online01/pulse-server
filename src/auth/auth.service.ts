import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInInput, SignUpInput, VerifyEmailInput, SetPasswordInput, ForgotPasswordInput, ResetPasswordInput } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { SignInResponse, SignUpResponse } from '../lib/types/auth';
import { ProfileData } from '../lib/types/auth';
import { RewardsService } from '../rewards/rewards.service';
import { XP_VALUES, XP_VALUES_TYPES } from 'src/lib/constants/constants';
import { EmailType } from '../lib/enums/email.enums';
import { AccessLevel } from '../lib/enums/user.enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PendingSignupService } from './pending-signup.service';
import { PasswordResetService } from './password-reset.service';
import { LicensingService } from '../licensing/licensing.service';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		private userService: UserService,
		private rewardsService: RewardsService,
		private eventEmitter: EventEmitter2,
		private pendingSignupService: PendingSignupService,
		private passwordResetService: PasswordResetService,
		private licensingService: LicensingService,
	) { }

	private async generateSecureToken(): Promise<string> {
		return crypto.randomBytes(32).toString('hex');
	}

	async signIn(signInInput: SignInInput): Promise<SignInResponse> {
		try {
			const { username, password } = signInInput;;

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

			const { uid, accessLevel, name, organisationRef, ...restOfUser } = authProfile?.user;

			// Check organization license if user belongs to an organization
			if (organisationRef) {
				const licenses = await this.licensingService.findByOrganisation(organisationRef);
				const activeLicense = licenses.find(license => this.licensingService.validateLicense(String(license?.uid)));

				if (!activeLicense) {
					throw new UnauthorizedException('Your organization\'s license has expired. Please contact your administrator.');
				}

				// Add license info to profile data
				const profileData: ProfileData = {
					uid: uid.toString(),
					accessLevel,
					name,
					organisationRef,
					licenseInfo: {
						licenseId: String(activeLicense?.uid),
						plan: activeLicense?.plan,
						status: activeLicense?.status,
						features: activeLicense?.features
					},
					...restOfUser
				};

				const tokenRole = accessLevel?.toLowerCase();

				// Include license info in token payload
				const payload = {
					uid: uid?.toString(),
					role: tokenRole,
					organisationRef,
					licenseId: String(activeLicense?.uid),
					licensePlan: activeLicense?.plan,
					features: activeLicense?.features
				};

				const accessToken = await this.jwtService.signAsync(payload, { expiresIn: `8h` });
				const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: `7d` });

				const gainedXP = {
					owner: Number(uid),
					amount: XP_VALUES.DAILY_LOGIN,
					action: 'DAILY_LOGIN',
					source: {
						id: uid.toString(),
						type: XP_VALUES_TYPES.LOGIN,
						details: 'Daily login reward'
					}
				}

				await this.rewardsService.awardXP(gainedXP);

				return {
					profileData,
					accessToken,
					refreshToken,
					message: `Welcome ${profileData.name}!`,
				};
			}

			// For users without organization (like system admins)
			const profileData: ProfileData = {
				uid: uid.toString(),
				accessLevel,
				name,
				...restOfUser
			};

			const tokenRole = accessLevel?.toLowerCase();
			const payload = { uid: uid?.toString(), role: tokenRole };

			const accessToken = await this.jwtService.signAsync(payload, { expiresIn: `8h` });
			const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: `7d` });

			return {
				profileData,
				accessToken,
				refreshToken,
				message: `Welcome ${profileData.name}!`,
			};

		} catch (error) {
			const response = {
				message: error?.message,
				accessToken: null,
				refreshToken: null,
				profileData: null,
			}

			return response;
		}
	}

	async signUp(signUpInput: SignUpInput): Promise<SignUpResponse> {
		try {
			const { email } = signUpInput;

			const existingUser = await this.userService.findOneByEmail(email);
			if (existingUser?.user) {
				throw new BadRequestException('Email already taken, please try another one.');
			}

			const existingPendingSignup = await this.pendingSignupService.findByEmail(email);

			if (existingPendingSignup) {
				if (!existingPendingSignup.isVerified && existingPendingSignup.tokenExpires > new Date()) {
					return {
						message: 'Please check your email for the verification link sent earlier.',
					};
				}
				await this.pendingSignupService.delete(existingPendingSignup.uid);
			}

			const verificationToken = await this.generateSecureToken();
			const verificationUrl = `${process.env.SIGNUP_DOMAIN}/verify/${verificationToken}`;

			await this.pendingSignupService.create(email, verificationToken);

			this.eventEmitter.emit('send.email',
				EmailType.VERIFICATION,
				[email],
				{
					name: email.split('@')[0],
					verificationLink: verificationUrl,
					expiryHours: 24
				}
			);

			const response = {
				status: 'success',
				message: 'Please check your email and verify your account within the next 24 hours.',
			}

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}

			return response;
		}
	}

	async verifyEmail(verifyEmailInput: VerifyEmailInput) {
		try {
			const { token } = verifyEmailInput;
			const pendingSignup = await this.pendingSignupService.findByToken(token);

			if (!pendingSignup) {
				throw new BadRequestException('Invalid verification token');
			}

			if (pendingSignup.tokenExpires < new Date()) {
				await this.pendingSignupService.delete(pendingSignup.uid);
				throw new BadRequestException('Verification token has expired. Please sign up again.');
			}

			if (pendingSignup.isVerified) {
				throw new BadRequestException('Email already verified. Please proceed to set your password.');
			}

			await this.pendingSignupService.markAsVerified(pendingSignup.uid);

			return {
				message: 'Email verified successfully. You can now set your password.',
				email: pendingSignup.email
			};
		} catch (error) {
			throw new HttpException(
				error.message || 'Email verification failed',
				error.status || HttpStatus.BAD_REQUEST
			);
		}
	}

	async setPassword(setPasswordInput: SetPasswordInput) {
		try {
			const { token, password } = setPasswordInput;
			const pendingSignup = await this.pendingSignupService.findByToken(token);

			if (!pendingSignup) {
				throw new BadRequestException('Invalid token');
			}

			if (!pendingSignup.isVerified) {
				throw new BadRequestException('Email not verified. Please verify your email first.');
			}

			if (pendingSignup.tokenExpires < new Date()) {
				await this.pendingSignupService.delete(pendingSignup.uid);
				throw new BadRequestException('Token has expired. Please sign up again.');
			}

			// Create the actual user account
			const username = pendingSignup.email.split('@')[0].toLowerCase();
			const hashedPassword = await bcrypt.hash(password, 10);

			await this.userService.create({
				email: pendingSignup.email,
				username,
				password: hashedPassword,
				name: username,
				surname: '',
				phone: '',
				photoURL: `https://ui-avatars.com/api/?name=${username}&background=805adc&color=fff`,
				accessLevel: AccessLevel.USER,
				userref: `USR${Date.now()}`
			});

			// Delete the pending signup
			await this.pendingSignupService.delete(pendingSignup.uid);

			// Send welcome email
			this.eventEmitter.emit('send.email',
				EmailType.SIGNUP,
				[pendingSignup.email],
				{
					name: username,
				}
			);

			const response = {
				status: 'success',
				message: 'Account created successfully. You can now sign in.',
			};

			return response;
		} catch (error) {
			throw new HttpException(
				error.message || 'Failed to create account',
				error.status || HttpStatus.BAD_REQUEST
			);
		}
	}

	async forgotPassword(forgotPasswordInput: ForgotPasswordInput) {
		try {
			const { email } = forgotPasswordInput;

			const existingUser = await this.userService.findOneByEmail(email);

			if (!existingUser?.user) {
				return {
					message: 'sign up to get started',
				};
			}

			const existingReset = await this.passwordResetService.findByEmail(email);

			if (existingReset) {
				if (existingReset.tokenExpires > new Date()) {
					const response = {
						status: 'success',
						message: 'Please check your email for the password reset link sent earlier.',
					};

					return response;
				}

				await this.passwordResetService.delete(existingReset?.uid);
			}

			const resetToken = await this.generateSecureToken();
			const resetUrl = `${process.env.SIGNUP_DOMAIN}/reset-password/${resetToken}`;

			await this.passwordResetService.create(email, resetToken);

			this.eventEmitter.emit('send.email',
				EmailType.PASSWORD_RESET,
				[email],
				{
					name: existingUser.user.name,
					resetLink: resetUrl,
					expiryMinutes: 30
				}
			);

			const response = {
				status: 'success',
				message: 'A password reset link has been sent to your email. Please check your inbox.',
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}

			return response;
		}
	}

	async resetPassword(resetPasswordInput: ResetPasswordInput) {
		try {
			const { token, password } = resetPasswordInput;
			const resetRequest = await this.passwordResetService.findByToken(token);

			if (!resetRequest) {
				throw new BadRequestException('Invalid or expired reset token');
			}

			if (resetRequest.tokenExpires < new Date()) {
				await this.passwordResetService.delete(resetRequest.uid);
				throw new BadRequestException('Reset token has expired. Please request a new one.');
			}

			const user = await this.userService.findOneByEmail(resetRequest.email);
			if (!user?.user) {
				throw new BadRequestException('User not found');
			}

			const hashedPassword = await bcrypt.hash(password, 10);
			await this.userService.resetPassword(user.user.uid, hashedPassword);

			// Mark reset request as used
			await this.passwordResetService.markAsUsed(resetRequest.uid);

			this.eventEmitter.emit('send.email',
				EmailType.PASSWORD_CHANGED,
				[user.user.email],
				{
					name: user.user.name,
					date: new Date(),
					deviceInfo: {
						browser: 'Web Browser',
						os: 'Unknown',
						location: 'Unknown'
					}
				}
			);

			return {
				message: 'Password reset successfully. You can now sign in with your new password.',
			};
		} catch (error) {
			throw new HttpException(
				error.message || 'Failed to reset password',
				error.status || HttpStatus.BAD_REQUEST
			);
		}
	}

	async refreshToken(token: string) {
		try {
			const payload = await this.jwtService.verifyAsync(token);

			if (!payload) {
				throw new BadRequestException('Invalid refresh token');
			}

			const authProfile = await this.userService.findOneByUid(Number(payload?.uid));

			if (!authProfile?.user) {
				throw new BadRequestException('User not found');
			}

			// Check organization license if user belongs to an organization
			if (authProfile.user.organisationRef) {
				const licenses = await this.licensingService.findByOrganisation(authProfile.user.organisationRef);
				const activeLicense = licenses.find(license => this.licensingService.validateLicense(String(license?.uid)));

				if (!activeLicense) {
					throw new UnauthorizedException('Your organization\'s license has expired. Please contact your administrator.');
				}

				const newPayload = {
					uid: payload?.uid,
					role: authProfile?.user?.accessLevel?.toLowerCase(),
					organisationRef: authProfile?.user?.organisationRef,
					licenseId: String(activeLicense?.uid),
					licensePlan: activeLicense?.plan,
					features: activeLicense?.features
				};

				const accessToken = await this.jwtService.signAsync(newPayload, {
					expiresIn: `${process.env.JWT_ACCESS_EXPIRES_IN}`
				});

				return {
					accessToken,
					profileData: {
						...authProfile?.user,
						licenseInfo: {
							licenseId: String(activeLicense?.uid),
							plan: activeLicense?.plan,
							status: activeLicense?.status,
							features: activeLicense?.features
						}
					},
					message: 'Access token refreshed successfully'
				};
			}

			// For users without organization
			const newPayload = {
				uid: payload.uid,
				role: authProfile.user.accessLevel?.toLowerCase()
			};

			const accessToken = await this.jwtService.signAsync(newPayload, {
				expiresIn: `${process.env.JWT_ACCESS_EXPIRES_IN}`
			});

			return {
				accessToken,
				profileData: authProfile?.user,
				message: 'Access token refreshed successfully'
			};
		} catch (error) {

			if (error?.name === 'TokenExpiredError') {
				throw new HttpException('Refresh token has expired', HttpStatus.UNAUTHORIZED);
			}
			throw new HttpException(
				error.message || 'Failed to refresh token',
				error.status || HttpStatus.BAD_REQUEST
			);
		}
	}
}
