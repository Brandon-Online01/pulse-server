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
const storage_service_1 = require("../lib/services/storage.service");
let DocsService = class DocsService {
    constructor(docsRepository, storageService) {
        this.docsRepository = docsRepository;
        this.storageService = storageService;
    }
    async uploadFile(file, type, ownerId, branchId) {
        try {
            if (!file || !file.buffer) {
                throw new Error('Invalid file: No file data provided');
            }
            if (file.size <= 0) {
                throw new Error('Invalid file: File is empty');
            }
            if (type && !this.isValidFileType(file.mimetype, type)) {
                throw new Error(`Invalid file type: ${file.mimetype} for specified type: ${type}`);
            }
            try {
                const result = await this.storageService.upload({
                    buffer: file.buffer,
                    mimetype: file.mimetype,
                    originalname: file.originalname,
                    size: file.size,
                    metadata: {
                        type,
                        uploadedBy: ownerId?.toString(),
                        branch: branchId?.toString(),
                    },
                }, undefined, ownerId, branchId);
                return {
                    message: 'File uploaded successfully',
                    ...result,
                };
            }
            catch (storageError) {
                console.error('Storage service error:', storageError);
                throw new Error(`Storage service error: ${storageError.message}`);
            }
        }
        catch (error) {
            console.error('File upload failed:', error);
            throw new Error(`File upload failed: ${error.message}`);
        }
    }
    isValidFileType(mimetype, type) {
        const typeMap = {
            image: ['image/jpeg', 'image/png', 'image/gif'],
            document: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            spreadsheet: [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],
            text: ['text/plain'],
        };
        return !typeMap[type] || typeMap[type].includes(mimetype);
    }
    async getDownloadUrl(docId) {
        const doc = await this.docsRepository.findOne({
            where: { uid: docId },
        });
        if (!doc) {
            throw new common_1.NotFoundException('Document not found');
        }
        const fileName = doc.url.split('/').pop();
        if (!fileName) {
            throw new common_1.NotFoundException('Invalid document URL');
        }
        const signedUrl = await this.storageService.getSignedUrl(fileName);
        return {
            message: 'Download URL generated successfully',
            url: signedUrl,
            fileName: doc.title,
            mimeType: doc.mimeType,
        };
    }
    async create(createDocDto) {
        try {
            const doc = await this.docsRepository.save(createDocDto);
            if (!doc) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error.message,
            };
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
                docs: docs,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: process.env.NOT_FOUND_MESSAGE,
                docs: null,
            };
            return response;
        }
    }
    async findOne(ref) {
        try {
            const doc = await this.docsRepository.findOne({
                where: { uid: ref },
                relations: ['owner', 'branch'],
            });
            if (!doc) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                doc: doc,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: process.env.NOT_FOUND_MESSAGE,
                doc: null,
            };
            return response;
        }
    }
    async docsByUser(ref) {
        try {
            const docs = await this.docsRepository.find({
                where: { owner: { uid: ref } },
            });
            if (!docs) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                docs,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: `could not get documents by user - ${error?.message}`,
                docs: null,
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
    async deleteFromBucket(ref) {
        try {
            const doc = await this.docsRepository.findOne({
                where: { uid: ref },
            });
            if (!doc) {
                throw new common_1.NotFoundException('Document not found');
            }
            await this.storageService.delete(ref);
            await this.docsRepository.delete(ref);
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
};
exports.DocsService = DocsService;
exports.DocsService = DocsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(doc_entity_1.Doc)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        storage_service_1.StorageService])
], DocsService);
//# sourceMappingURL=docs.service.js.map