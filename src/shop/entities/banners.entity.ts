import { BannerCategory } from "src/lib/enums/category.enum";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('banners')
export class Banners {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false, type: 'varchar' })
    title: string;

    @Column({ nullable: false, type: 'varchar' })
    subtitle: string;

    @Column({ nullable: false, type: 'varchar' })
    description: string;

    @Column({ nullable: false, type: 'varchar' })
    image: string;

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

    @Column({ nullable: false, type: 'enum', enum: BannerCategory, default: BannerCategory.NEWS })
    category: BannerCategory;
} 