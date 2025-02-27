import { GeneralStatus } from '../../lib/enums/status.enums';
import { Lead } from '../../leads/entities/lead.entity';
import { User } from '../../user/entities/user.entity';
import { Quotation } from '../../shop/entities/quotation.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Column, Entity, OneToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CheckIn } from '../../check-ins/entities/check-in.entity';
import { Organisation } from 'src/organisation/entities/organisation.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { ClientType } from 'src/lib/enums/client.enums';

@Entity('client')
export class Client {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false, unique: true })
    name: string;

    @Column({ nullable: false })
    contactPerson: string;

    @Column({ nullable: false, default: 'contract' })
    category: string;

    @Column({ nullable: false, unique: true })
    email: string;

    @Column({ nullable: false, unique: true })
    phone: string;

    @Column({ nullable: true, unique: true })
    alternativePhone: string;

    @Column({ nullable: true, unique: true })
    website: string;

    @Column({ nullable: true, unique: true })
    logo: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'json', nullable: false })
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ nullable: false, default: GeneralStatus.ACTIVE })
    status: GeneralStatus;

    @Column({ default: false })
    isDeleted: boolean;

    @Column({ nullable: false })
    ref: string;

    // Relations
    @ManyToOne(() => User, (user) => user?.clients, { nullable: true })
    assignedSalesRep: User;

    @OneToMany(() => Lead, (lead) => lead?.client, { nullable: true })
    leads: Lead[];

    @OneToMany(() => Quotation, (quotation) => quotation?.client, { nullable: true })
    quotations: Quotation[];

    @OneToMany(() => Task, (task) => task?.clients, { nullable: true })
    tasks: Task[];

    @OneToMany(() => CheckIn, (checkIn) => checkIn?.client, { nullable: true })
    checkIns: CheckIn[];

    @Column({ type: 'enum', enum: ClientType, default: ClientType.STANDARD })
    type: ClientType;

    @ManyToOne(() => Organisation, (organisation) => organisation?.clients, { nullable: true })
    organisation: Organisation;

    @ManyToOne(() => Branch, (branch) => branch?.clients, { nullable: true })
    branch: Branch;
}
