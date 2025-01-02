import { OrganisationService } from './organisation.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
export declare class OrganisationController {
    private readonly organisationService;
    constructor(organisationService: OrganisationService);
    create(createOrganisationDto: CreateOrganisationDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        organisations: import("./entities/organisation.entity").Organisation[] | null;
        message: string;
    }>;
    findOne(ref: string): Promise<{
        organisation: import("./entities/organisation.entity").Organisation | null;
        message: string;
    }>;
    update(ref: string, updateOrganisationDto: UpdateOrganisationDto): Promise<{
        message: string;
    }>;
    restore(ref: string): Promise<{
        message: string;
    }>;
    remove(ref: string): Promise<{
        message: string;
    }>;
}
