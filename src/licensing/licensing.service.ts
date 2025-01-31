import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { License } from './entities/license.entity';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { LicenseStatus, SubscriptionPlan, LicenseType } from '../lib/enums/license.enums';
import { PLAN_FEATURES } from '../lib/constants/license-features';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailType } from '../lib/enums/email.enums';
import * as crypto from 'crypto';

@Injectable()
export class LicensingService {
    private readonly logger = new Logger(LicensingService.name);
    private readonly GRACE_PERIOD_DAYS = 15;
    private readonly RENEWAL_WINDOW_DAYS = 30;

    constructor(
        @InjectRepository(License)
        private readonly licenseRepository: Repository<License>,
        private readonly eventEmitter: EventEmitter2
    ) { }

    private generateLicenseKey(): string {
        return crypto.randomBytes(16).toString('hex').toUpperCase();
    }

    private getPlanDefaults(plan: SubscriptionPlan): Partial<License> {
        if (!plan) {
            throw new BadRequestException('Subscription plan is required');
        }

        const defaults = {
            [SubscriptionPlan.STARTER]: {
                maxUsers: 5,
                maxBranches: 1,
                storageLimit: 5120, // 5GB in MB
                apiCallLimit: 10000,
                integrationLimit: 2,
                price: 99,
                features: PLAN_FEATURES[SubscriptionPlan.STARTER],
            },
            [SubscriptionPlan.PROFESSIONAL]: {
                maxUsers: 20,
                maxBranches: 3,
                storageLimit: 20480, // 20GB in MB
                apiCallLimit: 500000,
                integrationLimit: 5,
                price: 199,
                features: PLAN_FEATURES[SubscriptionPlan.PROFESSIONAL],
            },
            [SubscriptionPlan.BUSINESS]: {
                maxUsers: 50,
                maxBranches: 10,
                storageLimit: 102400, // 100GB in MB
                apiCallLimit: 2000000,
                integrationLimit: 15,
                price: 499,
                features: PLAN_FEATURES[SubscriptionPlan.BUSINESS],
            },
            [SubscriptionPlan.ENTERPRISE]: {
                maxUsers: 999999,
                maxBranches: 999999,
                storageLimit: 1024 * 1024, // 1TB in MB
                apiCallLimit: 10000000,
                integrationLimit: 999999,
                price: 999,
                features: PLAN_FEATURES[SubscriptionPlan.ENTERPRISE],
            },
        };

        const planDefaults = defaults[plan];
        if (!planDefaults) {
            throw new BadRequestException(`Invalid subscription plan: ${plan}`);
        }

        return planDefaults;
    }

    async create(createLicenseDto: CreateLicenseDto): Promise<License> {
        try {
            if (!createLicenseDto?.plan) {
                throw new BadRequestException('Subscription plan is required');
            }

            const planDefaults = this.getPlanDefaults(createLicenseDto.plan);

            if (createLicenseDto.plan !== SubscriptionPlan.ENTERPRISE) {
                createLicenseDto = {
                    ...createLicenseDto,
                    maxUsers: planDefaults.maxUsers,
                    maxBranches: planDefaults.maxBranches,
                    storageLimit: planDefaults.storageLimit,
                    apiCallLimit: planDefaults.apiCallLimit,
                    integrationLimit: planDefaults.integrationLimit,
                    price: planDefaults.price,
                };
            }

            const license = this.licenseRepository.create({
                ...createLicenseDto,
                features: planDefaults.features,
                licenseKey: this.generateLicenseKey(),
                status: createLicenseDto?.type === LicenseType.TRIAL ? LicenseStatus.TRIAL : LicenseStatus.ACTIVE,
                organisationRef: Number(createLicenseDto.organisationRef)
            });

            const created = await this.licenseRepository.save(license).then(result => {
                if (Array.isArray(result)) {
                    return result[0];
                }
                return result;
            });

            // Send email notification
            await this.eventEmitter.emit('send.email', EmailType.LICENSE_CREATED, [created.organisation?.email], {
                name: created.organisation?.name,
                licenseKey: created.licenseKey,
                organisationName: created.organisation?.name,
                plan: created.plan,
                validUntil: created.validUntil,
                features: created.features,
                limits: {
                    maxUsers: created.maxUsers,
                    maxBranches: created.maxBranches,
                    storageLimit: created.storageLimit,
                    apiCallLimit: created.apiCallLimit,
                    integrationLimit: created.integrationLimit,
                }
            });

            return created;
        } catch (error) {
            throw error;
        }
    }

