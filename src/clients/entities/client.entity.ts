import { GeneralStatus } from '../../lib/enums/status.enums';
import { Lead } from '../../leads/entities/lead.entity';
import { User } from '../../user/entities/user.entity';
import { Order } from '../../shop/entities/order.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Column, Entity, OneToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CheckIn } from '../../check-ins/entities/check-in.entity';

export enum CustomerType {
    STANDARD = 'standard',
    PREMIUM = 'premium',
    VIP = 'vip',
    WHOLESALE = 'wholesale'
}

@Entity('client')
export class Client {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false, unique: true })
    name: string;

    @Column({ nullable: false })
    contactPerson: string;

    @Column({ nullable: false, unique: true })
    email: string;

    @Column({ nullable: false, unique: true })
    phone: string;

    @Column({ nullable: true, unique: true })
    alternativePhone: string;

    @Column({ nullable: true, unique: true })
    website: string;

    @Column({ nullable: true, unique: true })
    logo: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: false })
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    postalCode: string;

    @Column({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;

    @Column({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @Column({ nullable: false, default: GeneralStatus.ACTIVE })
    status: GeneralStatus;

    @Column({ default: false })
    isDeleted: boolean;

    @Column({ nullable: false })
    ref: string;

    @ManyToOne(() => User, (user) => user?.clients, { nullable: true })
    assignedSalesRep: User;

    @OneToMany(() => Lead, (lead) => lead?.client, { nullable: true })
    leads: Lead[];

    @OneToMany(() => Order, (order) => order?.client, { nullable: true })
    orders: Order[];

    @OneToMany(() => Task, (task) => task?.client, { nullable: true })
    tasks: Task[];

    @OneToMany(() => CheckIn, (checkIn) => checkIn?.client, { nullable: true })
    checkIns: CheckIn[];

    @Column({ type: 'enum', enum: CustomerType, default: CustomerType.STANDARD })
    type: CustomerType;
}
