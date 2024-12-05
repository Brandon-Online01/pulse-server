import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Branch } from '../../branch/entities/branch.entity';

@Entity('journal')
export class Journal {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    clientRef: string;

    @Column({ nullable: false })
    fileURL: string;

    @Column({ nullable: false })
    comments: string;

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date;

    @Column({
        type: 'timestamp',
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @Column({ nullable: false })
    isDeleted: boolean;

    @ManyToOne(() => User, user => user.journals)
    owner: User;

    @ManyToOne(() => Branch, (branch) => branch?.journals)
    branch: Branch;
}
