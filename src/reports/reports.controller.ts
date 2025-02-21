import { ReportsService } from './reports.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Controller, UseGuards, Logger } from '@nestjs/common';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';

@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('reports')
export class ReportsController {
	private readonly logger = new Logger(ReportsController.name);

	constructor(private readonly reportsService: ReportsService) {}
}
