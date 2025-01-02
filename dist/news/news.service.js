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
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const news_entity_1 = require("./entities/news.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const status_enums_1 = require("../lib/enums/status.enums");
let NewsService = class NewsService {
    constructor(newsRepository, eventEmitter) {
        this.newsRepository = newsRepository;
        this.eventEmitter = eventEmitter;
    }
    async create(createNewsDto) {
        try {
            const news = await this.newsRepository.save(createNewsDto);
            if (!news)
                throw new Error(process.env.NOT_FOUND_MESSAGE);
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                data: news
            };
            this.eventEmitter.emit('add.xp', { owner: news?.author?.uid, pointsToAdd: 50 });
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message
            };
            return response;
        }
    }
    async findAll() {
        try {
            const news = await this.newsRepository.find({ where: { isDeleted: false } });
            if (!news)
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                data: news
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                data: null
            };
            return response;
        }
    }
    async findOne(ref) {
        try {
            const news = await this.newsRepository.findOne({ where: { uid: ref, isDeleted: false }, relations: ['author', 'branch'] });
            if (!news)
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                data: news
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                data: null
            };
            return response;
        }
    }
    async update(ref, updateNewsDto) {
        try {
            const news = await this.newsRepository.update(ref, updateNewsDto);
            if (!news)
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            const response = {
                message: process.env.SUCCESS_MESSAGE
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message
            };
            return response;
        }
    }
    async remove(ref) {
        try {
            const news = await this.newsRepository.update(ref, { isDeleted: true });
            if (!news)
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            const response = {
                message: process.env.SUCCESS_MESSAGE
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message
            };
            return response;
        }
    }
    async restore(ref) {
        try {
            await this.newsRepository.update({ uid: ref }, {
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
exports.NewsService = NewsService;
exports.NewsService = NewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(news_entity_1.News)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        event_emitter_1.EventEmitter2])
], NewsService);
//# sourceMappingURL=news.service.js.map