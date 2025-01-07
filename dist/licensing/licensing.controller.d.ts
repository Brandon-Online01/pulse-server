import { LicensingService } from './licensing.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { License } from './entities/license.entity';
export declare class LicensingController {
    private readonly licensingService;
    constructor(licensingService: LicensingService);
    create(createLicenseDto: CreateLicenseDto): Promise<License>;
    findAll(): Promise<License[]>;
    findOne(ref: string): Promise<License>;
    findByOrganisation(ref: string): Promise<License[]>;
    update(ref: string, updateLicenseDto: UpdateLicenseDto): Promise<License>;
    validate(ref: string): Promise<boolean>;
    renew(ref: string): Promise<License>;
    suspend(ref: string): Promise<License>;
    activate(ref: string): Promise<License>;
}
