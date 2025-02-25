import { PartialType } from '@nestjs/swagger';
import { CreateClaimDto } from './create-claim.dto';
import { ClaimStatus } from '../../lib/enums/finance.enums';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClaimDto extends PartialType(CreateClaimDto) {
    @IsOptional()
    @ApiProperty({ enum: ClaimStatus, description: 'Status of the claim' })
    @IsEnum(ClaimStatus)
    status: ClaimStatus = ClaimStatus.PENDING;
}
