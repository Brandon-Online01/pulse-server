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
        origin: [
            ...process.env.ALLOWED_ORIGINS?.split(',') ||
                ['http://localhost:3000'],
            'https://loro.co.za',
            'https://www.loro.co.za',
            'https://*.loro.co.za'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'token'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        maxAge: 3600
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('LORO API DOCS')
        .setDescription(`
LORO API documentation with detailed endpoints and schemas definitions.

## Key Features
- **Authentication**: JWT-based authentication system with role-based access
- **File Storage**: Google Cloud Storage integration for secure file management
- **Route Optimization**: Google Maps integration for task route planning
- **Real-time Updates**: WebSocket support for live notifications
- **Geofencing**: Advanced location-based services and territory management
- **Enterprise Features**: Comprehensive business management tools

## Environment Setup
Required environment variables:
- \`GOOGLE_MAPS_API_KEY\`: For route optimization and geocoding
- \`GOOGLE_MAPS_GEOCODING_ENABLED\`: Enable geocoding features
- \`GOOGLE_CLOUD_PROJECT_ID\`: For file storage
- \`GOOGLE_CLOUD_BUCKET_NAME\`: Storage bucket name
- \`JWT_SECRET\`: For authentication
- \`DATABASE_URL\`: Database connection string
- \`ALLOWED_ORIGINS\`: CORS allowed origins

## API Security
- JWT-based authentication
- Role-based access control (RBAC)
- CORS enabled with configurable origins
- Helmet protection
- Rate limiting
- Enterprise-only features protection
- Geofencing validation

## WebSocket Events
- Real-time notifications
- Location updates
- Task assignments
- Status changes
`)
        .addTag('auth', 'JWT-based authentication and authorization system with role management')
        .addTag('user', 'User management with role-based access control and permissions')
        .addTag('org', 'Core organization configuration and enterprise features')
        .addTag('org settings', 'Organization-wide configuration and preferences')
        .addTag('org appearance', 'Custom branding and UI/UX settings')
        .addTag('org hours', 'Operating hours and availability management')
        .addTag('licensing', 'License management with subscription tiers and renewal tracking')
        .addTag('gps', 'Advanced location services with Google Maps integration')
        .addTag('geofence', 'Geofencing for organizations, branches, tasks, and clients')
        .addTag('check-ins', 'GPS-based employee check-in system with location validation')
        .addTag('branch', 'Branch management with geocoding and territory mapping')
        .addTag('tasks', 'Task management with route optimization and GPS tracking')
        .addTag('assets', 'Digital and physical asset tracking with location support')
        .addTag('att', 'Employee attendance and time tracking with location validation')
        .addTag('docs', 'Document management with Google Cloud Storage integration')
        .addTag('clients', 'Client management with location-based services and geofencing')
        .addTag('leads', 'Sales lead tracking with location and territory management')
        .addTag('claims', 'Insurance claims processing with document attachments')
        .addTag('journal', 'Daily activity logging for management and audit trails')
        .addTag('products', 'Product catalog with image storage and inventory tracking')
        .addTag('shop', 'E-commerce with location-based delivery and territory restrictions')
        .addTag('communication', 'Real-time messaging system with WebSocket support')
        .addTag('notifications', 'Real-time notification system via WebSocket')
        .addTag('news', 'Company announcements with rich media support')
        .addTag('websockets', 'Real-time bi-directional communication')
        .addTag('reports', 'Business analytics with location and route insights')
        .addTag('rewards', 'Performance tracking and employee recognition system')
        .addTag('resellers', 'Partner management with territory mapping and analytics')
        .addBearerAuth()
        .addServer('https://api.loro.co.za', 'Production')
        .addServer('http://localhost:4400', 'Development')
        .addServer('wss://api.loro.co.za', 'WebSocket')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        deepScanRoutes: true,
        operationIdFactory: (methodKey) => methodKey,
    });
    const wsDocument = {
        ...document,
        components: {
            ...document.components,
            schemas: {
                ...document.components?.schemas,
                WebSocketNewQuotation: {
                    type: 'object',
                    properties: {
                        event: {
                            type: 'string',
                            enum: ['newQuotation', 'locationUpdate', 'taskAssigned', 'statusChange'],
                            description: 'WebSocket event name'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                    description: 'The unique identifier of the event'
                                },
                                type: {
                                    type: 'string',
                                    description: 'The type of event'
                                },
                                payload: {
                                    type: 'object',
                                    description: 'Event-specific data payload'
                                },
                                timestamp: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: 'Event timestamp'
                                }
                            }
                        }
                    }
                }
            }
        },
        paths: {
            ...document.paths,
            '/websocket': {
                get: {
                    tags: ['websockets'],
                    summary: 'WebSocket Connection',
                    description: `
						# WebSocket Documentation
						
						## Connection Details
						- URL: wss://api.loro.co.za
						- Protocol: Socket.IO
						
						## Available Events
						
						### System Events
						- \`connect\`: Connection established
						- \`disconnect\`: Connection terminated
						- \`error\`: Error occurred
						
						### Business Events
						- \`locationUpdate\`: Real-time GPS position updates
						- \`taskAssigned\`: New task assignments
						- \`statusChange\`: Entity status changes
						- \`newQuotation\`: New quotation created
						
						## Authentication
						WebSocket connections require JWT authentication via query parameter:
						\`\`\`
						wss://api.loro.co.za?token=your_jwt_token
						\`\`\`
						
						## Code Examples
						
						### JavaScript/TypeScript
						\`\`\`typescript
						import { io } from "socket.io-client";
						
						const socket = io("wss://api.loro.co.za", {
							query: { token: "your_jwt_token" }
						});
						
						// Handle connection
						socket.on("connect", () => {
							console.log("Connected to WebSocket");
						});
						
						// Listen for events
						socket.on("locationUpdate", (data) => {
							console.log("Location update:", data);
						});
						
						socket.on("taskAssigned", (data) => {
							console.log("New task:", data);
						});
						
						socket.on("error", (error) => {
							console.error("WebSocket error:", error);
						});
						\`\`\`
					`,
                    responses: {
                        '101': {
                            description: 'WebSocket connection established',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/WebSocketNewQuotation'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    swagger_1.SwaggerModule.setup('api', app, wsDocument, {
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