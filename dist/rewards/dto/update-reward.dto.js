"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRewardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_reward_dto_1 = require("./create-reward.dto");
class UpdateRewardDto extends (0, swagger_1.PartialType)(create_reward_dto_1.CreateRewardDto) {
}
exports.UpdateRewardDto = UpdateRewardDto;
//# sourceMappingURL=update-reward.dto.js.map