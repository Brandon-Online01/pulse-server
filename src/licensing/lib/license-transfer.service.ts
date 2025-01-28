import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License } from '../entities/license.entity';
import { LicenseAuditService, AuditAction } from './audit.service';
import { User } from '../../user/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailType } from '../../lib/enums/email.enums';
import { LicenseStatus } from '../../lib/enums/license.enums';

export interface TransferResult {
    success: boolean;
    message: string;
    license?: License;
    error?: string;
}

@Injectable()
export class LicenseTransferService {
    private readonly logger = new Logger(LicenseTransferService.name);

    constructor(
        @InjectRepository(License)
        private readonly licenseRepository: Repository<License>,
        private readonly auditService: LicenseAuditService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async transferLicense(
        licenseId: number,
        newOrganizationId: number,
        user: User,
        reason: string
    ): Promise<TransferResult> {
        try {
            const license = await this.licenseRepository.findOne({
                where: { uid: licenseId },
                relations: ['organisation'],
            });

            if (!license) {
                throw new BadRequestException('License not found');
            }

            if (Number(license.organisationRef) === newOrganizationId) {
                throw new BadRequestException(
                    'License already belongs to this organization'
                );
            }

            // Store old organization details for notification
            const oldOrganization = license.organisation;

            // Update license with new organization
            license.organisationRef = newOrganizationId;
            const updatedLicense = await this.licenseRepository.save(license);

            // Create audit log
            await this.auditService.log(AuditAction.TRANSFER, license, user, {
                oldOrganizationId: oldOrganization.uid,
                newOrganizationId,
                reason,
            });

            // Notify both organizations
            await this.notifyOrganizations(
                oldOrganization,
                updatedLicense.organisation,
                license,
                user
            );

            return {
                success: true,
                message: 'License transferred successfully',
                license: updatedLicense,
            };
        } catch (error) {
            this.logger.error(
                `Failed to transfer license ${licenseId}`,
                error.stack
            );
            return {
                success: false,
                message: 'Failed to transfer license',
                error: error.message,
            };
        }
    }

    private async notifyOrganizations(
        oldOrg: any,
        newOrg: any,
        license: License,
        user: User
    ): Promise<void> {
        const baseNotificationData = {
            licenseKey: license.licenseKey,
            transferredBy: user.name,
            transferDate: new Date().toISOString(),
        };

        // Notify old organization
        await this.eventEmitter.emit('send.email', EmailType.LICENSE_TRANSFERRED_FROM, [oldOrg.email], {
            ...baseNotificationData,
            organizationName: oldOrg.name,
            newOrganizationName: newOrg.name,
        });

        // Notify new organization
        await this.eventEmitter.emit('send.email', EmailType.LICENSE_TRANSFERRED_TO, [newOrg.email], {
            ...baseNotificationData,
            organizationName: newOrg.name,
            oldOrganizationName: oldOrg.name,
        });
    }

    async validateTransferEligibility(
        licenseId: number
    ): Promise<{ eligible: boolean; reason?: string }> {
        try {
            const license = await this.licenseRepository.findOne({
                where: { uid: licenseId },
            });

            if (!license) {
                return {
                    eligible: false,
                    reason: 'License not found',
                };
            }

            // Check if license is active
            if (license.status !== LicenseStatus.ACTIVE) {
                return {
                    eligible: false,
                    reason: 'License must be active to transfer',
                };
            }

            // Check if license has any pending payments
            if (license.hasPendingPayments) {
                return {
                    eligible: false,
                    reason: 'License has pending payments',
                };
            }

            // Add more validation rules as needed

            return { eligible: true };
        } catch (error) {
            this.logger.error(
                `Failed to validate transfer eligibility for license ${licenseId}`,
                error.stack
            );
            throw error;
        }
    }
} 