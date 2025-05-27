import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { Organisation } from 'src/organisation/entities/organisation.entity';
import { JournalStatus } from 'src/lib/enums/journal.enums';

@Entity('journal')
@Index(['owner', 'timestamp']) // User journal entries
@Index(['clientRef', 'timestamp']) // Client journal history
@Index(['status', 'isDeleted']) // Journal status filtering
@Index(['organisation', 'branch', 'timestamp']) // Regional journal reports
@Index(['createdAt']) // Date-based sorting
export class Journal {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    clientRef: string;

    @Column({ nullable: false })
    fileURL: string;

    @Column({ nullable: false })
    comments: string;

    @Column({ 
        type: 'enum', 
        enum: JournalStatus, 
        default: JournalStatus.PENDING_REVIEW 
    })
    status: JournalStatus;

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

    @Column({ nullable: false, default: false })
    isDeleted: boolean;

    @ManyToOne(() => User, user => user.journals)
    owner: User;

    @ManyToOne(() => Branch, (branch) => branch?.journals)
    branch: Branch;

    @ManyToOne(() => Organisation, (organisation) => organisation?.journals)
    organisation: Organisation; 
}
