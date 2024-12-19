import { OrderItem } from "./order-item.entity";
import { Client } from "src/clients/entities/client.entity";
import { OrderStatus } from "src/lib/enums/status.enums";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";

@Entity('order')
export class Order {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false, type: 'varchar', length: 100 })
    orderNumber: string;

    @Column({ nullable: false, type: 'varchar', length: 100 })
    totalItems: string;

    @Column({ nullable: false, type: 'varchar', length: 100 })
    totalAmount: string;


    @Column({ nullable: false, type: 'varchar', length: 100, default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP'
    })
    orderDate: Date;

    @ManyToOne(() => User, (user) => user?.orders, { nullable: false })
    placedBy: User;

    @OneToMany(() => OrderItem, orderItem => orderItem?.order, {
        cascade: true,
        eager: true
    })
    orderItems: OrderItem[];

    @ManyToOne(() => Client, (client) => client?.orders, { nullable: false })
    client: Client;
}
