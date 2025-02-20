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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const client_entity_1 = require("./entities/client.entity");
const typeorm_2 = require("typeorm");
const status_enums_1 = require("../lib/enums/status.enums");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
let ClientsService = class ClientsService {
    constructor(clientsRepository, cacheManager, configService) {
        this.clientsRepository = clientsRepository;
        this.cacheManager = cacheManager;
        this.configService = configService;
        this.CACHE_PREFIX = 'client:';
        this.CACHE_TTL = this.configService.get('CACHE_EXPIRATION_TIME') || 30;
    }
    getCacheKey(key) {
        return `${this.CACHE_PREFIX}${key}`;
    }
    async clearClientCache(clientId) {
        if (clientId) {
            await this.cacheManager.del(this.getCacheKey(clientId));
        }
        await this.cacheManager.del(this.getCacheKey('all'));
    }
    async create(createClientDto, user) {
        try {
            const clientData = {
                ...createClientDto,
                organisation: user?.organisationRef ? { uid: user.organisationRef } : undefined,
                branch: user?.branch?.uid ? { uid: user.branch.uid } : undefined
            };
            const client = await this.clientsRepository.save(clientData);
            if (!client) {
                throw new common_1.NotFoundException(process.env.CREATE_ERROR_MESSAGE);
            }
            await this.clearClientCache();
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
    async findAll(page = 1, limit = Number(process.env.DEFAULT_PAGE_LIMIT), user, filters) {
        try {
            const cacheKey = this.getCacheKey(`all:${page}:${limit}:${JSON.stringify(filters)}`);
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                return cached;
            }
            const where = {
                isDeleted: false
            };
            if (user?.organisationRef) {
                where.organisation = { uid: user?.organisationRef };
            }
            if (user?.branch?.uid) {
                where.branch = { uid: user?.branch?.uid };
            }
            if (filters?.status) {
                where.status = filters?.status;
            }
            if (filters?.category) {
                where.category = filters?.category;
            }
            if (filters?.search) {
                where.name = (0, typeorm_2.ILike)(`%${filters.search}%`);
            }
            const [clients, total] = await this.clientsRepository.findAndCount({
                where,
                relations: ['organisation', 'branch'],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' }
            });
            if (!clients) {
                throw new common_1.NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
            }
            const result = {
                data: clients,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
                message: process.env.SUCCESS_MESSAGE,
            };
            await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
            return result;
        }
        catch (error) {
            return {
                data: [],
                meta: {
                    total: 0,
                    page,
                    limit,
                    totalPages: 0,
                },
                message: error?.message,
            };
        }
    }
    async findOne(ref, user) {
        try {
            const cacheKey = this.getCacheKey(ref);
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                return {
                    message: process.env.SUCCESS_MESSAGE,
                    client: cached
                };
            }
            const where = {
                uid: ref,
                isDeleted: false
            };
            if (user?.organisationRef) {
                where.organisation = { uid: user.organisationRef };
            }
            if (user?.branch?.uid) {
                where.branch = { uid: user.branch.uid };
            }
            const client = await this.clientsRepository.findOne({
                where,
                relations: ['organisation', 'branch']
            });
            if (!client) {
                throw new common_1.NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
            }
            await this.cacheManager.set(cacheKey, client, this.CACHE_TTL);
            return {
                message: process.env.SUCCESS_MESSAGE,
                client
            };
        }
        catch (error) {
            return {
                message: error?.message,
                client: null
            };
        }
    }
    async update(ref, updateClientDto, user) {
        try {
            const existingClient = await this.findOne(ref, user);
            if (!existingClient.client) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.clientsRepository.update(ref, updateClientDto);
            await this.clearClientCache(ref);
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
    async remove(ref, user) {
        try {
            const existingClient = await this.findOne(ref, user);
            if (!existingClient.client) {
                throw new common_1.NotFoundException(process.env.DELETE_ERROR_MESSAGE);
            }
            await this.clientsRepository.update({ uid: ref }, { isDeleted: true });
            await this.clearClientCache(ref);
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
    async restore(ref, user) {
        try {
            const existingClient = await this.findOne(ref, user);
            if (!existingClient.client) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.clientsRepository.update({ uid: ref }, {
                isDeleted: false,
                status: status_enums_1.GeneralStatus.ACTIVE
            });
            await this.clearClientCache(ref);
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
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object, config_1.ConfigService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map