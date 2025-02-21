import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganisationHoursService } from '../services/organisation-hours.service';
import { CreateOrganisationHoursDto } from '../dto/create-organisation-hours.dto';
import { UpdateOrganisationHoursDto } from '../dto/update-organisation-hours.dto';
import { OrganisationHours } from '../entities/organisation-hours.entity';

@ApiTags('Organisation Hours')
@Controller('organisations')
export class OrganisationHoursController {
    constructor(private readonly hoursService: OrganisationHoursService) {}

    @Post(':orgRef/hours')
    @ApiOperation({ summary: 'Create organization hours' })
    @ApiResponse({ status: 201, description: 'Hours created successfully', type: OrganisationHours })
    @ApiResponse({ status: 404, description: 'Organization not found' })
    create(
        @Param('orgRef') orgRef: string,
        @Body() createHoursDto: CreateOrganisationHoursDto,
    ): Promise<OrganisationHours> {
        return this.hoursService.create(orgRef, createHoursDto);
    }

    @Get(':orgRef/hours')
    @ApiOperation({ summary: 'Get all organization hours' })
    @ApiResponse({ status: 200, description: 'Hours retrieved successfully', type: [OrganisationHours] })
    findAll(@Param('orgRef') orgRef: string): Promise<OrganisationHours[]> {
        return this.hoursService.findAll(orgRef);
    }

    @Get(':orgRef/hours/:hoursRef')
    @ApiOperation({ summary: 'Get specific organization hours' })
    @ApiResponse({ status: 200, description: 'Hours retrieved successfully', type: OrganisationHours })
    @ApiResponse({ status: 404, description: 'Hours not found' })
    findOne(
        @Param('orgRef') orgRef: string,
        @Param('hoursRef') hoursRef: string,
    ): Promise<OrganisationHours> {
        return this.hoursService.findOne(orgRef, hoursRef);
    }

    @Patch(':orgRef/hours/:hoursRef')
    @ApiOperation({ summary: 'Update organization hours' })
    @ApiResponse({ status: 200, description: 'Hours updated successfully', type: OrganisationHours })
    @ApiResponse({ status: 404, description: 'Hours not found' })
    update(
        @Param('orgRef') orgRef: string,
        @Param('hoursRef') hoursRef: string,
        @Body() updateHoursDto: UpdateOrganisationHoursDto,
    ): Promise<OrganisationHours> {
        return this.hoursService.update(orgRef, hoursRef, updateHoursDto);
    }

    @Delete(':orgRef/hours/:hoursRef')
    @ApiOperation({ summary: 'Delete organization hours' })
    @ApiResponse({ status: 200, description: 'Hours deleted successfully' })
    @ApiResponse({ status: 404, description: 'Hours not found' })
    remove(
        @Param('orgRef') orgRef: string,
        @Param('hoursRef') hoursRef: string,
    ): Promise<void> {
        return this.hoursService.remove(orgRef, hoursRef);
    }
} 