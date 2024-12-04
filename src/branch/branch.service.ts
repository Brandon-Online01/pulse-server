import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>
  ) { }

  async create(createBranchDto: CreateBranchDto) {
    return 'This action adds a new branch';
  }

  async findAll() {
    return `This action returns all branch`;
  }

  async findOne(referenceCode: string) {
    return `This action returns a #${referenceCode} branch`;
  }

  async update(referenceCode: string, updateBranchDto: UpdateBranchDto) {
    return `This action updates a #${referenceCode} branch`;
  }

  async remove(referenceCode: string) {
    return `This action removes a #${referenceCode} branch`;
  }
}
