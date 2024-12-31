import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	healthCheck(): string {
		return 'Welcome to the API Playground, everything is working fine!';
	}
}
