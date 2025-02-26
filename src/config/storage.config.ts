import { ConfigService } from '@nestjs/config';

export const getStorageConfig = (configService: ConfigService) => ({
	type: 'service_account',
	project_id: configService.get('GOOGLE_CLOUD_PROJECT_ID'),
	private_key_id: configService.get('GOOGLE_CLOUD_PRIVATE_KEY_ID'),
	private_key: configService.get('GOOGLE_CLOUD_PRIVATE_KEY'),
	client_email: configService.get('GOOGLE_CLOUD_CLIENT_EMAIL'),
	client_id: configService.get('GOOGLE_CLOUD_CLIENT_ID'),
	auth_uri: configService.get('GOOGLE_CLOUD_AUTH_URI'),
	token_uri: configService.get('GOOGLE_CLOUD_TOKEN_URI'),
	auth_provider_x509_cert_url: configService.get('GOOGLE_CLOUD_AUTH_PROVIDER_CERT_URL'),
	client_x509_cert_url: configService.get('GOOGLE_CLOUD_CLIENT_CERT_URL'),
	universe_domain: 'googleapis.com',
});
