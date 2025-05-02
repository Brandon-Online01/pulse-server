import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, IsNull, In, Not } from 'typeorm';
import { startOfDay } from 'date-fns';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { AttendanceStatus } from '../../lib/enums/attendance.enums';
import { Client } from '../../clients/entities/client.entity';
import { Competitor } from '../../competitors/entities/competitor.entity';
import { Quotation } from '../../shop/entities/quotation.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { Organisation } from '../../organisation/entities/organisation.entity';

interface MapDataRequestParams {
	organisationId: number;
	branchId?: number;
}

@Injectable()
export class MapDataReportGenerator {
	private readonly logger = new Logger(MapDataReportGenerator.name);

	constructor(
		@InjectRepository(Attendance)
		private attendanceRepository: Repository<Attendance>,
		@InjectRepository(Client)
		private clientRepository: Repository<Client>,
		@InjectRepository(Competitor)
		private competitorRepository: Repository<Competitor>,
		@InjectRepository(Quotation)
		private quotationRepository: Repository<Quotation>,
		@InjectRepository(Branch)
		private branchRepository: Repository<Branch>,
		@InjectRepository(Organisation)
		private organisationRepository: Repository<Organisation>,
	) {}

	async generate(params: MapDataRequestParams): Promise<Record<string, any>> {
		try {
			const { organisationId, branchId } = params;
			const todayStart = startOfDay(new Date());

			// ---------- WORKERS (Employees currently checked-in) ----------
			const activeAttendance = await this.attendanceRepository.find({
				where: {
					organisation: { uid: organisationId },
					...(branchId ? { branch: { uid: branchId } } : {}),
					status: In([AttendanceStatus.PRESENT, AttendanceStatus.ON_BREAK]),
					checkIn: MoreThanOrEqual(todayStart),
					checkOut: IsNull(),
				},
				relations: ['owner'],
			});

			const workers = activeAttendance
				.filter((a) => a.checkInLatitude && a.checkInLongitude)
				.map((a) => ({
					id: a.owner?.uid,
					name: a.owner?.name,
					position: [Number(a.checkInLatitude), Number(a.checkInLongitude)] as [number, number],
					latitude: Number(a.checkInLatitude),
					longitude: Number(a.checkInLongitude),
					markerType: 'check-in',
					status: a.status,
					checkInTime: a.checkIn?.toISOString(),
				}));

			// ---------- CLIENTS ----------
			const clients = await this.clientRepository.find({
				where: {
					organisation: { uid: organisationId },
					...(branchId ? { branch: { uid: branchId } } : {}),
					latitude: Not(IsNull()),
					longitude: Not(IsNull()),
				},
				select: ['uid', 'name', 'latitude', 'longitude', 'address', 'status'],
			});

			const clientMarkers = clients.map((c) => ({
				id: c.uid,
				name: c.name,
				position: [Number(c.latitude), Number(c.longitude)] as [number, number],
				latitude: Number(c.latitude),
				longitude: Number(c.longitude),
				address: c.address,
				clientRef: c?.uid,
				status: c.status ?? 'active',
				markerType: 'client',
			}));

			// ---------- COMPETITORS ----------
			const competitors = await this.competitorRepository.find({
				where: {
					organisation: { uid: organisationId },
					latitude: Not(IsNull()),
					longitude: Not(IsNull()),
				},
				select: ['uid', 'name', 'latitude', 'longitude', 'address', 'industry', 'competitorRef', 'status'],
			});

			const competitorMarkers = competitors.map((c) => ({
				id: c.uid,
				name: c.name,
				position: [Number(c.latitude), Number(c.longitude)] as [number, number],
				latitude: Number(c.latitude),
				longitude: Number(c.longitude),
				address: c.address,
				industry: c.industry,
				competitorRef: (c as any).competitorRef,
				status: c.status ?? 'active',
				markerType: 'competitor',
			}));

			// ---------- QUOTATIONS (recent) ----------
			const quotationsRaw = await this.quotationRepository.find({
				where: {
					organisation: { uid: organisationId },
					createdAt: MoreThanOrEqual(todayStart),
				},
				relations: ['client'],
				select: ['uid', 'totalAmount', 'status', 'client', 'quotationNumber', 'createdAt'],
			});
			const quotations = quotationsRaw
				.filter((q) => q.client?.latitude && q.client?.longitude)
				.map((q) => ({
					id: q.uid,
					quotationNumber: (q as any).quotationNumber,
					clientName: q.client.name,
					position: [Number(q.client.latitude), Number(q.client.longitude)] as [number, number],
					latitude: Number(q.client.latitude),
					longitude: Number(q.client.longitude),
					totalAmount: q.totalAmount,
					status: q.status,
					quotationDate: q.createdAt,
					validUntil: (q as any).expiryDate,
					markerType: 'quotation',
				}));

			// ---------- Map Config ----------
			let defaultCenter = { lat: 0, lng: 0 };
			const organisation = await this.organisationRepository.findOne({ where: { uid: organisationId } });
			if (organisation && (organisation as any).latitude && (organisation as any).longitude) {
				defaultCenter = { lat: (organisation as any).latitude, lng: (organisation as any).longitude };
			} else if (workers.length > 0) {
				defaultCenter = { lat: workers[0].latitude, lng: workers[0].longitude };
			}

			const branches = await this.branchRepository.find({
				where: { organisation: { uid: organisationId } },
				select: ['uid', 'name', 'address'],
			});

			const orgRegions: Array<{ name: string; center: { lat: number; lng: number }; zoom: number }> = [];

			return {
				workers,
				clients: clientMarkers,
				competitors: competitorMarkers,
				quotations,
				mapConfig: {
					defaultCenter,
					orgRegions,
				},
			};
		} catch (error) {
			this.logger.error(`Error generating map data: ${error.message}`, error.stack);
			throw error;
		}
	}
}
