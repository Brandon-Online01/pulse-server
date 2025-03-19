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
        message: string;
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
            tasks: import("../tasks/entities/task.entity").Task[];
            uid: number;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            clients: import("../clients/entities/client.entity").Client[];
            routes: import("../tasks/entities/route.entity").Route[];
            organisation: import("../organisation/entities/organisation.entity").Organisation;
            branch: import("../branch/entities/branch.entity").Branch;
            name: string;
            username: string;
            surname: string;
            email: string;
            phone: string;
            photoURL: string;
            role: string;
            departmentId: number;
            accessLevel: AccessLevel;
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
            checkIns: import("../check-ins/entities/check-in.entity").CheckIn[];
            rewards: import("../rewards/entities/user-rewards.entity").UserRewards;
            journals: import("../journal/entities/journal.entity").Journal[];
            taskFlags: import("../tasks/entities/task-flag.entity").TaskFlag[];
        };
        message: string;
    } | {
        accessToken: string;
        profileData: Omit<import("../user/entities/user.entity").User, "password">;
        message: string;
    }>;
}
