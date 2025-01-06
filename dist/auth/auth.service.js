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
let AuthService = class AuthService {
    constructor(jwtService, userService, rewardsService, eventEmitter, pendingSignupService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.rewardsService = rewardsService;
        this.eventEmitter = eventEmitter;
        this.pendingSignupService = pendingSignupService;
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
            const { uid, accessLevel, name, ...restOfUser } = authProfile?.user;
            const profileData = {
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
                amount: constants_1.XP_VALUES.DAILY_LOGIN,
                action: 'DAILY_LOGIN',
                source: {
                    id: uid.toString(),
                    type: constants_1.XP_VALUES_TYPES.LOGIN,
                    details: 'Daily login reward'
                }
            });
            return {
                profileData,
                accessToken,
                refreshToken,
                message: `Welcome ${profileData.name}!`,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Authentication failed', error.status || common_1.HttpStatus.BAD_REQUEST);
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
                expiryHours: 24
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
                email: pendingSignup.email
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
            const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT));
            await this.userService.create({
                email: pendingSignup.email,
                username,
                password: hashedPassword,
                name: username,
                surname: '',
                phone: '',
                photoURL: `https://ui-avatars.com/api/?name=${username}&background=805adc&color=fff`,
                accessLevel: user_enums_1.AccessLevel.USER,
                userref: `USR${Date.now()}`
            });
            await this.pendingSignupService.delete(pendingSignup.uid);
            this.eventEmitter.emit('send.email', email_enums_1.EmailType.SIGNUP, [pendingSignup.email], {
                name: username,
            });
            return {
                message: 'Account created successfully. You can now sign in.',
            };
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
                    message: 'If your email is registered, you will receive password reset instructions.',
                };
            }
            const resetToken = await this.generateSecureToken();
            const resetUrl = `${process.env.SIGNUP_DOMAIN}/reset-password/${resetToken}`;
            await this.userService.setResetToken(existingUser.user.uid, resetToken);
            this.eventEmitter.emit('send.email', email_enums_1.EmailType.PASSWORD_RESET, [email], {
                name: existingUser.user.name,
                resetLink: resetUrl,
                expiryMinutes: 30
            });
            const response = {
                status: 'success',
                message: 'A password reset link has been sent to your email. Follow the instructions to reset your password.',
            };
            return response;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || 'Failed to process password reset request', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async resetPassword(resetPasswordInput) {
        try {
            const { token, password } = resetPasswordInput;
            const user = await this.userService.findByResetToken(token);
            if (!user) {
                throw new common_1.BadRequestException('Invalid or expired reset token');
            }
            if (user.tokenExpires < new Date()) {
                throw new common_1.BadRequestException('Reset token has expired');
            }
            const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT));
            await this.userService.resetPassword(user.uid, hashedPassword);
            this.eventEmitter.emit('send.email', email_enums_1.EmailType.PASSWORD_CHANGED, [user.email], {
                name: user.name,
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
            const authProfile = await this.userService.findOne(payload?.uid);
            if (!authProfile?.user) {
                throw new common_1.BadRequestException('User not found');
            }
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
        pending_signup_service_1.PendingSignupService])
], AuthService);
//# sourceMappingURL=auth.service.js.map