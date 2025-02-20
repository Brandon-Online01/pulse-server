import { SignInInput, SignUpInput, VerifyEmailInput, SetPasswordInput, ForgotPasswordInput, ResetPasswordInput } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignInResponse, SignUpResponse } from '../lib/types/auth';
import { RewardsService } from '../rewards/rewards.service';
import { AccessLevel } from '../lib/enums/user.enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PendingSignupService } from './pending-signup.service';
import { PasswordResetService } from './password-reset.service';
import { LicensingService } from '../licensing/licensing.service';
export declare class AuthService {
    private jwtService;
    private userService;
    private rewardsService;
    private eventEmitter;
    private pendingSignupService;
    private passwordResetService;
    private licensingService;
    constructor(jwtService: JwtService, userService: UserService, rewardsService: RewardsService, eventEmitter: EventEmitter2, pendingSignupService: PendingSignupService, passwordResetService: PasswordResetService, licensingService: LicensingService);
    private excludePassword;
    private generateSecureToken;
    signIn(signInInput: SignInInput): Promise<SignInResponse>;
    signUp(signUpInput: SignUpInput): Promise<SignUpResponse>;
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
    refreshToken(token: string): Promise<{
        accessToken: string;
        profileData: {
            licenseInfo: {
                licenseId: string;
                plan: import("../lib/enums/license.enums").SubscriptionPlan;
                status: import("../lib/enums/license.enums").LicenseStatus;
                features: Record<string, boolean>;
            };
            uid: number;
            status: import("../lib/enums/status.enums").AccountStatus;
            isDeleted: boolean;
            createdAt: Date;
            updatedAt: Date;
            clients: import("../clients/entities/client.entity").Client[];
            name: string;
            username: string;
            email: string;
            phone: string;
            leads: import("../leads/entities/lead.entity").Lead[];
            quotations: import("../shop/entities/quotation.entity").Quotation[];
            checkIns: import("../check-ins/entities/check-in.entity").CheckIn[];
            surname: string;
            photoURL: string;
            accessLevel: AccessLevel;
            userref: string;
            organisation: import("../organisation/entities/organisation.entity").Organisation;
            organisationRef: string;
            verificationToken: string;
            resetToken: string;
            tokenExpires: Date;
            userProfile: import("../user/entities/user.profile.entity").UserProfile;
            userEmployeementProfile: import("../user/entities/user.employeement.profile.entity").UserEmployeementProfile;
            userAttendances: import("../attendance/entities/attendance.entity").Attendance[];
            userClaims: import("../claims/entities/claim.entity").Claim[];
            userDocs: import("../docs/entities/doc.entity").Doc[];
            journals: import("../journal/entities/journal.entity").Journal[];
            userTasks: import("../tasks/entities/task.entity").Task[];
            tasksAssigned: import("../tasks/entities/task.entity").Task[];
            articles: import("../news/entities/news.entity").News[];
            assets: import("../assets/entities/asset.entity").Asset[];
            trackings: import("../tracking/entities/tracking.entity").Tracking[];
            notifications: import("../notifications/entities/notification.entity").Notification[];
            branch: import("../branch/entities/branch.entity").Branch;
            rewards: import("../rewards/entities/user-rewards.entity").UserRewards;
            reports: import("../reports/entities/report.entity").Report[];
        };
        message: string;
    } | {
        accessToken: string;
        profileData: Omit<import("../user/entities/user.entity").User, "password">;
        message: string;
    }>;
}
