import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { QuotationItem } from './quotation-item.entity';
import { OrderStatus } from '../../lib/enums/status.enums';
import { User } from '../../user/entities/user.entity';

@Entity('quotation')
export class Quotation {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ unique: true })
    quotationNumber: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column()
    totalItems: number;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    quotationDate: Date;

    @ManyToOne(() => User, { eager: true })
    placedBy: User;

    @ManyToOne(() => Client, { eager: true })
    client: Client;

    @OneToMany(() => QuotationItem, quotationItem => quotationItem.quotation, { eager: true, cascade: true })
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
}