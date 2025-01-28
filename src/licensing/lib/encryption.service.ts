import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class LicenseEncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly keyLength = 32;
    private readonly ivLength = 16;
    private readonly saltLength = 64;
    private readonly tagLength = 16;
    private readonly iterations = 100000;
    private readonly digest = 'sha512';
    private readonly secretKey: Buffer;

    constructor(private readonly configService: ConfigService) {
        const secret = this.configService.get<string>('LICENSE_ENCRYPTION_KEY');
        if (!secret) {
            throw new Error('LICENSE_ENCRYPTION_KEY is not defined');
        }
        this.secretKey = crypto.scryptSync(
            secret,
            'license-salt',
            this.keyLength
        );
    }

    async encrypt(data: string): Promise<string> {
        const iv = crypto.randomBytes(this.ivLength);
        const salt = crypto.randomBytes(this.saltLength);
        const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);

        const encryptedData = Buffer.concat([
            cipher.update(data, 'utf8'),
            cipher.final(),
        ]);

        const tag = cipher.getAuthTag();

        const result = Buffer.concat([salt, iv, tag, encryptedData]);
        return result.toString('base64');
    }

    async decrypt(encryptedData: string): Promise<string> {
        const data = Buffer.from(encryptedData, 'base64');

        const salt = data.subarray(0, this.saltLength);
        const iv = data.subarray(this.saltLength, this.saltLength + this.ivLength);
        const tag = data.subarray(
            this.saltLength + this.ivLength,
            this.saltLength + this.ivLength + this.tagLength
        );
        const encrypted = data.subarray(this.saltLength + this.ivLength + this.tagLength);

        const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);

        return decrypted.toString('utf8');
    }

    generateSignature(data: string): string {
        return crypto
            .createHmac('sha256', this.secretKey)
            .update(data)
            .digest('hex');
    }

    verifySignature(data: string, signature: string): boolean {
        const computedSignature = this.generateSignature(data);
        return crypto.timingSafeEqual(
            Buffer.from(computedSignature),
            Buffer.from(signature)
        );
    }
} 