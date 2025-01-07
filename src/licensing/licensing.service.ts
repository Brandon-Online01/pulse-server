import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { License } from './entities/license.entity';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { LicenseStatus, SubscriptionPlan, LicenseType } from '../lib/enums/license.enums';
import * as crypto from 'crypto';

@Injectable()
export class LicensingService {
    private readonly logger = new Logger(LicensingService.name);
    private readonly GRACE_PERIOD_DAYS = 15;
    private readonly RENEWAL_WINDOW_DAYS = 30;

    constructor(
        @InjectRepository(License)
        private readonly licenseRepository: Repository<License>,
    ) { }

    private generateLicenseKey(): string {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(8).toString('hex').toUpperCase();
        return `${timestamp}-${random}`;
    }

    private getPlanDefaults(plan: SubscriptionPlan): Partial<License> {
        const defaults: Record<SubscriptionPlan, Partial<License>> = {
            [SubscriptionPlan.STARTER]: {
                maxUsers: 5,
                maxBranches: 1,
                storageLimit: 5 * 1024 * 1024 * 1024, // 5GB
                apiCallLimit: 10000,
                integrationLimit: 3,
                price: 99,
                features: {
                    basicDocumentStorage: true,
                    emailNotifications: true,
                    mobileAccess: true,
                    basicSupport: true,
                },
            },
            [SubscriptionPlan.PROFESSIONAL]: {
                maxUsers: 20,
                maxBranches: 3,
                storageLimit: 20 * 1024 * 1024 * 1024, // 20GB
                apiCallLimit: 50000,
                integrationLimit: 10,
                price: 249,
                features: {
                    basicDocumentStorage: true,
                    emailNotifications: true,
                    mobileAccess: true,
                    basicSupport: true,
                    advancedDocumentManagement: true,
                    customWorkflows: true,
                    advancedReporting: true,
                    prioritySupport: true,
                },
            },
            [SubscriptionPlan.BUSINESS]: {
                maxUsers: 50,
                maxBranches: 10,
                storageLimit: 50 * 1024 * 1024 * 1024, // 50GB
                apiCallLimit: 100000,
                integrationLimit: 20,
                price: 499,
                features: {
                    basicDocumentStorage: true,
                    emailNotifications: true,
                    mobileAccess: true,
                    basicSupport: true,
                    advancedDocumentManagement: true,
                    customWorkflows: true,
                    advancedReporting: true,
                    prioritySupport: true,
                    whiteLabel: true,
                    customIntegrations: true,
                    advancedAnalytics: true,
                    dedicatedSupport: true,
                },
            },
            [SubscriptionPlan.ENTERPRISE]: {
                maxUsers: 999999,
                maxBranches: 999999,
                storageLimit: 1024 * 1024 * 1024 * 1024, // 1TB
                apiCallLimit: 1000000,
                integrationLimit: 999999,
                price: 999,
                features: {
                    basicDocumentStorage: true,
                    emailNotifications: true,
                    mobileAccess: true,
                    basicSupport: true,
                    advancedDocumentManagement: true,
                    customWorkflows: true,
                    advancedReporting: true,
                    prioritySupport: true,
                    whiteLabel: true,
                    customIntegrations: true,
                    advancedAnalytics: true,
                    dedicatedSupport: true,
                    customDevelopment: true,
                    onPremise: true,
                    slaGuarantee: true,
                    accountManager: true,
                },
            },
        };

        return defaults[plan];
    }

    async create(createLicenseDto: CreateLicenseDto): Promise<License> {
        const planDefaults = this.getPlanDefaults(createLicenseDto.plan);

        // For enterprise plans, allow custom limits
        if (createLicenseDto.plan !== SubscriptionPlan.ENTERPRISE) {
            createLicenseDto = {
                ...createLicenseDto,
                maxUsers: planDefaults.maxUsers,
                maxBranches: planDefaults.maxBranches,
                storageLimit: planDefaults.storageLimit,
                apiCallLimit: planDefaults.apiCallLimit,
                integrationLimit: planDefaults.integrationLimit,
            };
        }

        const license = this.licenseRepository.create({
            ...createLicenseDto,
            features: planDefaults.features,
            licenseKey: this.generateLicenseKey(),
            status: createLicenseDto.type === LicenseType.TRIAL ? LicenseStatus.TRIAL : LicenseStatus.ACTIVE,
        });

        const created = await this.licenseRepository.save(license);
        this.logger.log(`Created new license: ${created.licenseKey} for organisation: ${created.organisationRef}`);
        return created;
    }

