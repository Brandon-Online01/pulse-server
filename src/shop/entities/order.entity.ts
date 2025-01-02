import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../../lib/enums/status.enums';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ unique: true })
    orderNumber: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column()
    totalItems: number;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    orderDate: Date;

    @ManyToOne(() => User, { eager: true })
    placedBy: User;

    @ManyToOne(() => Client, { eager: true })
    client: Client;

    @OneToMany(() => OrderItem, orderItem => orderItem.order, { eager: true, cascade: true })
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
}
