import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganisationSettingsService } from '../services/organisation-settings.service';
import { CreateOrganisationSettingsDto } from '../dto/create-organisation-settings.dto';
import { UpdateOrganisationSettingsDto } from '../dto/update-organisation-settings.dto';
import { OrganisationSettings } from '../entities/organisation-settings.entity';

@ApiTags('org settings')
@Controller('organisations')
export class OrganisationSettingsController {
    constructor(private readonly settingsService: OrganisationSettingsService) {}

    @Post(':orgRef/settings')
    @ApiOperation({ summary: 'Create organization settings' })
    @ApiResponse({ status: 201, description: 'Settings created successfully' })
    @ApiResponse({ status: 400, description: 'Settings already exist' })
    @ApiResponse({ status: 404, description: 'Organization not found' })
    async create(
        @Param('orgRef') orgRef: string,
        @Body() createSettingsDto: CreateOrganisationSettingsDto,
    ): Promise<{ settings: OrganisationSettings | null; message: string }> {
        return this.settingsService.create(orgRef, createSettingsDto);
    }

    @Get(':orgRef/settings')
    @ApiOperation({ summary: 'Get organization settings' })
    @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Settings not found' })
    async findOne(
        @Param('orgRef') orgRef: string,
    ): Promise<{ settings: OrganisationSettings | null; message: string }> {
        return this.settingsService.findOne(orgRef);
    }

    @Patch(':orgRef/settings')
    @ApiOperation({ summary: 'Update organization settings' })
    @ApiResponse({ status: 200, description: 'Settings updated successfully' })
    @ApiResponse({ status: 404, description: 'Settings not found' })
    async update(
        @Param('orgRef') orgRef: string,
        @Body() updateSettingsDto: UpdateOrganisationSettingsDto,
    ): Promise<{ settings: OrganisationSettings | null; message: string }> {
        return this.settingsService.update(orgRef, updateSettingsDto);
    }

    @Delete(':orgRef/settings')
    @ApiOperation({ summary: 'Delete organization settings' })
    @ApiResponse({ status: 200, description: 'Settings deleted successfully' })
    @ApiResponse({ status: 404, description: 'Settings not found' })
    async remove(
        @Param('orgRef') orgRef: string,
    ): Promise<{ success: boolean; message: string }> {
        return this.settingsService.remove(orgRef);
    }
} 