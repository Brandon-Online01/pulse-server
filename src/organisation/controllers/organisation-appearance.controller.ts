import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganisationAppearanceService } from '../services/organisation-appearance.service';
import { CreateOrganisationAppearanceDto } from '../dto/create-organisation-appearance.dto';
import { UpdateOrganisationAppearanceDto } from '../dto/update-organisation-appearance.dto';
import { OrganisationAppearance } from '../entities/organisation-appearance.entity';

@ApiTags('Organisation Appearance')
@Controller('organisations')
export class OrganisationAppearanceController {
    constructor(private readonly appearanceService: OrganisationAppearanceService) {}

    @Post(':orgRef/appearance')
    @ApiOperation({ summary: 'Create organization appearance settings' })
    @ApiResponse({ status: 201, description: 'Appearance settings created successfully', type: OrganisationAppearance })
    @ApiResponse({ status: 404, description: 'Organization not found' })
    create(
        @Param('orgRef') orgRef: string,
        @Body() createAppearanceDto: CreateOrganisationAppearanceDto,
    ): Promise<OrganisationAppearance> {
        return this.appearanceService.create(orgRef, createAppearanceDto);
    }

    @Get(':orgRef/appearance')
    @ApiOperation({ summary: 'Get organization appearance settings' })
    @ApiResponse({ status: 200, description: 'Appearance settings retrieved successfully', type: OrganisationAppearance })
    @ApiResponse({ status: 404, description: 'Appearance settings not found' })
    findOne(@Param('orgRef') orgRef: string): Promise<OrganisationAppearance> {
        return this.appearanceService.findOne(orgRef);
    }

    @Patch(':orgRef/appearance')
    @ApiOperation({ summary: 'Update organization appearance settings' })
    @ApiResponse({ status: 200, description: 'Appearance settings updated successfully', type: OrganisationAppearance })
    @ApiResponse({ status: 404, description: 'Appearance settings not found' })
    update(
        @Param('orgRef') orgRef: string,
        @Body() updateAppearanceDto: UpdateOrganisationAppearanceDto,
    ): Promise<OrganisationAppearance> {
        return this.appearanceService.update(orgRef, updateAppearanceDto);
    }

    @Delete(':orgRef/appearance')
    @ApiOperation({ summary: 'Delete organization appearance settings' })
    @ApiResponse({ status: 200, description: 'Appearance settings deleted successfully' })
    @ApiResponse({ status: 404, description: 'Appearance settings not found' })
    remove(@Param('orgRef') orgRef: string): Promise<void> {
        return this.appearanceService.remove(orgRef);
    }
} 