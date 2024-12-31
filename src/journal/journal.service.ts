import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Journal } from './entities/journal.entity';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { NotificationType, NotificationStatus } from '../lib/enums/notification.enums';
import { AccessLevel } from '../lib/enums/user.enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { endOfDay, startOfDay } from 'date-fns';
import { RewardsService } from 'src/rewards/rewards.service';

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
        throw new Error(process.env.NOT_FOUND_MESSAGE);
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

  async findAll(): Promise<{ message: string, journals: Journal[] | null, stats: any }> {
    try {
      const journals = await this.journalRepository.find({
        where: { isDeleted: false },
        relations: ['owner'],
        order: {
          timestamp: 'DESC'
        }
      });

      if (journals?.length === 0) {
        return {
          message: process.env.NOT_FOUND_MESSAGE,
          journals: null,
          stats: null
        }
      }

      const stats = this.calculateStats(journals);

      return {
        journals,
        message: process.env.SUCCESS_MESSAGE,
        stats
      }
    } catch (error) {
      return {
        message: error?.message,
        journals: null,
        stats: null
      }
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
        throw new Error(process.env.NOT_FOUND_MESSAGE);
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
        amount: 10,
        action: 'JOURNAL',
        source: {
          id: updateJournalDto.owner.uid.toString(),
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
}
