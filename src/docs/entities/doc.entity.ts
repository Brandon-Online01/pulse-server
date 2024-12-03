import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

@Entity('docs')
export class Doc {
    @ObjectIdColumn()
    uid: string;

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

    @Column({ nullable: true })
    thumbnailUrl?: string;

    @Column({ type: 'json', nullable: true })
    metadata?: Record<string, any>;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    mimeType?: string;

    @Column({ nullable: true })
    extension?: string;

    @Column({ nullable: true })
    owner?: string;

    @Column({ type: 'simple-array', nullable: true })
    sharedWith?: string[];

    @Column({ nullable: true })
    version?: number;

    @Column({ default: false })
    isPublic: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    lastAccessedAt?: Date;

    @Column({ nullable: true })
    createdBy?: string;

    @Column({ nullable: true })
    updatedBy?: string;
}
