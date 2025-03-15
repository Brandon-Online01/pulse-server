import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { Repository } from 'typeorm';
import { Organisation } from './entities/organisation.entity';
import { Cache } from 'cache-manager';
export declare class OrganisationService {
    private organisationRepository;
    private cacheManager;
    constructor(organisationRepository: Repository<Organisation>, cacheManager: Cache);
    private readonly CACHE_PREFIX;
    private readonly ALL_ORGS_CACHE_KEY;
    private getOrgCacheKey;
    private readonly DEFAULT_CACHE_TTL;
    private clearOrganisationCache;
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
