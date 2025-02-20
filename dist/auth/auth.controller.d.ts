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
        message: any;
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
            organisation: import("../organisation/entities/organisation.entity").Organisation;
            uid: number;
            name: string;
            email: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("../lib/enums/status.enums").AccountStatus;
            isDeleted: boolean;
            assets: import("../assets/entities/asset.entity").Asset[];
            clients: import("../clients/entities/client.entity").Client[];
            journals: import("../journal/entities/journal.entity").Journal[];
            reports: import("../reports/entities/report.entity").Report[];
            quotations: import("../shop/entities/quotation.entity").Quotation[];
            notifications: import("../notifications/entities/notification.entity").Notification[];
            trackings: import("../tracking/entities/tracking.entity").Tracking[];
            username: string;
            organisationRef: string;
            surname: string;
            photoURL: string;
            accessLevel: import("../lib/enums/user.enums").AccessLevel;
            userref: string;
            verificationToken: string;
            resetToken: string;
            tokenExpires: Date;
            userProfile: import("../user/entities/user.profile.entity").UserProfile;
            userEmployeementProfile: import("../user/entities/user.employeement.profile.entity").UserEmployeementProfile;
            userAttendances: import("../attendance/entities/attendance.entity").Attendance[];
            userClaims: import("../claims/entities/claim.entity").Claim[];
            userDocs: import("../docs/entities/doc.entity").Doc[];
            leads: import("../leads/entities/lead.entity").Lead[];
            userTasks: import("../tasks/entities/task.entity").Task[];
            tasksAssigned: import("../tasks/entities/task.entity").Task[];
            articles: import("../news/entities/news.entity").News[];
            branch: import("../branch/entities/branch.entity").Branch;
            checkIns: import("../check-ins/entities/check-in.entity").CheckIn[];
            rewards: import("../rewards/entities/user-rewards.entity").UserRewards;
        };
        message: string;
    } | {
        accessToken: string;
        profileData: Omit<import("../user/entities/user.entity").User, "password">;
        message: string;
    }>;
}
