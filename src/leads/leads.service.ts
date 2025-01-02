import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AccessLevel } from '../lib/enums/user.enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { endOfDay } from 'date-fns';
import { startOfDay } from 'date-fns';
import { NotificationStatus, NotificationType } from '../lib/enums/notification.enums';
import { LeadStatus } from '../lib/enums/leads.enums';
import { RewardsService } from '../rewards/rewards.service';
import { XP_VALUES } from '../lib/constants/constants';
import { XP_VALUES_TYPES } from '../lib/constants/constants';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    private readonly eventEmitter: EventEmitter2,
    private readonly rewardsService: RewardsService
  ) { }

  async create(createLeadDto: CreateLeadDto): Promise<{ message: string, data: Lead | null }> {
    try {
      const lead = await this.leadRepository.save(createLeadDto as unknown as Lead);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: lead
      };

      await this.rewardsService.awardXP({
        owner: createLeadDto.owner.uid,
        amount: 10,
        action: 'LEAD',
        source: {
          id: createLeadDto.owner.uid.toString(),
          type: 'lead',
          details: 'Lead reward'
        }
      });

      const notification = {
        type: NotificationType.USER,
        title: 'Lead Created',
        message: `A lead has been created`,
        status: NotificationStatus.UNREAD,
        owner: lead?.owner
      }

      const recipients = [AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.OWNER, AccessLevel.SUPERVISOR, AccessLevel.USER]

      this.eventEmitter.emit('send.notification', notification, recipients);


      await this.rewardsService.awardXP({
        owner: createLeadDto.owner.uid,
        amount: XP_VALUES.LEAD,
        action: XP_VALUES_TYPES.LEAD,
        source: {
          id: createLeadDto.owner.uid.toString(),
          type: XP_VALUES_TYPES.LEAD,
          details: 'Lead reward'
        }
      });

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

      await this.rewardsService.awardXP({
        owner: updateLeadDto.owner.uid,
        amount: XP_VALUES.LEAD,
        action: XP_VALUES_TYPES.LEAD,
        source: {
          id: updateLeadDto.owner.uid.toString(),
          type: XP_VALUES_TYPES.LEAD,
          details: 'Lead reward'
        }
      });

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
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
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
      pending: leads?.filter(lead => lead?.status === LeadStatus.PENDING)?.length || 0,
      approved: leads?.filter(lead => lead?.status === LeadStatus.APPROVED)?.length || 0,
      inReview: leads?.filter(lead => lead?.status === LeadStatus.REVIEW)?.length || 0,
      declined: leads?.filter(lead => lead?.status === LeadStatus.DECLINED)?.length || 0,
    };
  }


  async getLeadsForDate(date: Date): Promise<{
    message: string,
    leads: {
      pending: Lead[],
      approved: Lead[],
      review: Lead[],
      declined: Lead[],
      total: number
    }
  }> {
    try {
      const leads = await this.leadRepository.find({
        where: { createdAt: Between(startOfDay(date), endOfDay(date)) }
      });

      if (!leads) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      // Group leads by status
      const groupedLeads = {
        pending: leads.filter(lead => lead.status === LeadStatus.PENDING),
        approved: leads.filter(lead => lead.status === LeadStatus.APPROVED),
        review: leads.filter(lead => lead.status === LeadStatus.REVIEW),
        declined: leads.filter(lead => lead.status === LeadStatus.DECLINED),
        total: leads?.length
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
