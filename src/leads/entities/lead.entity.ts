import { Status } from '../../lib/enums/enums';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('lead')
export class Lead {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    phone: string;

    @Column({ nullable: true, type: 'text' })
    notes: string;

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

    @Column({ nullable: false, default: Status.PENDING })
    status: Status;

    @Column({ default: false })
    isDeleted: boolean;

    @ManyToOne(() => User, user => user?.leads)
    owner: User;
}