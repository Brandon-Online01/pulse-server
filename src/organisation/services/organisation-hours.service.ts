import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganisationHours } from '../entities/organisation-hours.entity';
import { CreateOrganisationHoursDto } from '../dto/create-organisation-hours.dto';
import { UpdateOrganisationHoursDto } from '../dto/update-organisation-hours.dto';
import { Organisation } from '../entities/organisation.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrganisationHoursService {
    constructor(
        @InjectRepository(OrganisationHours)
        private hoursRepository: Repository<OrganisationHours>,
        @InjectRepository(Organisation)
        private organisationRepository: Repository<Organisation>,
    ) {}

    async create(orgRef: string, dto: CreateOrganisationHoursDto): Promise<OrganisationHours> {
        const organisation = await this.organisationRepository.findOne({
            where: { ref: orgRef, isDeleted: false },
        });

        if (!organisation) {
            throw new NotFoundException('Organisation not found');
        }

        const hours = this.hoursRepository.create({
            ...dto,
            ref: uuidv4(),
            organisation,
        });

        return this.hoursRepository.save(hours);
    }

    async findAll(orgRef: string): Promise<OrganisationHours[]> {
        return this.hoursRepository.find({
            where: { organisation: { ref: orgRef }, isDeleted: false },
            relations: ['organisation'],
        });
    }

    async findOne(orgRef: string, hoursRef: string): Promise<OrganisationHours> {
        const hours = await this.hoursRepository.findOne({
            where: { ref: hoursRef, organisation: { ref: orgRef }, isDeleted: false },
            relations: ['organisation'],
        });

        if (!hours) {
            throw new NotFoundException('Hours not found');
        }

        return hours;
    }

    async update(orgRef: string, hoursRef: string, dto: UpdateOrganisationHoursDto): Promise<OrganisationHours> {
        const hours = await this.findOne(orgRef, hoursRef);
        
        const updatedHours = this.hoursRepository.merge(hours, dto);
        return this.hoursRepository.save(updatedHours);
    }

    async remove(orgRef: string, hoursRef: string): Promise<void> {
        const hours = await this.findOne(orgRef, hoursRef);
        await this.hoursRepository.update(hours.ref, { isDeleted: true });
    }
} 