import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

interface FingerprintComponents {
    userAgent?: string;
    acceptLanguage?: string;
    secChUa?: string;
    secChUaPlatform?: string;
    secChUaMobile?: string;
    ip?: string;
    forwardedFor?: string;
    screenResolution?: string;
    colorDepth?: string;
    timezoneOffset?: string;
    platform?: string;
    plugins?: string;
    canvasFingerprint?: string;
    webglFingerprint?: string;
    audioFingerprint?: string;
    fonts?: string;
    cpuCores?: string;
    memory?: string;
    diskSpace?: string;
    networkInterfaces?: string;
}

@Injectable()
export class HardwareFingerprintService {
    generateFingerprint(req: Request): string {
        const components: FingerprintComponents = {
            userAgent: String(req.headers['user-agent'] || ''),
            acceptLanguage: String(req.headers['accept-language'] || ''),
            secChUa: String(req.headers['sec-ch-ua'] || ''),
            secChUaPlatform: String(req.headers['sec-ch-ua-platform'] || ''),
            secChUaMobile: String(req.headers['sec-ch-ua-mobile'] || ''),
            ip: req.ip || '',
            forwardedFor: String(req.headers['x-forwarded-for'] || ''),
            screenResolution: String(req.headers['screen-resolution'] || ''),
            colorDepth: String(req.headers['color-depth'] || ''),
            timezoneOffset: String(req.headers['timezone-offset'] || ''),
            platform: String(req.headers['platform'] || ''),
            plugins: String(req.headers['plugins'] || ''),
            canvasFingerprint: String(req.headers['canvas-fingerprint'] || ''),
            webglFingerprint: String(req.headers['webgl-fingerprint'] || ''),
            audioFingerprint: String(req.headers['audio-fingerprint'] || ''),
            fonts: String(req.headers['fonts'] || ''),
            cpuCores: String(req.headers['cpu-cores'] || ''),
            memory: String(req.headers['memory'] || ''),
            diskSpace: String(req.headers['disk-space'] || ''),
            networkInterfaces: String(req.headers['network-interfaces'] || ''),
        };

        return this.hashComponents(Object.values(components).filter(Boolean));
    }

    private hashComponents(components: string[]): string {
        const concatenated = components.join('|');
        return crypto
            .createHash('sha256')
            .update(concatenated)
            .digest('hex');
    }

    async validateFingerprint(
        storedFingerprint: string,
        currentFingerprint: string,
        tolerance: number = 0.9
    ): Promise<boolean> {
        if (!storedFingerprint || !currentFingerprint) {
            return false;
        }

        const similarity = this.calculateSimilarity(
            storedFingerprint,
            currentFingerprint
        );
        return similarity >= tolerance;
    }

    private calculateSimilarity(str1: string, str2: string): number {
        const len = Math.min(str1.length, str2.length);
        let matches = 0;

        for (let i = 0; i < len; i++) {
            if (str1[i] === str2[i]) {
                matches++;
            }
        }

        return matches / len;
    }
} 