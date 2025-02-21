import { ConfigService } from '@nestjs/config';
export declare class ReportsService {
    private readonly configService;
    private readonly currencyLocale;
    private readonly currencyCode;
    private readonly currencySymbol;
    constructor(configService: ConfigService);
}
