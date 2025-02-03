import * as mysql from 'mysql2/promise';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AccessLevel } from '../lib/enums/user.enums';
import { AccountStatus } from '../lib/enums/status.enums';
import { ClientsService } from '../clients/clients.service';
import { CreateClientDto } from '../clients/dto/create-client.dto';
import { GeneralStatus } from '../lib/enums/status.enums';
import { CustomerType } from '../clients/entities/client.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';

interface SyncUser {
    username: string;
    password: string;
    description?: string;
    phone?: string;
    userref?: string;
    organisationRef?: string;
}

interface SyncCustomer {
    ID: number;
    Code: string;
    Description: string;
    Category: string;
    Email: string;
    Tel: string;
    Cellphone: string;
    Address01: string;
    CustomerName: string;
    category_type: string;
    PhysicalAddress1: string;
    PhysicalAddress2: string;
    PhysicalAddress3: string;
    PhysicalAddress4: string;
}

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);
    private connection: mysql.Connection;

    constructor(
        private configService: ConfigService,
        private userService: UserService,
        private clientService: ClientsService,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>
    ) { }

    private async createConnection() {
        try {
            this.connection = await mysql.createConnection({
                host: this.configService.get<string>('SYNC_DB_HOST'),
                user: this.configService.get<string>('SYNC_DB_USER'),
                password: this.configService.get<string>('SYNC_DB_PASSWORD'),
                port: this.configService.get<number>('SYNC_DB_PORT'),
                database: this.configService.get<string>('SYNC_DB_NAME')
            });

            return {
                success: true,
                message: 'Database connection established'
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to connect to database: ${error.message}`
            };
        }
    }

    private async closeConnection() {
        try {
            if (this.connection) {
                await this.connection.end();
            }
        } catch (error) {
        }
    }

    async syncCustomers() {
        try {
            const connection = await this.createConnection();
            if (!connection.success) {
                return {
                    data: null,
                    message: connection.message
                };
            }

            const [rows] = await this.connection.execute('SELECT * FROM tblcustomers');

            return {
                data: rows,
                message: 'Successfully synced customers'
            };
        } catch (error) {
            return {
                data: null,
                message: `Error syncing customers: ${error?.message}`
            };
        } finally {
            await this.closeConnection();
        }
    }

    async syncUsers() {
        try {
            const connection = await this.createConnection();
            if (!connection.success) {
                return {
                    data: null,
                    message: connection.message
                };
            }

            const [rows] = await this.connection.execute('SELECT * FROM tblusers');

            return {
                data: rows,
                message: 'Successfully synced users'
            };
        } catch (error) {
            return {
                data: null,
                message: `Error syncing users: ${error?.message}`
            };
        } finally {
            await this.closeConnection();
        }
    }

    async syncSalesReps() {
        try {
            const connection = await this.createConnection();
            if (!connection.success) {
                return {
                    data: null,
                    message: connection.message
                };
            }

            const [rows] = await this.connection.execute('SELECT * FROM tblsalesman');

            return {
                data: rows,
                message: 'Successfully synced sales representatives'
            };
        } catch (error) {
            return {
                data: null,
                message: `Error syncing sales representatives: ${error?.message}`
            };
        } finally {
            await this.closeConnection();
        }
    }

    async syncInventory() {
        try {
            const connection = await this.createConnection();
            if (!connection.success) {
                return {
                    data: null,
                    message: connection.message
                };
            }

            const [inventoryRows] = await this.connection.execute('SELECT * FROM tblinventory');
            const [multistoreRows] = await this.connection.execute('SELECT * FROM tblmultistore');

            return {
                data: {
                    inventory: inventoryRows,
                    multistore: multistoreRows
                },
                message: 'Successfully synced inventory and multistore data'
            };
        } catch (error) {
            return {
                data: null,
                message: `Error syncing inventory: ${error?.message}`
            };
        } finally {
            await this.closeConnection();
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async syncAll() {
        try {
            const usersResult = await this.syncUsers();
            const customersResult = await this.syncCustomers();
            const syncUsers = usersResult?.data as SyncUser[] | undefined;
            const syncCustomers = customersResult?.data as SyncCustomer[] | undefined;

            if (syncUsers?.length > 0) {
                await this.processUsers(syncUsers);
            }

            if (syncCustomers?.length > 0) {
                await this.processCustomers(syncCustomers);
            }

            return {
                success: true,
                message: 'Sync completed successfully'
            };

        } catch (error) {
            throw error;
        }
    }

    private async processUsers(syncUsers: SyncUser[]) {
        const results = await Promise.allSettled(
            syncUsers.map(async (user, index) => {
                try {
                    const sequentialNumber = index + 1;
                    if (!user?.username) {
                        return { action: 'skipped', reason: 'Missing username' };
                    }

                    const existingUser = await this.userService.findOneForAuth(user?.username);

                    const userProfile = {
                        username: user.username,
                        password: 'securePass@2025',
                        name: user.description || user.username,
                        surname: user.description?.split(' ')[1] || 'User',
                        email: `${user.username.toLowerCase()}@company.com`,
                        phone: user.phone || '+1234567890',
                        photoURL: 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png',
                        accessLevel: AccessLevel.USER,
                        userref: `USR${String(sequentialNumber)}`,
                        organisationRef: user.organisationRef || '1',
                        status: AccountStatus.ACTIVE,
                        isDeleted: false
                    };

                    if (!existingUser?.user) {
                        await this.userService.create(userProfile as CreateUserDto);
                    }
                } catch (error) {
                    throw new Error(`Error processing user ${user?.username}: ${error.message}`);
                }
            })
        );
    }

    private async processCustomers(customers: SyncCustomer[]) {
        const results = await Promise.allSettled(
            customers.map(async (customer, index) => {
                try {
                    // if (!customer?.Code) {
                    //     return { action: 'skipped', reason: 'Missing customer code' };
                    // }

                    const clientName = customer.Description || customer.CustomerName || customer.Code;

                    // Check if client exists using repository
                    const existingClient = await this.clientRepository.findOne({
                        where: { ref: customer.Code, name: clientName }
                    });

                    if (existingClient) {
                        return { action: 'skipped', reason: 'Client already exists' };
                    }

                    const clientProfile = {
                        name: clientName,
                        contactPerson: customer?.CustomerName || 'Unknown',
                        category: customer?.category_type?.toUpperCase() || 'contract',
                        email: customer?.Email || `${customer?.Code?.toLowerCase()}@placeholder.com`,
                        phone: customer?.Cellphone || customer?.Tel || '+1234567890',
                        alternativePhone: customer?.Tel || null,
                        description: `Imported from ERP - ${customer?.Description || ''}`,
                        status: GeneralStatus.ACTIVE,
                        type: CustomerType.CONTRACT,
                        ref: customer.Code,
                        isDeleted: false,
                        address: customer?.PhysicalAddress1 || '',
                        city: customer?.PhysicalAddress2 || '',
                        country: customer?.PhysicalAddress3 || '',
                        postalCode: customer?.PhysicalAddress4 || '',
                        website: null,
                        logo: null,
                        assignedSalesRep: null
                    };

                    await this.clientService.create(clientProfile as CreateClientDto);

                } catch (error) {
                    throw new Error(`Error processing customer ${customer?.Code}: ${error.message}`);
                }
            })
        );

        console.log(results);
    }
}
