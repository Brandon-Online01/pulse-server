import { Controller, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@Controller('shop')
@UseGuards(AuthGuard, RoleGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) { }
}
