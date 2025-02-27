import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from './entities/organisation.entity';
import { GeneralStatus } from '../lib/enums/status.enums';

@Injectable()
export class OrganisationService {
	constructor(
		@InjectRepository(Organisation)
		private organisationRepository: Repository<Organisation>,
	) {}

	async create(createOrganisationDto: CreateOrganisationDto): Promise<{ message: string }> {
		try {
			const organisation = await this.organisationRepository.save(createOrganisationDto);

			if (!organisation) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async findAll(): Promise<{ organisations: Organisation[] | null; message: string }> {
		try {
			const organisations = await this.organisationRepository.find({
				where: { isDeleted: false },
				relations: ['branches'],
				select: {
					branches: {
						uid: true,
						name: true,
						phone: true,
						email: true,
						website: true,
					},
				},
			});

			if (!organisations) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			return {
				organisations,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				organisations: null,
				message: error?.message,
			};
		}
	}

	async findOne(ref: string): Promise<{ organisation: Organisation | null; message: string }> {
		try {
			const organisation = await this.organisationRepository.findOne({
				where: { ref, isDeleted: false },
				relations: ['branches', 'settings', 'appearance', 'hours', 'assets', 'products', 'clients', 'users', 'resellers', 'banners', 'news', 'journals', 'docs', 'claims', 'attendances', 'reports', 'quotations', 'tasks', 'notifications', 'trackings', 'communicationLogs'],
			});

			if (!organisation) {
				return {
					organisation: null,
					message: process.env.NOT_FOUND_MESSAGE,
				};
			}

			return {
				organisation,
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				organisation: null,
				message: error?.message,
			};
		}
	}

	async update(ref: string, updateOrganisationDto: UpdateOrganisationDto): Promise<{ message: string }> {
		try {
			await this.organisationRepository.update({ ref }, updateOrganisationDto);

			const updatedOrganisation = await this.organisationRepository.findOne({
				where: { ref, isDeleted: false },
			});

			if (!updatedOrganisation) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async remove(ref: string): Promise<{ message: string }> {
		try {
			const organisation = await this.organisationRepository.findOne({
				where: { ref, isDeleted: false },
			});

			if (!organisation) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			await this.organisationRepository.update({ ref }, { isDeleted: true });

			return {
				message: process.env.SUCCESS_MESSAGE,
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	async restore(ref: string): Promise<{ message: string }> {
		try {
			await this.organisationRepository.update(
				{ ref },
				{
					isDeleted: false,
					status: GeneralStatus.ACTIVE,
				},
			);

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			};

			return response;
		}
	}
}
