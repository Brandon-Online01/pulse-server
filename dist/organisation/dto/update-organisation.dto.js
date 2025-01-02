"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrganisationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_organisation_dto_1 = require("./create-organisation.dto");
class UpdateOrganisationDto extends (0, swagger_1.PartialType)(create_organisation_dto_1.CreateOrganisationDto) {
}
exports.UpdateOrganisationDto = UpdateOrganisationDto;
//# sourceMappingURL=update-organisation.dto.js.map