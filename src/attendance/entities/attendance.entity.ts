import { AttendanceStatus } from 'src/lib/enums/enums';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

@Entity('attendance')
export class Attendance {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({
        type: 'enum',
        enum: AttendanceStatus,
        default: AttendanceStatus.PRESENT
    })
    status: AttendanceStatus;

    @Column({ type: 'timestamp' })
    checkIn: Date;

    @Column({ type: 'timestamp', nullable: true })
    checkOut: Date;

    @Column({ type: 'int', nullable: true })
    duration: number;

    @Column({ nullable: true })
    checkInEventTag: string;

    @Column({ nullable: true })
    checkOutEventTag: string;

    @Column({ type: 'decimal', nullable: true })
    checkInLatitude: number;

    @Column({ type: 'decimal', nullable: true })
    checkInLongitude: number;

    @Column({ type: 'decimal', nullable: true })
    checkOutLatitude: number;

    @Column({ type: 'decimal', nullable: true })
    checkOutLongitude: number;

    @Column({ type: 'text', nullable: true })
    checkInNotes: string;

    @Column({ type: 'text', nullable: true })
    checkOutNotes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    createdBy: string;

    @Column({ nullable: true })
    updatedBy: string;

    @Column({ nullable: true })
    verifiedBy: string;

    @Column({ type: 'timestamp', nullable: true })
    verifiedAt: Date;

    @Column({ nullable: true })
    checkInDeviceMacAddress: string;

    @Column({ nullable: true })
    checkOutDeviceMacAddress: string;

    @Column({ nullable: true })
    employeeReferenceCode: string;

    // relations
    @ManyToOne(() => User, (user) => user?.userAttendances)
    owner: User;
}
