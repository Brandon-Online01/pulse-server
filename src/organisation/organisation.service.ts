import { Injectable } from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from './entities/organisation.entity';
import { Status } from 'src/lib/enums/enums';

@Injectable()
export class OrganisationService {
  constructor(
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>
  ) { }

  async create(createOrganisationDto: CreateOrganisationDto): Promise<{ message: string }> {
    try {
      const organisation = await this.organisationRepository.save(createOrganisationDto);

      if (!organisation) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      return {
        message: process.env.SUCCESS_MESSAGE,
      };
    } catch (error) {
      return {
        message: error?.message,
      };
    }
  }

  async findAll(): Promise<{ organisations: Organisation[] | null, message: string }> {
    try {
      const organisations = await this.organisationRepository.find({
        where: { isDeleted: false },
        relations: ['branches']
      });

      if (!organisations) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      return {
        organisations,
        message: process.env.SUCCESS_MESSAGE,
      };
    } catch (error) {
      return {
        organisations: null,
        message: error?.message,
      };
    }
  }

  async findOne(referenceCode: string): Promise<{ organisation: Organisation | null, message: string }> {
    try {
      const organisation = await this.organisationRepository.findOne({
        where: { referenceCode, isDeleted: false },
        relations: ['branches']
      });

      if (!organisation) {
        return {
          organisation: null,
          message: 'organisation not found',
        };
      }

      return {
        organisation,
        message: 'organisation found',
      };
    } catch (error) {
      return {
        organisation: null,
        message: error?.message,
      };
    }
  }

  async update(referenceCode: string, updateOrganisationDto: UpdateOrganisationDto): Promise<{ message: string }> {
    try {
      await this.organisationRepository.update({ referenceCode }, updateOrganisationDto);

      const updatedOrganisation = await this.organisationRepository.findOne({
        where: { referenceCode, isDeleted: false }
      });

      if (!updatedOrganisation) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      return {
        message: process.env.SUCCESS_MESSAGE,
      };
    } catch (error) {
      return {
        message: error?.message,
      };
    }
  }

  async remove(referenceCode: string): Promise<{ message: string }> {
    try {
      const organisation = await this.organisationRepository.findOne({
        where: { referenceCode, isDeleted: false }
      });

      if (!organisation) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      await this.organisationRepository.update(
        { referenceCode },
        { isDeleted: true }
      );

      return {
        message: process.env.SUCCESS_MESSAGE,
      };
    } catch (error) {
      return {
        message: error?.message,
      };
    }
  }

  async restore(referenceCode: string): Promise<{ message: string }> {
    try {
      await this.organisationRepository.update(
        { referenceCode },
        {
          isDeleted: false,
          status: Status.ACTIVE
        }
      );

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      };

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
      }

      return response;
    }
  }
}