    async findAll(): Promise<License[]> {
        try {
            return this.licenseRepository.find({
                relations: ['organisation'],
                order: { createdAt: 'DESC' },
            });
        } catch (error) {
            console.log(error);
        }
    }

    async findOne(ref: string): Promise<License> {
        try {
            const license = await this.licenseRepository.findOne({
                where: { uid: Number(ref) },
                relations: ['organisation'],
            });

            if (!license) {
                throw new NotFoundException(`License with ID ${ref} not found`);
            }

            return license;
        } catch (error) {
            console.log(error);
        }
    }

    async findByOrganisation(organisationRef: string): Promise<License[]> {
        try {
            return this.licenseRepository.find({
                where: { organisationRef: Number(organisationRef) },
                relations: ['organisation'],
                order: { validUntil: 'DESC' },
            });
        } catch (error) {
            console.log(error);
        }
    }

    async update(ref: string, updateLicenseDto: UpdateLicenseDto): Promise<License> {
        try {
            const license = await this.findOne(ref);

            if (updateLicenseDto.plan && updateLicenseDto.plan !== license.plan) {
                const planDefaults = this.getPlanDefaults(updateLicenseDto.plan);
                Object.assign(updateLicenseDto, {
                    features: planDefaults.features,
                    ...updateLicenseDto,
                });
            }

            Object.assign(license, updateLicenseDto);

            const updated = await this.licenseRepository.save(license);

            // Send email notification
            await this.eventEmitter.emit('send.email', EmailType.LICENSE_UPDATED, [updated?.organisation?.email], {
                name: updated?.organisation?.name,
                licenseKey: updated?.licenseKey,
                organisationName: updated?.organisation?.name,
                plan: updated?.plan,
                validUntil: updated?.validUntil,
                features: updated?.features,
                limits: {
                    maxUsers: updated?.maxUsers,
                    maxBranches: updated?.maxBranches,
                    storageLimit: updated?.storageLimit,
                    apiCallLimit: updated?.apiCallLimit,
                    integrationLimit: updated?.integrationLimit,
                }
            });

            return updated;
        } catch (error) {
            console.log(error);
        }
    }

