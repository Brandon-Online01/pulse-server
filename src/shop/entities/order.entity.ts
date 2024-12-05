import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Product } from "./product.entity";
import { User } from "../../user/entities/user.entity";
import { InvoiceRecipient } from "src/lib/enums/enums";

@Entity('order')
export class Order {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false, type: 'int' })
    quantity: number;

    @Column({ nullable: false, type: 'float' })
    totalPrice: number;

    @ManyToOne(() => Product, product => product.uid)
    product: Product;

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
    updatedAt: Date


    @Column({ nullable: false, type: 'enum', enum: InvoiceRecipient, default: InvoiceRecipient.BUYER })
    invoiceRecipient: InvoiceRecipient;

    @ManyToOne(() => User, user => user.orders)
    createdBy: User;
}
