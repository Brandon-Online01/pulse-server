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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const asset_entity_1 = require("./entities/asset.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
let AssetsService = class AssetsService {
    constructor(assetRepository) {
        this.assetRepository = assetRepository;
    }
    async create(createAssetDto) {
        try {
            const asset = await this.assetRepository.save(createAssetDto);
            if (!asset) {
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
    async findAll() {
        try {
            const assets = await this.assetRepository.find({ where: { isDeleted: false }, relations: ['owner', 'branch'] });
            if (!assets || assets?.length === 0) {
                const response = {
                    message: process.env.SEARCH_ERROR_MESSAGE,
                    assets: null
                };
                return response;
            }
            const response = {
                assets: assets,
                message: process.env.SUCCESS_MESSAGE
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                assets: null
            };
            return response;
        }
    }
    async findOne(ref) {
        try {
            const asset = await this.assetRepository.findOne({ where: { uid: ref, isDeleted: false }, relations: ['owner', 'branch'] });
            if (!asset) {
                throw new common_1.NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
            }
            const response = {
                asset: asset,
                message: process.env.SUCCESS_MESSAGE
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                asset: null
            };
            return response;
        }
    }
    async findBySearchTerm(query) {
        try {
            const assets = await this.assetRepository.find({
                where: [
                    { brand: (0, typeorm_1.Like)(`%${query}%`), isDeleted: false },
                    { serialNumber: (0, typeorm_1.Like)(`%${query}%`), isDeleted: false },
                    { modelNumber: (0, typeorm_1.Like)(`%${query}%`), isDeleted: false },
                    { owner: { name: (0, typeorm_1.Like)(`%${query}%`) }, isDeleted: false },
                    { branch: { name: (0, typeorm_1.Like)(`%${query}%`) }, isDeleted: false }
                ],
                relations: ['owner', 'branch']
            });
            if (!assets || assets?.length === 0) {
                throw new common_1.NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
            }
            const response = {
                assets: assets,
                message: process.env.SUCCESS_MESSAGE
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                assets: null
            };
            return response;
        }
    }
    async assetsByUser(ref) {
        try {
            const assets = await this.assetRepository.find({
                where: { owner: { uid: ref } }
            });
            if (!assets) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                assets
            };
            return response;
        }
        catch (error) {
            const response = {
                message: `could not get assets by user - ${error?.message}`,
                assets: null
            };
            return response;
        }
    }
    async update(ref, updateAssetDto) {
        try {
            const asset = await this.assetRepository.update(ref, updateAssetDto);
            if (!asset) {
                throw new common_1.NotFoundException(process.env.UPDATE_ERROR_MESSAGE);
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
            const asset = await this.assetRepository.update(ref, { isDeleted: true });
            if (!asset) {
                throw new common_1.NotFoundException(process.env.DELETE_ERROR_MESSAGE);
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
            const asset = await this.assetRepository.update({ uid: ref }, {
                isDeleted: false,
            });
            if (!asset) {
                throw new common_1.NotFoundException(process.env.RESTORE_ERROR_MESSAGE);
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
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(asset_entity_1.Asset)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], AssetsService);
//# sourceMappingURL=assets.service.js.map