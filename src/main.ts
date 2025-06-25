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
			...(process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']),
			'https://loro.co.za',
			'https://www.loro.co.za',
			'https://*.loro.co.za',
		],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'token'],
		exposedHeaders: ['Content-Range', 'X-Content-Range'],
		maxAge: 3600, // 1 hour
	});

	const config = new DocumentBuilder()
		.setTitle('LORO API Documentation')
		.setDescription(
			`
# 🚀 LORO Enterprise Management Platform API

**LORO** is a comprehensive enterprise management platform that revolutionizes how businesses manage their workforce, operations, and client relationships through cutting-edge technology and intelligent automation.

## 🌟 Platform Overview

LORO combines **GPS tracking**, **AI-powered analytics**, **real-time communication**, and **enterprise-grade security** to deliver a unified business management solution. Our platform empowers organizations to optimize operations, enhance productivity, and drive growth through data-driven insights.

### 🎯 Core Value Proposition
- **360° Business Visibility**: Real-time dashboards and analytics across all operations
- **Intelligent Automation**: AI-powered task optimization and route planning
- **Enterprise Security**: Bank-level security with role-based access control
- **Scalable Architecture**: From startups to enterprise-level organizations
- **Mobile-First Design**: Native mobile apps with offline capabilities

## 🔐 Getting Started & Authentication

### 📞 **Request API Access**
To test and integrate with the LORO API, you'll need valid credentials:

**Contact our Support Team:**
- 📧 Email: [api-support@loro.co.za](mailto:api-support@loro.co.za)
- 📱 WhatsApp: +27 123 456 789
- 🌐 Support Portal: [support.loro.co.za](https://support.loro.co.za)
- 💬 Live Chat: Available on [loro.co.za](https://loro.co.za)

## 📞 Support & Resources

### **Developer Support**
- **Documentation**: [docs.loro.co.za](https://docs.loro.co.za)
- **API Reference**: Interactive Swagger documentation
- **Code Examples**: GitHub repository with sample integrations
- **Video Tutorials**: Step-by-step integration guides

---

**🔔 Need Help?** Our expert support team is ready to assist with your integration. Contact us at [api-support@loro.co.za](mailto:api-support@loro.co.za) for personalized assistance.
`,
		)
		// Core Features
		.addTag('auth', 'JWT-based authentication and authorization system with role management')
		.addTag('user', 'User management with role-based access control and permissions')
		.addTag('org', 'Core organization configuration and enterprise features')
		.addTag('org settings', 'Organization-wide configuration and preferences')
		.addTag('org appearance', 'Custom branding and UI/UX settings')
		.addTag('org hours', 'Operating hours and availability management')
		.addTag('licensing', 'License management with subscription tiers and renewal tracking')

		// Location Services
		.addTag('gps', 'Advanced location services with Google Maps integration')
		.addTag('interactions', 'manage all interactions with leads and clients')
		.addTag('geofence', 'Geofencing for organizations, branches, tasks, and clients')
		.addTag('check-ins', 'GPS-based employee check-in system with location validation')
		.addTag('branch', 'Branch management with geocoding and territory mapping')

		// Task and Resource Management
		.addTag('tasks', 'Task management with route optimization and GPS tracking')
		.addTag('assets', 'Digital and physical asset tracking with location support')
		.addTag('att', 'Employee attendance and time tracking with location validation')
		.addTag('docs', 'Document management with Google Cloud Storage integration')
		.addTag('pdf-generation', 'Dynamic PDF generation service for business documents and templates')
		.addTag('shop', 'E-commerce with location-based delivery and territory restrictions')

		// Business Operations
		.addTag('clients', 'Client management with location-based services and geofencing')
		.addTag('client-auth', 'Client authentication with JWT-based authentication')
		.addTag('leads', 'Sales lead tracking with location and territory management')
		.addTag('claims', 'Insurance claims processing with document attachments')
		.addTag('journal', 'Daily activity logging for management and audit trails')
		.addTag('leave', 'Employee leave management with approval workflows and tracking')
		.addTag('products', 'Product catalog with image storage and inventory tracking')
		.addTag('quotation-conversion', 'Quotation conversion with image storage and inventory tracking')
		.addTag('shop', 'E-commerce with location-based delivery and territory restrictions')
		.addTag('warnings', 'Employee warning and disciplinary management system')

		// Communication and Notifications
		.addTag('communication', 'Real-time messaging system with WebSocket support')
		.addTag('competitors', 'Competitor management with location and territory management')
		.addTag('notifications', 'Real-time notification system via WebSocket')
		.addTag('news', 'Company announcements with rich media support')
		.addTag('websockets', 'Real-time bi-directional communication')

		// Analytics and Reporting
		.addTag('reports', 'Business analytics with location and route insights')
		.addTag('rewards', 'Performance tracking and employee recognition system')
		.addTag('resellers', 'Partner management with territory mapping and analytics')
		.addTag('Feedback', 'Feedback management with location and territory management')

		.addBearerAuth()
		.addServer('https://api.loro.co.za', 'Production')
		.addServer('https://api.dev.loro.co.za', 'Development')
		.addServer('wss://api.loro.co.za', 'WebSocket')
		.build();

	const document = SwaggerModule.createDocument(app, config, {
		deepScanRoutes: true,
		operationIdFactory: (methodKey: string) => methodKey,
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
							enum: ['newQuotation', 'locationUpdate', 'taskAssigned', 'statusChange'],
							description: 'WebSocket event name',
						},
						data: {
							type: 'object',
							properties: {
								id: {
									type: 'string',
									description: 'The unique identifier of the event',
								},
								type: {
									type: 'string',
									description: 'The type of event',
								},
								payload: {
									type: 'object',
									description: 'Event-specific data payload',
								},
								timestamp: {
									type: 'string',
									format: 'date-time',
									description: 'Event timestamp',
								},
							},
						},
					},
				},
			},
		},
		paths: {
			...document.paths,
			'/websocket': {
				get: {
					tags: ['websockets'],
					summary: 'WebSocket Connection',
					description:
						`# WebSocket Documentation
						
## Connection Details
- URL: wss://api.loro.co.za
- Protocol: Socket.IO

## Available Events

### System Events
- connect: Connection established
- disconnect: Connection terminated
- error: Error occurred

### Business Events
- locationUpdate: Real-time GPS position updates
- taskAssigned: New task assignments
- statusChange: Entity status changes
- newQuotation: New quotation created

## Authentication
WebSocket connections require JWT authentication via query parameter:
` +
						'```' +
						`
wss://api.loro.co.za?token=your_jwt_token
` +
						'```' +
						`

## Code Examples

### JavaScript/TypeScript
` +
						'```javascript' +
						`
import { io } from "socket.io-client";

const socket = io("wss://api.loro.co.za", {
	query: { token: "your_jwt_token" }
});

// Handle connection
socket.on("connect", function() {
	console.log("Connected to WebSocket");
});

// Listen for events
socket.on("locationUpdate", function(data) {
	console.log("Location update:", data);
});

socket.on("taskAssigned", function(data) {
	console.log("New task:", data);
});

socket.on("error", function(error) {
	console.error("WebSocket error:", error);
});
` +
						'```',
					responses: {
						'101': {
							description: 'WebSocket connection established',
							content: {
								'application/json': {
									schema: {
										$ref: '#/components/schemas/WebSocketNewQuotation',
									},
								},
							},
						},
					},
				},
			},
		},
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
