import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationSettings } from '../entities/organisation-settings.entity';
import { CreateOrganisationSettingsDto } from '../dto/create-organisation-settings.dto';
import { UpdateOrganisationSettingsDto } from '../dto/update-organisation-settings.dto';
import { Organisation } from '../entities/organisation.entity';

@Injectable()
export class OrganisationSettingsService {
    constructor(
        @InjectRepository(OrganisationSettings)
        private settingsRepository: Repository<OrganisationSettings>,
        @InjectRepository(Organisation)
        private organisationRepository: Repository<Organisation>,
    ) {}

    async create(orgRef: string, dto: CreateOrganisationSettingsDto): Promise<{ settings: OrganisationSettings | null; message: string }> {
        try {
            const organisation = await this.organisationRepository.findOne({
                where: { ref: orgRef, isDeleted: false },
                relations: ['settings'],
            });

            if (!organisation) {
                return {
                    settings: null,
                    message: 'Organisation not found',
                };
            }

            if (organisation.settings) {
                return {
                    settings: null,
                    message: 'Settings already exist for this organisation',
                };
            }

            const settings = this.settingsRepository.create({
                ...dto,
                organisationUid: organisation.uid,
            });

            const savedSettings = await this.settingsRepository.save(settings);

            return {
                settings: savedSettings,
                message: 'Settings created successfully',
            };
        } catch (error) {
            return {
                settings: null,
                message: error?.message || 'Error creating settings',
            };
        }
    }

    async findOne(orgRef: string): Promise<{ settings: OrganisationSettings | null; message: string }> {
        try {
            const settings = await this.settingsRepository.findOne({
                where: { organisation: { ref: orgRef }, isDeleted: false },
                relations: ['organisation'],
            });

            if (!settings) {
                return {
                    settings: null,
                    message: 'Settings not found',
                };
            }

            return {
                settings,
                message: 'Settings retrieved successfully',
            };
        } catch (error) {
            return {
                settings: null,
                message: error?.message || 'Error retrieving settings',
            };
        }
    }

    async update(orgRef: string, dto: UpdateOrganisationSettingsDto): Promise<{ settings: OrganisationSettings | null; message: string }> {
        try {
            const { settings } = await this.findOne(orgRef);
            
            if (!settings) {
                return {
                    settings: null,
                    message: 'Settings not found',
                };
            }

            const updatedSettings = this.settingsRepository.merge(settings, dto);
            const savedSettings = await this.settingsRepository.save(updatedSettings);

            return {
                settings: savedSettings,
                message: 'Settings updated successfully',
            };
        } catch (error) {
            return {
                settings: null,
                message: error?.message || 'Error updating settings',
            };
        }
    }

    async remove(orgRef: string): Promise<{ success: boolean; message: string }> {
        try {
            const { settings } = await this.findOne(orgRef);

            if (!settings) {
                return {
                    success: false,
                    message: 'Settings not found',
                };
            }

            await this.settingsRepository.update(settings.uid, { isDeleted: true });

            return {
                success: true,
                message: 'Settings deleted successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error?.message || 'Error deleting settings',
            };
        }
    }
} 