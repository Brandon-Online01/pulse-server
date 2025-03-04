import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDocDto } from './dto/create-doc.dto';
import { UpdateDocDto } from './dto/update-doc.dto';
import { Doc } from './entities/doc.entity';
import { DeepPartial, Repository } from 'typeorm';
import { StorageService } from '../lib/services/storage.service';

@Injectable()
export class DocsService {
	constructor(
		@InjectRepository(Doc)
		private readonly docsRepository: Repository<Doc>,
		private readonly storageService: StorageService,
	) {}

	async uploadFile(file: Express.Multer.File, type?: string, ownerId?: number, branchId?: number) {
		try {
			// Validate file
			if (!file || !file.buffer) {
				throw new Error('Invalid file: No file data provided');
			}

			if (file.size <= 0) {
				throw new Error('Invalid file: File is empty');
			}

			// Validate file type if specified
			if (type && !this.isValidFileType(file.mimetype, type)) {
				throw new Error(`Invalid file type: ${file.mimetype} for specified type: ${type}`);
			}

			try {
				const result = await this.storageService.upload(
					{
						buffer: file.buffer,
						mimetype: file.mimetype,
						originalname: file.originalname,
						size: file.size,
						metadata: {
							type,
							uploadedBy: ownerId?.toString(),
							branch: branchId?.toString(),
						},
					},
					undefined,
					ownerId,
					branchId,
				);

				return {
					message: 'File uploaded successfully',
					...result,
				};
			} catch (storageError) {
				console.error('Storage service error:', storageError);
				throw new Error(`Storage service error: ${storageError.message}`);
			}
		} catch (error) {
			console.error('File upload failed:', error);
			throw new Error(`File upload failed: ${error.message}`);
		}
	}

	private isValidFileType(mimetype: string, type: string): boolean {
		const typeMap: Record<string, string[]> = {
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

	async getDownloadUrl(docId: number) {
		const doc = await this.docsRepository.findOne({
			where: { uid: docId },
		});

		if (!doc) {
			throw new NotFoundException('Document not found');
		}

		// Extract filename from URL
		const fileName = doc.url.split('/').pop();
		if (!fileName) {
			throw new NotFoundException('Invalid document URL');
		}

		const signedUrl = await this.storageService.getSignedUrl(fileName);

		return {
			message: 'Download URL generated successfully',
			url: signedUrl,
			fileName: doc.title,
			mimeType: doc.mimeType,
		};
	}

	async create(createDocDto: CreateDocDto) {
		try {
			const doc = await this.docsRepository.save(createDocDto as unknown as DeepPartial<Doc>);

			if (!doc) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error.message,
			};
		}
	}

	async findAll(): Promise<{ docs: Doc[] | null; message: string }> {
		try {
			const docs = await this.docsRepository.find();

			if (!docs) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				docs: docs,
			};

			return response;
		} catch (error) {
			const response = {
				message: process.env.NOT_FOUND_MESSAGE,
				docs: null,
			};

			return response;
		}
	}

	async findOne(ref: number): Promise<{ doc: Doc | null; message: string }> {
		try {
			const doc = await this.docsRepository.findOne({
				where: { uid: ref },
				relations: ['owner', 'branch'],
			});

			if (!doc) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				doc: doc,
			};

			return response;
		} catch (error) {
			const response = {
				message: process.env.NOT_FOUND_MESSAGE,
				doc: null,
			};

			return response;
		}
	}

	public async docsByUser(ref: number): Promise<{ message: string; docs: Doc[] }> {
		try {
			const docs = await this.docsRepository.find({
				where: { owner: { uid: ref } },
			});

			if (!docs) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				docs,
			};

			return response;
		} catch (error) {
			const response = {
				message: `could not get documents by user - ${error?.message}`,
				docs: null,
			};

			return response;
		}
	}

	async update(ref: number, updateDocDto: UpdateDocDto): Promise<{ message: string }> {
		try {
			const doc = await this.docsRepository.update(ref, updateDocDto as unknown as DeepPartial<Doc>);

			if (!doc) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			};

			return response;
		}
	}

	async deleteFromBucket(ref: number): Promise<{ message: string }> {
		try {
			const doc = await this.docsRepository.findOne({
				where: { uid: ref },
			});

			if (!doc) {
				throw new NotFoundException('Document not found');
			}

			// Delete from storage first
			await this.storageService.delete(ref);

			// Then delete from database
			await this.docsRepository.delete(ref);

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}
}
