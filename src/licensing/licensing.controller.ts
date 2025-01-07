import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LicensingService } from './licensing.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { License } from './entities/license.entity';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { AccessLevel } from '../lib/enums/user.enums';
import { Roles } from '../decorators/role.decorator';
import { isPublic } from '../decorators/public.decorator';

@ApiTags('licensing')
@Controller('licensing')
// @UseGuards(AuthGuard, RoleGuard)
export class LicensingController {
    constructor(private readonly licensingService: LicensingService) { }

    @Post()
    @isPublic()
    // @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER)
    @ApiOperation({ summary: 'create a new license' })
    create(@Body() createLicenseDto: CreateLicenseDto): Promise<License> {
        return this.licensingService.create(createLicenseDto);
    }

    @Get()
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER, AccessLevel.SUPPORT)
    @ApiOperation({ summary: 'get all licenses' })
    @ApiResponse({ status: 200, description: 'Returns all licenses', type: [License] })
    findAll(): Promise<License[]> {
        return this.licensingService.findAll();
    }

    @Get(':ref')
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER, AccessLevel.SUPPORT)
    @ApiOperation({ summary: 'get license by reference' })
    @ApiResponse({ status: 200, description: 'Returns the license', type: License })
    findOne(@Param('ref') ref: string): Promise<License> {
        return this.licensingService.findOne(ref);
    }

    @Get('organisation/:ref')
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER, AccessLevel.SUPPORT, AccessLevel.MANAGER)
    @ApiOperation({ summary: 'get licenses by organisation reference' })
    @ApiResponse({ status: 200, description: 'Returns organisation licenses', type: [License] })
    findByOrganisation(@Param('ref') ref: string): Promise<License[]> {
        return this.licensingService.findByOrganisation(ref);
    }

    @Patch(':ref')
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER)
    @ApiOperation({ summary: 'update license' })
    @ApiResponse({ status: 200, description: 'License updated successfully', type: License })
    update(@Param('ref') ref: string, @Body() updateLicenseDto: UpdateLicenseDto): Promise<License> {
        return this.licensingService.update(ref, updateLicenseDto);
    }

    @Post(':ref/validate')
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER, AccessLevel.SUPPORT)
    @ApiOperation({ summary: 'validate license' })
    @ApiResponse({ status: 200, description: 'Returns license validation status' })
    validate(@Param('ref') ref: string): Promise<boolean> {
        return this.licensingService.validateLicense(ref);
    }

    @Post(':ref/renew')
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER)
    @ApiOperation({ summary: 'renew license' })
    @ApiResponse({ status: 200, description: 'License renewed successfully', type: License })
    renew(@Param('ref') ref: string): Promise<License> {
        return this.licensingService.renewLicense(ref);
    }

    @Post(':ref/suspend')
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER)
    @ApiOperation({ summary: 'suspend license' })
    @ApiResponse({ status: 200, description: 'License suspended successfully', type: License })
    suspend(@Param('ref') ref: string): Promise<License> {
        return this.licensingService.suspendLicense(ref);
    }

    @Post(':ref/activate')
    @Roles(AccessLevel.ADMIN, AccessLevel.DEVELOPER)
    @ApiOperation({ summary: 'activate license' })
    @ApiResponse({ status: 200, description: 'License activated successfully', type: License })
    activate(@Param('ref') ref: string): Promise<License> {
        return this.licensingService.activateLicense(ref);
    }
} 