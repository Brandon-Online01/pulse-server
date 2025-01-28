import { ApiProperty } from '@nestjs/swagger';
import { Claim } from '../entities/claim.entity';

export class ClaimStatsDto {
    @ApiProperty()
    total: number;

    @ApiProperty()
    pending: number;

    @ApiProperty()
    approved: number;

    @ApiProperty()
    declined: number;

    @ApiProperty()
    paid: number;
}

export class ClaimResponseDto {
    @ApiProperty()
    message: string;

    @ApiProperty({ type: () => Claim, isArray: true, nullable: true })
    claims?: Claim[] | null;

    @ApiProperty({ type: () => ClaimStatsDto })
    stats: ClaimStatsDto;
}

export class SingleClaimResponseDto {
    @ApiProperty()
    message: string;

    @ApiProperty({ type: () => Claim, nullable: true })
    claim?: Claim | null;

    @ApiProperty({ type: () => ClaimStatsDto })
    stats: ClaimStatsDto;
} 