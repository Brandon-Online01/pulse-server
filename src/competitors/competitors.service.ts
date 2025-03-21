import { Injectable, NotFoundException, BadRequestException, Inject, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, FindOptionsWhere, Like, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CreateCompetitorDto } from './dto/create-competitor.dto';
import { UpdateCompetitorDto } from './dto/update-competitor.dto';
import { Competitor } from './entities/competitor.entity';
import { User } from '../user/entities/user.entity';
import { PaginatedResponse } from '../lib/interfaces/paginated-response.interface';
import { CompetitorStatus, GeofenceType } from '../lib/enums/competitor.enums';
import * as crypto from 'crypto';
import { Organisation } from '../organisation/entities/organisation.entity';
import { Branch } from '../branch/entities/branch.entity';
import { OrganisationSettings } from '../organisation/entities/organisation-settings.entity';

@Injectable()
export class CompetitorsService {
  private readonly CACHE_TTL: number;
  private readonly CACHE_PREFIX = 'competitor:';
  private readonly logger = new Logger(CompetitorsService.name);

  constructor(
    @InjectRepository(Competitor)
    private readonly competitorRepository: Repository<Competitor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(OrganisationSettings)
    private readonly organisationSettingsRepository: Repository<OrganisationSettings>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.CACHE_TTL = +this.configService.get<number>('CACHE_EXPIRATION_TIME', 300);
  }

  // Helper method to get organization settings
  private async getOrganisationSettings(orgId: number): Promise<OrganisationSettings | null> {
    if (!orgId) return null;
    
    try {
      return await this.organisationSettingsRepository.findOne({
        where: { organisationUid: orgId }
      });
    } catch (error) {
      this.logger.error(`Error fetching organisation settings: ${error.message}`, error.stack);
      return null;
    }
  }

  private getCacheKey(key: string | number): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  private async clearCompetitorCache(competitorId?: number): Promise<void> {
    try {
      if (competitorId) {
        await this.cacheManager.del(this.getCacheKey(competitorId));
        await this.cacheManager.del(this.getCacheKey(`detail:${competitorId}`));
      }
      
      // Clear list cache keys with pattern matching
      await this.cacheManager.del(this.getCacheKey('list'));
      await this.cacheManager.del(this.getCacheKey('analytics'));
      await this.cacheManager.del(this.getCacheKey('by-industry'));
      await this.cacheManager.del(this.getCacheKey('by-threat'));
      await this.cacheManager.del(this.getCacheKey('by-name'));
    } catch (error) {
      this.logger.error(`Error clearing competitor cache: ${error.message}`, error.stack);
    }
  }

