import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository, DeepPartial } from 'typeorm';
import { Status } from 'src/lib/enums/enums';

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

  async findAll(): Promise<{ message: string, clients: Client[] | null }> {
    try {
      const clients = await this.clientsRepository.find({
        where: {
          isDeleted: false
        }
      });

      if (!clients) {
        throw new NotFoundException(process.env.SEARCH_ERROR_MESSAGE);
      }

      const response = {
        message: process.env.SUCCESS_MESSAGE,
        clients: clients
      }

      return response;
    } catch (error) {
      const response = {
        message: error?.message,
        clients: null
      }

      return response;
    }
  }

  async findOne(ref: number): Promise<{ message: string, client: Client | null }> {
    try {
      const client = await this.clientsRepository.findOne({
        where: {
          uid: ref,
          isDeleted: false
        },
        relations: ['user']
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
