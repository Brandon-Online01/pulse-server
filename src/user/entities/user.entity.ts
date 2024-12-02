import { AccessLevel, Status } from '../../lib/enums/enums';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserProfile } from './user.profile.entity';
import { UserEmployeementProfile } from './user.employeement.profile.entity';

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

    //auth
    @Column({ nullable: false })
    username: string;

    @Column({ nullable: false })
    password: string;

    @Column({ default: false })
    isDeleted: boolean;

    @Column({ nullable: false })
    userReferenceCode: string;

    //relations
    @OneToOne(() => UserProfile)
    @JoinColumn()
    profile: UserProfile;


    @OneToOne(() => UserEmployeementProfile)
    @JoinColumn()
    employeementProfile: UserEmployeementProfile;
    
}
