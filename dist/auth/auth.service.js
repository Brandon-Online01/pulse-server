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
const user_service_1 = require("../user/user.service");
const rewards_service_1 = require("../rewards/rewards.service");
const constants_1 = require("../lib/constants/constants");
const email_enums_1 = require("../lib/enums/email.enums");
const user_enums_1 = require("../lib/enums/user.enums");
const event_emitter_1 = require("@nestjs/event-emitter");
let AuthService = class AuthService {
    constructor(jwtService, userService, rewardsService, eventEmitter) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.rewardsService = rewardsService;
        this.eventEmitter = eventEmitter;
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
            const isEmailTaken = await this.userService.findOne(email);
            if (isEmailTaken) {
                throw new common_1.HttpException('email already taken, please try another one.', common_1.HttpStatus.BAD_REQUEST);
            }
            const verificationToken = await this.generateShortToken();
            const verificationUrl = `${process.env.SIGNUP_DOMAIN}/verify/${verificationToken}`;
            await this.userService.createPendingUser({
                ...signUpInput,
                verificationToken,
                status: 'pending',
                tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });
            this.eventEmitter.emit('send.email', email_enums_1.EmailType.VERIFICATION, [user_enums_1.AccessLevel.USER], {
                name: email?.split('@')[0],
                verificationLink: verificationUrl,
                expiryHours: 24
            });
            return {
                message: 'please check your email and verify your account within the next 24 hours.',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create profile', error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async generateShortToken(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < length; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        user_service_1.UserService,
        rewards_service_1.RewardsService,
        event_emitter_1.EventEmitter2])
], AuthService);
//# sourceMappingURL=auth.service.js.map