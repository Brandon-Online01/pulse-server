import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banners } from './entities/banners.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
    constructor(
        @InjectRepository(Banners)
        private bannersRepository: Repository<Banners>
    ) {}

    async create(createBannerDto: CreateBannerDto) {
        return await this.bannersRepository.save(createBannerDto);
    }

    async findAll() {
        return await this.bannersRepository.find();
    }

    async findOne(id: number) {
        return await this.bannersRepository.findOne({ where: { uid: id } });
    }

    async update(id: number, updateBannerDto: UpdateBannerDto) {
        return await this.bannersRepository.update(id, updateBannerDto);
    }

    async remove(id: number) {
        return await this.bannersRepository.delete(id);
    }
} 