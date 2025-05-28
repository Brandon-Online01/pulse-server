import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadScoringData, LeadActivityData } from './entities/lead.entity';
import { Interaction } from '../interactions/entities/interaction.entity';
import { InteractionType } from '../lib/enums/interaction.enums';
import { 
    LeadTemperature, 
    BusinessSize, 
    Industry, 
    DecisionMakerRole, 
    BudgetRange, 
    Timeline, 
    LeadIntent,
    LeadStatus,
    LeadPriority,
} from '../lib/enums/lead.enums';

@Injectable()
export class LeadScoringService {
    private readonly logger = new Logger(LeadScoringService.name);

    constructor(
        @InjectRepository(Lead)
        private leadRepository: Repository<Lead>,
        @InjectRepository(Interaction)
        private interactionRepository: Repository<Interaction>,
    ) {}

    /**
     * Calculate comprehensive lead score based on multiple factors
     * Enhanced with status-aware scoring and velocity intelligence
     */
    async calculateLeadScore(leadId: number): Promise<LeadScoringData> {
        const lead = await this.leadRepository.findOne({
            where: { uid: leadId },
            relations: ['interactions', 'owner'],
        });

        if (!lead) {
            throw new Error(`Lead with ID ${leadId} not found`);
        }

        const interactions = await this.interactionRepository.find({
            where: { lead: { uid: leadId } },
            order: { createdAt: 'DESC' },
            relations: ['createdBy'],
        });

        // Calculate individual scoring components with enhanced logic
        const engagementScore = this.calculateEngagementScore(lead, interactions);
        const demographicScore = this.calculateDemographicScore(lead);
        const behavioralScore = this.calculateEnhancedBehavioralScore(lead, interactions);
        const fitScore = this.calculateFitScore(lead);

        const totalScore = engagementScore + demographicScore + behavioralScore + fitScore;

        const scoringData: LeadScoringData = {
            totalScore: Math.min(100, Math.max(0, totalScore)), // Clamp between 0-100
            engagementScore,
            demographicScore,
            behavioralScore,
            fitScore,
            lastCalculated: new Date(),
            scoreHistory: [
                ...(lead.scoringData?.scoreHistory || []),
                {
                    score: totalScore,
                    timestamp: new Date(),
                    reason: 'Enhanced automated scoring calculation',
                },
            ].slice(-10), // Keep last 10 entries
        };

        // Update lead with new scoring data
        await this.leadRepository.update(leadId, {
            leadScore: scoringData.totalScore,
            scoringData,
        });

        return scoringData;
    }

