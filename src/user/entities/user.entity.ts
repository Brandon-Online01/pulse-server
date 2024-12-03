import { AccessLevel, Status } from '../../lib/enums/enums';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserProfile } from './user.profile.entity';
import { UserEmployeementProfile } from './user.employeement.profile.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { Claim } from 'src/claims/entities/claim.entity';
import { Doc } from 'src/docs/entities/doc.entity';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    surname: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ nullable: false })
    phone: string;

    @Column({ nullable: false })
    photoURL: string;

    @Column({ nullable: false, default: AccessLevel.USER })
    accessLevel: AccessLevel;

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

    @Column({
        nullable: true,
        default: null
    })
    deletedAt: Date;

    @Column({ nullable: false, default: Status.ACTIVE })
    status: Status;

    @Column({ nullable: false })
    username: string;

    @Column({ nullable: false })
    password: string;

    @Column({ default: false })
    isDeleted: boolean;

    @Column({ nullable: false })
    userReferenceCode: string;


    //relationships
    @OneToOne(() => UserProfile, (userProfile) => userProfile?.owner)
    @JoinColumn()
    userProfile: UserProfile;

    @OneToOne(() => UserEmployeementProfile, (userEmployeementProfile) => userEmployeementProfile?.owner)
    @JoinColumn()
    userEmployeementProfile: UserEmployeementProfile;

    @OneToMany(() => Attendance, (attendance) => attendance?.owner)
    userAttendances: Attendance[];

    @OneToMany(() => Claim, (claim) => claim?.owner)
    userClaims: Claim[];

    @OneToMany(() => Doc, (doc) => doc?.owner)
    userDocs: Doc[];
}
