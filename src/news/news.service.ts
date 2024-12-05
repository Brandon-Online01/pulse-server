import { Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { Status } from 'src/lib/enums/enums';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>
  ) { }

  async create(createNewsDto: CreateNewsDto): Promise<{ message: string }> {
    try {
      const news = await this.newsRepository.save(createNewsDto);

      if (!news) throw new Error(process.env.NOT_FOUND_MESSAGE);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: news
      }

      return response;
    } catch (error) {
      const response = {
        message: error?.message
      }

      return response;
    }
  }

  async findAll(): Promise<{ message: string, data: News[] }> {
    try {
      const news = await this.newsRepository.find({ where: { isDeleted: false } });

      if (!news) throw new Error(process.env.NOT_FOUND_MESSAGE);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: news
      }

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        data: null
      }

      return response;
    }
  }

  async findOne(referenceCode: number): Promise<{ message: string, data: News }> {
    try {
      const news = await this.newsRepository.findOne({ where: { uid: referenceCode, isDeleted: false } });

      if (!news) throw new Error(process.env.NOT_FOUND_MESSAGE);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        data: news
      }

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        data: null
      }

      return response;
    }
  }

  async update(referenceCode: number, updateNewsDto: UpdateNewsDto): Promise<{ message: string }> {
    try {
      const news = await this.newsRepository.update(referenceCode, updateNewsDto);

      if (!news) throw new Error(process.env.NOT_FOUND_MESSAGE);

      const response = {
        message: process.env.SUCCESS_MESSAGE
      }

      return response;
    } catch (error) {
      const response = {
        message: error?.message
      }

      return response;
    }
  }

  async remove(referenceCode: number): Promise<{ message: string }> {
    try {
      const news = await this.newsRepository.update(referenceCode, { isDeleted: true });

      if (!news) throw new Error(process.env.NOT_FOUND_MESSAGE);

      const response = {
        message: process.env.SUCCESS_MESSAGE
      }

      return response;
    } catch (error) {
      const response = {
        message: error?.message
      }

      return response;
    }
  }

  async restore(referenceCode: number): Promise<{ message: string }> {
    try {
      await this.newsRepository.update(
        { uid: referenceCode },
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
