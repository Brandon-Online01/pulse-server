import { Controller, Get, Post, Body, Patch, Param, UseGuards, UseFilters } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LicensingService } from './licensing.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { License } from './entities/license.entity';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { LicenseRateLimitGuard } from './lib/guards/license-rate-limit.guard';
import { LicenseExceptionFilter } from './lib/filters/license-exception.filter';
import { AccessLevel } from '../lib/enums/user.enums';
import { Roles } from '../decorators/role.decorator';
import { isPublic } from '../decorators/public.decorator';

@ApiTags('licensing')
@Controller('licensing')
@UseGuards(AuthGuard, RoleGuard, LicenseRateLimitGuard)
@UseFilters(LicenseExceptionFilter)
export class LicensingController {
    constructor(private readonly licensingService: LicensingService) { }

    @Post()
    @isPublic()
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER)
    @ApiOperation({ summary: 'Create a new license' })
    @ApiResponse({ status: 201, description: 'License created successfully', type: License })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 429, description: 'Too Many Requests' })
    create(@Body() createLicenseDto: CreateLicenseDto): Promise<License> {
        return this.licensingService.create(createLicenseDto);
    }

    @Get()
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER, AccessLevel.SUPPORT)
    @ApiOperation({ summary: 'Get all licenses' })
    @ApiResponse({ status: 200, description: 'Returns all licenses', type: [License] })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 429, description: 'Too Many Requests' })
    findAll(): Promise<License[]> {
        return this.licensingService.findAll();
    }

    @Get(':ref')
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER, AccessLevel.SUPPORT)
    @ApiOperation({ summary: 'Get license by reference' })
    @ApiResponse({ status: 200, description: 'Returns the license', type: License })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'License not found' })
    @ApiResponse({ status: 429, description: 'Too Many Requests' })
    findOne(@Param('ref') ref: string): Promise<License> {
        return this.licensingService.findOne(ref);
    }

    @Get('organisation/:ref')
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER, AccessLevel.SUPPORT, AccessLevel.MANAGER)
    @ApiOperation({ summary: 'Get licenses by organisation reference' })
    @ApiResponse({ status: 200, description: 'Returns organisation licenses', type: [License] })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Organisation not found' })
    @ApiResponse({ status: 429, description: 'Too Many Requests' })
    findByOrganisation(@Param('ref') ref: string): Promise<License[]> {
        return this.licensingService.findByOrganisation(ref);
    }

    @Patch(':ref')
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER)
    @ApiOperation({ summary: 'Update license' })
    @ApiResponse({ status: 200, description: 'License updated successfully', type: License })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'License not found' })
    @ApiResponse({ status: 429, description: 'Too Many Requests' })
    update(@Param('ref') ref: string, @Body() updateLicenseDto: UpdateLicenseDto): Promise<License> {
        return this.licensingService.update(ref, updateLicenseDto);
    }

    @Post(':ref/validate')
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER, AccessLevel.SUPPORT)
    @ApiOperation({ summary: 'Validate license' })
    @ApiResponse({ status: 200, description: 'Returns license validation status' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'License not found' })
    @ApiResponse({ status: 429, description: 'Too Many Requests' })
    validate(@Param('ref') ref: string): Promise<boolean> {
        return this.licensingService.validateLicense(ref);
    }

    @Post(':ref/renew')
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER)
    @ApiOperation({ summary: 'Renew license' })
    @ApiResponse({ status: 200, description: 'License renewed successfully', type: License })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'License not found' })
    @ApiResponse({ status: 429, description: 'Too Many Requests' })
    renew(@Param('ref') ref: string): Promise<License> {
        return this.licensingService.renewLicense(ref);
    }

    @Post(':ref/suspend')
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER)
    @ApiOperation({ summary: 'Suspend license' })
    @ApiResponse({ status: 200, description: 'License suspended successfully', type: License })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'License not found' })
    @ApiResponse({ status: 429, description: 'Too Many Requests' })
    suspend(@Param('ref') ref: string): Promise<License> {
        return this.licensingService.suspendLicense(ref);
    }

    @Post(':ref/activate')
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER)
    @ApiOperation({ summary: 'Activate license' })
    @ApiResponse({ status: 200, description: 'License activated successfully', type: License })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'License not found' })
    @ApiResponse({ status: 429, description: 'Too Many Requests' })
    activate(@Param('ref') ref: string): Promise<License> {
        return this.licensingService.activateLicense(ref);
    }
} 