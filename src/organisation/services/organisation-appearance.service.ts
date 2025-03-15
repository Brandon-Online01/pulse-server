import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationAppearance } from '../entities/organisation-appearance.entity';
import { CreateOrganisationAppearanceDto } from '../dto/create-organisation-appearance.dto';
import { UpdateOrganisationAppearanceDto } from '../dto/update-organisation-appearance.dto';
import { Organisation } from '../entities/organisation.entity';
import { v4 as uuidv4 } from 'uuid';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class OrganisationAppearanceService {
    constructor(
        @InjectRepository(OrganisationAppearance)
        private appearanceRepository: Repository<OrganisationAppearance>,
        @InjectRepository(Organisation)
        private organisationRepository: Repository<Organisation>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    private readonly CACHE_PREFIX = 'org_appearance';
    private getAppearanceCacheKey(orgRef: string): string {
        return `${this.CACHE_PREFIX}:${orgRef}`;
    }

    // Default cache TTL (in seconds)
    private readonly DEFAULT_CACHE_TTL = 3600; // 1 hour

    private async clearAppearanceCache(orgRef: string): Promise<void> {
        await this.cacheManager.del(this.getAppearanceCacheKey(orgRef));
    }

    async create(orgRef: string, dto: CreateOrganisationAppearanceDto): Promise<OrganisationAppearance> {
        const organisation = await this.organisationRepository.findOne({
            where: { ref: orgRef, isDeleted: false },
        });

        if (!organisation) {
            throw new NotFoundException('Organisation not found');
        }

        const appearance = this.appearanceRepository.create({
            ...dto,
            ref: uuidv4(),
            organisation,
        });

        const savedAppearance = await this.appearanceRepository.save(appearance);
        
        // Clear cache after creating
        await this.clearAppearanceCache(orgRef);
        
        return savedAppearance;
    }

    async findOne(orgRef: string): Promise<OrganisationAppearance> {
        // Try to get from cache first
        const cacheKey = this.getAppearanceCacheKey(orgRef);
        const cachedAppearance = await this.cacheManager.get<OrganisationAppearance>(cacheKey);
        
        if (cachedAppearance) {
            return cachedAppearance;
        }

        // If not in cache, fetch from database
        const appearance = await this.appearanceRepository.findOne({
            where: { organisation: { ref: orgRef }, isDeleted: false },
            relations: ['organisation'],
        });

        if (!appearance) {
            throw new NotFoundException('Appearance settings not found');
        }

        // Store in cache
        await this.cacheManager.set(cacheKey, appearance, {
            ttl: this.DEFAULT_CACHE_TTL
        });

        return appearance;
    }

    async update(orgRef: string, dto: UpdateOrganisationAppearanceDto): Promise<OrganisationAppearance> {
        const appearance = await this.findOne(orgRef);
        
        const updatedAppearance = this.appearanceRepository.merge(appearance, dto);
        const savedAppearance = await this.appearanceRepository.save(updatedAppearance);
        
        // Clear cache after updating
        await this.clearAppearanceCache(orgRef);
        
        return savedAppearance;
    }

    async remove(orgRef: string): Promise<void> {
        const appearance = await this.findOne(orgRef);
        await this.appearanceRepository.update(appearance.ref, { isDeleted: true });
        
        // Clear cache after removing
        await this.clearAppearanceCache(orgRef);
    }
} 