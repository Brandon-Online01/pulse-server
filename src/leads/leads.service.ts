import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AccessLevel, NotificationStatus, NotificationType, Status } from '../lib/enums/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { endOfDay } from 'date-fns';
import { startOfDay } from 'date-fns';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    private readonly eventEmitter: EventEmitter2
  ) { }

  async create(createLeadDto: CreateLeadDto): Promise<{ message: string, data: Lead | null }> {
    try {
      const lead = await this.leadRepository.save(createLeadDto as unknown as Lead);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: lead
      };

      const notification = {
        type: NotificationType.USER,
        title: 'Lead Created',
        message: `A lead has been created`,
        status: NotificationStatus.UNREAD,
        owner: lead?.owner
      }

      const recipients = [AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.OWNER, AccessLevel.SUPERVISOR, AccessLevel.USER]

      this.eventEmitter.emit('send.notification', notification, recipients);

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        data: null
      }

      return response;
    }
  }

  async findAll(): Promise<{ leads: Lead[] | null, message: string, stats: any }> {
    try {
      const leads = await this.leadRepository.find({ where: { isDeleted: false } });

      if (!leads) {
        return {
          leads: null,
          message: process.env.NOT_FOUND_MESSAGE,
          stats: null
        };
      }

      const stats = this.calculateStats(leads);

      const response = {
        leads: leads,
        message: process.env.SUCCESS_MESSAGE,
        stats
      };

      return response;

    } catch (error) {
      const response = {
        message: error?.message,
        leads: null,
        stats: null
      }

      return response;
    }
  }

  async findOne(ref: number): Promise<{ lead: Lead | null, message: string, stats: any }> {
    try {
      const lead = await this.leadRepository.findOne({
        where: { uid: ref, isDeleted: false },
        relations: ['owner']
      });

      if (!lead) {
        return {
          lead: null,
          message: process.env.NOT_FOUND_MESSAGE,
          stats: null
        };
      }

      const allLeads = await this.leadRepository.find();
      const stats = this.calculateStats(allLeads);

      const response = {
        lead: lead,
        message: process.env.SUCCESS_MESSAGE,
        stats
      };

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        lead: null,
        stats: null
      }

      return response;
    }
  }

  public async leadsByUser(ref: number): Promise<{ message: string, leads: Lead[], stats: any }> {
    try {
      const leads = await this.leadRepository.find({
        where: { owner: { uid: ref } }
      });

      if (!leads) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      const stats = this.calculateStats(leads);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        leads,
        stats
      };

      return response;
    } catch (error) {
      const response = {
        message: `could not get leads by user - ${error?.message}`,
        leads: null,
        stats: null
      }

      return response;
    }
  }

  async update(ref: number, updateLeadDto: UpdateLeadDto): Promise<{ message: string }> {
    try {
      await this.leadRepository.update(ref, updateLeadDto as unknown as Lead);

      const updatedLead = await this.leadRepository.findOne({
        where: { uid: ref, isDeleted: false },
        relations: ['owner']
      });

      if (!updatedLead) {
        return {
          message: process.env.NOT_FOUND_MESSAGE,
        };
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      };

      const notification = {
        type: NotificationType.USER,
        title: 'Lead Updated',
        message: `A lead has been updated`,
        status: NotificationStatus.UNREAD,
        owner: updatedLead?.owner
      }

      const recipients = [AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.OWNER, AccessLevel.SUPERVISOR, AccessLevel.USER]

      this.eventEmitter.emit('send.notification', notification, recipients);

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

  private calculateStats(leads: Lead[]): {
    total: number;
    pending: number;
    approved: number;
    inReview: number;
    declined: number;
  } {
    return {
      total: leads?.length || 0,
      pending: leads?.filter(lead => lead?.status === Status.PENDING)?.length || 0,
      approved: leads?.filter(lead => lead?.status === Status.APPROVED)?.length || 0,
      inReview: leads?.filter(lead => lead?.status === Status.REVIEW)?.length || 0,
      declined: leads?.filter(lead => lead?.status === Status.DECLINED)?.length || 0,
    };
  }


  async getLeadsForDate(date: Date): Promise<{
    message: string,
    leads: {
      pending: Lead[],
      approved: Lead[],
      review: Lead[],
      declined: Lead[]
    }
  }> {
    try {
      const leads = await this.leadRepository.find({
        where: { createdAt: Between(startOfDay(date), endOfDay(date)) }
      });

      if (!leads) {
        throw new Error(process.env.NOT_FOUND_MESSAGE);
      }

      // Group leads by status
      const groupedLeads = {
        pending: leads.filter(lead => lead.status === Status.PENDING),
        approved: leads.filter(lead => lead.status === Status.APPROVED),
        review: leads.filter(lead => lead.status === Status.REVIEW),
        declined: leads.filter(lead => lead.status === Status.DECLINED),
      };

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        leads: groupedLeads
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
}
