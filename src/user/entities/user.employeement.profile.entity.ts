import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('user_employeement_profile')
export class UserEmployeementProfile {
    @PrimaryGeneratedColumn('uuid')
    uid: string;

    @Column({ nullable: true })
    branchReferenceCode: string;

    @Column({ nullable: true })
    position: string;

    @Column({ nullable: true })
    department: string;

    @Column({ nullable: true })
    startDate: Date;

    @Column({ nullable: true })
    endDate: Date;

    @Column({ default: true })
    isCurrentlyEmployed: boolean;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    contactNumber: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}