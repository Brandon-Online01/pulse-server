import { Injectable } from '@nestjs/common';
import { Claim } from '../entities/claim.entity';
import { ClaimStatus, ClaimCategory } from '../../lib/enums/finance.enums';
import { ClaimStatsDto } from '../dto/claim-response.dto';
import { CurrencyService } from './currency.service';

@Injectable()
export class ClaimStatsService {
    constructor(private readonly currencyService: CurrencyService) { }

    calculateBasicStats(claims: Claim[]): ClaimStatsDto {
        return {
            total: claims?.length || 0,
            pending: claims?.filter(claim => claim?.status === ClaimStatus.PENDING)?.length || 0,
            approved: claims?.filter(claim => claim?.status === ClaimStatus.APPROVED)?.length || 0,
            declined: claims?.filter(claim => claim?.status === ClaimStatus.DECLINED)?.length || 0,
            paid: claims?.filter(claim => claim?.status === ClaimStatus.PAID)?.length || 0,
        };
    }

    calculateTotalValue(claims: Claim[]): string {
        const total = claims.reduce((sum, claim) => sum + Number(claim.amount), 0);
        return this.currencyService.formatCurrency(total);
    }

    calculateCategoryStats(claims: Claim[]): Record<ClaimCategory, number> {
        const stats = {} as Record<ClaimCategory, number>;

        Object.values(ClaimCategory).forEach(category => {
            stats[category] = claims.filter(claim => claim.category === category).length;
        });

        return stats;
    }

    calculateStatusBreakdown(claims: Claim[]): Record<ClaimStatus, { count: number; totalValue: string }> {
        const breakdown = {} as Record<ClaimStatus, { count: number; totalValue: string }>;

        Object.values(ClaimStatus).forEach(status => {
            const statusClaims = claims.filter(claim => claim.status === status);
            breakdown[status] = {
                count: statusClaims.length,
                totalValue: this.currencyService.formatCurrency(
                    statusClaims.reduce((sum, claim) => sum + Number(claim.amount), 0)
                ),
            };
        });

        return breakdown;
    }
} 