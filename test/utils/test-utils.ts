import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { MockType } from './mock-factory';

/**
 * Creates a test app with global pipes and other settings
 * matching the production environment
 */
export async function createTestApp(moduleFixture: TestingModule): Promise<INestApplication> {
  const app = moduleFixture.createNestApplication();
  
  // Apply global pipes and other settings to match production
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  return app;
}

/**
 * Helper function to generate a test database configuration
 * This uses an in-memory SQLite database for testing
 */
export function getTestDatabaseModule(entities: any[]) {
  return TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    entities: entities,
    synchronize: true,
    logging: false,
  });
}

/**
 * Helper function to make authenticated requests
 */
export function authRequest(app: INestApplication, token: string) {
  return {
    get: (url: string) => request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${token}`),
    post: (url: string, data?: any) => request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${token}`)
      .send(data),
    put: (url: string, data?: any) => request(app.getHttpServer())
      .put(url)
      .set('Authorization', `Bearer ${token}`)
      .send(data),
    delete: (url: string) => request(app.getHttpServer())
      .delete(url)
      .set('Authorization', `Bearer ${token}`),
  };
}

/**
 * Helper to get mocked repository from a test module
 */
export function getMockRepository<T>(module: TestingModule, entity: any): MockType<Repository<T>> {
  return module.get(getRepositoryToken(entity));
}

/**
 * Generate a valid JWT token for testing
 */
export function generateTestToken(userId: number, role: string): string {
  // Note: In a real implementation, you would use the JwtService
  // This is a simplified version for testing purposes only
  const payload = {
    sub: userId,
    role: role,
    // Add other claims as needed
  };
  
  // Return a mock token
  return `test.${Buffer.from(JSON.stringify(payload)).toString('base64')}.token`;
} 