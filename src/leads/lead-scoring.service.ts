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

        // Calculate individual scoring components
        const engagementScore = this.calculateEngagementScore(lead, interactions);
        const demographicScore = this.calculateDemographicScore(lead);
        const behavioralScore = this.calculateBehavioralScore(lead, interactions);
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
                    reason: 'Automated scoring calculation',
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
     * Calculate engagement score (0-25 points)
     * Based on interaction frequency, response rates, and engagement quality
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

        // Recent activity score (0-8 points)
        const recentInteractions = interactions.filter(
            (i) => new Date(i.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        );
        if (recentInteractions.length >= 5) score += 8;
        else if (recentInteractions.length >= 3) score += 6;
        else if (recentInteractions.length >= 1) score += 4;

        // Response rate score (0-7 points)
        const responseRate = this.calculateResponseRate(interactions);
        if (responseRate >= 0.8) score += 7;
        else if (responseRate >= 0.6) score += 5;
        else if (responseRate >= 0.4) score += 3;
        else if (responseRate >= 0.2) score += 1;

        return Math.min(25, score);
    }

    /**
     * Calculate demographic score (0-25 points)
     * Based on company size, industry, role, and profile completeness
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

        // Decision maker role score (0-8 points)
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
     * Calculate behavioral score (0-25 points)
     * Based on activity patterns, communication preferences, and engagement timing
     */
    private calculateBehavioralScore(lead: Lead, interactions: Interaction[]): number {
        let score = 0;

        // Temperature score (0-8 points)
        switch (lead.temperature) {
            case LeadTemperature.HOT:
                score += 8;
                break;
            case LeadTemperature.WARM:
                score += 6;
                break;
            case LeadTemperature.COLD:
                score += 3;
                break;
            case LeadTemperature.FROZEN:
                score += 0;
                break;
        }

        // Intent score (0-8 points)
        switch (lead.intent) {
            case LeadIntent.PURCHASE:
                score += 8;
                break;
            case LeadIntent.CONVERSION:
                score += 7;
                break;
            case LeadIntent.SERVICES:
                score += 5;
                break;
            case LeadIntent.ENQUIRY:
                score += 4;
                break;
            case LeadIntent.LOST:
                score += 0;
                break;
        }

        // Response timing score (0-5 points)
        const avgResponseTime = this.calculateAverageResponseTime(interactions);
        if (avgResponseTime > 0 && avgResponseTime <= 2) score += 5; // Within 2 hours
        else if (avgResponseTime <= 8) score += 4; // Within 8 hours
        else if (avgResponseTime <= 24) score += 3; // Within 24 hours
        else if (avgResponseTime <= 72) score += 2; // Within 3 days
        else if (avgResponseTime > 0) score += 1; // Eventually responds

        // Interaction diversity score (0-4 points)
        const interactionTypes = new Set(interactions.map(i => i.type));
        score += Math.min(4, interactionTypes.size);

        return Math.min(25, score);
    }

    /**
     * Calculate fit score (0-25 points)
     * Based on budget, timeline, and specific needs alignment
     */
    private calculateFitScore(lead: Lead): number {
        let score = 0;

        // Budget score (0-10 points)
        switch (lead.budgetRange) {
            case BudgetRange.OVER_1M:
                score += 10;
                break;
            case BudgetRange.R500K_1M:
                score += 9;
                break;
            case BudgetRange.R250K_500K:
                score += 8;
                break;
            case BudgetRange.R100K_250K:
                score += 7;
                break;
            case BudgetRange.R50K_100K:
                score += 6;
                break;
            case BudgetRange.R25K_50K:
                score += 5;
                break;
            case BudgetRange.R10K_25K:
                score += 4;
                break;
            case BudgetRange.R5K_10K:
                score += 3;
                break;
            case BudgetRange.R1K_5K:
                score += 2;
                break;
            case BudgetRange.UNDER_1K:
                score += 1;
                break;
        }

        // Timeline score (0-8 points)
        switch (lead.purchaseTimeline) {
            case Timeline.IMMEDIATE:
                score += 8;
                break;
            case Timeline.SHORT_TERM:
                score += 7;
                break;
            case Timeline.MEDIUM_TERM:
                score += 5;
                break;
            case Timeline.LONG_TERM:
                score += 3;
                break;
            case Timeline.FUTURE:
                score += 1;
                break;
        }

        // User quality rating score (0-5 points)
        if (lead.userQualityRating) {
            score += lead.userQualityRating;
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
     * Update activity data for a lead
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
            nextFollowUpDate: this.calculateNextFollowUpDate(lead, lastContactDate),
            totalInteractions: interactions.length,
            emailInteractions: interactions.filter(i => i.type === InteractionType.EMAIL).length,
            phoneInteractions: interactions.filter(i => i.type === InteractionType.CALL).length,
            meetingInteractions: interactions.filter(i => i.type === InteractionType.MEETING).length,
            averageResponseTime: this.calculateAverageResponseTime(interactions),
            engagementLevel: this.calculateEngagementLevel(interactions),
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
     * Calculate next follow-up date based on lead behavior and activity
     */
    private calculateNextFollowUpDate(lead: Lead, lastContactDate: Date | null): Date | null {
        if (!lastContactDate) return new Date(); // Follow up immediately for new leads

        const now = new Date();
        const daysSinceContact = Math.floor((now.getTime() - lastContactDate.getTime()) / (24 * 60 * 60 * 1000));

        let followUpDays = 7; // Default 1 week

        // Adjust based on temperature
        switch (lead.temperature) {
            case LeadTemperature.HOT:
                followUpDays = 1; // Daily follow-up
                break;
            case LeadTemperature.WARM:
                followUpDays = 3; // Every 3 days
                break;
            case LeadTemperature.COLD:
                followUpDays = 7; // Weekly
                break;
            case LeadTemperature.FROZEN:
                followUpDays = 30; // Monthly
                break;
        }

        // Adjust based on lead score
        if (lead.leadScore >= 80) followUpDays = Math.min(followUpDays, 1);
        else if (lead.leadScore >= 60) followUpDays = Math.min(followUpDays, 3);

        const nextFollowUp = new Date(lastContactDate);
        nextFollowUp.setDate(nextFollowUp.getDate() + followUpDays);

        return nextFollowUp;
    }

    /**
     * Calculate engagement level based on recent interactions
     */
    private calculateEngagementLevel(interactions: Interaction[]): 'HIGH' | 'MEDIUM' | 'LOW' {
        const recentInteractions = interactions.filter(
            i => new Date(i.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        );

        if (recentInteractions.length >= 10) return 'HIGH';
        if (recentInteractions.length >= 3) return 'MEDIUM';
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