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
exports.OrganisationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organisation_entity_1 = require("./entities/organisation.entity");
const status_enums_1 = require("../lib/enums/status.enums");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
let OrganisationService = class OrganisationService {
    constructor(organisationRepository, cacheManager) {
        this.organisationRepository = organisationRepository;
        this.cacheManager = cacheManager;
        this.CACHE_PREFIX = 'organisation';
        this.ALL_ORGS_CACHE_KEY = `${this.CACHE_PREFIX}:all`;
    }
    getOrgCacheKey(ref) {
        return `${this.CACHE_PREFIX}:${ref}`;
    }
    async clearOrganisationCache(ref) {
        await this.cacheManager.del(this.ALL_ORGS_CACHE_KEY);
        if (ref) {
            await this.cacheManager.del(this.getOrgCacheKey(ref));
        }
    }
    async create(createOrganisationDto) {
        try {
            const organisation = await this.organisationRepository.save(createOrganisationDto);
            if (!organisation) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.clearOrganisationCache();
            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
            };
        }
    }
    async findAll() {
        try {
            const cachedOrganisations = await this.cacheManager.get(this.ALL_ORGS_CACHE_KEY);
            if (cachedOrganisations) {
                return {
                    organisations: cachedOrganisations,
                    message: process.env.SUCCESS_MESSAGE,
                };
            }
            const organisations = await this.organisationRepository.find({
                where: { isDeleted: false },
                relations: ['branches'],
                select: {
                    branches: {
                        uid: true,
                        name: true,
                        phone: true,
                        email: true,
                        website: true,
                    },
                },
            });
            if (!organisations) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.cacheManager.set(this.ALL_ORGS_CACHE_KEY, organisations);
            return {
                organisations,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                organisations: null,
                message: error?.message,
            };
        }
    }
    async findOne(ref) {
        try {
            const cacheKey = this.getOrgCacheKey(ref);
            const cachedOrganisation = await this.cacheManager.get(cacheKey);
            if (cachedOrganisation) {
                return {
                    organisation: cachedOrganisation,
                    message: process.env.SUCCESS_MESSAGE,
                };
            }
            const organisation = await this.organisationRepository.findOne({
                where: { ref, isDeleted: false },
                relations: ['branches', 'settings', 'appearance', 'hours', 'assets', 'products', 'clients', 'users', 'resellers', 'banners', 'news', 'journals', 'docs', 'claims', 'attendances', 'reports', 'quotations', 'tasks', 'notifications', 'trackings', 'communicationLogs'],
            });
            if (!organisation) {
                return {
                    organisation: null,
                    message: process.env.NOT_FOUND_MESSAGE,
                };
            }
            await this.cacheManager.set(cacheKey, organisation);
            return {
                organisation,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                organisation: null,
                message: error?.message,
            };
        }
    }
    async update(ref, updateOrganisationDto) {
        try {
            await this.organisationRepository.update({ ref }, updateOrganisationDto);
            const updatedOrganisation = await this.organisationRepository.findOne({
                where: { ref, isDeleted: false },
            });
            if (!updatedOrganisation) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.clearOrganisationCache(ref);
            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
            };
        }
    }
    async remove(ref) {
        try {
            const organisation = await this.organisationRepository.findOne({
                where: { ref, isDeleted: false },
            });
            if (!organisation) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.organisationRepository.update({ ref }, { isDeleted: true });
            await this.clearOrganisationCache(ref);
            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
            };
        }
    }
    async restore(ref) {
        try {
            await this.organisationRepository.update({ ref }, {
                isDeleted: false,
                status: status_enums_1.GeneralStatus.ACTIVE,
            });
            await this.clearOrganisationCache(ref);
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
            };
            return response;
        }
    }
};
exports.OrganisationService = OrganisationService;
exports.OrganisationService = OrganisationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organisation_entity_1.Organisation)),
    __param(1, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], OrganisationService);
//# sourceMappingURL=organisation.service.js.map