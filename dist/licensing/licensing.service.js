"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicensingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const license_entity_1 = require("./entities/license.entity");
const license_enums_1 = require("../lib/enums/license.enums");
const license_features_1 = require("../lib/constants/license-features");
const event_emitter_1 = require("@nestjs/event-emitter");
const email_enums_1 = require("../lib/enums/email.enums");
const crypto = require("crypto");
const schedule_1 = require("@nestjs/schedule");
let LicensingService = class LicensingService {
    constructor(licenseRepository, eventEmitter) {
        this.licenseRepository = licenseRepository;
        this.eventEmitter = eventEmitter;
        this.GRACE_PERIOD_DAYS = 15;
        this.RENEWAL_WINDOW_DAYS = 30;
    }
    async resetAllLicensesToActive() {
        await this.licenseRepository.update({}, {
            status: license_enums_1.LicenseStatus.ACTIVE,
        });
    }
    generateLicenseKey() {
        return crypto.randomBytes(16).toString('hex').toUpperCase();
    }
    getPlanDefaults(plan) {
        if (!plan) {
            throw new common_1.BadRequestException('Subscription plan is required');
        }
        const defaults = {
            [license_enums_1.SubscriptionPlan.STARTER]: {
                maxUsers: 5,
                maxBranches: 1,
                storageLimit: 5120,
                apiCallLimit: 10000,
                integrationLimit: 2,
                price: 99,
                features: license_features_1.PLAN_FEATURES[license_enums_1.SubscriptionPlan.STARTER],
            },
            [license_enums_1.SubscriptionPlan.PROFESSIONAL]: {
                maxUsers: 20,
                maxBranches: 3,
                storageLimit: 20480,
                apiCallLimit: 500000,
                integrationLimit: 5,
                price: 199,
                features: license_features_1.PLAN_FEATURES[license_enums_1.SubscriptionPlan.PROFESSIONAL],
            },
            [license_enums_1.SubscriptionPlan.BUSINESS]: {
                maxUsers: 50,
                maxBranches: 10,
                storageLimit: 102400,
                apiCallLimit: 2000000,
                integrationLimit: 15,
                price: 499,
                features: license_features_1.PLAN_FEATURES[license_enums_1.SubscriptionPlan.BUSINESS],
            },
            [license_enums_1.SubscriptionPlan.ENTERPRISE]: {
                maxUsers: 999999,
                maxBranches: 999999,
                storageLimit: 1024 * 1024,
                apiCallLimit: 10000000,
                integrationLimit: 999999,
                price: 999,
                features: license_features_1.PLAN_FEATURES[license_enums_1.SubscriptionPlan.ENTERPRISE],
            },
        };
        const planDefaults = defaults[plan];
        if (!planDefaults) {
            throw new common_1.BadRequestException(`Invalid subscription plan: ${plan}`);
        }
        return planDefaults;
    }
    async create(createLicenseDto) {
        try {
            if (!createLicenseDto?.plan) {
                throw new common_1.BadRequestException('Subscription plan is required');
            }
            const planDefaults = this.getPlanDefaults(createLicenseDto.plan);
            if (createLicenseDto.plan !== license_enums_1.SubscriptionPlan.ENTERPRISE) {
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
                status: createLicenseDto?.type === license_enums_1.LicenseType.TRIAL ? license_enums_1.LicenseStatus.TRIAL : license_enums_1.LicenseStatus.ACTIVE,
                organisationRef: Number(createLicenseDto.organisationRef),
            });
            const created = await this.licenseRepository.save(license).then((result) => {
                if (Array.isArray(result)) {
                    return result[0];
                }
                return result;
            });
            await this.eventEmitter.emit('send.email', email_enums_1.EmailType.LICENSE_CREATED, [created.organisation?.email], {
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
                },
            });
            return created;
        }
        catch (error) {
            throw error;
        }
    }
    async findAll() {
        try {
            return this.licenseRepository.find({
                relations: ['organisation'],
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async findOne(ref) {
        try {
            const license = await this.licenseRepository.findOne({
                where: { uid: Number(ref) },
                relations: ['organisation'],
            });
            if (!license) {
                throw new common_1.NotFoundException(`License with ID ${ref} not found`);
            }
            return license;
        }
        catch (error) {
            console.log(error);
        }
    }
    async findByOrganisation(organisationRef) {
        try {
            return this.licenseRepository.find({
                where: { organisationRef: Number(organisationRef) },
                relations: ['organisation'],
                order: { validUntil: 'DESC' },
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async update(ref, updateLicenseDto) {
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
            await this.eventEmitter.emit('send.email', email_enums_1.EmailType.LICENSE_UPDATED, [updated?.organisation?.email], {
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
                },
            });
            return updated;
        }
        catch (error) {
            console.log(error);
        }
    }
    async validateLicense(ref) {
        try {
            const license = await this.findOne(ref);
            const now = new Date();
            license.lastValidated = now;
            await this.licenseRepository.save(license);
            if (license.status === license_enums_1.LicenseStatus.SUSPENDED) {
                return false;
            }
            if (now > license.validUntil) {
                const gracePeriodEnd = new Date(license.validUntil.getTime() + this.GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
                if (now <= gracePeriodEnd) {
                    license.status = license_enums_1.LicenseStatus.GRACE_PERIOD;
                    await this.licenseRepository.save(license);
                    return true;
                }
                license.status = license_enums_1.LicenseStatus.EXPIRED;
                await this.licenseRepository.save(license);
                return false;
            }
            if (license.status === license_enums_1.LicenseStatus.TRIAL) {
                return now <= license.validUntil;
            }
            return license.status === license_enums_1.LicenseStatus.ACTIVE;
        }
        catch (error) {
            console.log(error);
        }
    }
    async checkLimits(ref, metric, currentValue) {
        try {
            const license = await this.findOne(ref);
            const limit = license?.[metric];
            if (typeof limit !== 'number') {
                throw new common_1.BadRequestException(`Invalid metric: ${metric}`);
            }
            const isWithinLimit = currentValue <= limit;
            if (!isWithinLimit) {
                await this.eventEmitter.emit('send.email', email_enums_1.EmailType.LICENSE_LIMIT_REACHED, [license?.organisation?.email], {
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
                    limit,
                });
            }
            return isWithinLimit;
        }
        catch (error) {
            console.log(error);
        }
    }
    async renewLicense(ref) {
        try {
            const license = await this.findOne(ref);
            const now = new Date();
            const renewalStart = new Date(license.validUntil.getTime() - this.RENEWAL_WINDOW_DAYS * 24 * 60 * 60 * 1000);
            if (now < renewalStart) {
                throw new common_1.BadRequestException(`License can only be renewed within ${this.RENEWAL_WINDOW_DAYS} days of expiration`);
            }
            const validFrom = license.validUntil < now ? now : license.validUntil;
            const validUntil = new Date(validFrom.getTime() + 365 * 24 * 60 * 60 * 1000);
            const renewed = await this.update(ref, {
                validFrom,
                validUntil,
                status: license_enums_1.LicenseStatus.ACTIVE,
            });
            this.eventEmitter.emit('send.email', email_enums_1.EmailType.LICENSE_RENEWED, [renewed?.organisation?.email], {
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
                },
            });
            return renewed;
        }
        catch (error) {
            console.log(error);
        }
    }
    async suspendLicense(ref) {
        try {
            const suspended = await this.update(ref, { status: license_enums_1.LicenseStatus.SUSPENDED });
            this.eventEmitter.emit('send.email', email_enums_1.EmailType.LICENSE_SUSPENDED, [suspended.organisation.email], {
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
                },
            });
            return suspended;
        }
        catch (error) {
            console.log(error);
        }
    }
    async activateLicense(ref) {
        try {
            const activated = await this.update(ref, { status: license_enums_1.LicenseStatus.ACTIVE });
            this.eventEmitter.emit('send.email', email_enums_1.EmailType.LICENSE_ACTIVATED, [activated?.organisation?.email], {
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
                },
            });
            return activated;
        }
        catch (error) {
            console.log(error);
        }
    }
    async findExpiringLicenses(daysThreshold = 30) {
        try {
            const thresholdDate = new Date();
            thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
            return this.licenseRepository.find({
                where: {
                    validUntil: (0, typeorm_2.LessThan)(thresholdDate),
                    status: license_enums_1.LicenseStatus.ACTIVE,
                },
                relations: ['organisation'],
            });
        }
        catch (error) {
            console.log(error);
        }
    }
};
exports.LicensingService = LicensingService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LicensingService.prototype, "resetAllLicensesToActive", null);
exports.LicensingService = LicensingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(license_entity_1.License)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], LicensingService);
//# sourceMappingURL=licensing.service.js.map