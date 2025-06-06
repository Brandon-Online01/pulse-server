import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Leave } from './entities/leave.entity';
import { User } from '../user/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { LeaveStatus } from '../lib/enums/leave.enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaginatedResponse } from '../lib/interfaces/product.interfaces';
import { LeaveEmailService } from './services/leave-email.service';

@Injectable()
export class LeaveService {
	private readonly CACHE_TTL: number;
	private readonly CACHE_PREFIX = 'leave:';

	constructor(
		@InjectRepository(Leave)
		private leaveRepository: Repository<Leave>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@Inject(CACHE_MANAGER)
		private cacheManager: Cache,
		private readonly configService: ConfigService,
		private readonly eventEmitter: EventEmitter2,
		private readonly leaveEmailService: LeaveEmailService,
	) {
		this.CACHE_TTL = this.configService.get<number>('CACHE_EXPIRATION_TIME') || 30;
	}

	private getCacheKey(key: string | number): string {
		return `${this.CACHE_PREFIX}${key}`;
	}

	private async clearLeaveCache(leaveId?: number): Promise<void> {
		try {
			// Get all cache keys
			const keys = await this.cacheManager.store.keys();

			// Keys to clear
			const keysToDelete = [];

			// If specific leave, clear its cache
			if (leaveId) {
				keysToDelete.push(this.getCacheKey(leaveId));
			}

			// Clear all pagination and filtered leave list caches
			const leaveListCaches = keys.filter(
				(key) =>
					key.startsWith('leaves_page') || // Pagination caches
					key.startsWith('leave:all') || // All leaves cache
					key.includes('_limit'), // Filtered caches
			);
			keysToDelete.push(...leaveListCaches);

			// Clear all caches
			await Promise.all(keysToDelete.map((key) => this.cacheManager.del(key)));
		} catch (error) {
			return error;
		}
	}

	async create(
		createLeaveDto: CreateLeaveDto,
		orgId?: number,
		branchId?: number,
		userId?: number,
	): Promise<{ message: string }> {
		try {
			// Find the owner user
			if (!userId) {
				throw new BadRequestException('User ID is required to create a leave request');
			}
			const owner = await this.userRepository.findOne({ where: { uid: userId } });

			if (!owner) {
				throw new NotFoundException(`User with ID ${userId} not found`);
			}

			// Format dates to YYYY-MM-DD string
			const formatDate = (date: Date | string): string | undefined => {
				if (!date) return undefined;
				const d = new Date(date);
				// Check if the date is valid after parsing
				if (isNaN(d.getTime())) {
					// Optionally throw an error or return undefined/original value
					// For now, returning undefined to let DB handle potential nulls if column allows
					// Or, if dates are mandatory, throw new BadRequestException(`Invalid date format: ${date}`);
					return undefined;
				}
				const year = d.getFullYear();
				const month = `0${d.getMonth() + 1}`.slice(-2);
				const day = `0${d.getDate()}`.slice(-2);
				return `${year}-${month}-${day}`;
			};

			const formattedStartDate = formatDate(createLeaveDto.startDate);
			const formattedEndDate = formatDate(createLeaveDto.endDate);

			// Calculate duration from start and end dates if not provided
			if (!createLeaveDto.duration) {
				const startDate = new Date(createLeaveDto.startDate);
				const endDate = new Date(createLeaveDto.endDate);

				// Calculate business days between dates (excluding weekends)
				// This is a simplified version - in production, you'd want to account for holidays and partial days
				let duration = 0;
				let currentDate = new Date(startDate);

				while (currentDate <= endDate) {
					const dayOfWeek = currentDate.getDay();
					if (dayOfWeek !== 0 && dayOfWeek !== 6) {
						// Not Sunday (0) or Saturday (6)
						duration++;
					}
					currentDate.setDate(currentDate.getDate() + 1);
				}

				if (createLeaveDto.isHalfDay) {
					duration -= 0.5;
				}

				createLeaveDto.duration = duration;
			}

			// Create new leave entity
			const leave = this.leaveRepository.create({
				...createLeaveDto,
				startDate: formattedStartDate as any, // TypeORM expects Date, but we provide string for 'date' type
				endDate: formattedEndDate as any, // TypeORM expects Date, but we provide string for 'date' type
				owner,
				status: LeaveStatus.PENDING,
				// Set organization and branch if provided
				...(orgId && { organisation: { uid: orgId } }),
				...(branchId && { branch: { uid: branchId } }),
			});

			// Save the leave request
			const savedLeave = await this.leaveRepository.save(leave);

			// Send confirmation email to applicant
			await this.leaveEmailService.sendApplicationConfirmation(savedLeave, owner);

			// Send notification email to admins
			await this.leaveEmailService.sendNewApplicationAdminNotification(savedLeave, owner);

			// Emit leave created event for notifications
			this.eventEmitter.emit('leave.created', {
				leave: savedLeave,
				owner,
			});

			// Clear cache
			await this.clearLeaveCache();

			return { message: 'Leave request created successfully' };
		} catch (error) {
			console.log(error);
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new BadRequestException(error.message || 'Error creating leave request');
		}
	}

