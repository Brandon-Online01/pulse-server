import { Controller, Get, Logger } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(private readonly syncService: SyncService) { }

  @Get('customers')
  async syncCustomers() {
    this.logger.log('Initiating customers sync');
    return this.syncService.syncCustomers();
  }

  @Get('users')
  async syncUsers() {
    this.logger.log('Initiating users sync');
    return this.syncService.syncUsers();
  }

  @Get('sales-reps')
  async syncSalesReps() {
    this.logger.log('Initiating sales representatives sync');
    return this.syncService.syncSalesReps();
  }

  @Get('inventory')
  async syncInventory() {
    this.logger.log('Initiating inventory sync');
    return this.syncService.syncInventory();
  }

  @Get('all')
  async syncAll() {
    this.logger.log('Initiating full sync');
    return this.syncService.syncAll();
  }
}
