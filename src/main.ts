import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(helmet());

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

	const config = new DocumentBuilder()
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
		.addTag('websockets', 'Real-time WebSocket Communication')
		.addServer('wss://api.loro.co.za', 'WebSocket Server')
		.build();

	const document = SwaggerModule.createDocument(app, config, {
		deepScanRoutes: true,
		operationIdFactory: (
			methodKey: string
		) => methodKey,
	});

	// Add WebSocket documentation
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
							enum: ['newQuotation'],
							description: 'WebSocket event name'
						},
						data: {
							type: 'object',
							properties: {
								quotationNumber: {
									type: 'string',
									description: 'The quotation number that was created'
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
						
						### newQuotation
						Emitted when a new quotation is created
						
						\`\`\`typescript
						// Event name: newQuotation
						// Payload structure:
						{
							quotationNumber: string
						}
						\`\`\`
						
						## Code Examples
						
						### JavaScript/TypeScript (Socket.IO Client)
						\`\`\`typescript
						import { io } from "socket.io-client";
						
						const socket = io("wss://api.loro.co.za");
						
						socket.on("newQuotation", (data) => {
							console.log("New quotation:", data.quotationNumber);
						});
						\`\`\`
						
						### C# (.NET)
						\`\`\`csharp
						using SocketIOClient;
						
						var client = new SocketIO("https://api.loro.co.za");
						
						client.On("newQuotation", response => {
							var data = response.GetValue<QuotationData>();
							Console.WriteLine($"New quotation: {data.QuotationNumber}");
						});
						
						await client.ConnectAsync();
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

	SwaggerModule.setup('api', app, wsDocument, {
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
