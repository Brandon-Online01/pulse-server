import { Injectable, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { getStorageConfig } from '../../config/storage.config';
import { extname } from 'path';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doc } from '../../docs/entities/doc.entity';

export interface StorageFile {
	buffer: Buffer;
	mimetype: string;
	originalname: string;
	size: number;
	metadata?: Record<string, string>;
}

export interface UploadResult {
	fileName: string;
	publicUrl: string;
	metadata: Record<string, any>;
	docId?: number;
}

@Injectable()
export class StorageService {
	private storage: Storage;
	private bucket: string;
	private readonly logger = new Logger(StorageService.name);

	constructor(
		private readonly configService: ConfigService,
		@InjectRepository(Doc)
		private readonly docsRepository: Repository<Doc>,
	) {
		const projectId = 'storage-buckets-451516'; // Hardcode the correct project ID
		const bucketName = 'loro'; // Hardcode the correct bucket name

		this.logger.log(`Initializing Storage Service with project: ${projectId} and bucket: ${bucketName}`);

		this.storage = new Storage({
			projectId,
			credentials: getStorageConfig(configService),
		});
		this.bucket = bucketName;

		// Initialize bucket
		this.initializeBucket().catch((err) => {
			this.logger.error(`Failed to initialize bucket: ${err.message}`);
		});
	}

	private async initializeBucket(): Promise<void> {
		try {
			const [exists] = await this.storage.bucket(this.bucket).exists();

			console.log('exists', exists, this.bucket);

			if (!exists) {
				this.logger.warn(`Bucket ${this.bucket} does not exist, creating...`);
			}

			this.logger.log(`Bucket ${this.bucket} initialized successfully`);
		} catch (error) {
			this.logger.error(`Bucket initialization failed: ${error.message}`);
			throw error;
		}
	}

	private generateFileName(file: StorageFile): string {
		// Create a unique filename with original extension
		const fileHash = crypto
			.createHash('md5')
			.update(Date.now().toString() + file.originalname)
			.digest('hex');
		const ext = extname(file.originalname);
		return `${fileHash}${ext}`;
	}

	private async createDocRecord(
		originalName: string,
		publicUrl: string,
		metadata: Record<string, any>,
		mimeType: string,
		fileSize: number,
		ownerId?: number,
		branchId?: number,
	): Promise<Doc> {
		const doc = this.docsRepository.create({
			title: originalName,
			content: '',
			fileType: mimeType.split('/')[0],
			fileSize,
			url: publicUrl,
			mimeType,
			extension: extname(originalName),
			metadata,
			isActive: true,
			isPublic: false,
			owner: ownerId ? ({ uid: ownerId } as any) : null,
			branch: branchId ? ({ uid: branchId } as any) : null,
		});

		return await this.docsRepository.save(doc);
	}

	async upload(
		file: StorageFile,
		customFileName?: string,
		ownerId?: number,
		branchId?: number,
	): Promise<UploadResult> {
		try {
			const fileName = customFileName || this.generateFileName(file);
			const bucket = this.storage.bucket(this.bucket);

			// Check bucket exists
			const [exists] = await bucket.exists();
			if (!exists) {
				throw new Error(`Bucket ${this.bucket} does not exist`);
			}

			const blob = bucket.file(fileName);

			// Upload with resumable=false for small files
			await blob.save(file.buffer, {
				resumable: false,
				metadata: {
					contentType: file.mimetype,
					metadata: file.metadata,
				},
			});

			// Make the file public
			await blob.makePublic();
			const publicUrl = blob.publicUrl();
			const [fileMetadata] = await blob.getMetadata();

			const doc = await this.createDocRecord(
				file.originalname,
				publicUrl,
				fileMetadata,
				file.mimetype,
				file.size,
				ownerId,
				branchId,
			);

			return {
				fileName,
				publicUrl,
				metadata: fileMetadata,
				docId: doc.uid,
			};
		} catch (error) {
			this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
			throw new Error(`File upload failed: ${error.message}`);
		}
	}

	async delete(docId: number): Promise<void> {
		try {
			// Find the doc first
			const doc = await this.docsRepository.findOne({ where: { uid: docId } });
			if (!doc) {
				throw new Error('Document not found');
			}

			// Delete from storage
			const bucket = this.storage.bucket(this.bucket);
			const fileName = doc.url.split('/').pop(); // Extract filename from URL
			if (fileName) {
				const file = bucket.file(fileName);
				const exists = await file.exists();
				if (exists[0]) {
					await file.delete();
				}
			}

			// Delete doc record
			await this.docsRepository.delete(docId);
		} catch (error) {
			this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
			throw error;
		}
	}

	async getSignedUrl(fileName: string, expiresIn = 3600): Promise<string> {
		try {
			const bucket = this.storage.bucket(this.bucket);
			const file = bucket.file(fileName);
			const [url] = await file.getSignedUrl({
				version: 'v4',
				action: 'read',
				expires: Date.now() + expiresIn * 1000,
			});
			return url;
		} catch (error) {
			this.logger.error(`Failed to get signed URL: ${error.message}`, error.stack);
			throw error;
		}
	}

	async getMetadata(fileName: string): Promise<any> {
		try {
			const bucket = this.storage.bucket(this.bucket);
			const file = bucket.file(fileName);
			const [metadata] = await file.getMetadata();
			return metadata;
		} catch (error) {
			this.logger.error(`Failed to get metadata: ${error.message}`, error.stack);
			throw error;
		}
	}

	async updateDoc(docId: number, updates: Partial<Doc>): Promise<void> {
		try {
			await this.docsRepository.update(docId, updates);
		} catch (error) {
			this.logger.error(`Failed to update doc: ${error.message}`, error.stack);
			throw error;
		}
	}
}
