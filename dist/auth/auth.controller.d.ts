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
            username: string;
            email: string;
            uid: number;
            createdAt: Date;
            isDeleted: boolean;
            organisation: import("../organisation/entities/organisation.entity").Organisation;
            branch: import("../branch/entities/branch.entity").Branch;
            leads: import("../leads/entities/lead.entity").Lead[];
            name: string;
            phone: string;
            status: string;
            updatedAt: Date;
            routes: import("../tasks/entities/route.entity").Route[];
            tasks: import("../tasks/entities/task.entity").Task[];
            clients: import("../clients/entities/client.entity").Client[];
            quotations: import("../shop/entities/quotation.entity").Quotation[];
            checkIns: import("../check-ins/entities/check-in.entity").CheckIn[];
            attendance: import("../attendance/entities/attendance.entity").Attendance[];
            reports: import("../reports/entities/report.entity").Report[];
            organisationRef: string;
            notifications: import("../notifications/entities/notification.entity").Notification[];
            assets: import("../assets/entities/asset.entity").Asset[];
            journals: import("../journal/entities/journal.entity").Journal[];
            trackings: import("../tracking/entities/tracking.entity").Tracking[];
            surname: string;
            photoURL: string;
            role: string;
            departmentId: number;
            accessLevel: import("../lib/enums/user.enums").AccessLevel;
            userref: string;
            verificationToken: string;
            resetToken: string;
            tokenExpires: Date;
            userProfile: import("../user/entities/user.profile.entity").UserProfile;
            userEmployeementProfile: import("../user/entities/user.employeement.profile.entity").UserEmployeementProfile;
            userClaims: import("../claims/entities/claim.entity").Claim[];
            userDocs: import("../docs/entities/doc.entity").Doc[];
            articles: import("../news/entities/news.entity").News[];
            rewards: import("../rewards/entities/user-rewards.entity").UserRewards;
        };
        message: string;
    } | {
        accessToken: string;
        profileData: Omit<import("../user/entities/user.entity").User, "password">;
        message: string;
    }>;
}