    async validateLicense(ref: string): Promise<boolean> {
        try {
            const license = await this.findOne(ref);
            const now = new Date();

            license.lastValidated = now;
            await this.licenseRepository.save(license);

            if (license.status === LicenseStatus.SUSPENDED) {
                return false;
            }

            if (now > license.validUntil) {
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

            if (license.status === LicenseStatus.TRIAL) {
                return now <= license.validUntil;
            }

            return license.status === LicenseStatus.ACTIVE;
        } catch (error) {
            console.log(error);
        }
    }

    async checkLimits(ref: string, metric: keyof License, currentValue: number): Promise<boolean> {
        try {
            const license = await this.findOne(ref);
            const limit = license?.[metric];

            if (typeof limit !== 'number') {
                throw new BadRequestException(`Invalid metric: ${metric}`);
            }

            const isWithinLimit = currentValue <= limit;

            if (!isWithinLimit) {
                await this.eventEmitter.emit('send.email', EmailType.LICENSE_LIMIT_REACHED, [license?.organisation?.email], {
                    name: license?.organisation?.name,
                    licenseKey: license?.licenseKey,
                    organisationName: license?.organisation?.name,
                    plan: license?.plan,
                    validUntil: license?.validUntil,
                    features: license?.features,
                    limits: {
                        maxUsers: license?.maxUsers,
                        maxBranches: license?.maxBranches,
                        storageLimit: license?.storageLimit,
                        apiCallLimit: license?.apiCallLimit,
                        integrationLimit: license?.integrationLimit,
                    },
                    metric,
                    currentValue,
                    limit
                });
            }

            return isWithinLimit;
        } catch (error) {
            console.log(error);
        }
    }

    async renewLicense(ref: string): Promise<License> {
        try {
            const license = await this.findOne(ref);
            const now = new Date();

            const renewalStart = new Date(license.validUntil.getTime() - this.RENEWAL_WINDOW_DAYS * 24 * 60 * 60 * 1000);
            if (now < renewalStart) {
                throw new BadRequestException(`License can only be renewed within ${this.RENEWAL_WINDOW_DAYS} days of expiration`);
            }

            const validFrom = license.validUntil < now ? now : license.validUntil;
            const validUntil = new Date(validFrom.getTime() + 365 * 24 * 60 * 60 * 1000);

            const renewed = await this.update(ref, {
                validFrom,
                validUntil,
                status: LicenseStatus.ACTIVE,
            });

            this.eventEmitter.emit('send.email', EmailType.LICENSE_RENEWED, [renewed?.organisation?.email], {
                name: renewed?.organisation?.name,
                licenseKey: renewed?.licenseKey,
                organisationName: renewed?.organisation?.name,
                plan: renewed?.plan,
                validUntil: renewed?.validUntil,
                features: renewed?.features,
                limits: {
                    maxUsers: renewed?.maxUsers,
                    maxBranches: renewed?.maxBranches,
                    storageLimit: renewed?.storageLimit,
                    apiCallLimit: renewed?.apiCallLimit,
                    integrationLimit: renewed?.integrationLimit,
                }
            });

            return renewed;
        } catch (error) {
            console.log(error);
        }
    }

    async suspendLicense(ref: string): Promise<License> {
        try {
            const suspended = await this.update(ref, { status: LicenseStatus.SUSPENDED });

            // Send email notification
            this.eventEmitter.emit('send.email', EmailType.LICENSE_SUSPENDED, [suspended.organisation.email], {
                name: suspended.organisation.name,
                licenseKey: suspended.licenseKey,
                organisationName: suspended.organisation.name,
                plan: suspended.plan,
                validUntil: suspended.validUntil,
                features: suspended.features,
                limits: {
                    maxUsers: suspended.maxUsers,
                    maxBranches: suspended.maxBranches,
                    storageLimit: suspended.storageLimit,
                    apiCallLimit: suspended.apiCallLimit,
                    integrationLimit: suspended.integrationLimit,
                }
            });

            return suspended;
        } catch (error) {
            console.log(error);
        }
    }

    async activateLicense(ref: string): Promise<License> {
        try {
            const activated = await this.update(ref, { status: LicenseStatus.ACTIVE });

            this.eventEmitter.emit('send.email', EmailType.LICENSE_ACTIVATED, [activated?.organisation?.email], {
                name: activated?.organisation?.name,
                licenseKey: activated?.licenseKey,
                organisationName: activated?.organisation?.name,
                plan: activated?.plan,
                validUntil: activated?.validUntil,
                features: activated?.features,
                limits: {
                    maxUsers: activated?.maxUsers,
                    maxBranches: activated?.maxBranches,
                    storageLimit: activated?.storageLimit,
                    apiCallLimit: activated?.apiCallLimit,
                    integrationLimit: activated?.integrationLimit,
                }
            });

            return activated;
        } catch (error) {
            console.log(error);
        }
    }

    async findExpiringLicenses(daysThreshold: number = 30): Promise<License[]> {
        try {
            const thresholdDate = new Date();
            thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

            return this.licenseRepository.find({
                where: {
                    validUntil: LessThan(thresholdDate),
                    status: LicenseStatus.ACTIVE,
                },
                relations: ['organisation'],
            });
        } catch (error) {
            console.log(error);
        }
    }
} 