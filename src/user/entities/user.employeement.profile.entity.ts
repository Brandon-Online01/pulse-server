import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";

@Entity('user_employeement_profile')
export class UserEmployeementProfile {
    @PrimaryGeneratedColumn()
    uid: string;

    @Column({ nullable: true })
    startDate: Date;

    @Column({ nullable: true })
    endDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    branchReferenceCode: string;

    @Column({ nullable: true })
    department: string; F

    @Column({ nullable: true })
    position: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    contactNumber: string;

    @Column({ default: true })
    isCurrentlyEmployed: boolean;

    //relationships
    @OneToOne(() => User, (user) => user?.userEmployeementProfile)
    owner: User;
}
