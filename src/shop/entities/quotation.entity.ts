import { Client } from '../../clients/entities/client.entity';
import { QuotationItem } from './quotation-item.entity';
import { OrderStatus } from '../../lib/enums/status.enums';
import { User } from '../../user/entities/user.entity';
import { Organisation } from '../../organisation/entities/organisation.entity';
import { Branch } from '../../branch/entities/branch.entity';
import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
} from 'typeorm';
import { Order } from './order.entity';
import { Interaction } from '../../interactions/entities/interaction.entity';

@Entity('quotation')
export class Quotation {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({ unique: true, nullable: false })
	quotationNumber: string;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	totalAmount: number;

	@Column()
	totalItems: number;

	@Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.DRAFT })
	status: OrderStatus;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	quotationDate: Date;

	@ManyToOne(() => User, { eager: true })
	placedBy: User;

	@ManyToOne(() => Client, { eager: true })
	client: Client;

	@OneToMany(() => QuotationItem, (quotationItem) => quotationItem.quotation, { eager: true, cascade: true })
	quotationItems: QuotationItem[];

	@Column({ nullable: true })
	shippingMethod: string;

	@Column({ nullable: true })
	notes: string;

	@Column({ nullable: true })
	shippingInstructions: string;

	@Column({ nullable: true })
	packagingRequirements: string;

	@ManyToOne(() => User, { nullable: true })
	reseller: User;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
	resellerCommission: number;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@Column({ type: 'timestamp', nullable: true })
	validUntil: Date;

	@Column({ nullable: true })
	reviewToken: string;

	@Column({ nullable: true })
	reviewUrl: string;

	// Currency information
	@Column({ nullable: true, length: 6, default: 'ZAR' })
	currency: string;

	// Conversion tracking
	@Column({ default: false })
	isConverted: boolean;

	@Column({ type: 'timestamp', nullable: true })
	convertedAt: Date;

	@Column({ nullable: true })
	convertedBy: number;

	@OneToMany(() => Order, (order) => order.quotation)
	orders: Order[];

	// Relations
	@ManyToOne(() => Branch, (branch) => branch?.quotations, { nullable: true })
	branch: Branch;

	@ManyToOne(() => Organisation, (organisation) => organisation?.quotations, { nullable: true })
	organisation: Organisation;

	@OneToMany(() => Interaction, (interaction) => interaction.quotation)
	interactions: Interaction[];
}
