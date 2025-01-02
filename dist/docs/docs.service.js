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
exports.DocsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const doc_entity_1 = require("./entities/doc.entity");
const typeorm_2 = require("typeorm");
const path_1 = require("path");
const storage_1 = require("@google-cloud/storage");
const storage_config_1 = require("../config/storage.config");
let DocsService = class DocsService {
    constructor(docsRepository) {
        this.docsRepository = docsRepository;
        this.bucketName = `${process.env.BUCKET_NAME}`;
    }
    async create(createDocDto) {
        try {
            const doc = await this.docsRepository.save(createDocDto);
            if (!doc) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error.message,
            };
            return response;
        }
    }
    async findAll() {
        try {
            const docs = await this.docsRepository.find();
            if (!docs) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                docs: docs
            };
            return response;
        }
        catch (error) {
            const response = {
                message: process.env.NOT_FOUND_MESSAGE,
                docs: null
            };
            return response;
        }
    }
    async findOne(ref) {
        try {
            const doc = await this.docsRepository.findOne({
                where: { uid: ref },
                relations: ['owner', 'branch']
            });
            if (!doc) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                doc: doc
            };
            return response;
        }
        catch (error) {
            const response = {
                message: process.env.NOT_FOUND_MESSAGE,
                doc: null
            };
            return response;
        }
    }
    async docsByUser(ref) {
        try {
            const docs = await this.docsRepository.find({
                where: { owner: { uid: ref } }
            });
            if (!docs) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                docs
            };
            return response;
        }
        catch (error) {
            const response = {
                message: `could not get documents by user - ${error?.message}`,
                docs: null
            };
            return response;
        }
    }
    async update(ref, updateDocDto) {
        try {
            const doc = await this.docsRepository.update(ref, updateDocDto);
            if (!doc) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
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
    async remove(ref) {
        try {
            await this.docsRepository.delete(ref);
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
    async uploadToBucket(fileData, fileName) {
        try {
            const autoGeneratedFileName = fileName
                ? fileName
                : `${Math.random().toString(36).substring(2, 10)}${Math.round(Math.random() * 1e9)}${(0, path_1.extname)(fileData?.originalname)?.replace(' ', '')}`;
            const payLoadWithFileName = {
                ...fileData,
                filename: autoGeneratedFileName,
            };
            const storage = new storage_1.Storage({
                projectId: `${process.env.PROJECT_ID}`,
                credentials: storage_config_1.storageConfig,
            });
            const bucket = storage.bucket(this.bucketName);
            const file = bucket.file(payLoadWithFileName?.filename);
            const transportOptions = {
                resumable: false,
                metadata: {
                    contentType: fileData.mimetype,
                },
            };
            const stream = file.createWriteStream(transportOptions);
            await new Promise((resolve, reject) => {
                stream.on('error', (error) => {
                    reject(error);
                });
                stream.on('finish', () => {
                    resolve();
                });
                stream.end(payLoadWithFileName?.buffer);
            });
            const response = {
                newFileName: payLoadWithFileName?.filename,
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                newFileName: null,
                message: error.message,
            };
            return response;
        }
    }
    async deleteFromBucket(fileName) {
        try {
            const storage = new storage_1.Storage({
                projectId: `${process.env.PROJECT_ID}`,
                credentials: storage_config_1.storageConfig,
            });
            const bucket = storage.bucket(this.bucketName);
            const file = bucket.file(fileName);
            const exists = await file.exists();
            if (exists?.[0]) {
                await file.delete();
                const response = {
                    message: process.env.SUCCESS_MESSAGE,
                };
                return response;
            }
            else {
                const response = {
                    message: process.env.NOT_FOUND_MESSAGE,
                };
                return response;
            }
        }
        catch (error) {
            const response = {
                message: error.message,
            };
            return response;
        }
    }
};
exports.DocsService = DocsService;
exports.DocsService = DocsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(doc_entity_1.Doc)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DocsService);
//# sourceMappingURL=docs.service.js.map