	async findAll(
		filters?: {
			status?: string;
			leaveType?: string;
			ownerUid?: number;
			startDate?: Date;
			endDate?: Date;
			isApproved?: boolean;
		},
		page: number = 1,
		limit: number = Number(process.env.DEFAULT_PAGE_LIMIT),
		orgId?: number,
		branchId?: number,
		userId?: number,
	): Promise<PaginatedResponse<Leave>> {
		try {
			// Building the where clause
			const where: any = {};

			// Add organizational filters
			if (orgId) {
				where.organisation = { uid: orgId };
			}

			if (branchId) {
				where.branch = { uid: branchId };
			}

			// Add status filter
			if (filters?.status) {
				where.status = filters.status;
			}

			// Add leave type filter
			if (filters?.leaveType) {
				where.leaveType = filters.leaveType;
			}

			// Add approval status filter
			if (filters?.isApproved !== undefined) {
				where.status = filters.isApproved ? LeaveStatus.APPROVED : LeaveStatus.PENDING;
			}

			// Add date range filters
			if (filters?.startDate && filters?.endDate) {
				// Match leaves that overlap with the date range
				where.startDate = LessThanOrEqual(filters.endDate);
				where.endDate = MoreThanOrEqual(filters.startDate);
			} else if (filters?.startDate) {
				where.startDate = MoreThanOrEqual(filters.startDate);
			} else if (filters?.endDate) {
				where.endDate = LessThanOrEqual(filters.endDate);
			}

			// Calculate pagination
			const skip = (page - 1) * limit;

			// Execute query with pagination
			const [data, total] = await this.leaveRepository.findAndCount({
				where,
				skip,
				take: limit,
				relations: ['owner', 'organisation', 'branch', 'approvedBy'],
				order: {
					createdAt: 'DESC',
				},
			});

			// Calculate total pages
			const totalPages = Math.ceil(total / limit);

			return {
				data,
				meta: {
					total,
					page,
					limit,
					totalPages,
				},
				message: 'Success',
			};
		} catch (error) {
			throw new BadRequestException(error.message || 'Error retrieving leave requests');
		}
	}

	async findOne(
		ref: number,
		orgId?: number,
		branchId?: number,
		userId?: number,
	): Promise<{ message: string; leave: Leave | null }> {
		try {
			// Build query conditions
			const where: any = { uid: ref };

			// Add org and branch filters if provided
			if (orgId) {
				where.organisation = { uid: orgId };
			}

			if (branchId) {
				where.branch = { uid: branchId };
			}

			// Try to get from cache first
			const cacheKey = this.getCacheKey(`${ref}_${orgId || 'null'}_${branchId || 'null'}`);
			const cached = await this.cacheManager.get(cacheKey);

			if (cached) {
				return {
					leave: cached as Leave,
					message: 'Success',
				};
			}

			// If not cached, query the database
			const leave = await this.leaveRepository.findOne({
				where,
				relations: ['owner', 'organisation', 'branch', 'approvedBy'],
			});

			if (!leave) {
				return {
					leave: null,
					message: 'Leave request not found',
				};
			}

			// Cache the result
			await this.cacheManager.set(cacheKey, leave, this.CACHE_TTL);

			return {
				leave,
				message: 'Success',
			};
		} catch (error) {
			throw new BadRequestException(error.message || 'Error retrieving leave request');
		}
	}

