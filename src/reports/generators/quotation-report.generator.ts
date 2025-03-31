import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ReportParamsDto } from '../dto/report-params.dto';
import { Quotation } from '../../shop/entities/quotation.entity';
import { OrderStatus } from '../../lib/enums/status.enums';

@Injectable()
export class QuotationReportGenerator {
	constructor(
		@InjectRepository(Quotation)
		private quotationRepository: Repository<Quotation>,
	) {}

	async generate(params: ReportParamsDto): Promise<Record<string, any>> {
		const { organisationId, branchId, dateRange, filters } = params;

		// Extract client ID from filters if provided
		const clientId = filters?.clientId;

		if (!clientId) {
			throw new Error('Client ID is required for quotation reports');
		}

		try {
			// Use QueryBuilder for more control over the query
			let quotationsQuery = this.quotationRepository
				.createQueryBuilder('quotation')
				.innerJoin('quotation.client', 'client')
				.innerJoin('quotation.organisation', 'organisation')
				.leftJoinAndSelect('quotation.quotationItems', 'quotationItems')
				.leftJoinAndSelect('quotationItems.product', 'product')
				.leftJoinAndSelect('quotation.client', 'clientDetail')
				.leftJoinAndSelect('quotation.placedBy', 'placedBy')
				.where('client.uid = :clientId', { clientId })
				.andWhere('organisation.uid = :organisationId', { organisationId });

			// Add branch filter if specified
			if (branchId) {
				quotationsQuery = quotationsQuery
					.innerJoin('quotation.branch', 'branch')
					.andWhere('branch.uid = :branchId', { branchId });
			}

			// Sort by creation date
			quotationsQuery = quotationsQuery.orderBy('quotation.createdAt', 'DESC');

			// Add date filter if specified
			if (dateRange && dateRange.start && dateRange.end) {
				quotationsQuery = quotationsQuery.andWhere('quotation.createdAt BETWEEN :startDate AND :endDate', {
					startDate: new Date(dateRange.start),
					endDate: new Date(dateRange.end),
				});
			}

			// Print the SQL query for debugging
			const rawSql = quotationsQuery.getSql();

			let quotations;

			try {
				// First attempt: Use QueryBuilder approach
				quotations = await quotationsQuery.getMany();
			} catch (queryError) {
				// Fallback to direct approach
				// Prepare the direct where clause
				const whereClause: any = {};

				// Add client relationship filter
				whereClause.client = { uid: clientId };

				// Add organisation relationship filter
				whereClause.organisation = { uid: organisationId };

				// Add branch filter if specified
				if (branchId) {
					whereClause.branch = { uid: branchId };
				}

				// Add date filter if specified
				if (dateRange && dateRange.start && dateRange.end) {
					whereClause.createdAt = Between(new Date(dateRange.start), new Date(dateRange.end));
				}

				quotations = await this.quotationRepository.find({
					where: whereClause,
					relations: [
						'quotationItems',
						'quotationItems.product',
						'client',
						'placedBy',
						'branch',
						'organisation',
					],
					// order: { createdAt: 'DESC' }
				});
			}

			if (quotations.length === 0) {
				// Try a simpler query to see if any quotations exist for this client at all
				const basicQuery = await this.quotationRepository
					.createQueryBuilder('quotation')
					.innerJoin('quotation.client', 'client')
					.select('COUNT(quotation.uid)', 'count')
					.where('client.uid = :clientId', { clientId })
					.getRawOne();

				// Try querying without joins to check if quotations exist at all
				const basicQuotationCount = await this.quotationRepository.count();

				// Try with just client filter
				const clientOnlyQuery = await this.quotationRepository
					.createQueryBuilder('quotation')
					.innerJoin('quotation.client', 'client')
					.select('COUNT(quotation.uid)', 'count')
					.where('client.uid = :clientId', { clientId })
					.getRawOne();

				console.log(`Client-only quotation count: ${clientOnlyQuery?.count || 0}`);

				// Try with just organization filter
				const orgOnlyQuery = await this.quotationRepository
					.createQueryBuilder('quotation')
					.innerJoin('quotation.organisation', 'organisation')
					.select('COUNT(quotation.uid)', 'count')
					.where('organisation.uid = :organisationId', { organisationId })
					.getRawOne();

				// Try using direct column names (assuming they follow TypeORM naming conventions)
				try {
					const rawCount = await this.quotationRepository.query(
						`SELECT COUNT(*) as count FROM quotation 
             WHERE client_uid = $1 AND organisation_uid = $2`,
						[clientId, organisationId],
					);
				} catch (sqlError) {}

				return {
					metadata: {
						organisationId,
						branchId,
						clientId,
						generatedAt: new Date(),
						reportType: 'quotation',
						name: params.name || 'Client Quotation Report',
						dateRange: dateRange
							? {
									start: dateRange.start,
									end: dateRange.end,
							  }
							: null,
					},
					summary: {
						quotationCount: 0,
						totalAmount: '0.00',
						totalItems: 0,
						averageOrderValue: '0.00',
						pendingCount: 0,
						approvedCount: 0,
						rejectedCount: 0,
						completedCount: 0,
						convertedToOrderCount: 0,
					},
					metrics: {
						byStatus: [],
						timeline: [],
						frequentProducts: [],
					},
					data: {
						quotations: [],
					},
					message: 'No quotations found for this client',
				};
			}

			// Calculate statistics
			const totalAmount = quotations.reduce((sum, q) => sum + Number(q.totalAmount), 0);
			const totalItems = quotations.reduce((sum, q) => sum + q.totalItems, 0);
			const averageAmount = quotations.length > 0 ? totalAmount / quotations.length : 0;

			// Group by status
			const byStatus = this.groupByStatus(quotations);

			// Timeline data (by month)
			const timeline = this.generateTimeline(quotations);

			// Most frequently ordered products
			const frequentProducts = this.getFrequentProducts(quotations);

			// Return structured report data
			return {
				name: params.name || 'Client Quotation Report',
				type: 'quotation',
				generatedAt: new Date(),
				filters: {
					organisationId,
					branchId,
					clientId
				},
				generatedBy: {
					uid: params.userId || 1
				},
				metadata: {
					organisationId,
					branchId,
					clientId,
					generatedAt: new Date(),
					reportType: 'quotation',
					name: params.name || 'Client Quotation Report',
					dateRange: dateRange
						? {
								start: dateRange.start,
								end: dateRange.end,
						  }
						: null,
				},
				summary: {
					quotationCount: quotations.length,
					totalAmount: totalAmount.toFixed(2),
					totalItems,
					averageOrderValue: averageAmount.toFixed(2),
					pendingCount: byStatus[OrderStatus.PENDING]?.length || 0,
					approvedCount: byStatus[OrderStatus.APPROVED]?.length || 0,
					rejectedCount: byStatus[OrderStatus.REJECTED]?.length || 0,
					completedCount: byStatus[OrderStatus.COMPLETED]?.length || 0,
					convertedToOrderCount: quotations.filter((q) => q.isConverted).length,
				},
				metrics: {
					byStatus: Object.keys(byStatus).map((status) => ({
						status,
						count: byStatus[status].length,
						value: byStatus[status].reduce((sum, q) => sum + Number(q.totalAmount), 0).toFixed(2),
					})),
					timeline,
					frequentProducts: frequentProducts.slice(0, 10),
				},
				charts: {
					// Bar chart for quotation values
					quotationValues: {
						data: quotations.map((quote) => ({
							name: quote.quotationNumber?.substring(quote.quotationNumber.length - 8) || `#${quote.uid}`,
							value: Number(quote.totalAmount || 0),
							fullNumber: quote.quotationNumber,
							date: quote.quotationDate || quote.createdAt,
							status: quote.status,
							itemCount: quote.quotationItems?.length || 0
						})),
						config: {
							xAxisLabel: "QUOTATIONS",
							yAxisLabel: "AMOUNT (ZAR)",
							barColor: "#3b82f6"
						}
					},
					
					// Pie chart for status distribution
					statusDistribution: {
						data: Object.entries(byStatus).map(([status, quotes]) => ({
							name: status.toLowerCase(),
							value: quotes.length,
							status: status
						})),
						config: {
							colors: {
								pending: "#3b82f6",
								approved: "#22c55e",
								rejected: "#ef4444",
								completed: "#a855f7",
								convertedToOrder: "#f97316"
							}
						}
					},
					
					// Line chart for timeline
					timeline: {
						data: quotations.map((quote) => ({
							name: quote.quotationDate 
								? new Date(quote.quotationDate).toISOString().split('T')[0]
								: quote.createdAt
									? new Date(quote.createdAt).toISOString().split('T')[0] 
									: 'Unknown',
							value: Number(quote.totalAmount || 0),
							fullNumber: quote.quotationNumber,
							status: quote.status,
							itemCount: quote.quotationItems?.length || 0
						})),
						config: {
							xAxisLabel: "DATE",
							yAxisLabel: "AMOUNT (ZAR)",
							lineColor: "#3b82f6"
						}
					},
					
					// Bar chart for product frequency
					productFrequency: {
						data: frequentProducts.slice(0, 10).map(product => ({
							name: product.name,
							value: product.orderedCount,
							uid: product.uid,
							category: product.category,
							price: product.price
						})),
						config: {
							xAxisLabel: "PRODUCTS",
							yAxisLabel: "QUANTITY",
							barColor: "#3b82f6"
						}
					},
					
					// Bar chart for item quantities by quotation
					itemQuantities: {
						data: quotations.map((quote) => {
							const items = quote.quotationItems || [];
							const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
							
							return {
								name: quote.quotationNumber?.substring(quote.quotationNumber.length - 8) || `#${quote.uid}`,
								quantity: totalQuantity,
								fullNumber: quote.quotationNumber,
								date: quote.quotationDate || quote.createdAt,
								status: quote.status,
								itemCount: items.length
							};
						}),
						config: {
							xAxisLabel: "QUOTATIONS",
							yAxisLabel: "TOTAL QUANTITY",
							barColor: "#3b82f6"
						}
					},
					
					// Monthly distribution
					monthlyDistribution: {
						data: timeline.map(item => ({
							month: item.month,
							count: item.count,
							value: item.value
						})),
						config: {
							xAxisLabel: "MONTH",
							yAxisLabel: "AMOUNT (ZAR)",
							barColor: "#3b82f6"
						}
					}
				},
				data: {
					quotations,
				},
			};
		} catch (error) {
			throw error;
		}
	}

