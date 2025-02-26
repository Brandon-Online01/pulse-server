"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorageConfig = void 0;
const getStorageConfig = (configService) => ({
    type: 'service_account',
    project_id: configService.get('STORAGE_PROJECT_ID'),
    private_key_id: configService.get('STORAGE_PRIVATE_KEY_ID'),
    private_key: configService.get('STORAGE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
    client_email: configService.get('STORAGE_CLIENT_EMAIL'),
    client_id: configService.get('STORAGE_CLIENT_ID'),
    auth_uri: configService.get('STORAGE_AUTH_URI'),
    token_uri: configService.get('STORAGE_TOKEN_URI'),
    auth_provider_x509_cert_url: configService.get('STORAGE_AUTH_PROVIDER_CERT_URL'),
    client_x509_cert_url: configService.get('STORAGE_CLIENT_CERT_URL'),
    universe_domain: 'googleapis.com',
});
exports.getStorageConfig = getStorageConfig;
//# sourceMappingURL=storage.config.js.map