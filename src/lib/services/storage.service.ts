import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
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

	constructor(
		private readonly configService: ConfigService,
		@InjectRepository(Doc)
		private readonly docsRepository: Repository<Doc>,
	) {}

	private generateFileName(file: StorageFile): string {
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

			const [exists] = await bucket.exists();
			if (!exists) {
				throw new Error(`Bucket ${this.bucket} does not exist`);
			}

			const blob = bucket.file(fileName);

			await blob.save(file.buffer, {
				resumable: false,
				metadata: {
					contentType: file.mimetype,
					metadata: file.metadata,
				},
			});

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
			throw new Error(`File upload failed: ${error.message}`);
		}
	}

	async delete(docId: number): Promise<void> {
		try {
			const doc = await this.docsRepository.findOne({ where: { uid: docId } });
			if (!doc) {
				throw new Error('Document not found');
			}

			const bucket = this.storage.bucket(this.bucket);
			
			const fileName = doc.url.split('/').pop();
			if (fileName) {
				const file = bucket.file(fileName);
				const exists = await file.exists();
				if (exists[0]) {
					await file.delete();
				}
			}

			await this.docsRepository.delete(docId);
		} catch (error) {
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
			throw error;
		}
	}

	async updateDoc(docId: number, updates: Partial<Doc>): Promise<void> {
		try {
			await this.docsRepository.update(docId, updates);
		} catch (error) {
			throw error;
		}
	}
}