	private groupByStatus(quotations: Quotation[]): Record<string, Quotation[]> {
		return quotations.reduce((acc, quotation) => {
			const status = quotation.status;
			if (!acc[status]) {
				acc[status] = [];
			}
			acc[status].push(quotation);
			return acc;
		}, {} as Record<string, Quotation[]>);
	}

	private generateTimeline(quotations: Quotation[]): any[] {
		const byMonth: Record<string, { count: number; value: number }> = {};

		quotations.forEach((quotation) => {
			const date = new Date(quotation.createdAt);
			const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

			if (!byMonth[monthKey]) {
				byMonth[monthKey] = { count: 0, value: 0 };
			}

			byMonth[monthKey].count += 1;
			byMonth[monthKey].value += Number(quotation.totalAmount);
		});

		return Object.entries(byMonth)
			.map(([month, data]) => ({
				month,
				count: data.count,
				value: data.value.toFixed(2),
			}))
			.sort((a, b) => a.month.localeCompare(b.month));
	}

	private getFrequentProducts(quotations: Quotation[]): any[] {
		const productCounts: Record<number, { count: number; product: any }> = {};

		quotations.forEach((quotation) => {
			quotation.quotationItems.forEach((item) => {
				const productId = item.product.uid;

				if (!productCounts[productId]) {
					productCounts[productId] = {
						count: 0,
						product: {
							uid: item.product.uid,
							name: item.product.name,
							sku: item.product.sku,
							price: item.product.price,
						},
					};
				}

				productCounts[productId].count += item.quantity;
			});
		});

		return Object.values(productCounts)
			.sort((a, b) => b.count - a.count)
			.map(({ count, product }) => ({
				...product,
				orderedCount: count,
			}));
	}
}
