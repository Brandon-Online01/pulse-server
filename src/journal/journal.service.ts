import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Journal } from './entities/journal.entity';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(Journal)
    private journalRepository: Repository<Journal>,
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
        where: { owner: { uid: ref }, isDeleted: false }
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

  async update(ref: number, updateJournalDto: UpdateJournalDto) {
    try {
      const journal = await this.journalRepository.findOne({ where: { uid: ref, isDeleted: false } });

      if (!journal) {
        const response = {
          message: process.env.NOT_FOUND_MESSAGE,
          journal: null
        }

        return response
      }

      const updatedJournal = await this.journalRepository.update(ref, updateJournalDto);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        journal: updatedJournal
      }

      return response
    } catch (error) {
      const response = {
        message: error?.message,
        journal: null
      }

      return response
    }
  }

  async remove(ref: number): Promise<{ message: string, journal: Journal | null }> {
    try {
      const journal = await this.journalRepository.findOne({ where: { uid: ref } });

      if (!journal) {
        const response = {
          message: process.env.NOT_FOUND_MESSAGE,
          journal: null
        }

        return response
      }

      await this.journalRepository.update(ref, { isDeleted: true });

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        journal: null
      }

      return response
    } catch (error) {
      const response = {
        message: error?.message,
        journal: null
      }

      return response
    }
  }

  async restore(ref: number): Promise<{ message: string, journal: Journal | null }> {
    try {
      const journal = await this.journalRepository.findOne({ where: { uid: ref } });

      if (!journal) {
        const response = {
          message: process.env.NOT_FOUND_MESSAGE,
          journal: null
        }

        return response
      }

      await this.journalRepository.update(ref, { isDeleted: false });

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        journal: null
      }

      return response
    } catch (error) {
      const response = {
        message: error?.message,
        journal: null
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
