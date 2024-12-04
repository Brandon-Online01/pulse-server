import { Injectable } from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from './entities/organisation.entity';

@Injectable()
export class OrganisationService {
  constructor(
    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>
  ) { }

  create(createOrganisationDto: CreateOrganisationDto) {
    return 'This action adds a new organisation';
  }

  findAll() {
    return `This action returns all organisation`;
  }

  findOne(referenceCode: string) {
    return `This action returns a ${referenceCode} organisation`;
  }

  update(referenceCode: string, updateOrganisationDto: UpdateOrganisationDto) {
    return `This action updates a ${referenceCode} organisation`;
  }

  remove(referenceCode: string) {
    return `This action removes a ${referenceCode} organisation`;
  }
}
