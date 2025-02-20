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
let ClientsService = class ClientsService {
    constructor(clientsRepository) {
        this.clientsRepository = clientsRepository;
    }
    async create(createClientDto) {
        try {
            const client = await this.clientsRepository.save(createClientDto);
            if (!client) {
                throw new common_1.NotFoundException(process.env.CREATE_ERROR_MESSAGE);
            }
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
    async findAll(page = 1, limit = Number(process.env.DEFAULT_PAGE_LIMIT)) {
        try {
            const queryBuilder = this.clientsRepository
                .createQueryBuilder('client')
                .where('client.isDeleted = :isDeleted', { isDeleted: false });
            queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .orderBy('client.createdAt', 'DESC');
            const [clients, total] = await queryBuilder.getManyAndCount();
            if (!clients) {
                throw new common_1.NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
            }
            return {
                data: clients,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
                message: process.env.SUCCESS_MESSAGE,
            };
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
    async findOne(ref) {
        try {
            const client = await this.clientsRepository.findOne({
                where: {
                    uid: ref,
                    isDeleted: false
                },
            });
            if (!client) {
                throw new common_1.NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                client: client
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                client: null
            };
            return response;
        }
    }
    async update(ref, updateClientDto) {
        try {
            await this.clientsRepository.update(ref, updateClientDto);
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
    async remove(ref) {
        try {
            const client = await this.clientsRepository.findOne({
                where: { uid: ref, isDeleted: false }
            });
            if (!client) {
                throw new common_1.NotFoundException(process.env.DELETE_ERROR_MESSAGE);
            }
            ;
            await this.clientsRepository.update({ uid: ref }, { isDeleted: true });
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
    async restore(ref) {
        try {
            await this.clientsRepository.update({ uid: ref }, {
                isDeleted: false,
                status: status_enums_1.GeneralStatus.ACTIVE
            });
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
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClientsService);
//# sourceMappingURL=clients.service.js.map