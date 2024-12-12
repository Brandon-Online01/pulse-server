import { Branch } from "src/branch/entities/branch.entity";
import { ClaimCategory, ClaimStatus } from "src/lib/enums/enums";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('claim')
export class Claim {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ type: 'varchar', nullable: false })
    amount: string;

    @Column({ type: 'varchar', nullable: true })
    fileUrl: string;

    @Column({ type: 'int', nullable: true })
    verifiedBy: number;

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    verifiedAt: Date;

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: false, onUpdate: 'CURRENT_TIMESTAMP', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    deletedAt: Date;

    @Column({ type: 'varchar', nullable: true, length: 5000 })
    comments: string;

    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

    @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.PENDING })
    status: ClaimStatus;

    @Column({ type: 'enum', enum: ClaimCategory, nullable: true, default: ClaimCategory.GENERAL })
    category: ClaimCategory;

    //relationships
    @ManyToOne(() => User, (user) => user?.userClaims)
    owner: User;

    @ManyToOne(() => Branch, (branch) => branch?.claims)
    branch: Branch;
}
