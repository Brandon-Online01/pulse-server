import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository, DeepPartial } from 'typeorm';
import { GeneralStatus } from '../lib/enums/status.enums';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>
  ) { }

  async create(createClientDto: CreateClientDto): Promise<{ message: string }> {
    try {
      const client = await this.clientsRepository.save(createClientDto as unknown as DeepPartial<Client>);

      if (!client) {
        throw new NotFoundException(process.env.CREATE_ERROR_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
      }

      return response;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = Number(process.env.DEFAULT_PAGE_LIMIT)
  ): Promise<PaginatedResponse<Client>> {
    try {
      const queryBuilder = this.clientsRepository
        .createQueryBuilder('client')
        .where('client.isDeleted = :isDeleted', { isDeleted: false });

      // Add pagination
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('client.createdAt', 'DESC');

      const [clients, total] = await queryBuilder.getManyAndCount();

      if (!clients) {
        throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
      }

      return {
        data: clients,
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

  async findOne(ref: number): Promise<{ message: string, client: Client | null }> {
    try {
      const client = await this.clientsRepository.findOne({
        where: {
          uid: ref,
          isDeleted: false
        },
      });

      if (!client) {
        throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        client: client
      }

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        client: null
      }

      return response;
    }
  }

  async update(ref: number, updateClientDto: UpdateClientDto): Promise<{ message: string }> {
    try {
      await this.clientsRepository.update(ref, updateClientDto as unknown as DeepPartial<Client>);

      const response = {
        message: process.env.SUCCESS_MESSAGE,
      }

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
      const client = await this.clientsRepository.findOne({
        where: { uid: ref, isDeleted: false }
      });

      if (!client) {
        throw new NotFoundException(process.env.DELETE_ERROR_MESSAGE);
      };

      await this.clientsRepository.update(
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
      await this.clientsRepository.update(
        { uid: ref },
        {
          isDeleted: false,
          status: GeneralStatus.ACTIVE
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