	async leavesByUser(
		ref: number,
		orgId?: number,
		branchId?: number,
		userId?: number,
	): Promise<{ message: string; leaves: Leave[] }> {
		try {
			// Build query conditions
			const where: any = { owner: { uid: ref } };

			// Add org and branch filters if provided
			if (orgId) {
				where.organisation = { uid: orgId };
			}

			if (branchId) {
				where.branch = { uid: branchId };
			}

			// Query leaves for the user
			const leaves = await this.leaveRepository.find({
				where,
				relations: ['owner', 'organisation', 'branch', 'approvedBy'],
				order: {
					startDate: 'DESC',
				},
			});

			return {
				leaves,
				message: 'Success',
			};
		} catch (error) {
			throw new BadRequestException(error.message || 'Error retrieving user leave requests');
		}
	}

	async update(
		ref: number,
		updateLeaveDto: UpdateLeaveDto,
		orgId?: number,
		branchId?: number,
		userId?: number,
	): Promise<{ message: string }> {
		try {
			// Find the leave first
			const { leave } = await this.findOne(ref, orgId, branchId, userId);

			if (!leave) {
				throw new NotFoundException('Leave request not found');
			}

			// Check if leave can be updated (only pending leaves can be updated)
			if (leave.status !== LeaveStatus.PENDING) {
				throw new BadRequestException(
					`Leave request cannot be updated because it is already ${leave.status.toLowerCase()}`,
				);
			}

			// Calculate duration if start or end date changes
			if ((updateLeaveDto.startDate || updateLeaveDto.endDate) && !updateLeaveDto.duration) {
				const startDate = new Date(updateLeaveDto.startDate || leave.startDate);
				const endDate = new Date(updateLeaveDto.endDate || leave.endDate);

				// Calculate business days between dates (excluding weekends)
				let duration = 0;
				let currentDate = new Date(startDate);

				while (currentDate <= endDate) {
					const dayOfWeek = currentDate.getDay();
					if (dayOfWeek !== 0 && dayOfWeek !== 6) {
						// Not Sunday (0) or Saturday (6)
						duration++;
					}
					currentDate.setDate(currentDate.getDate() + 1);
				}

				if (updateLeaveDto.isHalfDay !== undefined ? updateLeaveDto.isHalfDay : leave.isHalfDay) {
					duration -= 0.5;
				}

				updateLeaveDto.duration = duration;
			}

			// Update the leave
			await this.leaveRepository.update(ref, {
				...updateLeaveDto,
			});

			// Clear cache
			await this.clearLeaveCache(ref);

			return { message: 'Leave request updated successfully' };
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new BadRequestException(error.message || 'Error updating leave request');
		}
	}

	async approveLeave(
		ref: number,
		approverUid: number,
		orgId?: number,
		branchId?: number,
		userId?: number,
	): Promise<{ message: string }> {
		try {
			// Find the leave first
			const { leave } = await this.findOne(ref, orgId, branchId, userId);

			if (!leave) {
				throw new NotFoundException('Leave request not found');
			}

			// Check if leave can be approved (only pending leaves can be approved)
			if (leave.status !== LeaveStatus.PENDING) {
				throw new BadRequestException(
					`Leave request cannot be approved because it is already ${leave.status.toLowerCase()}`,
				);
			}

			// Find the approver
			const approver = await this.userRepository.findOne({ where: { uid: approverUid } });

			if (!approver) {
				throw new NotFoundException(`Approver with ID ${approverUid} not found`);
			}

			// Store previous status for email
			const previousStatus = leave.status;

			// Update the leave
			await this.leaveRepository.update(ref, {
				status: LeaveStatus.APPROVED,
				approvedBy: approver,
				approvedAt: new Date(),
			});

			// Get updated leave with relations
			const updatedLeave = await this.leaveRepository.findOne({
				where: { uid: ref },
				relations: ['owner', 'approvedBy', 'organisation', 'branch'],
			});

			if (updatedLeave && updatedLeave.owner) {
				// Send status update emails
				await this.leaveEmailService.sendStatusUpdateToUser(
					updatedLeave,
					updatedLeave.owner,
					previousStatus,
					approver
				);
				await this.leaveEmailService.sendStatusUpdateToAdmins(
					updatedLeave,
					updatedLeave.owner,
					previousStatus,
					approver
				);
			}

			// Emit leave approved event for notifications
			this.eventEmitter.emit('leave.approved', {
				leave: updatedLeave,
				approver,
			});

			// Clear cache
			await this.clearLeaveCache(ref);

			return { message: 'Leave request approved successfully' };
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new BadRequestException(error.message || 'Error approving leave request');
		}
	}

