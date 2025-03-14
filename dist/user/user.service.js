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
exports.UserService = void 0;
const bcrypt = require("bcrypt");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const typeorm_2 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const status_enums_1 = require("../lib/enums/status.enums");
const user_enums_1 = require("../lib/enums/user.enums");
const cache_manager_1 = require("@nestjs/cache-manager");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_1 = require("@nestjs/config");
let UserService = class UserService {
    constructor(userRepository, cacheManager, eventEmitter, configService) {
        this.userRepository = userRepository;
        this.cacheManager = cacheManager;
        this.eventEmitter = eventEmitter;
        this.configService = configService;
        this.CACHE_PREFIX = 'users:';
        this.CACHE_TTL = this.configService.get('CACHE_EXPIRATION_TIME') || 30;
    }
    getCacheKey(key) {
        return `${this.CACHE_PREFIX}${key}`;
    }
    async invalidateUserCache(user) {
        try {
            const keys = await this.cacheManager.store.keys();
            const keysToDelete = [];
            keysToDelete.push(this.getCacheKey(user.uid), this.getCacheKey(user.email), this.getCacheKey(user.username), `${this.CACHE_PREFIX}all`, `${this.CACHE_PREFIX}stats`);
            if (user.organisation?.uid) {
                keysToDelete.push(`${this.CACHE_PREFIX}org_${user.organisation.uid}`);
            }
            if (user.branch?.uid) {
                keysToDelete.push(`${this.CACHE_PREFIX}branch_${user.branch.uid}`);
            }
            if (user.accessLevel) {
                keysToDelete.push(`${this.CACHE_PREFIX}access_${user.accessLevel}`);
            }
            if (user.status) {
                keysToDelete.push(`${this.CACHE_PREFIX}status_${user.status}`);
            }
            const userListCaches = keys.filter((key) => key.startsWith(`${this.CACHE_PREFIX}page`) || key.includes('_limit') || key.includes('_filter'));
            keysToDelete.push(...userListCaches);
            await Promise.all(keysToDelete.map((key) => this.cacheManager.del(key)));
            this.eventEmitter.emit('users.cache.invalidate', {
                userId: user.uid,
                keys: keysToDelete,
            });
        }
        catch (error) {
            console.error('Error invalidating user cache:', error);
        }
    }
    excludePassword(user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async create(createUserDto) {
        try {
            if (createUserDto.password) {
                createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
            }
            const user = await this.userRepository.save(createUserDto);
            if (!user) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.invalidateUserCache(user);
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
    async findAll(filters, page = 1, limit = Number(process.env.DEFAULT_PAGE_LIMIT)) {
        try {
            const queryBuilder = this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.branch', 'branch')
                .leftJoinAndSelect('user.organisation', 'organisation')
                .where('user.isDeleted = :isDeleted', { isDeleted: false });
            if (filters?.status) {
                queryBuilder.andWhere('user.status = :status', { status: filters.status });
            }
            if (filters?.accessLevel) {
                queryBuilder.andWhere('user.accessLevel = :accessLevel', { accessLevel: filters.accessLevel });
            }
            if (filters?.branchId) {
                queryBuilder.andWhere('branch.uid = :branchId', { branchId: filters.branchId });
            }
            if (filters?.organisationId) {
                queryBuilder.andWhere('organisation.uid = :organisationId', { organisationId: filters.organisationId });
            }
            if (filters?.search) {
                queryBuilder.andWhere('(user.name ILIKE :search OR user.surname ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search)', { search: `%${filters.search}%` });
            }
            queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .orderBy('user.createdAt', 'DESC');
            const [users, total] = await queryBuilder.getManyAndCount();
            if (!users) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            return {
                data: users.map((user) => this.excludePassword(user)),
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
    async findOne(searchParameter) {
        try {
            const user = await this.userRepository.findOne({
                where: [{ uid: searchParameter, isDeleted: false }],
                select: {
                    uid: true,
                    name: true,
                    surname: true,
                    email: true,
                    username: true,
                    accessLevel: true,
                    organisationRef: true,
                    createdAt: true,
                    updatedAt: true,
                    isDeleted: true,
                    status: true,
                    verificationToken: true,
                    resetToken: true,
                    tokenExpires: true,
                },
                relations: [
                    'userProfile',
                    'userEmployeementProfile',
                    'userAttendances',
                    'userClaims',
                    'userDocs',
                    'leads',
                    'journals',
                    'tasks',
                    'articles',
                    'assets',
                    'trackings',
                    'orders',
                    'notifications',
                    'branch',
                    'clients',
                    'checkIns',
                    'reports',
                    'rewards',
                    'organisation',
                ],
            });
            if (!user) {
                return {
                    user: null,
                    message: process.env.NOT_FOUND_MESSAGE,
                };
            }
            return {
                user,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
                user: null,
            };
        }
    }
    async findOneByEmail(email) {
        try {
            const user = await this.userRepository.findOne({ where: { email } });
            if (!user) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                user: this.excludePassword(user),
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                user: null,
            };
            return response;
        }
    }
    async findOneForAuth(searchParameter) {
        try {
            const user = await this.userRepository.findOne({
                where: [
                    {
                        username: searchParameter,
                        isDeleted: false,
                        status: status_enums_1.AccountStatus.ACTIVE,
                    },
                ],
                relations: ['branch', 'rewards'],
            });
            if (!user) {
                return {
                    user: null,
                    message: process.env.NOT_FOUND_MESSAGE,
                };
            }
            return {
                user,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            const response = {
                message: error?.message,
                user: null,
            };
            return response;
        }
    }
    async findOneByUid(searchParameter) {
        try {
            const user = await this.userRepository.findOne({
                where: [{ uid: searchParameter, isDeleted: false }],
                relations: ['branch', 'rewards'],
            });
            if (!user) {
                return {
                    user: null,
                    message: process.env.NOT_FOUND_MESSAGE,
                };
            }
            return {
                user: this.excludePassword(user),
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            const response = {
                message: error?.message,
                user: null,
            };
            return response;
        }
    }
    async getUsersByRole(recipients) {
        try {
            const users = await this.userRepository.find({
                where: { email: (0, typeorm_1.In)(recipients) },
            });
            if (!users) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            return {
                users: users.map((user) => this.excludePassword(user)),
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            const response = {
                message: error?.message,
                users: null,
            };
            return response;
        }
    }
    async findAdminUsers() {
        try {
            const users = await this.userRepository.find({
                where: {
                    accessLevel: user_enums_1.AccessLevel.ADMIN,
                    isDeleted: false,
                    status: status_enums_1.AccountStatus.ACTIVE
                },
            });
            if (!users || users.length === 0) {
                return {
                    users: null,
                    message: 'No admin users found',
                };
            }
            return {
                users: users.map((user) => this.excludePassword(user)),
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
                users: null,
            };
        }
    }
    async update(ref, updateUserDto) {
        try {
            const user = await this.userRepository.findOne({
                where: { uid: ref, isDeleted: false },
                relations: ['organisation', 'branch'],
            });
            if (!user) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.userRepository.update(ref, updateUserDto);
            await this.invalidateUserCache(user);
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
            const user = await this.userRepository.findOne({
                where: { uid: ref, isDeleted: false },
                relations: ['organisation', 'branch'],
            });
            if (!user) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.userRepository.update({ uid: ref }, {
                isDeleted: true,
                status: status_enums_1.AccountStatus.INACTIVE,
            });
            await this.invalidateUserCache(user);
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
    async createPendingUser(userData) {
        try {
            if (userData?.password) {
                userData.password = await bcrypt.hash(userData.password, 10);
            }
            const user = await this.userRepository.save({
                ...userData,
                status: userData?.status,
            });
            await this.invalidateUserCache(user);
            this.schedulePendingUserCleanup(userData?.email, userData?.tokenExpires);
        }
        catch (error) {
            throw new Error(error?.message);
        }
    }
    schedulePendingUserCleanup(email, expiryDate) {
        const timeUntilExpiry = expiryDate.getTime() - Date.now();
        setTimeout(async () => {
            const user = await this.userRepository.findOne({ where: { email } });
            if (user && user?.status === 'pending') {
                await this.userRepository.update({ email }, { isDeleted: true });
            }
        }, timeUntilExpiry);
    }
    async restore(ref) {
        try {
            const user = await this.userRepository.findOne({
                where: { uid: ref },
                relations: ['organisation', 'branch'],
            });
            if (!user) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.userRepository.update({ uid: ref }, {
                isDeleted: false,
                status: status_enums_1.AccountStatus.ACTIVE,
            });
            await this.invalidateUserCache(user);
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
    async findByVerificationToken(token) {
        try {
            return await this.userRepository.findOne({
                where: { verificationToken: token, isDeleted: false },
            });
        }
        catch (error) {
            return null;
        }
    }
    async findByResetToken(token) {
        try {
            return await this.userRepository.findOne({
                where: { resetToken: token, isDeleted: false },
            });
        }
        catch (error) {
            return null;
        }
    }
    async markEmailAsVerified(uid) {
        const user = await this.userRepository.findOne({
            where: { uid },
            relations: ['organisation', 'branch'],
        });
        if (user) {
            await this.userRepository.update({ uid }, {
                status: status_enums_1.AccountStatus.ACTIVE,
                verificationToken: null,
                tokenExpires: null,
            });
            await this.invalidateUserCache(user);
        }
    }
    async setPassword(uid, hashedPassword) {
        const user = await this.userRepository.findOne({
            where: { uid },
            relations: ['organisation', 'branch'],
        });
        if (user) {
            await this.userRepository.update({ uid }, {
                password: hashedPassword,
                verificationToken: null,
                tokenExpires: null,
                status: status_enums_1.AccountStatus.ACTIVE,
            });
            await this.invalidateUserCache(user);
        }
    }
    async setResetToken(uid, token) {
        const user = await this.userRepository.findOne({
            where: { uid },
            relations: ['organisation', 'branch'],
        });
        if (user) {
            await this.userRepository.update({ uid }, {
                resetToken: token,
                tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
            await this.invalidateUserCache(user);
        }
    }
    async resetPassword(uid, hashedPassword) {
        const user = await this.userRepository.findOne({
            where: { uid },
            relations: ['organisation', 'branch'],
        });
        if (user) {
            await this.userRepository.update({ uid }, {
                password: hashedPassword,
                resetToken: null,
                tokenExpires: null,
            });
            await this.invalidateUserCache(user);
        }
    }
    async updatePassword(uid, hashedPassword) {
        await this.userRepository.update(uid, {
            password: hashedPassword,
            updatedAt: new Date(),
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_1.Repository, Object, event_emitter_1.EventEmitter2,
        config_1.ConfigService])
], UserService);
//# sourceMappingURL=user.service.js.map