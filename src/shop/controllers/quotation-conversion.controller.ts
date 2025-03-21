import {
	Controller,
	Post,
	Body,
	Param,
	Get,
	UseGuards,
	Request,
	BadRequestException,
	NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/role.decorator';
import { AccessLevel } from '../../lib/enums/user.enums';
import {
	ApiTags,
	ApiOperation,
	ApiParam,
	ApiBody,
	ApiResponse,
	ApiBadRequestResponse,
	ApiNotFoundResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { QuotationConversionService } from '../services/quotation-conversion.service';
import { QuotationConversionDto } from '../dto/quotation-conversion.dto';
import { AuthenticatedRequest } from '../../lib/interfaces/authenticated-request.interface';
import { UserService } from '../../user/user.service';

@ApiTags('quotation-conversion')
@Controller('quotations')
@UseGuards(AuthGuard, RoleGuard)
export class QuotationConversionController {
	constructor(
		private readonly quotationConversionService: QuotationConversionService,
		private readonly userService: UserService,
	) {}

	@Post(':id/convert')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER)
	@ApiOperation({ summary: 'Convert quotation to order' })
	@ApiParam({ name: 'id', description: 'Quotation ID' })
	@ApiBody({ type: QuotationConversionDto })
	@ApiResponse({ status: 200, description: 'Quotation successfully converted to order' })
	@ApiBadRequestResponse({ description: 'Invalid quotation state or data' })
	@ApiNotFoundResponse({ description: 'Quotation not found' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	async convertToOrder(
		@Param('id') id: string,
		@Body() conversionData: QuotationConversionDto,
		@Request() req: AuthenticatedRequest,
	) {
		if (!id || isNaN(Number(id))) {
			throw new BadRequestException('Invalid quotation ID');
		}

		const quotationId = Number(id);
		const userResult = await this.userService.findOne(req.user.uid);
		if (!userResult.user) {
			throw new NotFoundException('User not found');
		}
		const user = userResult.user;
		const orgId = req.user?.org?.uid;
		const branchId = req.user?.branch?.uid;

		return this.quotationConversionService.convertToOrder(quotationId, conversionData, user, orgId, branchId);
	}

	@Get(':ref/conversion-status')
	@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPERVISOR)
	@ApiOperation({ summary: 'Get quotation conversion status' })
	@ApiParam({ name: 'ref', description: 'Quotation reference' })
	@ApiResponse({ status: 200, description: 'Returns conversion status' })
	@ApiNotFoundResponse({ description: 'Quotation not found' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	async getConversionStatus(@Param('ref') ref: string) {
		if (!ref) {
			throw new BadRequestException('Invalid quotation reference');
		}

		const quotationRef = Number(ref);
		return this.quotationConversionService.getConversionStatus(quotationRef);
	}

	@Post(':ref/conversion/rollback')
	@Roles(AccessLevel.ADMIN)
	@ApiOperation({ summary: 'Rollback a conversion' })
	@ApiParam({ name: 'ref', description: 'Quotation reference' })
	@ApiResponse({ status: 200, description: 'Conversion successfully rolled back' })
	@ApiBadRequestResponse({ description: 'Invalid request' })
	@ApiNotFoundResponse({ description: 'Quotation not found' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	async rollbackConversion(@Param('ref') ref: string, @Request() req: AuthenticatedRequest) {
		if (!ref) {
			throw new BadRequestException('Invalid quotation reference');
		}

		const quotationRef = Number(ref);
		const userResult = await this.userService.findOne(req.user.uid);
		if (!userResult.user) {
			throw new NotFoundException('User not found');
		}
		const user = userResult.user;
		return this.quotationConversionService.rollbackConversion(quotationRef, user);
	}
}
