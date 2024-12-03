import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('journal')
export class Journal {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    clientRef: string;

    @Column({ nullable: false })
    fileURL: string;

    @Column({ type: 'timestamp', nullable: false })
    timestamp: Date;

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

    @Column({ nullable: false })
    isDeleted: boolean;

    @ManyToOne(() => User, user => user.journals)
    owner: User;
}