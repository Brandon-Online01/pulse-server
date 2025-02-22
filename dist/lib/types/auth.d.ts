import { AccessLevel } from '../enums/user.enums';
import { SubscriptionPlan, LicenseStatus } from '../enums/license.enums';
export interface ProfileData {
    uid: string;
    accessLevel: AccessLevel;
    name: string;
    email?: string;
    phone?: string;
    photoURL?: string;
    organisationRef?: string;
    licenseInfo?: {
        licenseId: string;
        plan: SubscriptionPlan;
        status: LicenseStatus;
        features: Record<string, boolean>;
    };
    branch?: {
        uid: string;
    };
}
export interface SignInResponse {
    message: string;
    accessToken: string | null;
    refreshToken: string | null;
    profileData: ProfileData | null;
}
export interface SignUpResponse {
    message: string;
    status?: string;
}
