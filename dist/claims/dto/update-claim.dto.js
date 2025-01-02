"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClaimDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_claim_dto_1 = require("./create-claim.dto");
class UpdateClaimDto extends (0, swagger_1.PartialType)(create_claim_dto_1.CreateClaimDto) {
}
exports.UpdateClaimDto = UpdateClaimDto;
//# sourceMappingURL=update-claim.dto.js.map