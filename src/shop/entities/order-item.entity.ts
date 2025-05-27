import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_item')
@Index(['order'])
@Index(['product'])
@Index(['isShipped'])
@Index(['order', 'product'])
export class OrderItem {
	@PrimaryGeneratedColumn()
	uid: number;

	@ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
	order: Order;

	@ManyToOne(() => Product, { eager: true })
	product: Product;

	@Column()
	quantity: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	unitPrice: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	totalPrice: number;

	@Column({ nullable: true })
	notes: string;

	@Column({ default: false })
	isShipped: boolean;

	@Column({ nullable: true })
	serialNumber: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
} 