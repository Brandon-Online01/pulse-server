import { LicensingService } from './licensing.service';
export declare class LicensingNotificationsService {
    private readonly licensingService;
    private readonly logger;
    private readonly NOTIFICATION_THRESHOLDS;
    constructor(licensingService: LicensingService);
    private sendExpirationNotification;
    private getExpirationMessage;
    checkExpiringLicenses(): Promise<void>;
    checkGracePeriodLicenses(): Promise<void>;
    checkLicenseUsage(): Promise<void>;
}
