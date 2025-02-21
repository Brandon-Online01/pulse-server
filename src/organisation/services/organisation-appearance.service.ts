import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationAppearance } from '../entities/organisation-appearance.entity';
import { CreateOrganisationAppearanceDto } from '../dto/create-organisation-appearance.dto';
import { UpdateOrganisationAppearanceDto } from '../dto/update-organisation-appearance.dto';
import { Organisation } from '../entities/organisation.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrganisationAppearanceService {
    constructor(
        @InjectRepository(OrganisationAppearance)
        private appearanceRepository: Repository<OrganisationAppearance>,
        @InjectRepository(Organisation)
        private organisationRepository: Repository<Organisation>,
    ) {}

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

        return this.appearanceRepository.save(appearance);
    }

    async findOne(orgRef: string): Promise<OrganisationAppearance> {
        const appearance = await this.appearanceRepository.findOne({
            where: { organisation: { ref: orgRef }, isDeleted: false },
            relations: ['organisation'],
        });

        if (!appearance) {
            throw new NotFoundException('Appearance settings not found');
        }

        return appearance;
    }

    async update(orgRef: string, dto: UpdateOrganisationAppearanceDto): Promise<OrganisationAppearance> {
        const appearance = await this.findOne(orgRef);
        
        const updatedAppearance = this.appearanceRepository.merge(appearance, dto);
        return this.appearanceRepository.save(updatedAppearance);
    }

    async remove(orgRef: string): Promise<void> {
        const appearance = await this.findOne(orgRef);
        await this.appearanceRepository.update(appearance.ref, { isDeleted: true });
    }
} 