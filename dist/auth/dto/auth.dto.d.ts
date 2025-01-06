export declare class SignInInput {
    username: string;
    password: string;
}
export declare class SignUpInput {
    email: string;
}
export declare class VerifyEmailInput {
    token: string;
}
export declare class SetPasswordInput {
    token: string;
    password: string;
}
export declare class ForgotPasswordInput {
    email: string;
}
export declare class ResetPasswordInput {
    token: string;
    password: string;
}
