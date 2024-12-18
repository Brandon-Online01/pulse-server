import { OrderItem } from "../../shop/entities/order-item.entity";
import { Reseller } from "../../resellers/entities/reseller.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { ProductStatus } from "../../lib/enums/product.enums";

@Entity('product')
export class Product {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false, length: 100, type: 'varchar' })
    name: string;

    @Column({ nullable: false, length: 100, type: 'varchar' })
    description: string;

    @Column({ nullable: false, length: 1000, type: 'varchar' })
    image: string;

    @Column({ nullable: false, type: 'float' })
    price: number;

    @Column({ nullable: true, type: 'float' })
    salePrice: number;

    @Column({ nullable: true, type: 'datetime' })
    saleStart: Date;

    @Column({ nullable: true, type: 'datetime' })
    saleEnd: Date;

    @Column({ nullable: true, type: 'float' })
    discount: number;

    @Column({ nullable: false, type: 'int' })
    barcode: number;

    @Column({ nullable: true, type: 'int' })
    packageQuantity: number;

    @Column({ nullable: false, type: 'varchar', length: 100 })
    category: string;

    @Column({ nullable: false, type: 'varchar', length: 100 })
    brand: string;

    @Column({ nullable: true, type: 'int' })
    weight: number;

    @Column({ nullable: false, type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
    status: ProductStatus;

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

    @ManyToOne(() => Reseller, reseller => reseller?.products)
    reseller: Reseller;

    @Column({ nullable: false, default: false })
    isDeleted: boolean;

    @Column({ nullable: false, default: false })
    isOnPromotion: boolean;

    @OneToMany(() => OrderItem, orderItem => orderItem?.product)
    orderItems: OrderItem[];
}

