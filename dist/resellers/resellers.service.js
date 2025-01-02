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
exports.ResellersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reseller_entity_1 = require("./entities/reseller.entity");
const product_enums_1 = require("../lib/enums/product.enums");
let ResellersService = class ResellersService {
    constructor(resellerRepository) {
        this.resellerRepository = resellerRepository;
    }
    async create(createResellerDto) {
        try {
            const reseller = await this.resellerRepository.save(createResellerDto);
            if (!reseller) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
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
    async findAll() {
        try {
            const resellers = await this.resellerRepository.find({ where: { isDeleted: false } });
            if (!resellers) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                resellers: resellers,
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                resellers: null
            };
            return response;
        }
    }
    async findOne(ref) {
        try {
            const reseller = await this.resellerRepository.findOne({ where: { uid: ref }, relations: ['products'] });
            if (!reseller) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                reseller: reseller,
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                reseller: null
            };
            return response;
        }
    }
    async update(ref, updateResellerDto) {
        try {
            const reseller = await this.resellerRepository.update(ref, updateResellerDto);
            if (!reseller) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
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
    async remove(ref) {
        try {
            const reseller = await this.resellerRepository.update(ref, { isDeleted: true });
            if (!reseller) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
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
    async restore(ref) {
        try {
            await this.resellerRepository.update({ uid: ref }, {
                isDeleted: false,
                status: product_enums_1.ResellerStatus.ACTIVE
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
exports.ResellersService = ResellersService;
exports.ResellersService = ResellersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reseller_entity_1.Reseller)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ResellersService);
//# sourceMappingURL=resellers.service.js.map