  async create(createCompetitorDto: CreateCompetitorDto, creator: User, orgId?: number, branchId?: number) {
    try {
      // Create a new competitor instance
      const newCompetitor = new Competitor();
      
      // Copy properties from DTO
      Object.assign(newCompetitor, createCompetitorDto);
      
      // Handle organization and branch assignment
      if (orgId) {
        const organisation = await this.organisationRepository.findOne({ where: { uid: orgId } });
        if (organisation) {
          newCompetitor.organisation = organisation;
        }
      }
      
      if (branchId) {
        const branch = await this.branchRepository.findOne({ where: { uid: branchId } });
        if (branch) {
          newCompetitor.branch = branch;
        }
      }
      
      // Set creator reference
      if (creator) {
        newCompetitor.createdBy = creator;
      }
      
      // Generate a unique reference code if not provided
      if (!newCompetitor.competitorRef) {
        newCompetitor.competitorRef = `COMP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      }

      // Handle geofencing settings
      if (createCompetitorDto.enableGeofence) {
        // If enabling geofencing, ensure we have coordinates
        if (!newCompetitor.latitude || !newCompetitor.longitude) {
          throw new BadRequestException('Coordinates are required for geofencing');
        }
        
        // Set default geofence type if not provided
        if (!newCompetitor.geofenceType) {
          newCompetitor.geofenceType = GeofenceType.NOTIFY;
        }
        
        // Get default radius from organization settings if available
        let defaultRadius = 500; // Default fallback value
        
        if (orgId) {
          const orgSettings = await this.getOrganisationSettings(orgId);
          if (orgSettings?.geofenceDefaultRadius) {
            defaultRadius = orgSettings.geofenceDefaultRadius;
          }
        }
        
        // Set default radius if not provided
        if (!newCompetitor.geofenceRadius) {
          newCompetitor.geofenceRadius = defaultRadius;
        }
      } else if (createCompetitorDto.enableGeofence === false) {
        // If explicitly disabling geofencing
        newCompetitor.geofenceType = GeofenceType.NONE;
      }

      // Save the new competitor
      const savedCompetitor = await this.competitorRepository.save(newCompetitor);
      
      await this.clearCompetitorCache();
      
      return {
        message: 'Competitor created successfully',
        competitor: savedCompetitor,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error creating competitor',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(
    filters?: {
      status?: CompetitorStatus; 
      industry?: string;
      isDirect?: boolean;
      name?: string;
      minThreatLevel?: number;
      organisationId?: number;
      branchId?: number;
      isDeleted?: boolean;
    },
    page: number = 1,
    limit: number = Number(process.env.DEFAULT_PAGE_LIMIT || 10),
    orgId?: number,
    branchId?: number,
  ): Promise<PaginatedResponse<Competitor>> {
    // Create a specific cache key based on all parameters
    const cacheKey = this.getCacheKey(`list:${JSON.stringify({ filters, page, limit, orgId, branchId })}`);
    
    // Try to get from cache first
    const cachedResult = await this.cacheManager.get<PaginatedResponse<Competitor>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    // Build query
    const where: FindOptionsWhere<Competitor> = {
      isDeleted: filters?.isDeleted !== undefined ? filters.isDeleted : false,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.industry) {
      where.industry = filters.industry;
    }

    if (filters?.isDirect !== undefined) {
      where.isDirect = filters.isDirect;
    }

    if (filters?.name) {
      where.name = Like(`%${filters.name}%`);
    }

    if (filters?.minThreatLevel) {
      where.threatLevel = In(Array.from({ length: 5 - filters.minThreatLevel + 1 }, (_, i) => i + filters.minThreatLevel));
    }

    // Priority order: filters > params > JWT
    const effectiveOrgId = filters?.organisationId || orgId;
    const effectiveBranchId = filters?.branchId || branchId;

    if (effectiveOrgId) {
      where.organisation = { uid: effectiveOrgId };
    }

    if (effectiveBranchId) {
      where.branch = { uid: effectiveBranchId };
    }

    try {
      const [competitors, total] = await this.competitorRepository.findAndCount({
        where,
        relations: ['organisation', 'branch', 'createdBy'],
        order: { name: 'ASC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const result: PaginatedResponse<Competitor> = {
        data: competitors,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Success',
      };

      // Cache the result
      await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
      return result;
    } catch (error) {
      this.logger.error(`Error finding competitors: ${error.message}`, error.stack);
      throw new BadRequestException(`Error finding competitors: ${error.message}`);
    }
  }

  async findOne(id: number, orgId?: number, branchId?: number): Promise<{ message: string; competitor: Competitor | null }> {
    const cacheKey = this.getCacheKey(`detail:${id}:${orgId}:${branchId}`);
    
    const cached = await this.cacheManager.get<{ message: string; competitor: Competitor | null }>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const where: FindOptionsWhere<Competitor> = { 
      uid: id, 
      isDeleted: false 
    };
    
    if (orgId) {
      where.organisation = { uid: orgId };
    }
    
    if (branchId) {
      where.branch = { uid: branchId };
    }
    
    const competitor = await this.competitorRepository.findOne({
      where,
      relations: ['organisation', 'branch', 'createdBy'],
    });

    if (!competitor) {
      return { message: `Competitor with ID ${id} not found`, competitor: null };
    }

    const result = { message: 'Success', competitor };
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  async findOneByRef(ref: string, orgId?: number, branchId?: number): Promise<{ message: string; competitor: Competitor | null }> {
    const cacheKey = this.getCacheKey(`ref:${ref}:${orgId}:${branchId}`);
    
    const cached = await this.cacheManager.get<{ message: string; competitor: Competitor | null }>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const where: FindOptionsWhere<Competitor> = { 
      competitorRef: ref, 
      isDeleted: false 
    };
    
    if (orgId) {
      where.organisation = { uid: orgId };
    }
    
    if (branchId) {
      where.branch = { uid: branchId };
    }
    
    const competitor = await this.competitorRepository.findOne({
      where,
      relations: ['organisation', 'branch', 'createdBy'],
    });

    if (!competitor) {
      return { message: `Competitor with reference ${ref} not found`, competitor: null };
    }

    const result = { message: 'Success', competitor };
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  async update(id: number, updateCompetitorDto: UpdateCompetitorDto, orgId?: number, branchId?: number) {
    try {
      // Find the existing competitor
      const competitor = await this.competitorRepository.findOne({
        where: { 
          uid: id,
          ...(orgId && { organisation: { uid: orgId } }),
          ...(branchId && { branch: { uid: branchId } }),
        },
        relations: ['organisation', 'branch', 'createdBy'],
      });
      
      if (!competitor) {
        throw new HttpException('Competitor not found', HttpStatus.NOT_FOUND);
      }
      
      // Copy properties from DTO
      Object.assign(competitor, updateCompetitorDto);
      
      // Update organisation if different
      if (updateCompetitorDto.organisationId) {
        const organisation = await this.organisationRepository.findOne({ 
          where: { uid: updateCompetitorDto.organisationId } 
        });
        if (organisation) {
          competitor.organisation = organisation;
        }
      }
      
      // Update branch if different
      if (updateCompetitorDto.branchId) {
        const branch = await this.branchRepository.findOne({ 
          where: { uid: updateCompetitorDto.branchId } 
        });
        if (branch) {
          competitor.branch = branch;
        }
      }

      // Handle geofencing settings update
      if (updateCompetitorDto.enableGeofence !== undefined) {
        if (updateCompetitorDto.enableGeofence) {
          // Ensure we have coordinates for geofencing
          if (!competitor.latitude || !competitor.longitude) {
            throw new BadRequestException('Coordinates are required for geofencing');
          }
          
          // Set default geofence type if not already set
          if (!competitor.geofenceType || competitor.geofenceType === GeofenceType.NONE) {
            competitor.geofenceType = GeofenceType.NOTIFY;
          }
          
          // Get default radius from organization settings if available
          let defaultRadius = 500; // Default fallback value
          const competitorOrgId = competitor.organisation?.uid || orgId;
          
          if (competitorOrgId) {
            const orgSettings = await this.getOrganisationSettings(competitorOrgId);
            if (orgSettings?.geofenceDefaultRadius) {
              defaultRadius = orgSettings.geofenceDefaultRadius;
            }
          }
          
          // Set default radius if not already set
          if (!competitor.geofenceRadius) {
            competitor.geofenceRadius = defaultRadius;
          }
        } else {
          // If explicitly disabling geofencing
          competitor.geofenceType = GeofenceType.NONE;
        }
      }
      
      // Save the updated competitor
      const updatedCompetitor = await this.competitorRepository.save(competitor);
      
      await this.clearCompetitorCache(id);
      
      return {
        message: 'Competitor updated successfully',
        competitor: updatedCompetitor,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error updating competitor',
          error: error.message,
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
    const { competitor } = await this.findOne(id, orgId, branchId);
    
    if (!competitor) {
      throw new NotFoundException(`Competitor with ID ${id} not found`);
    }
    
    // Soft delete by setting isDeleted flag
    competitor.isDeleted = true;
    
    await this.competitorRepository.save(competitor);
    await this.clearCompetitorCache(id);
    
    return { message: 'Competitor deleted successfully' };
  }

  async hardRemove(id: number, orgId?: number, branchId?: number): Promise<{ message: string }> {
    const { competitor } = await this.findOne(id, orgId, branchId);
    
    if (!competitor) {
      throw new NotFoundException(`Competitor with ID ${id} not found`);
    }
    
    await this.competitorRepository.remove(competitor);
    await this.clearCompetitorCache(id);
    
    return { message: 'Competitor permanently deleted' };
  }

  async findByName(name: string, orgId?: number, branchId?: number): Promise<Competitor[]> {
    const cacheKey = this.getCacheKey(`by-name:${name}:${orgId}:${branchId}`);
    
    const cached = await this.cacheManager.get<Competitor[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const where: FindOptionsWhere<Competitor> = { 
      name: Like(`%${name}%`),
      isDeleted: false 
    };
    
    if (orgId) {
      where.organisation = { uid: orgId };
    }
    
    if (branchId) {
      where.branch = { uid: branchId };
    }
    
    const competitors = await this.competitorRepository.find({
      where,
      relations: ['organisation', 'branch'],
    });

    await this.cacheManager.set(cacheKey, competitors, this.CACHE_TTL);
    return competitors;
  }

  async findByThreatLevel(minThreatLevel: number = 0, orgId?: number, branchId?: number): Promise<Competitor[]> {
    const cacheKey = this.getCacheKey(`by-threat:${minThreatLevel}:${orgId}:${branchId}`);
    
    const cached = await this.cacheManager.get<Competitor[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const where: FindOptionsWhere<Competitor> = { 
      isDeleted: false
    };
    
    if (minThreatLevel > 0) {
      Object.assign(where, {
        threatLevel: In(Array.from({ length: 5 - minThreatLevel + 1 }, (_, i) => i + minThreatLevel))
      });
    }
    
    if (orgId) {
      where.organisation = { uid: orgId };
    }
    
    if (branchId) {
      where.branch = { uid: branchId };
    }
    
    const competitors = await this.competitorRepository.find({
      where,
      relations: ['organisation', 'branch'],
      order: { threatLevel: 'DESC' },
    });

    await this.cacheManager.set(cacheKey, competitors, this.CACHE_TTL);
    return competitors;
  }

  async getCompetitorsByIndustry(orgId?: number, branchId?: number): Promise<Record<string, number>> {
    const cacheKey = this.getCacheKey(`by-industry:${orgId}:${branchId}`);
    
    const cached = await this.cacheManager.get<Record<string, number>>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const where: FindOptionsWhere<Competitor> = { 
      industry: Not(IsNull()),
      isDeleted: false
    };
    
    if (orgId) {
      where.organisation = { uid: orgId };
    }
    
    if (branchId) {
      where.branch = { uid: branchId };
    }
    
    const competitors = await this.competitorRepository.find({
      where,
      select: ['industry'],
    });

    // Count competitors by industry
    const industriesCount: Record<string, number> = {};
    competitors.forEach(competitor => {
      if (competitor.industry) {
        industriesCount[competitor.industry] = (industriesCount[competitor.industry] || 0) + 1;
      }
    });

    await this.cacheManager.set(cacheKey, industriesCount, this.CACHE_TTL);
    return industriesCount;
  }

  async getCompetitorAnalytics(orgId?: number, branchId?: number): Promise<any> {
    const cacheKey = this.getCacheKey(`analytics:${orgId}:${branchId}`);
    
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const where: FindOptionsWhere<Competitor> = {
        isDeleted: false,
      };

      if (orgId) {
        where.organisation = { uid: orgId };
      }
      
      if (branchId) {
        where.branch = { uid: branchId };
      }

      const competitors = await this.competitorRepository.find({ 
        where,
        relations: ['organisation', 'branch'],
        cache: true,  // Enable query caching
      });
      
      // Calculate analytics
      const totalCompetitors = competitors.length;
      const directCompetitors = competitors.filter(c => c.isDirect).length;
      const indirectCompetitors = totalCompetitors - directCompetitors;
      
      // Get average threat level
      const competitorsWithThreatLevel = competitors.filter(c => c.threatLevel !== null && c.threatLevel !== undefined);
      const averageThreatLevel = competitorsWithThreatLevel.length > 0 
        ? +(competitorsWithThreatLevel.reduce((sum, c) => sum + c.threatLevel, 0) / competitorsWithThreatLevel.length).toFixed(2)
        : 0;
      
      // Get top threats
      const topThreats = [...competitors]
        .sort((a, b) => (b.threatLevel || 0) - (a.threatLevel || 0))
        .slice(0, 5)
        .map(c => ({
          uid: c.uid,
          name: c.name,
          threatLevel: c.threatLevel,
          industry: c.industry,
          competitorRef: c.competitorRef
        }));
      
      // Group by industry
      const byIndustry = competitors.reduce((acc, comp) => {
        if (comp.industry) {
          acc[comp.industry] = (acc[comp.industry] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const result = {
        totalCompetitors,
        directCompetitors,
        indirectCompetitors,
        averageThreatLevel,
        topThreats,
        byIndustry,
        lastUpdated: new Date().toISOString(),
      };
      
      await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
      return result;
    } catch (error) {
      this.logger.error(`Error getting competitor analytics: ${error.message}`, error.stack);
      throw new BadRequestException(`Error getting competitor analytics: ${error.message}`);
    }
  }
}
