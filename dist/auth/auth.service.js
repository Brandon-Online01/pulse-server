"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const user_service_1 = require("../user/user.service");
const rewards_service_1 = require("../rewards/rewards.service");
const constants_1 = require("../lib/constants/constants");
const email_enums_1 = require("../lib/enums/email.enums");
const user_enums_1 = require("../lib/enums/user.enums");
const event_emitter_1 = require("@nestjs/event-emitter");
const pending_signup_service_1 = require("./pending-signup.service");
const password_reset_service_1 = require("./password-reset.service");
const licensing_service_1 = require("../licensing/licensing.service");
let AuthService = class AuthService {
    constructor(jwtService, userService, rewardsService, eventEmitter, pendingSignupService, passwordResetService, licensingService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.rewardsService = rewardsService;
        this.eventEmitter = eventEmitter;
        this.pendingSignupService = pendingSignupService;
        this.passwordResetService = passwordResetService;
        this.licensingService = licensingService;
    }
    excludePassword(user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async generateSecureToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    async signIn(signInInput) {
        try {
            const { username, password } = signInInput;
            const authProfile = await this.userService.findOneForAuth(username);
            if (!authProfile?.user) {
                throw new common_1.BadRequestException('Invalid credentials provided');
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
            const userWithoutPassword = this.excludePassword(authProfile.user);
            const { uid, accessLevel, name, organisationRef, ...restOfUser } = userWithoutPassword;
            if (organisationRef) {
                const licenses = await this.licensingService.findByOrganisation(organisationRef);
                const activeLicense = licenses.find((license) => this.licensingService.validateLicense(String(license?.uid)));
                if (!activeLicense) {
                    throw new common_1.UnauthorizedException("Your organization's license has expired. Please contact your administrator.");
                }
                const profileData = {
                    uid: uid.toString(),
                    accessLevel,
                    name,
                    organisationRef,
                    licenseInfo: {
                        licenseId: String(activeLicense?.uid),
                        plan: activeLicense?.plan,
                        status: activeLicense?.status,
                        features: activeLicense?.features,
                    },
                    ...restOfUser,
                };
                const tokenRole = accessLevel?.toLowerCase();
                const payload = {
                    uid: uid?.toString(),
                    role: tokenRole,
                    organisationRef,
                    licenseId: String(activeLicense?.uid),
                    licensePlan: activeLicense?.plan,
                    features: activeLicense?.features,
                };
                const accessToken = await this.jwtService.signAsync(payload, { expiresIn: `8h` });
                const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: `7d` });
                const gainedXP = {
                    owner: Number(uid),
                    amount: constants_1.XP_VALUES.DAILY_LOGIN,
                    action: 'DAILY_LOGIN',
                    source: {
                        id: uid.toString(),
                        type: constants_1.XP_VALUES_TYPES.LOGIN,
                        details: 'Daily login reward',
                    },
                };
                await this.rewardsService.awardXP(gainedXP);
                return {
                    profileData,
                    accessToken,
                    refreshToken,
                    message: `Welcome ${profileData.name}!`,
                };
            }
            const profileData = {
                uid: uid.toString(),
                accessLevel,
                name,
                ...restOfUser,
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
        }
        catch (error) {
            const response = {
                message: error?.message,
                accessToken: null,
                refreshToken: null,
                profileData: null,
            };
            return response;
        }
    }
    async signUp(signUpInput) {
        try {
            const { email } = signUpInput;
            const existingUser = await this.userService.findOneByEmail(email);
            if (existingUser?.user) {
                throw new common_1.BadRequestException('Email already taken, please try another one.');
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
            this.eventEmitter.emit('send.email', email_enums_1.EmailType.VERIFICATION, [email], {
                name: email.split('@')[0],
                verificationLink: verificationUrl,
                expiryHours: 24,
            });
            const response = {
                status: 'success',
                message: 'Please check your email and verify your account within the next 24 hours.',
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
            };
            return response;
        }
    }
    async verifyEmail(verifyEmailInput) {
        try {
            const { token } = verifyEmailInput;
            const pendingSignup = await this.pendingSignupService.findByToken(token);
            if (!pendingSignup) {
                throw new common_1.BadRequestException('Invalid verification token');
            }
            if (pendingSignup.tokenExpires < new Date()) {
                await this.pendingSignupService.delete(pendingSignup.uid);
                throw new common_1.BadRequestException('Verification token has expired. Please sign up again.');
            }
            if (pendingSignup.isVerified) {
                throw new common_1.BadRequestException('Email already verified. Please proceed to set your password.');
            }
            await this.pendingSignupService.markAsVerified(pendingSignup.uid);
            return {
                message: 'Email verified successfully. You can now set your password.',
                email: pendingSignup.email,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Email verification failed', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async setPassword(setPasswordInput) {
        try {
            const { token, password } = setPasswordInput;
            const pendingSignup = await this.pendingSignupService.findByToken(token);
            if (!pendingSignup) {
                throw new common_1.BadRequestException('Invalid token');
            }
            if (!pendingSignup.isVerified) {
                throw new common_1.BadRequestException('Email not verified. Please verify your email first.');
            }
            if (pendingSignup.tokenExpires < new Date()) {
                await this.pendingSignupService.delete(pendingSignup.uid);
                throw new common_1.BadRequestException('Token has expired. Please sign up again.');
            }
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
                accessLevel: user_enums_1.AccessLevel.USER,
                userref: `USR${Date.now()}`,
            });
            await this.pendingSignupService.delete(pendingSignup.uid);
            this.eventEmitter.emit('send.email', email_enums_1.EmailType.SIGNUP, [pendingSignup.email], {
                name: username,
            });
            const response = {
                status: 'success',
                message: 'Account created successfully. You can now sign in.',
            };
            return response;
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create account', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async forgotPassword(forgotPasswordInput) {
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
            this.eventEmitter.emit('send.email', email_enums_1.EmailType.PASSWORD_RESET, [email], {
                name: existingUser.user.name,
                resetLink: resetUrl,
                expiryMinutes: 30,
            });
            const response = {
                status: 'success',
                message: 'A password reset link has been sent to your email. Please check your inbox.',
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
            };
            return response;
        }
    }
    async resetPassword(resetPasswordInput) {
        try {
            const { token, password } = resetPasswordInput;
            const resetRequest = await this.passwordResetService.findByToken(token);
            if (!resetRequest) {
                throw new common_1.BadRequestException('Invalid or expired reset token');
            }
            if (resetRequest.tokenExpires < new Date()) {
                await this.passwordResetService.delete(resetRequest.uid);
                throw new common_1.BadRequestException('Reset token has expired. Please request a new one.');
            }
            const user = await this.userService.findOneByEmail(resetRequest.email);
            if (!user?.user) {
                throw new common_1.BadRequestException('User not found');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            await this.userService.resetPassword(user.user.uid, hashedPassword);
            await this.passwordResetService.markAsUsed(resetRequest.uid);
            this.eventEmitter.emit('send.email', email_enums_1.EmailType.PASSWORD_CHANGED, [user.user.email], {
                name: user.user.name,
                date: new Date(),
                deviceInfo: {
                    browser: 'Web Browser',
                    os: 'Unknown',
                    location: 'Unknown',
                },
            });
            return {
                message: 'Password reset successfully. You can now sign in with your new password.',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to reset password', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async refreshToken(token) {
        try {
            const payload = await this.jwtService.verifyAsync(token);
            if (!payload) {
                throw new common_1.BadRequestException('Invalid refresh token');
            }
            const authProfile = await this.userService.findOneByUid(Number(payload?.uid));
            if (!authProfile?.user) {
                throw new common_1.BadRequestException('User not found');
            }
            if (authProfile.user.organisationRef) {
                const licenses = await this.licensingService.findByOrganisation(authProfile.user.organisationRef);
                const activeLicense = licenses.find((license) => this.licensingService.validateLicense(String(license?.uid)));
                if (!activeLicense) {
                    throw new common_1.UnauthorizedException("Your organization's license has expired. Please contact your administrator.");
                }
                const newPayload = {
                    uid: payload?.uid,
                    role: authProfile?.user?.accessLevel?.toLowerCase(),
                    organisationRef: authProfile?.user?.organisationRef,
                    licenseId: String(activeLicense?.uid),
                    licensePlan: activeLicense?.plan,
                    features: activeLicense?.features,
                };
                const accessToken = await this.jwtService.signAsync(newPayload, {
                    expiresIn: `${process.env.JWT_ACCESS_EXPIRES_IN}`,
                });
                return {
                    accessToken,
                    profileData: {
                        ...authProfile?.user,
                        licenseInfo: {
                            licenseId: String(activeLicense?.uid),
                            plan: activeLicense?.plan,
                            status: activeLicense?.status,
                            features: activeLicense?.features,
                        },
                    },
                    message: 'Access token refreshed successfully',
                };
            }
            const newPayload = {
                uid: payload.uid,
                role: authProfile.user.accessLevel?.toLowerCase(),
            };
            const accessToken = await this.jwtService.signAsync(newPayload, {
                expiresIn: `${process.env.JWT_ACCESS_EXPIRES_IN}`,
            });
            return {
                accessToken,
                profileData: authProfile?.user,
                message: 'Access token refreshed successfully',
            };
        }
        catch (error) {
            if (error?.name === 'TokenExpiredError') {
                throw new common_1.HttpException('Refresh token has expired', common_1.HttpStatus.UNAUTHORIZED);
            }
            throw new common_1.HttpException(error.message || 'Failed to refresh token', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        user_service_1.UserService,
        rewards_service_1.RewardsService,
        event_emitter_1.EventEmitter2,
        pending_signup_service_1.PendingSignupService,
        password_reset_service_1.PasswordResetService,
        licensing_service_1.LicensingService])
], AuthService);
//# sourceMappingURL=auth.service.js.map