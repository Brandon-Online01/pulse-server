import { Product } from "src/products/entities/product.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Order } from "./order.entity";

@Entity('order_item')
export class OrderItem {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false, type: 'int' })
    quantity: number;

    @Column({ nullable: false, type: 'float' })
    totalPrice: number;

    @ManyToOne(() => Product, product => product?.orderItems)
    product: Product;

    @ManyToOne(() => Order, order => order?.orderItems)
    order: Order;

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
} 