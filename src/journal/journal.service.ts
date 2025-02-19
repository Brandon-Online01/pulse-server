import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Journal } from './entities/journal.entity';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { NotificationType, NotificationStatus } from '../lib/enums/notification.enums';
import { AccessLevel } from '../lib/enums/user.enums';
import { JournalStatus } from '../lib/enums/journal.enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { endOfDay, startOfDay } from 'date-fns';
import { RewardsService } from '../rewards/rewards.service';
import { XP_VALUES, XP_VALUES_TYPES } from '../lib/constants/constants';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(Journal)
    private journalRepository: Repository<Journal>,
    private readonly eventEmitter: EventEmitter2,
    private readonly rewardsService: RewardsService
  ) { }

  private calculateStats(journals: Journal[]): {
    total: number;
  } {
    return {
      total: journals?.length || 0,
    };
  }

  async create(createJournalDto: CreateJournalDto): Promise<{ message: string }> {
    try {
      const journal = await this.journalRepository.save(createJournalDto);

      if (!journal) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

      const notification = {
        type: NotificationType.USER,
        title: 'Journal Created',
        message: `A journal has been created`,
        status: NotificationStatus.UNREAD,
        owner: journal?.owner
      }

      const recipients = [AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.OWNER, AccessLevel.SUPERVISOR, AccessLevel.USER]

      this.eventEmitter.emit('send.notification', notification, recipients);

      await this.rewardsService.awardXP({
        owner: createJournalDto.owner.uid,
        amount: 10,
        action: 'JOURNAL',
        source: {
          id: createJournalDto.owner.uid.toString(),
          type: 'journal',
          details: 'Journal reward'
        }
      });

      return response
    } catch (error) {
      const response = {
        message: error?.message,
      }

      return response
    }
  }

  async findAll(
    filters?: {
      status?: JournalStatus; 
      authorId?: number;
      startDate?: Date;
      endDate?: Date;
      search?: string;
      categoryId?: number;
    },
    page: number = 1,
    limit: number = Number(process.env.DEFAULT_PAGE_LIMIT)
  ): Promise<PaginatedResponse<Journal>> {
    try {
      const queryBuilder = this.journalRepository
        .createQueryBuilder('journal')
        .leftJoinAndSelect('journal.author', 'author')
        .leftJoinAndSelect('journal.category', 'category')
        .where('journal.isDeleted = :isDeleted', { isDeleted: false });

      if (filters?.status) {
        queryBuilder.andWhere('journal.status = :status', { status: filters.status });
      }

      if (filters?.authorId) {
        queryBuilder.andWhere('author.uid = :authorId', { authorId: filters.authorId });
      }

      if (filters?.categoryId) {
        queryBuilder.andWhere('category.uid = :categoryId', { categoryId: filters.categoryId });
      }

      if (filters?.startDate && filters?.endDate) {
        queryBuilder.andWhere('journal.createdAt BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate
        });
      }

      if (filters?.search) {
        queryBuilder.andWhere(
          '(journal.title ILIKE :search OR journal.content ILIKE :search OR author.name ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      // Add pagination
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('journal.createdAt', 'DESC');

      const [journals, total] = await queryBuilder.getManyAndCount();

      if (!journals) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      return {
        data: journals,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: process.env.SUCCESS_MESSAGE,
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
        message: error?.message,
      };
    }
  }

  async findOne(ref: number): Promise<{ message: string, journal: Journal | null, stats: any }> {
    try {
      const journal = await this.journalRepository.findOne({
        where: { uid: ref, isDeleted: false },
        relations: ['owner']
      });

      if (!journal) {
        return {
          message: process.env.NOT_FOUND_MESSAGE,
          journal: null,
          stats: null
        }
      }

      const allJournals = await this.journalRepository.find();
      const stats = this.calculateStats(allJournals);

      return {
        journal,
        message: process.env.SUCCESS_MESSAGE,
        stats
      }
    } catch (error) {
      return {
        message: error?.message,
        journal: null,
        stats: null
      }
    }
  }

  public async journalsByUser(ref: number): Promise<{ message: string, journals: Journal[], stats: { total: number } }> {
    try {
      const journals = await this.journalRepository.find({
        where: { owner: { uid: ref }, isDeleted: false },
        relations: ['owner']
      });

      if (!journals) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      const stats = this.calculateStats(journals);

      return {
        message: process.env.SUCCESS_MESSAGE,
        journals,
        stats
      };
    } catch (error) {
      return {
        message: `could not get journals by user - ${error?.message}`,
        journals: null,
        stats: null
      }
    }
  }

  async getJournalsForDate(date: Date): Promise<{ message: string, journals: Journal[] }> {
    try {
      const journals = await this.journalRepository.find({
        where: { createdAt: Between(startOfDay(date), endOfDay(date)) }
      });

      if (!journals) {
        throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        journals
      };

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        journals: null
      };

      return response;
    }
  }

  async update(ref: number, updateJournalDto: UpdateJournalDto) {
    try {
      const journal = await this.journalRepository.findOne({ where: { uid: ref, isDeleted: false } });

      if (!journal) {
        const response = {
          message: process.env.NOT_FOUND_MESSAGE,
        }

        return response
      }

      await this.journalRepository.update(ref, updateJournalDto);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

      const notification = {
        type: NotificationType.USER,
        title: 'Journal Created',
        message: `A journal has been created`,
        status: NotificationStatus.UNREAD,
        owner: journal?.owner
      }

      const recipients = [AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.OWNER, AccessLevel.SUPERVISOR, AccessLevel.USER]

      this.eventEmitter.emit('send.notification', notification, recipients);

      await this.rewardsService.awardXP({
        owner: updateJournalDto.owner.uid,
        amount: XP_VALUES.JOURNAL,
        action: XP_VALUES_TYPES.JOURNAL,
        source: {
          id: updateJournalDto.owner.uid.toString(),
          type: XP_VALUES_TYPES.JOURNAL,
          details: 'Journal reward'
        }
      });

      return response
    } catch (error) {
      const response = {
        message: error?.message,
      }

      return response
    }
  }

  async remove(ref: number): Promise<{ message: string }> {
    try {
      const journal = await this.journalRepository.findOne({ where: { uid: ref } });

      if (!journal) {
        const response = {
          message: process.env.NOT_FOUND_MESSAGE,
        }

        return response
      }

      await this.journalRepository.update(ref, { isDeleted: true });

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

      return response
    } catch (error) {
      const response = {
        message: error?.message,
      }

      return response
    }
  }

  async restore(ref: number): Promise<{ message: string }> {
    try {
      const journal = await this.journalRepository.findOne({ where: { uid: ref } });

      if (!journal) {
        const response = {
          message: process.env.NOT_FOUND_MESSAGE,
        }

        return response
      }

      await this.journalRepository.update(ref, { isDeleted: false });

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

      return response
    } catch (error) {
      const response = {
        message: error?.message,
      }

      return response
    }
  }

  async count(): Promise<{ total: number }> {
    try {
      const total = await this.journalRepository.count();

      return {
        total
      };
    } catch (error) {
      return {
        total: 0
      };
    }
  }

  async getJournalsReport(filter: any) {
    try {
      const journals = await this.journalRepository.find({
        where: {
          ...filter,
          isDeleted: false
        },
        relations: ['owner', 'branch'],
        order: {
          timestamp: 'DESC'
        }
      });

      if (!journals) {
        throw new NotFoundException('No journals found for the specified period');
      }

      const totalEntries = journals.length;
      const categories = this.analyzeJournalCategories(journals);
      const entriesPerDay = this.calculateEntriesPerDay(journals);
      const completionRate = this.calculateCompletionRate(journals);

      return {
        entries: journals,
        metrics: {
          totalEntries,
          averageEntriesPerDay: entriesPerDay,
          topCategories: categories,
          completionRate: `${completionRate}%`
        }
      };
    } catch (error) {
      return null;
    }
  }

  private analyzeJournalCategories(journals: Journal[]): Array<{ category: string; count: number }> {
    const categoryCounts = journals.reduce((acc, journal) => {
      // Extract category from comments or clientRef if available
      const category = this.extractCategory(journal);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Return top 5 categories
  }

  private extractCategory(journal: Journal): string {
    // Try to extract category from comments
    const comments = journal.comments.toLowerCase();
    if (comments.includes('meeting')) return 'Meeting';
    if (comments.includes('call')) return 'Call';
    if (comments.includes('report')) return 'Report';
    if (comments.includes('follow')) return 'Follow-up';
    return 'Other';
  }

  private calculateEntriesPerDay(journals: Journal[]): number {
    if (journals.length === 0) return 0;

    const dates = journals.map(j => j.timestamp.toISOString().split('T')[0]);
    const uniqueDates = new Set(dates).size;
    return Number((journals.length / uniqueDates).toFixed(1));
  }

  private calculateCompletionRate(journals: Journal[]): number {
    if (journals.length === 0) return 0;

    const completedEntries = journals.filter(journal =>
      journal.fileURL &&
      journal.comments &&
      journal.comments.length > 10
    ).length;

    return Number(((completedEntries / journals.length) * 100).toFixed(1));
  }
}
