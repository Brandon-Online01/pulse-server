import { Status } from "../../lib/enums/enums";
import { Branch } from "../../branch/entities/branch.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('organisation')
export class Organisation {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false, unique: true })
    name: string;

    @Column({ nullable: false, unique: true })
    address: string;

    @Column({ nullable: false, unique: true })
    email: string;

    @Column({ nullable: false, unique: true })
    phone: string;

    @Column({ nullable: false, unique: true })
    website: string;

    @Column({ nullable: false })
    logo: string;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ nullable: false })
    status: Status;

    @Column({ nullable: false, default: false })
    isDeleted: boolean;

    @Column({ nullable: false, unique: true })
    referenceCode: string;

    @OneToMany(() => Branch, (branch) => branch.referenceCode)
    branches: Branch[];
}
