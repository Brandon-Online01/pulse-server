import { Branch } from "src/branch/entities/branch.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('check-ins')
export class CheckIn {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ type: 'varchar', nullable: false })
    checkInTime: Date;

    @Column({ type: 'varchar', nullable: false })
    checkInPhoto: string;

    @Column({ type: 'varchar', nullable: false })
    checkInLocation: string;

    @Column({ type: 'varchar', nullable: true })
    checkOutTime: Date;

    @Column({ type: 'varchar', nullable: true })
    checkOutPhoto: string;

    @Column({ type: 'varchar', nullable: true })
    checkOutLocation: string;

    @Column({ type: 'varchar', nullable: true })
    duration: string;

    @ManyToOne(() => User, (user) => user?.checkIns)
    owner: User;

    @ManyToOne(() => Branch, (branch) => branch?.checkIns)
    branch: Branch;
}
