import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReportsService {
	private readonly currencyLocale: string;
	private readonly currencyCode: string;
	private readonly currencySymbol: string;

	constructor(private readonly configService: ConfigService) {
		this.currencyLocale = this.configService.get<string>('CURRENCY_LOCALE') || 'en-ZA';
		this.currencyCode = this.configService.get<string>('CURRENCY_CODE') || 'ZAR';
		this.currencySymbol = this.configService.get<string>('CURRENCY_SYMBOL') || 'R';
	}
}
