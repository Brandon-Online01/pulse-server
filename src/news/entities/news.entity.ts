import { Branch } from "../../branch/entities/branch.entity";
import { NewsCategory } from "../../lib/enums/news.enums";
import { GeneralStatus } from "../../lib/enums/status.enums";
import { User } from "../../user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('news')
export class News {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    subtitle: string;

    @Column({ nullable: false, type: 'text' })
    content: string;

    @Column({ nullable: false })
    attachments: string;

    @Column({ nullable: false })
    coverImage: string;

    @Column({ nullable: false })
    thumbnail: string;

    @Column({ nullable: false })
    publishingDate: Date;

    @Column({ nullable: false, default: GeneralStatus.ACTIVE })
    status: GeneralStatus;

    @ManyToOne(() => User, (user) => user?.articles)
    author: User;

    @ManyToOne(() => Branch, (branch) => branch?.news)
    branch: Branch;

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

    @Column({ type: 'boolean', nullable: true, default: false })
    isDeleted: boolean;

    @Column({ nullable: true, type: 'enum', enum: NewsCategory })
    category: NewsCategory;

    @Column({ nullable: false })
    shareLink: string;
}
