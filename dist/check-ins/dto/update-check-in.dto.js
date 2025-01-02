"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCheckInDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_check_in_dto_1 = require("./create-check-in.dto");
class UpdateCheckInDto extends (0, swagger_1.PartialType)(create_check_in_dto_1.CreateCheckInDto) {
}
exports.UpdateCheckInDto = UpdateCheckInDto;
//# sourceMappingURL=update-check-in.dto.js.map