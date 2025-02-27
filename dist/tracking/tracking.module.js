"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingModule = void 0;
const common_1 = require("@nestjs/common");
const tracking_service_1 = require("./tracking.service");
const tracking_controller_1 = require("./tracking.controller");
const typeorm_1 = require("@nestjs/typeorm");
const tracking_entity_1 = require("./entities/tracking.entity");
const licensing_module_1 = require("../licensing/licensing.module");
const geofence_entity_1 = require("./entities/geofence.entity");
const geofence_event_entity_1 = require("./entities/geofence-event.entity");
const geofence_service_1 = require("./geofence.service");
const geofence_controller_1 = require("./geofence.controller");
const organisation_module_1 = require("../organisation/organisation.module");
const organisation_entity_1 = require("../organisation/entities/organisation.entity");
const user_entity_1 = require("../user/entities/user.entity");
const jwt_1 = require("@nestjs/jwt");
let TrackingModule = class TrackingModule {
};
exports.TrackingModule = TrackingModule;
exports.TrackingModule = TrackingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            licensing_module_1.LicensingModule,
            organisation_module_1.OrganisationModule,
            typeorm_1.TypeOrmModule.forFeature([tracking_entity_1.Tracking, geofence_entity_1.Geofence, geofence_event_entity_1.GeofenceEvent, organisation_entity_1.Organisation, user_entity_1.User]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '8h' },
            }),
        ],
        controllers: [tracking_controller_1.TrackingController, geofence_controller_1.GeofenceController],
        providers: [tracking_service_1.TrackingService, geofence_service_1.GeofenceService],
        exports: [tracking_service_1.TrackingService, geofence_service_1.GeofenceService],
    })
], TrackingModule);
//# sourceMappingURL=tracking.module.js.map