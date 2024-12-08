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

  async findAll(): Promise<{ message: string, journals: Journal[] | null }> {
    try {
      const journals = await this.journalRepository.find({
        relations: ['owner'],
        order: {
          timestamp: 'DESC'
        }
      });


      if (journals?.length === 0) {
        const response = {
          message: process.env.NOT_FOUND_MESSAGE,
          journals: null
        }

        return response
      }

      const response = {
        journals,
        message: process.env.SUCCESS_MESSAGE,
      }

      return response
    } catch (error) {
      const response = {
        message: error?.message,
        journals: null
      }

      return response
    }
  }

  async findOne(ref: number): Promise<{ message: string, journal: Journal | null }> {
    try {
      const journal = await this.journalRepository.findOne({
        where: { uid: ref },
        relations: ['owner']
      });

      if (!journal) {
        const response = {
          message: process.env.NOT_FOUND_MESSAGE,
          journal: null
        }

        return response
      }

      const response = {
        journal,
        message: process.env.SUCCESS_MESSAGE
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

  public async journalsByUser(ref: number): Promise<{ message: string, journals: Journal[] }> {
    try {
      const journals = await this.journalRepository.find({
        where: { owner: { uid: ref } }
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
        message: `could not get journals by user - ${error?.message}`,
        journals: null
      }

      return response;
    }
  }

  async update(ref: number, updateJournalDto: UpdateJournalDto) {
    try {
      const journal = await this.journalRepository.findOne({ where: { uid: ref } });

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
}
