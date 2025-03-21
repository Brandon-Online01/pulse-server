import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductAnalytics } from '../entities/product-analytics.entity';

@Injectable()
export class ProductAnalyticsService {
    private readonly logger = new Logger(ProductAnalyticsService.name);

    constructor(
        @InjectRepository(ProductAnalytics)
        private readonly productAnalyticsRepository: Repository<ProductAnalytics>
    ) {}

    async recordQuotation(productId: number): Promise<void> {
        try {
            const analytics = await this.productAnalyticsRepository.findOne({ 
                where: { productId } 
            });
            
            if (!analytics) {
                throw new NotFoundException(`Product analytics not found for product ${productId}`);
            }

            // Increment quotation count
            await this.productAnalyticsRepository.update(
                { productId }, 
                { quotationCount: (analytics.quotationCount || 0) + 1 }
            );
        } catch (error) {
            this.logger.error(`Error recording quotation for product ${productId}: ${error.message}`, error.stack);
            // Continue with the process even if analytics recording fails
        }
    }

    async recordConversion(
        productId: number, 
        quotationId: number, 
        orderId: number
    ): Promise<void> {
        try {
            const analytics = await this.productAnalyticsRepository.findOne({ 
                where: { productId } 
            });
            
            if (!analytics) {
                throw new NotFoundException(`Product analytics not found for product ${productId}`);
            }

            // Increment conversion count
            const quotationToOrderCount = (analytics.quotationToOrderCount || 0) + 1;
            
            // Calculate conversion rate
            const quotationCount = (analytics.quotationCount || 0);
            const conversionRate = quotationCount > 0 
                ? (quotationToOrderCount / quotationCount) * 100 
                : 0;
            
            // Update conversion history
            const conversionHistory = analytics.conversionHistory || [];
            conversionHistory.push({
                quotationId,
                orderId,
                convertedAt: new Date()
            });
            
            await this.productAnalyticsRepository.update(
                { productId }, 
                { 
                    quotationToOrderCount,
                    conversionRate,
                    conversionHistory
                }
            );
        } catch (error) {
            this.logger.error(`Error recording conversion for product ${productId}: ${error.message}`, error.stack);
            // Continue with the process even if analytics recording fails
        }
    }

    async removeConversion(
        productId: number, 
        orderId: number
    ): Promise<void> {
        try {
            const analytics = await this.productAnalyticsRepository.findOne({ 
                where: { productId } 
            });
            
            if (!analytics) {
                throw new NotFoundException(`Product analytics not found for product ${productId}`);
            }

            // Decrement conversion count
            const quotationToOrderCount = Math.max(0, (analytics.quotationToOrderCount || 0) - 1);
            
            // Calculate conversion rate
            const quotationCount = (analytics.quotationCount || 0);
            const conversionRate = quotationCount > 0 
                ? (quotationToOrderCount / quotationCount) * 100 
                : 0;
            
            // Remove from conversion history
            const conversionHistory = (analytics.conversionHistory || [])
                .filter(entry => entry.orderId !== orderId);
            
            await this.productAnalyticsRepository.update(
                { productId }, 
                { 
                    quotationToOrderCount,
                    conversionRate,
                    conversionHistory
                }
            );
        } catch (error) {
            this.logger.error(`Error removing conversion for product ${productId}: ${error.message}`, error.stack);
            // Continue with the process even if analytics recording fails
        }
    }

    async getConversionAnalytics(productId: number): Promise<{
        quotationCount: number;
        quotationToOrderCount: number;
        conversionRate: number;
        conversionHistory: any[];
    }> {
        const analytics = await this.productAnalyticsRepository.findOne({ 
            where: { productId } 
        });
        
        if (!analytics) {
            throw new NotFoundException(`Product analytics not found for product ${productId}`);
        }

        return {
            quotationCount: analytics.quotationCount || 0,
            quotationToOrderCount: analytics.quotationToOrderCount || 0,
            conversionRate: analytics.conversionRate || 0,
            conversionHistory: analytics.conversionHistory || []
        };
    }
} 