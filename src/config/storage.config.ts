import { ConfigService } from '@nestjs/config';

export const getStorageConfig = (configService: ConfigService) => ({
	type: 'service_account',
	project_id: configService.get<string>('STORAGE_PROJECT_ID'),
	private_key_id: configService.get<string>('STORAGE_PRIVATE_KEY_ID'),
	private_key: configService.get<string>('STORAGE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
	client_email: configService.get<string>('STORAGE_CLIENT_EMAIL'),
	client_id: configService.get<string>('STORAGE_CLIENT_ID'),
	auth_uri: configService.get<string>('STORAGE_AUTH_URI'),
	token_uri: configService.get<string>('STORAGE_TOKEN_URI'),
	auth_provider_x509_cert_url: configService.get<string>('STORAGE_AUTH_PROVIDER_CERT_URL'),
	client_x509_cert_url: configService.get<string>('STORAGE_CLIENT_CERT_URL'),
	universe_domain: 'googleapis.com',
});
