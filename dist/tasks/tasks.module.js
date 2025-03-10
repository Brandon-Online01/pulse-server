"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksModule = void 0;
const common_1 = require("@nestjs/common");
const tasks_service_1 = require("./tasks.service");
const tasks_controller_1 = require("./tasks.controller");
const task_entity_1 = require("./entities/task.entity");
const typeorm_1 = require("@nestjs/typeorm");
const subtask_entity_1 = require("./entities/subtask.entity");
const rewards_module_1 = require("../rewards/rewards.module");
const licensing_module_1 = require("../licensing/licensing.module");
const client_entity_1 = require("../clients/entities/client.entity");
const user_entity_1 = require("../user/entities/user.entity");
const config_1 = require("@nestjs/config");
const organisation_entity_1 = require("../organisation/entities/organisation.entity");
const branch_entity_1 = require("../branch/entities/branch.entity");
const communication_module_1 = require("../communication/communication.module");
const notifications_module_1 = require("../notifications/notifications.module");
const task_reminder_service_1 = require("./task-reminder.service");
const task_route_service_1 = require("./task-route.service");
const route_entity_1 = require("./entities/route.entity");
const google_maps_service_1 = require("../lib/services/google-maps.service");
const schedule_1 = require("@nestjs/schedule");
let TasksModule = class TasksModule {
};
exports.TasksModule = TasksModule;
exports.TasksModule = TasksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            licensing_module_1.LicensingModule,
            typeorm_1.TypeOrmModule.forFeature([task_entity_1.Task, subtask_entity_1.SubTask, client_entity_1.Client, user_entity_1.User, organisation_entity_1.Organisation, branch_entity_1.Branch, route_entity_1.Route]),
            rewards_module_1.RewardsModule,
            config_1.ConfigModule,
            communication_module_1.CommunicationModule,
            notifications_module_1.NotificationsModule,
            schedule_1.ScheduleModule.forRoot(),
        ],
        controllers: [tasks_controller_1.TasksController],
        providers: [tasks_service_1.TasksService, task_reminder_service_1.TaskReminderService, task_route_service_1.TaskRouteService, google_maps_service_1.GoogleMapsService],
        exports: [tasks_service_1.TasksService]
    })
], TasksModule);
//# sourceMappingURL=tasks.module.js.map