import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		credentials: true,
	});

	const config = new DocumentBuilder()
		.setTitle('Loro HR API Playground')
		.setDescription('API Playground for Loro HR')
		.setVersion('1.0')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	const reflector = new Reflector();
	app.useGlobalGuards(
		new AuthGuard(app.get(JwtService), reflector),
		new RoleGuard(app.get(JwtService)),
	);

	await app.listen(process.env.PORT ?? 4400);
}
bootstrap();
