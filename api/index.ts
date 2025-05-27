import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';
import compression from 'compression';
import type { IncomingMessage, ServerResponse } from 'http';

let app: any;

async function createNestApp() {
	if (!app) {
		app = await NestFactory.create(AppModule);

		// Configure for serverless environments
		app.enableShutdownHooks();

		app.use(helmet({
			crossOriginEmbedderPolicy: false,
		}));

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

**What to include in your request:**
- Company name and size
- Intended use case
- Integration timeline
- Technical contact details

### 🔑 Authentication Flow
\`\`\`bash
# 1. Obtain JWT token via login
POST /auth/login
{
  "email": "your-email@company.com",
  "password": "your-password"
}

# 2. Use token in subsequent requests
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

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

		SwaggerModule.setup('api', app, document, {
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

		await app.init();
	}

	return app;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
	const nestApp = await createNestApp();
	const server = nestApp.getHttpAdapter().getInstance();
	
	return server(req, res);
} 