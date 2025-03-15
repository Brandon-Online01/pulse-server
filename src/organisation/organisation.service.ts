import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from './entities/organisation.entity';
import { GeneralStatus } from '../lib/enums/status.enums';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class OrganisationService {
	constructor(
		@InjectRepository(Organisation)
		private organisationRepository: Repository<Organisation>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	private readonly CACHE_PREFIX = 'organisation';
	private readonly ALL_ORGS_CACHE_KEY = `${this.CACHE_PREFIX}:all`;
	private getOrgCacheKey(ref: string): string {
		return `${this.CACHE_PREFIX}:${ref}`;
	}

	// Default cache TTL (in seconds)
	private readonly DEFAULT_CACHE_TTL = 3600; // 1 hour

	private async clearOrganisationCache(ref?: string): Promise<void> {
		// Clear the all organisations cache
		await this.cacheManager.del(this.ALL_ORGS_CACHE_KEY);
		
		// If a specific ref is provided, clear that organisation's cache
		if (ref) {
			await this.cacheManager.del(this.getOrgCacheKey(ref));
		}
	}

	async create(createOrganisationDto: CreateOrganisationDto): Promise<{ message: string }> {
		try {
			const organisation = await this.organisationRepository.save(createOrganisationDto);

			if (!organisation) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Clear cache after creating a new organisation
			await this.clearOrganisationCache();

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
			// Try to get from cache first
			const cachedOrganisations = await this.cacheManager.get<Organisation[]>(this.ALL_ORGS_CACHE_KEY);
			
			if (cachedOrganisations) {
				return {
					organisations: cachedOrganisations,
					message: process.env.SUCCESS_MESSAGE,
				};
			}

			// If not in cache, fetch from database
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

			// Store in cache
			await this.cacheManager.set(this.ALL_ORGS_CACHE_KEY, organisations, {
				ttl: this.DEFAULT_CACHE_TTL
			});

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
			// Try to get from cache first
			const cacheKey = this.getOrgCacheKey(ref);
			const cachedOrganisation = await this.cacheManager.get<Organisation>(cacheKey);
			
			if (cachedOrganisation) {
				return {
					organisation: cachedOrganisation,
					message: process.env.SUCCESS_MESSAGE,
				};
			}

			// If not in cache, fetch from database
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

			// Store in cache
			await this.cacheManager.set(cacheKey, organisation, {
				ttl: this.DEFAULT_CACHE_TTL
			});

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

			// Clear cache after updating
			await this.clearOrganisationCache(ref);

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

			// Clear cache after removing
			await this.clearOrganisationCache(ref);

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

			// Clear cache after restoring
			await this.clearOrganisationCache(ref);

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
