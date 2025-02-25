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
import { LeadStatus } from '../lib/enums/lead.enums';
import { RewardsService } from '../rewards/rewards.service';
import { XP_VALUES } from '../lib/constants/constants';
import { XP_VALUES_TYPES } from '../lib/constants/constants';
import { PaginatedResponse } from 'src/lib/types/paginated-response';

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

  async findAll(
    filters?: {
      status?: LeadStatus;
      search?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 25
  ): Promise<PaginatedResponse<Lead>> {
    try {
      const queryBuilder = this.leadRepository
        .createQueryBuilder('lead')
        .leftJoinAndSelect('lead.owner', 'owner')
        .leftJoinAndSelect('lead.branch', 'branch')
        .where('lead.isDeleted = :isDeleted', { isDeleted: false });

      if (filters?.status) {
        queryBuilder.andWhere('lead.status = :status', { status: filters.status });
      }

      if (filters?.startDate && filters?.endDate) {
        queryBuilder.andWhere('lead.createdAt BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate
        });
      }

      if (filters?.search) {
        queryBuilder.andWhere(
          '(lead.name ILIKE :search OR lead.email ILIKE :search OR lead.phone ILIKE :search OR owner.name ILIKE :search OR owner.surname ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('lead.createdAt', 'DESC');

      const [leads, total] = await queryBuilder.getManyAndCount();

      if (!leads) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      const stats = this.calculateStats(leads);

      return {
        data: leads,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        message: process.env.SUCCESS_MESSAGE
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0
        },
        message: error?.message
      };
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
      await this.leadRepository.update(ref, updateLeadDto);

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
        owner: updatedLead?.owner?.uid,
        amount: XP_VALUES.LEAD,
        action: XP_VALUES_TYPES.LEAD,
        source: {
          id: updatedLead?.owner?.uid.toString(),
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

  async getLeadsReport(filter: any) {
    try {
      const leads = await this.leadRepository.find({
        where: {
          ...filter,
          isDeleted: false
        },
        relations: ['owner', 'branch', 'client']
      });

      if (!leads) {
        throw new NotFoundException('No leads found for the specified period');
      }

      const groupedLeads = {
        review: leads.filter(lead => lead.status === LeadStatus.REVIEW),
        pending: leads.filter(lead => lead.status === LeadStatus.PENDING),
        approved: leads.filter(lead => lead.status === LeadStatus.APPROVED),
        declined: leads.filter(lead => lead.status === LeadStatus.DECLINED)
      };

      const totalLeads = leads.length;
      const approvedLeads = groupedLeads.approved.length;
      const avgResponseTime = this.calculateAverageResponseTime(leads);
      const sources = this.analyzeLeadSources(leads);
      const sourceEffectiveness = this.analyzeSourceEffectiveness(leads);
      const geographicDistribution = this.analyzeGeographicDistribution(leads);
      const leadQualityBySource = this.analyzeLeadQualityBySource(leads);
      const conversionTrends = this.analyzeConversionTrends(leads);
      const responseTimeDistribution = this.analyzeResponseTimeDistribution(leads);

      return {
        ...groupedLeads,
        total: totalLeads,
        metrics: {
          conversionRate: `${((approvedLeads / totalLeads) * 100).toFixed(1)}%`,
          averageResponseTime: `${avgResponseTime} hours`,
          topSources: sources,
          qualityScore: this.calculateQualityScore(leads),
          sourceEffectiveness,
          geographicDistribution,
          leadQualityBySource,
          conversionTrends,
          responseTimeDistribution
        }
      };
    } catch (error) {
      return null;
    }
  }

  private calculateAverageResponseTime(leads: Lead[]): number {
    const respondedLeads = leads.filter(lead =>
      lead.status === LeadStatus.APPROVED ||
      lead.status === LeadStatus.DECLINED
    );

    if (respondedLeads.length === 0) return 0;

    const totalResponseTime = respondedLeads.reduce((sum, lead) => {
      const responseTime = lead.updatedAt.getTime() - lead.createdAt.getTime();
      return sum + responseTime;
    }, 0);

    // Convert from milliseconds to hours
    return Number((totalResponseTime / (respondedLeads.length * 60 * 60 * 1000)).toFixed(1));
  }

  private analyzeLeadSources(leads: Lead[]): Array<{ source: string; count: number }> {
    const sourceCounts = leads.reduce((acc, lead) => {
      const source = lead.client?.category || 'Direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Return top 5 sources
  }

  private calculateQualityScore(leads: Lead[]): number {
    if (leads.length === 0) return 0;

    const approvedLeads = leads.filter(lead => lead.status === LeadStatus.APPROVED).length;
    const responseTimeScore = this.calculateAverageResponseTime(leads) < 24 ? 1 : 0.5;
    const conversionRate = approvedLeads / leads.length;

    // Calculate score out of 100
    const score = ((conversionRate * 0.6 + responseTimeScore * 0.4) * 100);
    return Number(score.toFixed(1));
  }

  private analyzeSourceEffectiveness(leads: Lead[]): Array<{
    source: string;
    totalLeads: number;
    convertedLeads: number;
    conversionRate: string;
    averageResponseTime: string;
    qualityScore: number;
  }> {
    const sourceStats = new Map<string, {
      total: number;
      converted: number;
      totalResponseTime: number;
      respondedLeads: number;
      qualityScores: number[];
    }>();

    leads.forEach(lead => {
      const source = lead.client?.category || 'Direct';

      if (!sourceStats.has(source)) {
        sourceStats.set(source, {
          total: 0,
          converted: 0,
          totalResponseTime: 0,
          respondedLeads: 0,
          qualityScores: []
        });
      }

      const stats = sourceStats.get(source);
      stats.total++;

      if (lead.status === LeadStatus.APPROVED) {
        stats.converted++;
      }

      if (lead.status !== LeadStatus.PENDING) {
        stats.respondedLeads++;
        stats.totalResponseTime += lead.updatedAt.getTime() - lead.createdAt.getTime();
      }

      stats.qualityScores.push(this.calculateIndividualLeadQualityScore(lead));
    });

    return Array.from(sourceStats.entries())
      .map(([source, stats]) => ({
        source,
        totalLeads: stats.total,
        convertedLeads: stats.converted,
        conversionRate: `${((stats.converted / stats.total) * 100).toFixed(1)}%`,
        averageResponseTime: `${(
          stats.respondedLeads > 0
            ? stats.totalResponseTime / (stats.respondedLeads * 60 * 60 * 1000)
            : 0
        ).toFixed(1)} hours`,
        qualityScore: Number((
          stats.qualityScores.reduce((sum, score) => sum + score, 0) / stats.total
        ).toFixed(1))
      }))
      .sort((a, b) => b.convertedLeads - a.convertedLeads);
  }

  private analyzeGeographicDistribution(leads: Lead[]): Record<string, {
    total: number;
    converted: number;
    conversionRate: string;
  }> {
    const geoStats = new Map<string, {
      total: number;
      converted: number;
    }>();

    leads.forEach(lead => {
      const region = lead?.client?.address?.city || 'Unknown';

      if (!geoStats.has(region)) {
        geoStats.set(region, {
          total: 0,
          converted: 0
        });
      }

      const stats = geoStats.get(region);
      stats.total++;
      if (lead.status === LeadStatus.APPROVED) {
        stats.converted++;
      }
    });

    return Object.fromEntries(
      Array.from(geoStats.entries())
        .map(([region, stats]) => [
          region,
          {
            total: stats.total,
            converted: stats.converted,
            conversionRate: `${((stats.converted / stats.total) * 100).toFixed(1)}%`
          }
        ])
    );
  }

  private analyzeLeadQualityBySource(leads: Lead[]): Array<{
    source: string;
    averageQualityScore: number;
    leadDistribution: {
      high: number;
      medium: number;
      low: number;
    };
  }> {
    const sourceQuality = new Map<string, {
      scores: number[];
      distribution: {
        high: number;
        medium: number;
        low: number;
      };
    }>();

    leads.forEach(lead => {
      const source = lead.client?.category || 'Direct';
      const qualityScore = this.calculateIndividualLeadQualityScore(lead);

      if (!sourceQuality.has(source)) {
        sourceQuality.set(source, {
          scores: [],
          distribution: {
            high: 0,
            medium: 0,
            low: 0
          }
        });
      }

      const stats = sourceQuality.get(source);
      stats.scores.push(qualityScore);

      if (qualityScore >= 80) stats.distribution.high++;
      else if (qualityScore >= 50) stats.distribution.medium++;
      else stats.distribution.low++;
    });

    return Array.from(sourceQuality.entries())
      .map(([source, stats]) => ({
        source,
        averageQualityScore: Number((
          stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length
        ).toFixed(1)),
        leadDistribution: stats.distribution
      }))
      .sort((a, b) => b.averageQualityScore - a.averageQualityScore);
  }

  private analyzeConversionTrends(leads: Lead[]): Array<{
    date: string;
    totalLeads: number;
    convertedLeads: number;
    conversionRate: string;
  }> {
    const dailyStats = new Map<string, {
      total: number;
      converted: number;
    }>();

    leads.forEach(lead => {
      const date = lead.createdAt.toISOString().split('T')[0];

      if (!dailyStats.has(date)) {
        dailyStats.set(date, {
          total: 0,
          converted: 0
        });
      }

      const stats = dailyStats.get(date);
      stats.total++;
      if (lead.status === LeadStatus.APPROVED) {
        stats.converted++;
      }
    });

    return Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        totalLeads: stats.total,
        convertedLeads: stats.converted,
        conversionRate: `${((stats.converted / stats.total) * 100).toFixed(1)}%`
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private analyzeResponseTimeDistribution(leads: Lead[]): Record<string, number> {
    const distribution = {
      'Under 1 hour': 0,
      '1-4 hours': 0,
      '4-12 hours': 0,
      '12-24 hours': 0,
      'Over 24 hours': 0
    };

    leads.forEach(lead => {
      if (lead.status === LeadStatus.PENDING) return;

      const responseTime =
        (lead.updatedAt.getTime() - lead.createdAt.getTime()) / (60 * 60 * 1000); // hours

      if (responseTime < 1) distribution['Under 1 hour']++;
      else if (responseTime < 4) distribution['1-4 hours']++;
      else if (responseTime < 12) distribution['4-12 hours']++;
      else if (responseTime < 24) distribution['12-24 hours']++;
      else distribution['Over 24 hours']++;
    });

    return distribution;
  }

  private calculateIndividualLeadQualityScore(lead: Lead): number {
    let score = 0;

    // Response time score (40%)
    if (lead.status !== LeadStatus.PENDING) {
      const responseTime =
        (lead.updatedAt.getTime() - lead.createdAt.getTime()) / (60 * 60 * 1000);
      if (responseTime < 1) score += 40;
      else if (responseTime < 4) score += 30;
      else if (responseTime < 12) score += 20;
      else if (responseTime < 24) score += 10;
    }

    // Status score (30%)
    if (lead.status === LeadStatus.APPROVED) score += 30;
    else if (lead.status === LeadStatus.REVIEW) score += 15;

    // Data completeness score (30%)
    if (lead.client) {
      if (lead.client.email) score += 10;
      if (lead.client.phone) score += 10;
      if (lead.client.address) score += 10;
    }

    return score;
  }
}
