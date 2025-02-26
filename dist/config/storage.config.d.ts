import { ConfigService } from '@nestjs/config';
export declare const getStorageConfig: (configService: ConfigService) => {
    type: string;
    project_id: any;
    private_key_id: any;
    private_key: any;
    client_email: any;
    client_id: any;
    auth_uri: any;
    token_uri: any;
    auth_provider_x509_cert_url: any;
    client_x509_cert_url: any;
    universe_domain: string;
};
