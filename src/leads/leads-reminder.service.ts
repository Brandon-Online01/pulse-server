import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { LeadStatus } from '../lib/enums/lead.enums';
import { EmailType } from '../lib/enums/email.enums';
import { User } from '../user/entities/user.entity';
import { CommunicationService } from '../communication/communication.service';

@Injectable()
export class LeadsReminderService {
  private readonly logger = new Logger(LeadsReminderService.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly communicationService: CommunicationService,
  ) {}

  /**
   * Cron job that runs daily at 5:00 AM to check for pending leads
   * and send reminder emails to lead owners
   */
  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async handlePendingLeadsReminders() {
    this.logger.log('Starting pending leads reminder check...');

    try {
      // Get all leads with PENDING status
      const pendingLeads = await this.leadRepository.find({
        where: {
          status: LeadStatus.PENDING,
          isDeleted: false,
        },
        relations: ['owner'],
      });

      if (pendingLeads.length === 0) {
        this.logger.log('No pending leads found.');
        return;
      }

      this.logger.log(`Found ${pendingLeads.length} pending leads.`);

      // Group leads by owner
      const leadsByOwner = this.groupLeadsByOwner(pendingLeads);

      // Process each owner's leads and send reminders
      for (const [ownerUid, leads] of Object.entries(leadsByOwner)) {
        await this.sendReminderEmail(parseInt(ownerUid), leads);
      }

      this.logger.log('Pending leads reminder process completed successfully.');
    } catch (error) {
      this.logger.error('Failed to process pending leads reminders', error.stack);
    }
  }

  /**
   * Groups leads by their owner
   */
  private groupLeadsByOwner(leads: Lead[]): Record<number, Lead[]> {
    const leadsByOwner: Record<number, Lead[]> = {};

    for (const lead of leads) {
      if (!lead.ownerUid) continue;
      
      if (!leadsByOwner[lead.ownerUid]) {
        leadsByOwner[lead.ownerUid] = [];
      }
      
      leadsByOwner[lead.ownerUid].push(lead);
    }

    return leadsByOwner;
  }

  /**
   * Sends a reminder email to a lead owner about their pending leads
   */
  private async sendReminderEmail(ownerUid: number, leads: Lead[]) {
    try {
      const owner = await this.userRepository.findOne({ where: { uid: ownerUid } });
      
      if (!owner || !owner.email) {
        this.logger.warn(`Owner not found or has no email: ${ownerUid}`);
        return;
      }

      // Format leads for the email template
      const formattedLeads = leads.map(lead => ({
        uid: lead.uid,
        name: lead.name || 'Unnamed Lead',
        email: lead.email,
        phone: lead.phone,
        createdAt: lead.createdAt.toLocaleDateString('en-US', {
          year: 'numeric', 
          month: 'short', 
          day: 'numeric'
        }),
        image: lead.image,
        latitude: lead.latitude ? Number(lead.latitude) : undefined,
        longitude: lead.longitude ? Number(lead.longitude) : undefined,
        notes: lead.notes,
      }));

      // Prepare email data
      const emailData = {
        name: owner.name || 'Team Member',
        leads: formattedLeads,
        leadsCount: leads.length,
        dashboardLink: `${process.env.DASHBOARD_URL}/leads`,
      };

      // Send email using the communication service
      await this.communicationService.sendEmail(
        EmailType.LEAD_REMINDER,
        [owner.email],
        emailData
      );

      this.logger.log(`Reminder email sent to ${owner.email} for ${leads.length} pending leads.`);
    } catch (error) {
      this.logger.error(`Failed to send reminder email to owner ${ownerUid}:`, error.stack);
    }
  }
} 