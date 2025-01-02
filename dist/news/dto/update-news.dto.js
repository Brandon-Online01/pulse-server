"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNewsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_news_dto_1 = require("./create-news.dto");
class UpdateNewsDto extends (0, swagger_1.PartialType)(create_news_dto_1.CreateNewsDto) {
}
exports.UpdateNewsDto = UpdateNewsDto;
//# sourceMappingURL=update-news.dto.js.map