import { SignInInput, SignUpInput, VerifyEmailInput, SetPasswordInput, ForgotPasswordInput, ResetPasswordInput } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignInResponse, SignUpResponse } from '../lib/types/auth';
import { RewardsService } from '../rewards/rewards.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PendingSignupService } from './pending-signup.service';
export declare class AuthService {
    private jwtService;
    private userService;
    private rewardsService;
    private eventEmitter;
    private pendingSignupService;
    constructor(jwtService: JwtService, userService: UserService, rewardsService: RewardsService, eventEmitter: EventEmitter2, pendingSignupService: PendingSignupService);
    private generateSecureToken;
    signIn(signInInput: SignInInput): Promise<SignInResponse>;
    signUp(signUpInput: SignUpInput): Promise<SignUpResponse>;
    verifyEmail(verifyEmailInput: VerifyEmailInput): Promise<{
        message: string;
        email: string;
    }>;
    setPassword(setPasswordInput: SetPasswordInput): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordInput: ForgotPasswordInput): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordInput: ResetPasswordInput): Promise<{
        message: string;
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
        profileData: import("../user/entities/user.entity").User;
        message: string;
    }>;
}
