"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const helmet_1 = require("helmet");
const compression = require("compression");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('LORO API DOCS')
        .setDescription('LORO API documentation with detailed endpoints and schemas definitions')
        .addTag('assets', 'Manage and track digital assets and resources')
        .addTag('att', 'Employee attendance tracking and management')
        .addTag('auth', 'Authentication, authorization, and account security')
        .addTag('branch', 'Branch office location and information management')
        .addTag('check-ins', 'Location-based employee check-in system')
        .addTag('claims', 'Insurance claims and reimbursement processing')
        .addTag('clients', 'Client relationship and account management')
        .addTag('communication', 'Event-driven internal and external messaging system')
        .addTag('docs', 'Document management and file sharing system')
        .addTag('journal', 'Financial transaction and journal entry management')
        .addTag('leads', 'Sales lead and prospect management')
        .addTag('news', 'Company news and announcement management')
        .addTag('notifications', 'System notifications and user alerts')
        .addTag('org', 'Organization settings and configuration')
        .addTag('products', 'Product catalog and inventory management')
        .addTag('reports', 'Business analytics and reporting tools')
        .addTag('resellers', 'Reseller partner and distribution management')
        .addTag('rewards', 'Employee rewards and recognition system')
        .addTag('shop', 'E-commerce and order management')
        .addTag('tasks', 'Task and project management system')
        .addTag('gps', 'GPS tracking and location services')
        .addTag('user', 'User account management')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        deepScanRoutes: true,
        operationIdFactory: (methodKey) => methodKey,
    });
    swagger_1.SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
            docExpansion: 'none',
            filter: true,
            showRequestDuration: true,
            showCommonExtensions: true,
        },
    });
    await app.listen(process.env.PORT ?? 4400);
}
bootstrap();
//# sourceMappingURL=main.js.map