	async rejectLeave(
		ref: number,
		rejectionReason: string,
		orgId?: number,
		branchId?: number,
		userId?: number,
	): Promise<{ message: string }> {
		try {
			// Find the leave first
			const { leave } = await this.findOne(ref, orgId, branchId, userId);

			if (!leave) {
				throw new NotFoundException('Leave request not found');
			}

			// Check if leave can be rejected (only pending leaves can be rejected)
			if (leave.status !== LeaveStatus.PENDING) {
				throw new BadRequestException(
					`Leave request cannot be rejected because it is already ${leave.status.toLowerCase()}`,
				);
			}

			// Validate rejection reason
			if (!rejectionReason) {
				throw new BadRequestException('Rejection reason is required');
			}

			// Store previous status for email
			const previousStatus = leave.status;

			// Update the leave
			await this.leaveRepository.update(ref, {
				status: LeaveStatus.REJECTED,
				rejectedAt: new Date(),
				rejectionReason,
			});

			// Get updated leave with relations
			const updatedLeave = await this.leaveRepository.findOne({
				where: { uid: ref },
				relations: ['owner', 'approvedBy', 'organisation', 'branch'],
			});

			if (updatedLeave && updatedLeave.owner) {
				// Send status update emails
				await this.leaveEmailService.sendStatusUpdateToUser(
					updatedLeave,
					updatedLeave.owner,
					previousStatus
				);
				await this.leaveEmailService.sendStatusUpdateToAdmins(
					updatedLeave,
					updatedLeave.owner,
					previousStatus
				);
			}

			// Emit leave rejected event for notifications
			this.eventEmitter.emit('leave.rejected', {
				leave: updatedLeave,
				rejectionReason,
			});

			// Clear cache
			await this.clearLeaveCache(ref);

			return { message: 'Leave request rejected successfully' };
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new BadRequestException(error.message || 'Error rejecting leave request');
		}
	}

	async cancelLeave(
		ref: number,
		cancellationReason: string,
		userId: number,
		orgId?: number,
		branchId?: number,
	): Promise<{ message: string }> {
		try {
			// Find the leave first
			const { leave } = await this.findOne(ref, orgId, branchId, userId);

			if (!leave) {
				throw new NotFoundException('Leave request not found');
			}

			// Check if leave can be canceled (only pending or approved leaves can be canceled)
			if (![LeaveStatus.PENDING, LeaveStatus.APPROVED].includes(leave.status)) {
				throw new BadRequestException(
					`Leave request cannot be canceled because it is already ${leave.status.toLowerCase()}`,
				);
			}

			// Validate cancellation reason
			if (!cancellationReason) {
				throw new BadRequestException('Cancellation reason is required');
			}

			// Check if the user canceling is the owner or has admin privileges
			// This check would be more robust in a real application
			const isOwner = leave.owner?.uid === userId;
			// We're assuming here that non-owners are authorized through the controller's @Roles decorator

			// Determine which cancellation status to use
			const cancellationStatus = isOwner ? LeaveStatus.CANCELLED_BY_USER : LeaveStatus.CANCELLED_BY_ADMIN;

			// Update the leave
			await this.leaveRepository.update(ref, {
				status: cancellationStatus,
				cancelledAt: new Date(),
				cancellationReason,
			});

			// Emit leave canceled event for notifications
			this.eventEmitter.emit('leave.canceled', {
				leave,
				cancellationReason,
				canceledBy: userId,
			});

			// Clear cache
			await this.clearLeaveCache(ref);

			return { message: 'Leave request canceled successfully' };
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new BadRequestException(error.message || 'Error canceling leave request');
		}
	}

	async remove(ref: number, orgId?: number, branchId?: number, userId?: number): Promise<{ message: string }> {
		try {
			// Find the leave first
			const { leave } = await this.findOne(ref, orgId, branchId, userId);

			if (!leave) {
				throw new NotFoundException('Leave request not found');
			}

			// Soft delete the leave
			await this.leaveRepository.softDelete(ref);

			// Clear cache
			await this.clearLeaveCache(ref);

			return { message: 'Leave request deleted successfully' };
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new BadRequestException(error.message || 'Error deleting leave request');
		}
	}
}
