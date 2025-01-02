import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { Repository } from 'typeorm';
import { Organisation } from './entities/organisation.entity';
export declare class OrganisationService {
    private organisationRepository;
    constructor(organisationRepository: Repository<Organisation>);
    create(createOrganisationDto: CreateOrganisationDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<{
        organisations: Organisation[] | null;
        message: string;
    }>;
    findOne(ref: string): Promise<{
        organisation: Organisation | null;
        message: string;
    }>;
    update(ref: string, updateOrganisationDto: UpdateOrganisationDto): Promise<{
        message: string;
    }>;
    remove(ref: string): Promise<{
        message: string;
    }>;
    restore(ref: string): Promise<{
        message: string;
    }>;
}
