import { Client } from '../../clients/entities/client.entity';
import { OrderItem } from '../../shop/entities/order-item.entity';
import { OrderStatus } from '../../lib/enums/status.enums';
import { User } from '../../user/entities/user.entity';
import { Organisation } from '../../organisation/entities/organisation.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { Quotation } from './quotation.entity';
import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
	JoinColumn,
} from 'typeorm';

@Entity('order')
export class Order {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({ unique: true })
	orderNumber: string;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	totalAmount: number;

	@Column()
	totalItems: number;

	@Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.IN_FULFILLMENT })
	status: OrderStatus;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	orderDate: Date;

	@ManyToOne(() => User, { eager: true })
	placedBy: User;

	@ManyToOne(() => Client, { eager: true })
	client: Client;

	@OneToMany(() => OrderItem, (orderItem) => orderItem.order, { eager: true, cascade: true })
	orderItems: OrderItem[];

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

	// Original quotation reference
	@ManyToOne(() => Quotation, (quotation) => quotation.orders)
	@JoinColumn()
	quotation: Quotation;

	@Column({ nullable: false })
	quotationId: number;

	@Column({ nullable: true })
	quotationNumber: string;

	// Payment tracking
	@Column({ default: false })
	isPaid: boolean;

	@Column({ type: 'timestamp', nullable: true })
	paidAt: Date;

	@Column({ nullable: true })
	paymentMethod: string;

	@Column({ nullable: true })
	paymentReference: string;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
	paidAmount: number;

	// Shipping tracking
	@Column({ nullable: true })
	trackingNumber: string;

	@Column({ nullable: true })
	carrier: string;

	@Column({ type: 'timestamp', nullable: true })
	shippedAt: Date;

	@Column({ type: 'timestamp', nullable: true })
	deliveredAt: Date;

	// Relations
	@ManyToOne(() => Branch, (branch) => branch?.orders, { nullable: true })
	branch: Branch;

	@ManyToOne(() => Organisation, (organisation) => organisation?.orders, { nullable: true })
	organisation: Organisation;
}
