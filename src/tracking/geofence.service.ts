import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Geofence } from './entities/geofence.entity';
import { GeofenceEvent } from './entities/geofence-event.entity';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { UpdateGeofenceDto } from './dto/update-geofence.dto';
import { CreateGeofenceEventDto } from './dto/create-geofence-event.dto';
import { User } from '../user/entities/user.entity';
import { Organisation } from '../organisation/entities/organisation.entity';
import { GeofenceArea } from './interfaces/geofence-area.interface';

@Injectable()
export class GeofenceService {
	constructor(
		@InjectRepository(Geofence)
		private readonly geofenceRepository: Repository<Geofence>,
		@InjectRepository(GeofenceEvent)
		private readonly geofenceEventRepository: Repository<GeofenceEvent>,
		@InjectRepository(Organisation)
		private readonly organisationRepository: Repository<Organisation>,
	) {}

	async createGeofence(
		createGeofenceDto: CreateGeofenceDto,
		user: User,
	): Promise<{ geofence: Geofence | null; message: string }> {
		try {
			const organisationId = createGeofenceDto.organisationId || user.organisationRef;

			if (!organisationId) {
				throw new BadRequestException('Organisation ID is required');
			}

			// Find the organisation
			const organisation = await this.organisationRepository.findOne({
				where: { uid: Number(organisationId) },
			});

			if (!organisation) {
				throw new NotFoundException(`Organisation with ID ${organisationId} not found`);
			}

			// Create new geofence with the provided data and tracking information
			const newGeofence = new Geofence();
			Object.assign(newGeofence, {
				...createGeofenceDto,
				organisation,
				isActive: true,
				createdById: user.uid,
				updatedById: user.uid,
			});

			const savedGeofence = await this.geofenceRepository.save(newGeofence);

			return {
				geofence: savedGeofence,
				message: process.env.SUCCESS_MESSAGE || 'Geofence created successfully',
			};
		} catch (error) {
			return {
				geofence: null,
				message: error?.message || 'Failed to create geofence',
			};
		}
	}

	async findAllByOrganisation(organisationId: number): Promise<{ geofences: Geofence[]; message: string }> {
		try {
			const geofences = await this.geofenceRepository.find({
				where: { 
					organisation: { uid: organisationId }, 
					isActive: true 
				},
				relations: ['organisation'],
				order: { createdAt: 'DESC' },
			});

			return {
				geofences,
				message: process.env.SUCCESS_MESSAGE || 'Geofences retrieved successfully',
			};
		} catch (error) {
			return {
				geofences: [],
				message: error?.message || 'Failed to retrieve geofences',
			};
		}
	}

	async findOne(ref: string): Promise<{ geofence: Geofence | null; message: string }> {
		try {
			const geofence = await this.geofenceRepository.findOne({
				where: { uid: ref, isActive: true },
				relations: ['organisation'],
			});

			if (!geofence) {
				throw new NotFoundException(`Geofence with ID ${ref} not found`);
			}

			return {
				geofence,
				message: process.env.SUCCESS_MESSAGE || 'Geofence retrieved successfully',
			};
		} catch (error) {
			return {
				geofence: null,
				message: error?.message || 'Failed to retrieve geofence',
			};
		}
	}

	async update(
		id: string,
		updateGeofenceDto: UpdateGeofenceDto,
		user: User,
	): Promise<{ geofence: Geofence | null; message: string }> {
		try {
			const { geofence } = await this.findOne(id);

			if (!geofence) {
				throw new NotFoundException(`Geofence with ID ${id} not found`);
			}

			// Check if organisation is being updated
			if (updateGeofenceDto.organisationId) {
				const organisation = await this.organisationRepository.findOne({
					where: { uid: Number(updateGeofenceDto.organisationId) },
				});

				if (!organisation) {
					throw new NotFoundException(`Organisation with ID ${updateGeofenceDto.organisationId} not found`);
				}

				geofence.organisation = organisation;
			}

			// Update the geofence with the new data and tracking information
			Object.assign(geofence, {
				...updateGeofenceDto,
				updatedById: user.uid,
				updatedAt: new Date(),
			});

			const updatedGeofence = await this.geofenceRepository.save(geofence);

			return {
				geofence: updatedGeofence,
				message: process.env.SUCCESS_MESSAGE || 'Geofence updated successfully',
			};
		} catch (error) {
			return {
				geofence: null,
				message: error?.message || 'Failed to update geofence',
			};
		}
	}