    async findAll(): Promise<License[]> {
        return this.licenseRepository.find({
            relations: ['organisation'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(ref: string): Promise<License> {
        const license = await this.licenseRepository.findOne({
            where: { uid: ref },
            relations: ['organisation'],
        });

        if (!license) {
            throw new NotFoundException(`License with ID ${ref} not found`);
        }

        return license;
    }

    async findByOrganisation(organisationRef: string): Promise<License[]> {
        return this.licenseRepository.find({
            where: { organisationRef },
            relations: ['organisation'],
            order: { validUntil: 'DESC' },
        });
    }

    async update(ref: string, updateLicenseDto: UpdateLicenseDto): Promise<License> {
        const license = await this.findOne(ref);

        // If plan is being updated, apply new plan defaults
        if (updateLicenseDto.plan && updateLicenseDto.plan !== license.plan) {
            const planDefaults = this.getPlanDefaults(updateLicenseDto.plan);
            Object.assign(updateLicenseDto, {
                features: planDefaults.features,
                ...updateLicenseDto,
            });
        }

        Object.assign(license, updateLicenseDto);

        const updated = await this.licenseRepository.save(license);
        this.logger.log(`Updated license: ${updated.licenseKey}`);
        return updated;
    }

    async validateLicense(ref: string): Promise<boolean> {
        const license = await this.findOne(ref);
        const now = new Date();

        // Update last validation timestamp
        license.lastValidated = now;
        await this.licenseRepository.save(license);

        // Check if license is suspended
        if (license.status === LicenseStatus.SUSPENDED) {
            return false;
        }

        // Check if license is expired
        if (now > license.validUntil) {
            // Check if within grace period
            const gracePeriodEnd = new Date(license.validUntil.getTime() + this.GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

            if (now <= gracePeriodEnd) {
                license.status = LicenseStatus.GRACE_PERIOD;
                await this.licenseRepository.save(license);
                return true;
            }

            license.status = LicenseStatus.EXPIRED;
            await this.licenseRepository.save(license);
            return false;
        }

        // Check if license is in trial
        if (license.status === LicenseStatus.TRIAL) {
            return now <= license.validUntil;
        }

        return license.status === LicenseStatus.ACTIVE;
    }

    async checkLimits(ref: string, metric: keyof License, currentValue: number): Promise<boolean> {
        const license = await this.findOne(ref);
        const limit = license[metric];

        if (typeof limit !== 'number') {
            throw new BadRequestException(`Invalid metric: ${metric}`);
        }

        const isWithinLimit = currentValue <= limit;

        if (!isWithinLimit) {
            this.logger.warn(`License ${license.licenseKey} exceeded ${metric} limit: ${currentValue}/${limit}`);
        }

        return isWithinLimit;
    }

    async renewLicense(ref: string): Promise<License> {
        const license = await this.findOne(ref);
        const now = new Date();

        // Only renew if within renewal window or expired
        const renewalStart = new Date(license.validUntil.getTime() - this.RENEWAL_WINDOW_DAYS * 24 * 60 * 60 * 1000);
        if (now < renewalStart) {
            throw new BadRequestException(`License can only be renewed within ${this.RENEWAL_WINDOW_DAYS} days of expiration`);
        }

        // Set new validity period
        const validFrom = license.validUntil < now ? now : license.validUntil;
        const validUntil = new Date(validFrom.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

        const renewed = await this.update(ref, {
            validFrom,
            validUntil,
            status: LicenseStatus.ACTIVE,
        });

        this.logger.log(`Renewed license: ${renewed.licenseKey}`);
        return renewed;
    }

    async suspendLicense(ref: string): Promise<License> {
        const suspended = await this.update(ref, { status: LicenseStatus.SUSPENDED });
        this.logger.warn(`Suspended license: ${suspended.licenseKey}`);
        return suspended;
    }

    async activateLicense(ref: string): Promise<License> {
        const activated = await this.update(ref, { status: LicenseStatus.ACTIVE });
        this.logger.log(`Activated license: ${activated.licenseKey}`);
        return activated;
    }

    async findExpiringLicenses(daysThreshold: number = 30): Promise<License[]> {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

        return this.licenseRepository.find({
            where: {
                validUntil: LessThan(thresholdDate),
                status: LicenseStatus.ACTIVE,
            },
            relations: ['organisation'],
        });
    }
} 