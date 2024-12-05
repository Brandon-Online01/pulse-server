import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
  ) { }

  async create(createLeadDto: CreateLeadDto): Promise<{ message: string, data: Lead | null }> {
    try {
      const lead = await this.leadRepository.save(createLeadDto as unknown as Lead);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: lead
      };

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        data: null
      }

      return response;
    }
  }

  async findAll(): Promise<{ leads: Lead[] | null, message: string }> {
    try {
      const leads = await this.leadRepository.find({ where: { isDeleted: false } });

      if (!leads) {
        return {
          leads: null,
          message: process.env.NOT_FOUND_MESSAGE,
        };
      }

      const response = {
        leads: leads,
        message: process.env.SUCCESS_MESSAGE,
      };

      return response;

    } catch (error) {
      const response = {
        message: error?.message,
        leads: null
      }

      return response;
    }
  }

  async findOne(referenceCode: number): Promise<{ lead: Lead | null, message: string }> {
    try {
      const lead = await this.leadRepository.findOne({
        where: { uid: referenceCode, isDeleted: false },
        relations: ['user', 'branch']
      });

      if (!lead) {
        return {
          lead: null,
          message: process.env.NOT_FOUND_MESSAGE,
        };
      }

      const response = {
        lead: lead,
        message: process.env.SUCCESS_MESSAGE,
      };

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        lead: null
      }

      return response;
    }
  }

  async update(referenceCode: number, updateLeadDto: UpdateLeadDto): Promise<{ message: string }> {
    try {
      await this.leadRepository.update(referenceCode, updateLeadDto as unknown as Lead);

      const updatedLead = await this.leadRepository.findOne({
        where: { uid: referenceCode, isDeleted: false }
      });

      if (!updatedLead) {
        return {
          message: process.env.NOT_FOUND_MESSAGE,
        };
      }

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

  async remove(referenceCode: number): Promise<{ message: string }> {
    try {
      const lead = await this.leadRepository.findOne({
        where: { uid: referenceCode, isDeleted: false }
      });

      if (!lead) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      };

      await this.leadRepository.update(
        { uid: referenceCode },
        { isDeleted: true }
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

  async restore(referenceCode: number): Promise<{ message: string }> {
    try {
      await this.leadRepository.update(
        { uid: referenceCode },
        { isDeleted: false }
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
