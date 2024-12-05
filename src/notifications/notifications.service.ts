import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

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

	async findOne(referenceCode: number): Promise<{ message: string, notification: Notification | null }> {
		try {
			const notification = await this.notificationRepository.findOne({ where: { uid: referenceCode }, relations: ['user'] });

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

	async update(referenceCode: number, updateNotificationDto: UpdateNotificationDto): Promise<{ message: string }> {
		try {
			const notification = await this.notificationRepository.update(referenceCode, updateNotificationDto);

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

	async remove(referenceCode: number): Promise<{ message: string }> {
		try {
			const notification = await this.notificationRepository.delete(referenceCode);

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
