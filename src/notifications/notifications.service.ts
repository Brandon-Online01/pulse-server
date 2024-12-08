import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Any } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationResponse } from 'src/lib/types/notification';
import { formatDistanceToNow } from 'date-fns';

@Injectable()
export class NotificationsService {
	constructor(
		@InjectRepository(Notification)
		private readonly notificationRepository: Repository<Notification>
	) { }

	async create(createNotificationDto: CreateNotificationDto): Promise<{ message: string }> {
		try {
			const notification = await this.notificationRepository.save(createNotificationDto);

			if (!notification) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}

			return response;
		}
	}

	async findAll(): Promise<{ message: string, notifications: Notification[] | null }> {
		try {
			const notifications = await this.notificationRepository.find();

			if (!notifications) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				notifications: notifications
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				notifications: null
			}

			return response;
		}
	}

	async findOne(ref: number): Promise<{ message: string, notification: Notification | null }> {
		try {
			const notification = await this.notificationRepository.findOne({ where: { uid: ref }, relations: ['user'] });

			if (!notification) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				notification: notification
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				notification: null
			}

			return response;
		}
	}

	async findForUser(ref: number): Promise<{ message: string, notification: NotificationResponse[] | null }> {
		try {
			const notifications = await this.notificationRepository.find({
				where: {
					owner: {
						uid: ref
					}
				}
			});

			if (!notifications.length) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				notification: notifications.map(notification => ({
					...notification,
					createdAt: `${notification.createdAt}`,
					updatedAt: `${notification.updatedAt}`,
					recordAge: formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }),
					updateAge: formatDistanceToNow(new Date(notification.updatedAt), { addSuffix: true })
				}))
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
				notification: null
			}

			return response;
		}
	}

	async update(ref: number, updateNotificationDto: UpdateNotificationDto): Promise<{ message: string }> {
		try {
			const notification = await this.notificationRepository.update(ref, updateNotificationDto);

			if (!notification) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}

			return response;
		}
	}

	async remove(ref: number): Promise<{ message: string }> {
		try {
			const notification = await this.notificationRepository.delete(ref);

			if (!notification) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			}
		}
	}
}
