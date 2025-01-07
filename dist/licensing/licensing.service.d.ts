import { Repository } from 'typeorm';
import { License } from './entities/license.entity';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
export declare class LicensingService {
    private readonly licenseRepository;
    private readonly logger;
    private readonly GRACE_PERIOD_DAYS;
    private readonly RENEWAL_WINDOW_DAYS;
    constructor(licenseRepository: Repository<License>);
    private generateLicenseKey;
    private getPlanDefaults;
    create(createLicenseDto: CreateLicenseDto): Promise<License>;
    findAll(): Promise<License[]>;
    findOne(ref: string): Promise<License>;
    findByOrganisation(organisationRef: string): Promise<License[]>;
    update(ref: string, updateLicenseDto: UpdateLicenseDto): Promise<License>;
    validateLicense(ref: string): Promise<boolean>;
    checkLimits(ref: string, metric: keyof License, currentValue: number): Promise<boolean>;
    renewLicense(ref: string): Promise<License>;
    suspendLicense(ref: string): Promise<License>;
    activateLicense(ref: string): Promise<License>;
    findExpiringLicenses(daysThreshold?: number): Promise<License[]>;
}
