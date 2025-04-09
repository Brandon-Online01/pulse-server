import { ApiProperty } from '@nestjs/swagger';
import { MetricType } from '../../lib/enums/licenses';

export class MetricUsageDto {
	@ApiProperty({
		description: 'Current value of the metric',
		example: 100,
	})
	currentValue: number;

	@ApiProperty({
		description: 'Limit of the metric',
		example: 1000,
	})
	limit: number;

	@ApiProperty({
		description: 'Utilization percentage',
		example: 50,
	})
	utilizationPercentage: number;

	@ApiProperty({
		description: 'Last updated timestamp',
		example: '2023-01-01T00:00:00.000Z',
	})
	lastUpdated: Date;

	@ApiProperty({
		description: 'Additional metadata related to the metric',
		type: 'object',
		additionalProperties: true,
	})
	metadata?: Record<string, any>;
}

export class ConsolidatedLicenseUsageDto {
	@ApiProperty({ description: 'License ID', example: '1234567890' })
	licenseId: string;

	@ApiProperty({
		description: 'Utilization metrics organized by type',
		type: 'object',
		additionalProperties: {
			type: 'object',
			$ref: '#/components/schemas/MetricUsageDto',
		},
	})
	utilization: Record<MetricType, MetricUsageDto>;

	@ApiProperty({ description: 'Timestamp of the consolidated report', example: '2023-01-01T00:00:00.000Z' })
	timestamp: Date;
}
