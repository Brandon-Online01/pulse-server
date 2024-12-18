import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { ResellerStatus } from "../../lib/enums/product.enums";

@Entity('reseller')
export class Reseller {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false, length: 100, type: 'varchar' })
    name: string;

    @Column({ nullable: false, length: 100, type: 'varchar' })
    description: string;

    @Column({ nullable: false, length: 100, type: 'varchar' })
    logo: string;

    @Column({ nullable: false, length: 100, type: 'varchar' })
    website: string;

    @Column({ nullable: false, type: 'enum', enum: ResellerStatus, default: ResellerStatus.ACTIVE })
    status: ResellerStatus;

    @Column({ nullable: false, length: 100, type: 'varchar' })
    contactPerson: string;

    @Column({ nullable: false, length: 100, type: 'varchar' })
    phone: string;

    @Column({ nullable: false, length: 100, type: 'varchar' })
    email: string;

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

    @OneToMany(() => Product, (product) => product?.reseller)
    products: Product[];

    @Column({ nullable: false, default: false })
    isDeleted: boolean;

    @Column({ nullable: false, length: 100, type: 'varchar' })
    address: string;
}
