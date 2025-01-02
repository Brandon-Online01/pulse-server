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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsSubscriber = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const rewards_service_1 = require("./rewards.service");
const constants_1 = require("../lib/constants/constants");
let RewardsSubscriber = class RewardsSubscriber {
    constructor(rewardsService) {
        this.rewardsService = rewardsService;
    }
    handleTaskCreated(payload) {
        this.rewardsService.awardXP({
            owner: payload.userId,
            action: 'CREATE_TASK',
            amount: constants_1.XP_VALUES.CREATE_TASK,
            source: {
                id: payload.taskId,
                type: 'task'
            }
        });
    }
    handleTaskCompleted(payload) {
        this.rewardsService.awardXP({
            owner: payload.userId,
            action: payload.completedEarly ? 'COMPLETE_TASK_EARLY' : 'COMPLETE_TASK',
            amount: payload.completedEarly ? constants_1.XP_VALUES.COMPLETE_TASK_EARLY : constants_1.XP_VALUES.COMPLETE_TASK,
            source: {
                id: payload.taskId,
                type: 'task',
                details: { completedEarly: payload.completedEarly }
            }
        });
    }
    handleLeadCreated(payload) {
        this.rewardsService.awardXP({
            owner: payload.userId,
            action: 'CREATE_LEAD',
            amount: constants_1.XP_VALUES.CREATE_LEAD,
            source: {
                id: payload.leadId,
                type: 'lead'
            }
        });
    }
};
exports.RewardsSubscriber = RewardsSubscriber;
__decorate([
    (0, event_emitter_1.OnEvent)('task.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RewardsSubscriber.prototype, "handleTaskCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('task.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RewardsSubscriber.prototype, "handleTaskCompleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)('lead.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RewardsSubscriber.prototype, "handleLeadCreated", null);
exports.RewardsSubscriber = RewardsSubscriber = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rewards_service_1.RewardsService])
], RewardsSubscriber);
//# sourceMappingURL=rewards.subscriber.js.map