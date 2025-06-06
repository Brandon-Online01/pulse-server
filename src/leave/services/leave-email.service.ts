import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../user/entities/user.entity';
import { Leave } from '../entities/leave.entity';
import { AccessLevel } from '../../lib/enums/user.enums';
import { LeaveStatus } from '../../lib/enums/leave.enums';
import {
	LeaveApplicationConfirmationData,
	LeaveNewApplicationAdminData,
	LeaveStatusUpdateUserData,
	LeaveStatusUpdateAdminData,
	LeaveDeletedNotificationData,
} from '../../lib/types/email-templates.types';

@Injectable()
export class LeaveEmailService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@Inject('EmailTemplateService')
		private readonly emailTemplateService: any,
		private readonly eventEmitter: EventEmitter2,
	) {}

	/**
	 * Find all admin users in the same organization as the applicant
	 */
	private async findAdminUsers(orgId: number, branchId?: number): Promise<User[]> {
		const whereClause: any = {
			accessLevel: AccessLevel.ADMIN,
		};

		// Add organization filter
		if (orgId) {
			whereClause.organisation = { uid: orgId };
		}

		// Optionally filter by branch if provided
		if (branchId) {
			whereClause.branch = { uid: branchId };
		}

		return this.userRepository.find({
			where: whereClause,
			relations: ['organisation', 'branch'],
		});
	}

	/**
	 * Get delegated user information if delegation is set up
	 */
	private async getDelegatedUser(delegatedToUid?: number): Promise<User | null> {
		if (!delegatedToUid) return null;

		return this.userRepository.findOne({
			where: { uid: delegatedToUid },
			relations: ['organisation', 'branch'],
		});
	}

	/**
	 * Send leave application confirmation email to the applicant
	 */
	async sendApplicationConfirmation(leave: Leave, applicant: User): Promise<void> {
		try {
			const delegatedUser = await this.getDelegatedUser(leave.delegatedToUid);

			const emailData: LeaveApplicationConfirmationData = {
				name: applicant.name || applicant.email,
				applicantName: applicant.name || applicant.email,
				leaveId: leave.uid,
				leaveType: leave.leaveType,
				startDate: leave.startDate.toString(),
				endDate: leave.endDate.toString(),
				duration: leave.duration,
				status: leave.status,
				isHalfDay: leave.isHalfDay,
				halfDayPeriod: leave.halfDayPeriod,
				motivation: leave.motivation,
				tags: leave.tags,
				isPaid: leave.isPaid,
				paidAmount: leave.paidAmount,
				isDelegated: !!leave.delegatedToUid,
				delegatedToName: delegatedUser?.name,
				isPublicHoliday: leave.isPublicHoliday,
				createdAt: leave.createdAt.toISOString(),
			};

			const htmlContent = this.emailTemplateService.leaveApplicationConfirmation(emailData);

			// Emit email event
			this.eventEmitter.emit('email.send', {
				to: applicant.email,
				subject: `Leave Application Confirmation - Reference #${leave.uid}`,
				html: htmlContent,
				type: 'LEAVE_APPLICATION_CONFIRMATION',
			});
		} catch (error) {
			console.error('Error sending leave application confirmation email:', error);
		}
	}

	/**
	 * Send new leave application notification to admins
	 */
	async sendNewApplicationAdminNotification(leave: Leave, applicant: User): Promise<void> {
		try {
			const admins = await this.findAdminUsers(
				leave.organisation?.uid || applicant.organisation?.uid,
				leave.branch?.uid || applicant.branch?.uid,
			);

			if (admins.length === 0) {
				console.warn(
					`No admin users found for organization ${leave.organisation?.uid || applicant.organisation?.uid}`,
				);
				return;
			}

			const delegatedUser = await this.getDelegatedUser(leave.delegatedToUid);

			for (const admin of admins) {
				const emailData: LeaveNewApplicationAdminData = {
					name: admin.name || admin.email,
					adminName: admin.name || admin.email,
					applicantName: applicant.name || applicant.email,
					applicantEmail: applicant.email,
					applicantDepartment: applicant.departmentId?.toString() || 'Not specified',
					branchName: leave.branch?.name || applicant.branch?.name || 'Main Branch',
					leaveId: leave.uid,
					leaveType: leave.leaveType,
					startDate: leave.startDate.toString(),
					endDate: leave.endDate.toString(),
					duration: leave.duration,
					isHalfDay: leave.isHalfDay,
					halfDayPeriod: leave.halfDayPeriod,
					motivation: leave.motivation,
					tags: leave.tags,
					isPaid: leave.isPaid,
					paidAmount: leave.paidAmount,
					isDelegated: !!leave.delegatedToUid,
					delegatedToName: delegatedUser?.name,
					isPublicHoliday: leave.isPublicHoliday,
					attachments: leave.attachments,
					createdAt: leave.createdAt.toISOString(),
				};

				const htmlContent = this.emailTemplateService.leaveNewApplicationAdmin(emailData);

				// Emit email event
				this.eventEmitter.emit('email.send', {
					to: admin.email,
					subject: `New Leave Application - ${applicant.name || applicant.email} (#${leave.uid})`,
					html: htmlContent,
					type: 'LEAVE_NEW_APPLICATION_ADMIN',
				});
			}
		} catch (error) {
			console.error('Error sending new leave application admin notification:', error);
		}
	}

	/**
	 * Send leave status update to the user
	 */
	async sendStatusUpdateToUser(
		leave: Leave,
		applicant: User,
		previousStatus: string,
		processedBy?: User,
	): Promise<void> {
		try {
			// Calculate return date (day after end date)
			const returnDate = new Date(leave.endDate);
			returnDate.setDate(returnDate.getDate() + 1);

			const emailData: LeaveStatusUpdateUserData = {
				name: applicant.name || applicant.email,
				applicantName: applicant.name || applicant.email,
				leaveId: leave.uid,
				leaveType: leave.leaveType,
				startDate: leave.startDate.toString(),
				endDate: leave.endDate.toString(),
				duration: leave.duration,
				status: leave.status,
				processedBy: processedBy?.name || processedBy?.email,
				processedAt:
					leave.approvedAt?.toISOString() ||
					leave.rejectedAt?.toISOString() ||
					leave.cancelledAt?.toISOString(),
				comments: leave.comments,
				rejectionReason: leave.rejectionReason,
				cancellationReason: leave.cancellationReason,
				isDelegated: !!leave.delegatedToUid,
				returnDate: returnDate.toISOString(),
				createdAt: leave.createdAt.toISOString(),
			};

			const htmlContent = this.emailTemplateService.leaveStatusUpdateUser(emailData);

			let subject = `Leave Application Update - Reference #${leave.uid}`;
			if (leave.status === LeaveStatus.APPROVED) {
				subject = `Leave Application Approved - Reference #${leave.uid}`;
			} else if (leave.status === LeaveStatus.REJECTED) {
				subject = `Leave Application Declined - Reference #${leave.uid}`;
			} else if (leave.status.includes('CANCELLED')) {
				subject = `Leave Application Cancelled - Reference #${leave.uid}`;
			}

			// Emit email event
			this.eventEmitter.emit('email.send', {
				to: applicant.email,
				subject,
				html: htmlContent,
				type: 'LEAVE_STATUS_UPDATE_USER',
			});
		} catch (error) {
			console.error('Error sending leave status update to user:', error);
		}
	}

	/**
	 * Send leave status update to admins
	 */
	async sendStatusUpdateToAdmins(
		leave: Leave,
		applicant: User,
		previousStatus: string,
		processedBy?: User,
	): Promise<void> {
		try {
			const admins = await this.findAdminUsers(
				leave.organisation?.uid || applicant.organisation?.uid,
				leave.branch?.uid || applicant.branch?.uid,
			);

			if (admins.length === 0) {
				console.warn(
					`No admin users found for organization ${leave.organisation?.uid || applicant.organisation?.uid}`,
				);
				return;
			}

			// Calculate return date (day after end date)
			const returnDate = new Date(leave.endDate);
			returnDate.setDate(returnDate.getDate() + 1);

			// Get some basic metrics (you can expand this with actual queries)
			const pendingCount = 0; // TODO: Implement actual count
			const monthlyApprovals = 0; // TODO: Implement actual count
			const adequateCoverage = true; // TODO: Implement actual logic

			for (const admin of admins) {
				const emailData: LeaveStatusUpdateAdminData = {
					name: admin.name || admin.email,
					adminName: admin.name || admin.email,
					applicantName: applicant.name || applicant.email,
					applicantEmail: applicant.email,
					applicantDepartment: applicant.departmentId?.toString() || 'Not specified',
					branchName: leave.branch?.name || applicant.branch?.name || 'Main Branch',
					leaveId: leave.uid,
					leaveType: leave.leaveType,
					startDate: leave.startDate.toString(),
					endDate: leave.endDate.toString(),
					duration: leave.duration,
					status: leave.status,
					previousStatus,
					actionTakenBy: processedBy?.name || processedBy?.email,
					updateTime: new Date().toISOString(),
					comments: leave.comments,
					rejectionReason: leave.rejectionReason,
					cancellationReason: leave.cancellationReason,
					isDelegated: !!leave.delegatedToUid,
					returnDate: returnDate.toISOString(),
					createdAt: leave.createdAt.toISOString(),
					pendingCount,
					monthlyApprovals,
					adequateCoverage,
					upcomingLeaves: [], // TODO: Implement actual upcoming leaves query
				};

				const htmlContent = this.emailTemplateService.leaveStatusUpdateAdmin(emailData);

				let subject = `Leave Status Update - ${applicant.name || applicant.email} (#${leave.uid})`;
				if (leave.status === LeaveStatus.APPROVED) {
					subject = `Leave Approved - ${applicant.name || applicant.email} (#${leave.uid})`;
				} else if (leave.status === LeaveStatus.REJECTED) {
					subject = `Leave Declined - ${applicant.name || applicant.email} (#${leave.uid})`;
				} else if (leave.status.includes('CANCELLED')) {
					subject = `Leave Cancelled - ${applicant.name || applicant.email} (#${leave.uid})`;
				}

				// Emit email event
				this.eventEmitter.emit('email.send', {
					to: admin.email,
					subject,
					html: htmlContent,
					type: 'LEAVE_STATUS_UPDATE_ADMIN',
				});
			}
		} catch (error) {
			console.error('Error sending leave status update to admins:', error);
		}
	}

	/**
	 * Send leave deletion notification
	 */
	async sendDeletedNotification(
		leave: Leave,
		applicant: User,
		deletedBy?: User,
		deletionReason?: string,
	): Promise<void> {
		try {
			const admins = await this.findAdminUsers(
				leave.organisation?.uid || applicant.organisation?.uid,
				leave.branch?.uid || applicant.branch?.uid,
			);

			// Send to applicant
			const applicantEmailData: LeaveDeletedNotificationData = {
				name: applicant.name || applicant.email,
				recipientName: applicant.name || applicant.email,
				isApplicant: true,
				applicantName: applicant.name || applicant.email,
				applicantEmail: applicant.email,
				leaveId: leave.uid,
				leaveType: leave.leaveType,
				startDate: leave.startDate.toString(),
				endDate: leave.endDate.toString(),
				duration: leave.duration,
				statusWhenDeleted: leave.status,
				deletedAt: new Date().toISOString(),
				deletedBy: deletedBy?.name || deletedBy?.email,
				motivation: leave.motivation,
				deletionReason,
				createdAt: leave.createdAt.toISOString(),
			};

			const applicantHtmlContent = this.emailTemplateService.leaveDeletedNotification(applicantEmailData);

			// Emit email event for applicant
			this.eventEmitter.emit('email.send', {
				to: applicant.email,
				subject: `Leave Application Deleted - Reference #${leave.uid}`,
				html: applicantHtmlContent,
				type: 'LEAVE_DELETED_NOTIFICATION',
			});

			// Send to admins
			for (const admin of admins) {
				const adminEmailData: LeaveDeletedNotificationData = {
					name: admin.name || admin.email,
					recipientName: admin.name || admin.email,
					isApplicant: false,
					applicantName: applicant.name || applicant.email,
					applicantEmail: applicant.email,
					leaveId: leave.uid,
					leaveType: leave.leaveType,
					startDate: leave.startDate.toString(),
					endDate: leave.endDate.toString(),
					duration: leave.duration,
					statusWhenDeleted: leave.status,
					deletedAt: new Date().toISOString(),
					deletedBy: deletedBy?.name || deletedBy?.email,
					motivation: leave.motivation,
					deletionReason,
					createdAt: leave.createdAt.toISOString(),
					remainingPendingCount: 0, // TODO: Implement actual count
					adequateCoverage: true, // TODO: Implement actual logic
				};

				const adminHtmlContent = this.emailTemplateService.leaveDeletedNotification(adminEmailData);

				// Emit email event for admin
				this.eventEmitter.emit('email.send', {
					to: admin.email,
					subject: `Leave Application Deleted - ${applicant.name || applicant.email} (#${leave.uid})`,
					html: adminHtmlContent,
					type: 'LEAVE_DELETED_NOTIFICATION',
				});
			}
		} catch (error) {
			console.error('Error sending leave deletion notification:', error);
		}
	}
}
