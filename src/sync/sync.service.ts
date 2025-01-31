import * as mysql from 'mysql2/promise';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { AccessLevel } from '../lib/enums/user.enums';
import { AccountStatus } from '../lib/enums/status.enums';

interface SyncUser {
    username: string;
    password: string;
    description?: string;
    phone?: string;
    userref?: string;
    organisationRef?: string;
}

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);
    private connection: mysql.Connection;

    constructor(
        private configService: ConfigService,
        private userService: UserService
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

    @Cron(CronExpression.EVERY_10_SECONDS)
    async syncAll() {
        try {
            const usersResult = await this.syncUsers();
            const syncUsers = usersResult?.data as SyncUser[] | undefined;

            if (!syncUsers || syncUsers.length === 0) {
                throw new Error('No users data available for sync');
            }

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

            const errors = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
            if (errors.length > 0) {
                this.logger.error('Sync errors:', errors.map(e => e.reason.message));
            }

            return {
                success: errors.length === 0,
                message: errors.length === 0 ? 'Sync completed successfully' : 'Sync completed with errors',
                errors: errors.length > 0 ? errors.map(e => e.reason.message) : undefined
            };

        } catch (error) {
            this.logger.error(`Sync failed: ${error.message}`);
            throw error;
        }
    }
}
