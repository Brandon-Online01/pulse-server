import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(ref: number): Promise<{ lead: Lead | null, message: string }> {
    try {
      const lead = await this.leadRepository.findOne({
        where: { uid: ref, isDeleted: false },
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

  public async leadsByUser(ref: number): Promise<{ message: string, leads: Lead[] }> {
    try {
      const leads = await this.leadRepository.find({
        where: { owner: { uid: ref } }
      });

      if (!leads) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        leads
      };

      return response;
    } catch (error) {
      const response = {
        message: `could not get leads by user - ${error?.message}`,
        leads: null
      }

      return response;
    }
  }

  async update(ref: number, updateLeadDto: UpdateLeadDto): Promise<{ message: string }> {
    try {
      await this.leadRepository.update(ref, updateLeadDto as unknown as Lead);

      const updatedLead = await this.leadRepository.findOne({
        where: { uid: ref, isDeleted: false }
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

  async remove(ref: number): Promise<{ message: string }> {
    try {
      const lead = await this.leadRepository.findOne({
        where: { uid: ref, isDeleted: false }
      });

      if (!lead) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      };

      await this.leadRepository.update(
        { uid: ref },
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

  async restore(ref: number): Promise<{ message: string }> {
    try {
      await this.leadRepository.update(
        { uid: ref },
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
