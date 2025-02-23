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
const event_emitter_1 = require("@nestjs/event-emitter");
let ClientsService = class ClientsService {
    constructor(clientsRepository, cacheManager, configService, eventEmitter) {
        this.clientsRepository = clientsRepository;
        this.cacheManager = cacheManager;
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.CACHE_PREFIX = 'clients:';
        this.CACHE_TTL = this.configService.get('CACHE_EXPIRATION_TIME') || 30;
    }
    getCacheKey(key) {
        return `${this.CACHE_PREFIX}${key}`;
    }
    async invalidateClientCache(client) {
        try {
            const keys = await this.cacheManager.store.keys();
            const keysToDelete = [];
            keysToDelete.push(this.getCacheKey(client.uid), this.getCacheKey(client.email), this.getCacheKey(client.name), `${this.CACHE_PREFIX}all`, `${this.CACHE_PREFIX}stats`);
            if (client.organisation?.uid) {
                keysToDelete.push(`${this.CACHE_PREFIX}org_${client.organisation.uid}`);
            }
            if (client.branch?.uid) {
                keysToDelete.push(`${this.CACHE_PREFIX}branch_${client.branch.uid}`);
            }
            if (client.status) {
                keysToDelete.push(`${this.CACHE_PREFIX}status_${client.status}`);
            }
            if (client.category) {
                keysToDelete.push(`${this.CACHE_PREFIX}category_${client.category}`);
            }
            const clientListCaches = keys.filter((key) => key.startsWith(`${this.CACHE_PREFIX}page`) ||
                key.includes('_limit') ||
                key.includes('_filter') ||
                key.includes('search_'));
            keysToDelete.push(...clientListCaches);
            await Promise.all(keysToDelete.map((key) => this.cacheManager.del(key)));
            this.eventEmitter.emit('clients.cache.invalidate', {
                clientId: client.uid,
                keys: keysToDelete,
            });
        }
        catch (error) {
            console.error('Error invalidating client cache:', error);
        }
    }
    async create(createClientDto, user) {
        try {
            const clientData = {
                ...createClientDto,
                organisation: user?.organisationRef ? { uid: user.organisationRef } : undefined,
                branch: user?.branch?.uid ? { uid: user.branch.uid } : undefined,
            };
            const client = await this.clientsRepository.save(clientData);
            if (!client) {
                throw new common_1.NotFoundException(process.env.CREATE_ERROR_MESSAGE);
            }
            await this.invalidateClientCache(client);
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
            const cacheKey = `${this.CACHE_PREFIX}page${page}_limit${limit}_${JSON.stringify(filters)}`;
            const cachedClients = await this.cacheManager.get(cacheKey);
            if (cachedClients) {
                return cachedClients;
            }
            const queryBuilder = this.clientsRepository
                .createQueryBuilder('client')
                .leftJoinAndSelect('client.branch', 'branch')
                .leftJoinAndSelect('client.organisation', 'organisation')
                .where('client.isDeleted = :isDeleted', { isDeleted: false });
            if (user?.organisationRef) {
                queryBuilder.andWhere('organisation.uid = :orgId', { orgId: user.organisationRef });
            }
            if (user?.branch?.uid) {
                queryBuilder.andWhere('branch.uid = :branchId', { branchId: user.branch.uid });
            }
            if (filters?.status) {
                queryBuilder.andWhere('client.status = :status', { status: filters.status });
            }
            if (filters?.category) {
                queryBuilder.andWhere('client.category = :category', { category: filters.category });
            }
            if (filters?.search) {
                queryBuilder.andWhere('(client.name ILIKE :search OR client.email ILIKE :search OR client.phone ILIKE :search)', { search: `%${filters.search}%` });
            }
            queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .orderBy('client.createdAt', 'DESC');
            const [clients, total] = await queryBuilder.getManyAndCount();
            if (!clients) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                data: clients,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
                message: process.env.SUCCESS_MESSAGE,
            };
            await this.cacheManager.set(cacheKey, response, this.CACHE_TTL);
            return response;
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
            const cachedClient = await this.cacheManager.get(cacheKey);
            if (cachedClient) {
                return {
                    client: cachedClient,
                    message: process.env.SUCCESS_MESSAGE,
                };
            }
            const queryBuilder = this.clientsRepository
                .createQueryBuilder('client')
                .leftJoinAndSelect('client.branch', 'branch')
                .leftJoinAndSelect('client.organisation', 'organisation')
                .where('client.uid = :ref', { ref })
                .andWhere('client.isDeleted = :isDeleted', { isDeleted: false });
            if (user?.organisationRef) {
                queryBuilder.andWhere('organisation.uid = :orgId', { orgId: user.organisationRef });
            }
            if (user?.branch?.uid) {
                queryBuilder.andWhere('branch.uid = :branchId', { branchId: user.branch.uid });
            }
            const client = await queryBuilder.getOne();
            if (!client) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.cacheManager.set(cacheKey, client, this.CACHE_TTL);
            return {
                client,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
                client: null,
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
            await this.invalidateClientCache(existingClient.client);
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
            await this.invalidateClientCache(existingClient.client);
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
                status: status_enums_1.GeneralStatus.ACTIVE,
            });
            await this.invalidateClientCache(existingClient.client);
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
    async clientsBySearchTerm(searchTerm, page = 1, limit = 10, user) {
        try {
            const cacheKey = `${this.CACHE_PREFIX}search_${searchTerm?.toLowerCase()}_page${page}_limit${limit}`;
            const cachedResults = await this.cacheManager.get(cacheKey);
            if (cachedResults) {
                return cachedResults;
            }
            const queryBuilder = this.clientsRepository
                .createQueryBuilder('client')
                .leftJoinAndSelect('client.branch', 'branch')
                .leftJoinAndSelect('client.organisation', 'organisation')
                .where('client.isDeleted = :isDeleted', { isDeleted: false });
            if (user?.organisationRef) {
                queryBuilder.andWhere('organisation.uid = :orgId', { orgId: user.organisationRef });
            }
            if (user?.branch?.uid) {
                queryBuilder.andWhere('branch.uid = :branchId', { branchId: user.branch.uid });
            }
            queryBuilder.andWhere('(client.name ILIKE :search OR client.email ILIKE :search OR client.phone ILIKE :search)', { search: `%${searchTerm?.toLowerCase()}%` });
            queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .orderBy('client.createdAt', 'DESC');
            const [clients, total] = await queryBuilder.getManyAndCount();
            if (!clients) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                data: clients,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
                message: process.env.SUCCESS_MESSAGE,
            };
            await this.cacheManager.set(cacheKey, response, this.CACHE_TTL);
            return response;
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
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object, config_1.ConfigService,
        event_emitter_1.EventEmitter2])
], ClientsService);
//# sourceMappingURL=clients.service.js.map