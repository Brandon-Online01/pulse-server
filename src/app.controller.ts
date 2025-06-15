import { Resolver, Query } from '@nestjs/graphql';
import { AppService } from './app.service';

@Resolver()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Query(() => String)
  healthCheck(): string {
    return 'Welcome to the API Playground, everything is working fine!';
  }

  @Query(() => String)
  hello(): string {
    return this.appService.getHello();
  }
}
