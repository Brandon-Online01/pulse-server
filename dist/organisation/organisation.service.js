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
exports.OrganisationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organisation_entity_1 = require("./entities/organisation.entity");
const status_enums_1 = require("../lib/enums/status.enums");
let OrganisationService = class OrganisationService {
    constructor(organisationRepository) {
        this.organisationRepository = organisationRepository;
    }
    async create(createOrganisationDto) {
        try {
            const organisation = await this.organisationRepository.save(createOrganisationDto);
            if (!organisation) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
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
            const organisations = await this.organisationRepository.find({
                where: { isDeleted: false },
                relations: ['branches']
            });
            if (!organisations) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            return {
                organisations,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                organisations: null,
                message: error?.message,
            };
        }
    }
    async findOne(ref) {
        try {
            const organisation = await this.organisationRepository.findOne({
                where: { ref, isDeleted: false },
                relations: ['branches']
            });
            if (!organisation) {
                return {
                    organisation: null,
                    message: process.env.NOT_FOUND_MESSAGE,
                };
            }
            return {
                organisation,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                organisation: null,
                message: error?.message,
            };
        }
    }
    async update(ref, updateOrganisationDto) {
        try {
            await this.organisationRepository.update({ ref }, updateOrganisationDto);
            const updatedOrganisation = await this.organisationRepository.findOne({
                where: { ref, isDeleted: false }
            });
            if (!updatedOrganisation) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
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
            const organisation = await this.organisationRepository.findOne({
                where: { ref, isDeleted: false }
            });
            if (!organisation) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            await this.organisationRepository.update({ ref }, { isDeleted: true });
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
    async restore(ref) {
        try {
            await this.organisationRepository.update({ ref }, {
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
exports.OrganisationService = OrganisationService;
exports.OrganisationService = OrganisationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organisation_entity_1.Organisation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OrganisationService);
//# sourceMappingURL=organisation.service.js.map