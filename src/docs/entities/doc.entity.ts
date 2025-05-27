import { Organisation } from 'src/organisation/entities/organisation.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { User } from '../../user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('docs')
@Index(['owner', 'isActive']) // User document queries
@Index(['fileType', 'isActive']) // File type filtering
@Index(['isPublic', 'isActive']) // Public document access
@Index(['organisation', 'branch', 'createdAt']) // Regional document management
@Index(['lastAccessedAt']) // Access pattern tracking
@Index(['createdAt']) // Date-based sorting
export class Doc {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column({ nullable: true })
    description?: string;

    @Column()
    fileType: string;

    @Column()
    fileSize: number;

    @Column()
    url: string;

    @Column({ type: 'json', nullable: true })
    metadata?: Record<string, any>;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    mimeType?: string;

    @Column({ nullable: true })
    extension?: string;

    @Column({ type: 'simple-array', nullable: true })
    sharedWith?: string[];

    @Column({ default: false })
    isPublic: boolean;

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: false, onUpdate: 'CURRENT_TIMESTAMP', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    lastAccessedAt?: Date;

    // relations
    @ManyToOne(() => User, (user) => user?.userDocs)
    owner: User;

    @ManyToOne(() => Branch, (branch) => branch?.docs)
    branch: Branch;

    @ManyToOne(() => Organisation, (organisation) => organisation?.docs)
    organisation: Organisation; 
}
