import { Module } from '@nestjs/common';
import { GoogleMapsService } from './services/google-maps.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [GoogleMapsService],
  exports: [GoogleMapsService],
})
export class LibModule {} 