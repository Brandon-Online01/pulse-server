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
exports.BranchService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const branch_entity_1 = require("./entities/branch.entity");
const typeorm_2 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
let BranchService = class BranchService {
    constructor(branchRepository, cacheManager) {
        this.branchRepository = branchRepository;
        this.cacheManager = cacheManager;
        this.CACHE_PREFIX = 'branch';
        this.ALL_BRANCHES_CACHE_KEY = `${this.CACHE_PREFIX}:all`;
    }
    getBranchCacheKey(ref) {
        return `${this.CACHE_PREFIX}:${ref}`;
    }
    async clearBranchCache(ref) {
        await this.cacheManager.del(this.ALL_BRANCHES_CACHE_KEY);
        if (ref) {
            await this.cacheManager.del(this.getBranchCacheKey(ref));
        }
    }
    async create(createBranchDto) {
        try {
            const branch = await this.branchRepository.save(createBranchDto);
            if (!branch) {
                throw new common_1.NotFoundException(process.env.CREATE_ERROR_MESSAGE);
            }
            await this.clearBranchCache();
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
            const cachedBranches = await this.cacheManager.get(this.ALL_BRANCHES_CACHE_KEY);
            if (cachedBranches) {
                return {
                    branches: cachedBranches,
                    message: process.env.SUCCESS_MESSAGE,
                };
            }
            const branches = await this.branchRepository.find({
                where: { isDeleted: false },
            });
            if (!branches) {
                throw new common_1.NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
            }
            await this.cacheManager.set(this.ALL_BRANCHES_CACHE_KEY, branches);
            return {
                branches,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
                branches: null,
            };
        }
    }
    async findOne(ref) {
        try {
            const cacheKey = this.getBranchCacheKey(ref);
            const cachedBranch = await this.cacheManager.get(cacheKey);
            if (cachedBranch) {
                return {
                    branch: cachedBranch,
                    message: process.env.SUCCESS_MESSAGE,
                };
            }
            const branch = await this.branchRepository.findOne({
                where: { ref, isDeleted: false },
                relations: ['news', 'docs', 'assets', 'organisation', 'trackings', 'banners', 'routes', 'users'],
            });
            if (!branch) {
                throw new common_1.NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
            }
            await this.cacheManager.set(cacheKey, branch);
            return {
                branch,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
                branch: null,
            };
        }
    }
    async update(ref, updateBranchDto) {
        try {
            await this.branchRepository.update({ ref }, updateBranchDto);
            const updatedBranch = await this.branchRepository.findOne({
                where: { ref, isDeleted: false },
            });
            if (!updatedBranch) {
                throw new common_1.NotFoundException(process.env.UPDATE_ERROR_MESSAGE);
            }
            await this.clearBranchCache(ref);
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
            const branch = await this.branchRepository.findOne({
                where: { ref, isDeleted: false },
            });
            if (!branch) {
                throw new common_1.NotFoundException(process.env.DELETE_ERROR_MESSAGE);
            }
            await this.branchRepository.update({ ref }, { isDeleted: true });
            await this.clearBranchCache(ref);
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
exports.BranchService = BranchService;
exports.BranchService = BranchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(branch_entity_1.Branch)),
    __param(1, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_1.Repository, Object])
], BranchService);
//# sourceMappingURL=branch.service.js.map