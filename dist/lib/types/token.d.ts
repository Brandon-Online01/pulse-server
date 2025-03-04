export interface Token {
    uid: string;
    role: string;
    organisationRef?: string;
    licenseId?: string;
    licensePlan?: string;
    features?: Record<string, boolean>;
    branch?: {
        uid: number;
    };
}
