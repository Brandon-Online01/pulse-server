import { AuthService } from './auth.service';
import { SignInInput, SignUpInput, VerifyEmailInput, SetPasswordInput, ForgotPasswordInput, ResetPasswordInput } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signUp(signUpInput: SignUpInput): Promise<import("../lib/types/auth").SignUpResponse>;
    verifyEmail(verifyEmailInput: VerifyEmailInput): Promise<{
        message: string;
        email: string;
    }>;
    setPassword(setPasswordInput: SetPasswordInput): Promise<{
        status: string;
        message: string;
    }>;
    forgotPassword(forgotPasswordInput: ForgotPasswordInput): Promise<{
        status: string;
        message: string;
    } | {
        message: string;
    }>;
    resetPassword(resetPasswordInput: ResetPasswordInput): Promise<{
        message: string;
    }>;
    signIn(signInInput: SignInInput): Promise<import("../lib/types/auth").SignInResponse>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        profileData: import("../user/entities/user.entity").User;
        message: string;
    }>;
}
