import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Organisation } from './organisation.entity';

@Entity()
export class OrganisationSettings {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({ type: 'json', nullable: true })
	contact: {
		email: string;
		phone: {
			code: string;
			number: string;
		};
		website: string;
		address: string;
	};

	@Column({ type: 'json', nullable: true })
	regional: {
		language: string;
		timezone: string;
		currency: string;
		dateFormat: string;
		timeFormat: string;
	};

	@Column({ type: 'json', nullable: true })
	branding: {
		logo: string;
		logoAltText: string;
		favicon: string;
		primaryColor: string;
		secondaryColor: string;
		accentColor: string;
	};

	@Column({ type: 'json', nullable: true })
	business: {
		name: string;
		registrationNumber: string;
		taxId: string;
		industry: string;
		size: 'small' | 'medium' | 'large' | 'enterprise';
	};

	@Column({ type: 'json', nullable: true })
	notifications: {
		email: boolean;
		sms: boolean;
		push: boolean;
		whatsapp: boolean;
	};

	@Column({ type: 'json', nullable: true })
	preferences: {
		defaultView: string;
		itemsPerPage: number;
		theme: 'light' | 'dark' | 'system';
		menuCollapsed: boolean;
	};

	@Column({ type: 'int', default: 500 })
	geofenceDefaultRadius: number;

	@Column({ type: 'boolean', default: false })
	geofenceEnabledByDefault: boolean;

	@Column({ type: 'varchar', length: 50, default: 'NOTIFY' })
	geofenceDefaultNotificationType: string;

	@Column({ type: 'int', default: 5000 })
	geofenceMaxRadius: number;

	@Column({ type: 'int', default: 100 })
	geofenceMinRadius: number;

	@Column({ default: false })
	isDeleted: boolean;

	@Column({ default: false })
	sendTaskNotifications: boolean;

	@Column({ default: 30 })
	feedbackTokenExpiryDays: number;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
	updatedAt: Date;

	@OneToOne(() => Organisation, (organisation) => organisation.settings)
	@JoinColumn({ name: 'organisationUid' })
	organisation: Organisation;

	@Column()
	organisationUid: number;
}
