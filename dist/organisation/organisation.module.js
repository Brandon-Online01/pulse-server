"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganisationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const organisation_controller_1 = require("./organisation.controller");
const organisation_service_1 = require("./organisation.service");
const organisation_entity_1 = require("./entities/organisation.entity");
const organisation_settings_entity_1 = require("./entities/organisation-settings.entity");
const organisation_appearance_entity_1 = require("./entities/organisation-appearance.entity");
const organisation_hours_entity_1 = require("./entities/organisation-hours.entity");
const organisation_settings_controller_1 = require("./controllers/organisation-settings.controller");
const organisation_hours_controller_1 = require("./controllers/organisation-hours.controller");
const organisation_settings_service_1 = require("./services/organisation-settings.service");
const organisation_appearance_service_1 = require("./services/organisation-appearance.service");
const organisation_hours_service_1 = require("./services/organisation-hours.service");
const organisation_appearance_controller_1 = require("./controllers/organisation-appearance.controller");
const licensing_module_1 = require("../licensing/licensing.module");
let OrganisationModule = class OrganisationModule {
};
exports.OrganisationModule = OrganisationModule;
exports.OrganisationModule = OrganisationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            licensing_module_1.LicensingModule,
            typeorm_1.TypeOrmModule.forFeature([
                organisation_entity_1.Organisation,
                organisation_settings_entity_1.OrganisationSettings,
                organisation_appearance_entity_1.OrganisationAppearance,
                organisation_hours_entity_1.OrganisationHours,
            ]),
        ],
        controllers: [
            organisation_controller_1.OrganisationController,
            organisation_settings_controller_1.OrganisationSettingsController,
            organisation_appearance_controller_1.OrganisationAppearanceController,
            organisation_hours_controller_1.OrganisationHoursController,
        ],
        providers: [
            organisation_service_1.OrganisationService,
            organisation_settings_service_1.OrganisationSettingsService,
            organisation_appearance_service_1.OrganisationAppearanceService,
            organisation_hours_service_1.OrganisationHoursService,
        ],
        exports: [organisation_service_1.OrganisationService],
    })
], OrganisationModule);
//# sourceMappingURL=organisation.module.js.map