    /**
     * Enhanced engagement score with status-aware weighting (0-25 points)
     */
    private calculateEngagementScore(lead: Lead, interactions: Interaction[]): number {
        let score = 0;

        // Base interaction count score (0-10 points)
        const interactionCount = interactions.length;
        if (interactionCount >= 20) score += 10;
        else if (interactionCount >= 10) score += 8;
        else if (interactionCount >= 5) score += 6;
        else if (interactionCount >= 2) score += 4;
        else if (interactionCount >= 1) score += 2;

        // Recent activity score with status-aware weighting (0-8 points)
        const recentInteractions = interactions.filter(
            (i) => new Date(i.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        );
        
        // Status-aware weighting: APPROVED leads need more recent activity
        const statusMultiplier = this.getStatusEngagementMultiplier(lead.status);
        let recentActivityScore = 0;
        
        if (recentInteractions.length >= 5) recentActivityScore = 8;
        else if (recentInteractions.length >= 3) recentActivityScore = 6;
        else if (recentInteractions.length >= 1) recentActivityScore = 4;
        
        score += Math.floor(recentActivityScore * statusMultiplier);

        // Response rate score (0-7 points)
        const responseRate = this.calculateResponseRate(interactions);
        if (responseRate >= 0.8) score += 7;
        else if (responseRate >= 0.6) score += 5;
        else if (responseRate >= 0.4) score += 3;
        else if (responseRate >= 0.2) score += 1;

        return Math.min(25, score);
    }

    /**
     * Enhanced behavioral score with velocity intelligence (0-25 points)
     * Replaces simple interaction diversity with status progression speed
     */
    private calculateEnhancedBehavioralScore(lead: Lead, interactions: Interaction[]): number {
        let score = 0;

        // Temperature score with status validation (0-8 points)
        const temperatureScore = this.calculateTemperatureScore(lead);
        score += temperatureScore;

        // Intent score with status-aware logic (0-8 points)
        const intentScore = this.calculateIntentScore(lead);
        score += intentScore;

        // Enhanced response timing with velocity intelligence (0-9 points) - increased from 5
        const velocityScore = this.calculateVelocityScore(lead, interactions);
        score += velocityScore;

        return Math.min(25, score);
    }

    /**
     * Calculate temperature score with status validation
     */
    private calculateTemperatureScore(lead: Lead): number {
        let baseScore = 0;
        
        switch (lead.temperature) {
            case LeadTemperature.HOT:
                baseScore = 8;
                break;
            case LeadTemperature.WARM:
                baseScore = 6;
                break;
            case LeadTemperature.COLD:
                baseScore = 3;
                break;
            case LeadTemperature.FROZEN:
                baseScore = 0;
                break;
        }

        // Status validation: APPROVED leads cannot have COLD/FROZEN temperature
        if (lead.status === LeadStatus.APPROVED && lead.temperature === LeadTemperature.COLD) {
            baseScore = Math.max(baseScore, 6); // Minimum WARM for approved
        }
        if (lead.status === LeadStatus.CONVERTED && lead.temperature !== LeadTemperature.HOT) {
            baseScore = 8; // Force HOT for converted
        }

        return baseScore;
    }

    /**
     * Calculate intent score with status awareness
     */
    private calculateIntentScore(lead: Lead): number {
        let baseScore = 0;
        
        switch (lead.intent) {
            case LeadIntent.PURCHASE:
                baseScore = 8;
                break;
            case LeadIntent.CONVERSION:
                baseScore = 7;
                break;
            case LeadIntent.SERVICES:
                baseScore = 5;
                break;
            case LeadIntent.ENQUIRY:
                baseScore = 4;
                break;
            case LeadIntent.LOST:
                baseScore = 0;
                break;
        }

        // Boost score for advanced status leads with high intent
        if (lead.status === LeadStatus.APPROVED && lead.intent === LeadIntent.PURCHASE) {
            baseScore = Math.min(8, baseScore + 1);
        }

        return baseScore;
    }

    /**
     * Calculate velocity score combining response time and status progression speed (0-9 points)
     */
    private calculateVelocityScore(lead: Lead, interactions: Interaction[]): number {
        let score = 0;

        // Response timing score (0-5 points)
        const avgResponseTime = this.calculateAverageResponseTime(interactions);
        if (avgResponseTime > 0 && avgResponseTime <= 2) score += 5; // Within 2 hours
        else if (avgResponseTime <= 8) score += 4; // Within 8 hours
        else if (avgResponseTime <= 24) score += 3; // Within 24 hours
        else if (avgResponseTime <= 72) score += 2; // Within 3 days
        else if (avgResponseTime > 0) score += 1; // Eventually responds

        // Status progression velocity (0-4 points)
        const statusVelocityScore = this.calculateStatusProgressionVelocity(lead);
        score += statusVelocityScore;

        return Math.min(9, score);
    }

    /**
     * Calculate status progression velocity based on time in current status
     */
    private calculateStatusProgressionVelocity(lead: Lead): number {
        const now = new Date();
        const updatedAt = new Date(lead.updatedAt);
        const daysInCurrentStatus = Math.floor((now.getTime() - updatedAt.getTime()) / (24 * 60 * 60 * 1000));

        // Fast progression bonuses
        if (daysInCurrentStatus <= 1) {
            return 4; // Very fast progression
        } else if (daysInCurrentStatus <= 3) {
            return 3; // Fast progression
        } else if (daysInCurrentStatus <= 7) {
            return 2; // Normal progression
        } else if (daysInCurrentStatus <= 14) {
            return 1; // Slow progression
        } else {
            return 0; // Stagnant
        }
    }

    /**
     * Get status-based engagement multiplier for recent activity scoring
     */
    private getStatusEngagementMultiplier(status: LeadStatus): number {
        switch (status) {
            case LeadStatus.APPROVED:
                return 1.2; // 20% boost for approved leads
            case LeadStatus.CONVERTED:
                return 1.1; // 10% boost for converted leads
            case LeadStatus.REVIEW:
                return 1.0; // Normal weight
            case LeadStatus.PENDING:
                return 0.9; // Slight reduction for pending
            default:
                return 1.0;
        }
    }

    /**
     * Calculate demographic score (0-25 points) - Enhanced with better role scoring
     */
    private calculateDemographicScore(lead: Lead): number {
        let score = 0;

        // Business size score (0-8 points)
        switch (lead.businessSize) {
            case BusinessSize.ENTERPRISE:
                score += 8;
                break;
            case BusinessSize.LARGE:
                score += 7;
                break;
            case BusinessSize.MEDIUM:
                score += 6;
                break;
            case BusinessSize.SMALL:
                score += 4;
                break;
            case BusinessSize.STARTUP:
                score += 3;
                break;
        }

        // Enhanced decision maker role score (0-8 points)
        switch (lead.decisionMakerRole) {
            case DecisionMakerRole.CEO:
            case DecisionMakerRole.OWNER:
                score += 8;
                break;
            case DecisionMakerRole.CTO:
            case DecisionMakerRole.CFO:
            case DecisionMakerRole.CMO:
                score += 7;
                break;
            case DecisionMakerRole.DIRECTOR:
                score += 6;
                break;
            case DecisionMakerRole.MANAGER:
                score += 5;
                break;
            case DecisionMakerRole.SUPERVISOR:
                score += 3;
                break;
            default:
                score += 1;
        }

        // Target industry score (0-5 points)
        const targetIndustries = [
            Industry.TECHNOLOGY,
            Industry.HEALTHCARE,
            Industry.FINANCE,
            Industry.MANUFACTURING,
        ];
        if (lead.industry && targetIndustries.includes(lead.industry)) {
            score += 5;
        } else if (lead.industry) {
            score += 2;
        }

        // Profile completeness score (0-4 points)
        let completenessScore = 0;
        if (lead.email) completenessScore++;
        if (lead.phone) completenessScore++;
        if (lead.companyName) completenessScore++;
        if (lead.jobTitle) completenessScore++;
        score += completenessScore;

        return Math.min(25, score);
    }

    /**
     * Calculate fit score (0-25 points) - Enhanced with status-aware value assessment
     */
    private calculateFitScore(lead: Lead): number {
        let score = 0;

        // Budget score with status boost (0-10 points)
        let budgetScore = 0;
        switch (lead.budgetRange) {
            case BudgetRange.OVER_1M:
                budgetScore = 10;
                break;
            case BudgetRange.R500K_1M:
                budgetScore = 9;
                break;
            case BudgetRange.R250K_500K:
                budgetScore = 8;
                break;
            case BudgetRange.R100K_250K:
                budgetScore = 7;
                break;
            case BudgetRange.R50K_100K:
                budgetScore = 6;
                break;
            case BudgetRange.R25K_50K:
                budgetScore = 5;
                break;
            case BudgetRange.R10K_25K:
                budgetScore = 4;
                break;
            case BudgetRange.R5K_10K:
                budgetScore = 3;
                break;
            case BudgetRange.R1K_5K:
                budgetScore = 2;
                break;
            case BudgetRange.UNDER_1K:
                budgetScore = 1;
                break;
        }

        // Boost budget score for advanced status leads
        if (lead.status === LeadStatus.APPROVED || lead.status === LeadStatus.CONVERTED) {
            budgetScore = Math.min(10, Math.floor(budgetScore * 1.1));
        }
        score += budgetScore;

        // Timeline score with urgency intelligence (0-8 points)
        let timelineScore = 0;
        switch (lead.purchaseTimeline) {
            case Timeline.IMMEDIATE:
                timelineScore = 8;
                break;
            case Timeline.SHORT_TERM:
                timelineScore = 7;
                break;
            case Timeline.MEDIUM_TERM:
                timelineScore = 5;
                break;
            case Timeline.LONG_TERM:
                timelineScore = 3;
                break;
            case Timeline.FUTURE:
                timelineScore = 1;
                break;
        }

        // Boost timeline score for hot leads
        if (lead.temperature === LeadTemperature.HOT && timelineScore > 0) {
            timelineScore = Math.min(8, timelineScore + 1);
        }
        score += timelineScore;

        // Enhanced user quality rating score (0-5 points)
        if (lead.userQualityRating) {
            let qualityScore = lead.userQualityRating;
            
            // Boost quality score for approved leads
            if (lead.status === LeadStatus.APPROVED && qualityScore >= 4) {
                qualityScore = Math.min(5, qualityScore + 0.5);
            }
            
            score += Math.floor(qualityScore);
        }

        // Estimated value score (0-2 points)
        if (lead.estimatedValue) {
            if (lead.estimatedValue >= 100000) score += 2;
            else if (lead.estimatedValue >= 25000) score += 1;
        }

        return Math.min(25, score);
    }

    /**
     * Calculate response rate based on interaction patterns
     */
    private calculateResponseRate(interactions: Interaction[]): number {
        if (interactions.length === 0) return 0;

        // Look for response indicators in message content or follow-up patterns
        const responses = interactions.filter(i => 
            i.message.toLowerCase().includes('reply') ||
            i.message.toLowerCase().includes('response') ||
            i.message.toLowerCase().includes('thank you') ||
            i.message.toLowerCase().includes('thanks') ||
            i.type === InteractionType.CALL ||
            i.type === InteractionType.MEETING
        );

        return responses.length / Math.max(1, interactions.length);
    }

    /**
     * Calculate average response time in hours
     */
    private calculateAverageResponseTime(interactions: Interaction[]): number {
        if (interactions.length < 2) return 0;

        const sortedInteractions = interactions.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        let totalResponseTime = 0;
        let responseCount = 0;

        for (let i = 1; i < sortedInteractions.length; i++) {
            const timeDiff = new Date(sortedInteractions[i].createdAt).getTime() - 
                           new Date(sortedInteractions[i-1].createdAt).getTime();
            
            // Only count as response if within reasonable timeframe (7 days)
            if (timeDiff <= 7 * 24 * 60 * 60 * 1000) {
                totalResponseTime += timeDiff;
                responseCount++;
            }
        }

        return responseCount > 0 ? (totalResponseTime / responseCount) / (60 * 60 * 1000) : 0; // Convert to hours
    }

    /**
     * Enhanced activity data update with status-aware follow-up calculation
     */
    async updateActivityData(leadId: number): Promise<LeadActivityData> {
        const lead = await this.leadRepository.findOne({
            where: { uid: leadId },
            relations: ['interactions'],
        });

        if (!lead) {
            throw new Error(`Lead with ID ${leadId} not found`);
        }

        const interactions = await this.interactionRepository.find({
            where: { lead: { uid: leadId } },
            order: { createdAt: 'DESC' },
        });

        const now = new Date();
        const lastInteraction = interactions[0];
        const lastContactDate = lastInteraction ? new Date(lastInteraction.createdAt) : null;

        const activityData: LeadActivityData = {
            lastContactDate,
            nextFollowUpDate: this.calculateIntelligentFollowUpDate(lead, lastContactDate),
            totalInteractions: interactions.length,
            emailInteractions: interactions.filter(i => i.type === InteractionType.EMAIL).length,
            phoneInteractions: interactions.filter(i => i.type === InteractionType.CALL).length,
            meetingInteractions: interactions.filter(i => i.type === InteractionType.MEETING).length,
            averageResponseTime: this.calculateAverageResponseTime(interactions),
            engagementLevel: this.calculateEnhancedEngagementLevel(lead, interactions),
            lastEngagementType: lastInteraction?.type || 'NONE',
            touchPointsCount: interactions.length,
            unresponsiveStreak: lastContactDate ? 
                Math.floor((now.getTime() - lastContactDate.getTime()) / (24 * 60 * 60 * 1000)) : 0,
        };

        // Update lead with activity data
        await this.leadRepository.update(leadId, {
            activityData,
            totalInteractions: activityData.totalInteractions,
            averageResponseTime: activityData.averageResponseTime,
            lastContactDate: activityData.lastContactDate,
            nextFollowUpDate: activityData.nextFollowUpDate,
            daysSinceLastResponse: activityData.unresponsiveStreak,
        });

        return activityData;
    }

    /**
     * Calculate intelligent follow-up date based on lead status, behavior and velocity
     */
    private calculateIntelligentFollowUpDate(lead: Lead, lastContactDate: Date | null): Date | null {
        if (!lastContactDate) return new Date(); // Follow up immediately for new leads

        const now = new Date();
        const daysSinceContact = Math.floor((now.getTime() - lastContactDate.getTime()) / (24 * 60 * 60 * 1000));

        let followUpDays = 7; // Default 1 week

        // Status-aware follow-up intervals
        switch (lead.status) {
            case LeadStatus.APPROVED:
                followUpDays = 2; // More frequent for approved
                break;
            case LeadStatus.REVIEW:
                followUpDays = 3; // Regular for review
                break;
            case LeadStatus.CONVERTED:
                followUpDays = 30; // Monthly check-ins
                break;
            default:
                followUpDays = 7; // Weekly for pending
        }

        // Adjust based on temperature with status validation
        switch (lead.temperature) {
            case LeadTemperature.HOT:
                followUpDays = Math.min(followUpDays, 1); // Daily for hot
                break;
            case LeadTemperature.WARM:
                followUpDays = Math.min(followUpDays, 3); // Every 3 days for warm
                break;
            case LeadTemperature.COLD:
                // Don't extend for approved leads even if cold
                if (lead.status !== LeadStatus.APPROVED) {
                    followUpDays = Math.max(followUpDays, 7); // Weekly for cold
                }
                break;
            case LeadTemperature.FROZEN:
                followUpDays = 30; // Monthly for frozen
                break;
        }

        // Velocity-based adjustments
        if (lead.leadScore >= 80) followUpDays = Math.min(followUpDays, 1);
        else if (lead.leadScore >= 60) followUpDays = Math.min(followUpDays, 3);

        const nextFollowUp = new Date(lastContactDate);
        nextFollowUp.setDate(nextFollowUp.getDate() + followUpDays);

        return nextFollowUp;
    }

    /**
     * Calculate enhanced engagement level with status awareness
     */
    private calculateEnhancedEngagementLevel(lead: Lead, interactions: Interaction[]): 'HIGH' | 'MEDIUM' | 'LOW' {
        const recentInteractions = interactions.filter(
            i => new Date(i.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        );

        // Status-aware thresholds
        const getThresholds = (status: LeadStatus) => {
            switch (status) {
                case LeadStatus.APPROVED:
                case LeadStatus.CONVERTED:
                    return { high: 8, medium: 2 }; // Higher expectations
                case LeadStatus.REVIEW:
                    return { high: 10, medium: 3 }; // Standard expectations
                default:
                    return { high: 12, medium: 4 }; // Lower expectations for pending
            }
        };

        const thresholds = getThresholds(lead.status);

        if (recentInteractions.length >= thresholds.high) return 'HIGH';
        if (recentInteractions.length >= thresholds.medium) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Batch recalculate scores for all leads
     */
    async recalculateAllScores(): Promise<void> {
        this.logger.log('Starting batch lead score recalculation...');

        const leads = await this.leadRepository.find({
            where: { isDeleted: false },
            select: ['uid'],
        });

        let processed = 0;
        for (const lead of leads) {
            try {
                await this.calculateLeadScore(lead.uid);
                await this.updateActivityData(lead.uid);
                processed++;

                if (processed % 100 === 0) {
                    this.logger.log(`Processed ${processed}/${leads.length} leads`);
                }
            } catch (error) {
                this.logger.error(`Failed to process lead ${lead.uid}: ${error.message}`);
            }
        }

        this.logger.log(`Completed batch score recalculation. Processed ${processed}/${leads.length} leads.`);
    }
} 