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
        message: string;
    }>;
    resetPassword(resetPasswordInput: ResetPasswordInput): Promise<{
        message: string;
    }>;
    signIn(signInInput: SignInInput): Promise<import("../lib/types/auth").SignInResponse>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        profileData: {
            licenseInfo: {
                licenseId: string;
                plan: import("../lib/enums/license.enums").SubscriptionPlan;
                status: import("../lib/enums/license.enums").LicenseStatus;
                features: Record<string, boolean>;
            };
            uid: number;
            username: string;
            name: string;
            surname: string;
            email: string;
            phone: string;
            photoURL: string;
            role: string;
            status: string;
            departmentId: number;
            createdAt: Date;
            updatedAt: Date;
            accessLevel: import("../lib/enums/user.enums").AccessLevel;
            organisation: import("../organisation/entities/organisation.entity").Organisation;
            organisationRef: string;
            verificationToken: string;
            resetToken: string;
            tokenExpires: Date;
            userProfile: import("../user/entities/user.profile.entity").UserProfile;
            userEmployeementProfile: import("../user/entities/user.employeement.profile.entity").UserEmployeementProfile;
            attendance: import("../attendance/entities/attendance.entity").Attendance[];
            reports: import("../reports/entities/report.entity").Report[];
            userClaims: import("../claims/entities/claim.entity").Claim[];
            userDocs: import("../docs/entities/doc.entity").Doc[];
            leads: import("../leads/entities/lead.entity").Lead[];
            articles: import("../news/entities/news.entity").News[];
            assets: import("../assets/entities/asset.entity").Asset[];
            trackings: import("../tracking/entities/tracking.entity").Tracking[];
            quotations: import("../shop/entities/quotation.entity").Quotation[];
            notifications: import("../notifications/entities/notification.entity").Notification[];
            branch: import("../branch/entities/branch.entity").Branch;
            clients: import("../clients/entities/client.entity").Client[];
            checkIns: import("../check-ins/entities/check-in.entity").CheckIn[];
            rewards: import("../rewards/entities/user-rewards.entity").UserRewards;
            journals: import("../journal/entities/journal.entity").Journal[];
            isDeleted: boolean;
            tasks: import("../tasks/entities/task.entity").Task[];
            routes: import("../tasks/entities/route.entity").Route[];
        };
        message: string;
    } | {
        accessToken: string;
        profileData: Omit<import("../user/entities/user.entity").User, "password">;
        message: string;
    }>;
}
