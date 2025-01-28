import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('password_reset')
export class PasswordReset {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ unique: true })
    email: string;

    @Column()
    resetToken: string;

    @Column()
    tokenExpires: Date;

    @Column({ default: false })
    isUsed: boolean;

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
} 