	async remove(ref: string, user: User): Promise<{ success: boolean; message: string }> {
		try {
			const geofence = await this.geofenceRepository.findOne({
				where: { uid: ref, isActive: true },
			});

			if (!geofence) {
				throw new NotFoundException(`Geofence with ID ${ref} not found`);
			}

			// Soft delete by updating isActive and tracking information
			Object.assign(geofence, {
				isActive: false,
				deletedById: user.uid,
				deletedAt: new Date(),
			});

			await this.geofenceRepository.save(geofence);

			return {
				success: true,
				message: process.env.SUCCESS_MESSAGE || 'Geofence deleted successfully',
			};
		} catch (error) {
			return {
				success: false,
				message: error?.message || 'Failed to delete geofence',
			};
		}
	}

	async createGeofenceEvent(
		createGeofenceEventDto: CreateGeofenceEventDto,
		user: User,
	): Promise<{ event: GeofenceEvent | null; message: string }> {
		try {
			// Find the geofence
			const geofence = await this.geofenceRepository.findOne({
				where: { uid: createGeofenceEventDto.geofenceId, isActive: true },
			});

			if (!geofence) {
				throw new NotFoundException(`Geofence with ID ${createGeofenceEventDto.geofenceId} not found`);
			}

			// Create new event with proper type casting
			const newEvent = new GeofenceEvent();
			Object.assign(newEvent, {
				...createGeofenceEventDto,
				userId: user.uid,
				geofenceId: geofence.uid,
				deviceInfo: createGeofenceEventDto.deviceInfo || {},
			});

			const savedEvent = await this.geofenceEventRepository.save(newEvent);

			return {
				event: savedEvent,
				message: process.env.SUCCESS_MESSAGE || 'Geofence event created successfully',
			};
		} catch (error) {
			return {
				event: null,
				message: error?.message || 'Failed to create geofence event',
			};
		}
	}

	async findUserEvents(userRef: string, limit = 100): Promise<{ events: GeofenceEvent[]; message: string }> {
		try {
			const events = await this.geofenceEventRepository.find({
				where: { userId: userRef },
				order: { createdAt: 'DESC' },
				take: limit,
				relations: ['geofence'],
			});

			return {
				events,
				message: process.env.SUCCESS_MESSAGE || 'User geofence events retrieved successfully',
			};
		} catch (error) {
			return {
				events: [],
				message: error?.message || 'Failed to retrieve user geofence events',
			};
		}
	}

	async findGeofenceEvents(geofenceRef: string, limit = 100): Promise<{ events: GeofenceEvent[]; message: string }> {
		try {
			const events = await this.geofenceEventRepository.find({
				where: { geofenceId: geofenceRef },
				order: { createdAt: 'DESC' },
				take: limit,
				relations: ['user'],
			});

			return {
				events,
				message: process.env.SUCCESS_MESSAGE || 'Geofence events retrieved successfully',
			};
		} catch (error) {
			return {
				events: [],
				message: error?.message || 'Failed to retrieve geofence events',
			};
		}
	}

	async getGeofenceAreasForMobile(user: User): Promise<{ areas: GeofenceArea[]; message: string }> {
		try {
			const { geofences } = await this.findAllByOrganisation(Number(user?.organisationRef));

			const areas: GeofenceArea[] = geofences.map((geofence) => ({
				identifier: geofence.uid,
				latitude: geofence.latitude,
				longitude: geofence.longitude,
				radius: geofence.radius,
				name: geofence.name,
				description: geofence.description,
			}));

			return {
				areas,
				message: process.env.SUCCESS_MESSAGE || 'Geofence areas retrieved successfully',
			};
		} catch (error) {
			return {
				areas: [],
				message: error?.message || 'Failed to retrieve geofence areas for mobile',
			};
		}
	}
}
