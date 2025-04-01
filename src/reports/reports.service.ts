import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { ReportType } from './constants/report-types.enum';
import { ReportParamsDto } from './dto/report-params.dto';
import { MainReportGenerator } from './generators/main-report.generator';
import { QuotationReportGenerator } from './generators/quotation-report.generator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReportsService {
	private readonly CACHE_PREFIX = 'reports:';
	private readonly CACHE_TTL: number;

	constructor(
		@InjectRepository(Report)
		private reportRepository: Repository<Report>,
		private mainReportGenerator: MainReportGenerator,
		private quotationReportGenerator: QuotationReportGenerator,
		@Inject(CACHE_MANAGER)
		private cacheManager: Cache,
		private readonly configService: ConfigService,
	) {
		this.CACHE_TTL = this.configService.get<number>('CACHE_EXPIRATION_TIME') || 300;
	}

	private getCacheKey(params: ReportParamsDto): string {
		const { type, organisationId, branchId, dateRange, filters } = params;

		// For quotation reports, include clientId in the cache key
		const clientIdStr = type === ReportType.QUOTATION && filters?.clientId ? `_client${filters.clientId}` : '';

		const dateStr = dateRange ? `_${dateRange.start.toISOString()}_${dateRange.end.toISOString()}` : '';

		return `${this.CACHE_PREFIX}${type}_org${organisationId}${
			branchId ? `_branch${branchId}` : ''
		}${clientIdStr}${dateStr}`;
	}

	async create(createReportDto: CreateReportDto) {
		return 'This action adds a new report';
	}

	async findAll() {
		return this.reportRepository.find();
	}

	async findOne(id: number) {
		return this.reportRepository.findOne({
			where: { uid: id },
			relations: ['organisation', 'branch', 'owner'],
		});
	}

	async update(id: number, updateReportDto: UpdateReportDto) {
		return `This action updates a #${id} report`;
	}

	async remove(id: number) {
		return this.reportRepository.delete(id);
	}

	async generateReport(params: ReportParamsDto, currentUser: any): Promise<Record<string, any>> {
		// Check cache first
		const cacheKey = this.getCacheKey(params);
		const cachedReport = await this.cacheManager.get<Record<string, any>>(cacheKey);

		if (cachedReport) {
			return {
				...cachedReport,
				fromCache: true,
			};
		}

		// Generate report data based on type
		let reportData: Record<string, any>;

		switch (params.type) {
			case ReportType.MAIN:
				reportData = await this.mainReportGenerator.generate(params);
				break;
			case ReportType.QUOTATION:
				reportData = await this.quotationReportGenerator.generate(params);
				break;
			case ReportType.USER:
				// Will be implemented later
				throw new Error('User report type not implemented yet');
			case ReportType.SHIFT:
				// Will be implemented later
				throw new Error('Shift report type not implemented yet');
			default:
				throw new Error(`Unknown report type: ${params.type}`);
		}

		// Prepare the report response with metadata
		const report = {
			name: params.name || `${params.type} Report`,
			type: params.type,
			generatedAt: new Date(),
			filters: {
				organisationId: params.organisationId,
				branchId: params.branchId,
				dateRange: params.dateRange,
				...params.filters, // Include any additional filters
			},
			generatedBy: {
				uid: currentUser.uid,
			},
			...reportData,
		};

		// Cache the report
		await this.cacheManager.set(cacheKey, report, this.CACHE_TTL);

		// Return the report data directly without saving to database
		return report;
	}
}
