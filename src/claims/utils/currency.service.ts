import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CurrencyService {
    private readonly currencyLocale: string;
    private readonly currencyCode: string;
    private readonly currencySymbol: string;

    constructor(private readonly configService: ConfigService) {
        this.currencyLocale = this.configService.get<string>('CURRENCY_LOCALE') || 'en-ZA';
        this.currencyCode = this.configService.get<string>('CURRENCY_CODE') || 'ZAR';
        this.currencySymbol = this.configService.get<string>('CURRENCY_SYMBOL') || 'R';
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat(this.currencyLocale, {
            style: 'currency',
            currency: this.currencyCode
        })
            .format(amount)
            .replace(this.currencyCode, this.currencySymbol);
    }

    parseCurrencyToNumber(currencyString: string): number {
        return Number(currencyString.replace(/[^0-9.-]+/g, ''));
    }

    formatAmountWithSymbol(amount: number): string {
        return `${this.currencySymbol}${amount.toFixed(2)}`;
    }
} 