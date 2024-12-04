import { Branch } from "src/branch/entities/branch.entity";
import { Status } from "src/lib/enums/enums";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('news')
export class News {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    subtitle: string;

    @Column({ nullable: false })
    content: string;

    @Column({ nullable: false })
    attachments: string;

    @Column({ nullable: false })
    coverImage: string;

    @Column({ nullable: false })
    thumbnail: string;

    @Column({ nullable: false })
    publishingDate: Date;

    @Column({ nullable: false })
    status: Status;

    @ManyToOne(() => User, (user) => user?.articles)
    author: User;

    @ManyToOne(() => Branch, (branch) => branch?.news)
    branch: Branch;
}
