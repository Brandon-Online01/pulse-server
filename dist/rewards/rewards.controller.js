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
exports.RewardsController = void 0;
const common_1 = require("@nestjs/common");
const rewards_service_1 = require("./rewards.service");
const create_reward_dto_1 = require("./dto/create-reward.dto");
const auth_guard_1 = require("../guards/auth.guard");
const role_guard_1 = require("../guards/role.guard");
const role_decorator_1 = require("../decorators/role.decorator");
const user_enums_1 = require("../lib/enums/user.enums");
const swagger_1 = require("@nestjs/swagger");
const enterprise_only_decorator_1 = require("../decorators/enterprise-only.decorator");
let RewardsController = class RewardsController {
    constructor(rewardsService) {
        this.rewardsService = rewardsService;
    }
    awardXP(createRewardDto) {
        return this.rewardsService.awardXP(createRewardDto);
    }
    getUserRewards(reference) {
        return this.rewardsService.getUserRewards(reference);
    }
    getLeaderboard() {
        return this.rewardsService.getLeaderboard();
    }
};
exports.RewardsController = RewardsController;
__decorate([
    (0, common_1.Post)('award-xp'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER),
    (0, swagger_1.ApiOperation)({
        summary: 'Award XP to a user',
        description: 'Awards experience points to a specific user. Requires ADMIN or MANAGER role.'
    }),
    (0, swagger_1.ApiBody)({ type: create_reward_dto_1.CreateRewardDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'XP awarded successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number', example: 1 },
                        xp: { type: 'number', example: 100 },
                        reason: { type: 'string', example: 'Completed project ahead of schedule' },
                        createdAt: { type: 'string', format: 'date-time' },
                        user: {
                            type: 'object',
                            properties: {
                                uid: { type: 'number', example: 1 },
                                name: { type: 'string', example: 'John Doe' }
                            }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data provided' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reward_dto_1.CreateRewardDto]),
    __metadata("design:returntype", void 0)
], RewardsController.prototype, "awardXP", null);
__decorate([
    (0, common_1.Get)('user-stats/:reference'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user rewards',
        description: 'Retrieves all rewards and statistics for a specific user. Accessible by ADMIN, MANAGER, and the user themselves.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'reference',
        description: 'User reference code',
        type: 'number',
        example: 1
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User rewards retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        totalXP: { type: 'number', example: 1250 },
                        level: { type: 'number', example: 5 },
                        nextLevelXP: { type: 'number', example: 2000 },
                        rewards: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    uid: { type: 'number', example: 1 },
                                    xp: { type: 'number', example: 100 },
                                    reason: { type: 'string', example: 'Completed project ahead of schedule' },
                                    createdAt: { type: 'string', format: 'date-time' }
                                }
                            }
                        },
                        badges: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    uid: { type: 'number', example: 1 },
                                    name: { type: 'string', example: 'Early Bird' },
                                    description: { type: 'string', example: 'Completed 10 tasks before deadline' },
                                    icon: { type: 'string', example: 'https://example.com/badges/early-bird.png' }
                                }
                            }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    __param(0, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RewardsController.prototype, "getUserRewards", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    (0, role_decorator_1.Roles)(user_enums_1.AccessLevel.ADMIN, user_enums_1.AccessLevel.MANAGER, user_enums_1.AccessLevel.USER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get rewards leaderboard',
        description: 'Retrieves the leaderboard showing users ranked by their XP. Accessible by ADMIN, MANAGER, and USER roles.'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Leaderboard retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            rank: { type: 'number', example: 1 },
                            user: {
                                type: 'object',
                                properties: {
                                    uid: { type: 'number', example: 1 },
                                    name: { type: 'string', example: 'John Doe' },
                                    avatar: { type: 'string', example: 'https://example.com/avatars/john.jpg' }
                                }
                            },
                            totalXP: { type: 'number', example: 3500 },
                            level: { type: 'number', example: 7 },
                            badges: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        uid: { type: 'number', example: 1 },
                                        name: { type: 'string', example: 'Early Bird' },
                                        icon: { type: 'string', example: 'https://example.com/badges/early-bird.png' }
                                    }
                                }
                            }
                        }
                    }
                },
                message: { type: 'string', example: 'Success' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RewardsController.prototype, "getLeaderboard", null);
exports.RewardsController = RewardsController = __decorate([
    (0, swagger_1.ApiTags)('rewards'),
    (0, common_1.Controller)('rewards'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, role_guard_1.RoleGuard),
    (0, enterprise_only_decorator_1.EnterpriseOnly)('rewards'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized access due to invalid credentials or missing token' }),
    __metadata("design:paramtypes", [rewards_service_1.RewardsService])
], RewardsController);
//# sourceMappingURL=rewards.controller.js.map