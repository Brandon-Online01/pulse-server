# Enterprise CRM Backend Service

A robust CRM backend service built with NestJS, featuring comprehensive business management capabilities including asset tracking, user management, and communication systems.

## Core Features

- **Asset Management**: Complete tracking of company assets with insurance details
- **User Management**: Role-based access control with multiple access levels
- **Branch Management**: Multi-branch business support
- **Communication System**: Internal messaging and notification system
- **Task Management**: Task tracking with subtasks support
- **Document Management**: Document storage and handling
- **Claims Processing**: Insurance and other claims management
- **Lead Management**: Sales lead tracking and processing
- **Journal System**: Activity logging and tracking
- **Organization Management**: Multi-organization support
- **Shop Module**: E-commerce capabilities
- **Reporting System**: Comprehensive business reporting

## Technical Architecture

### Core Technologies

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MySQL with TypeORM
- **Authentication**: JWT with Role-based Guards
- **API Documentation**: Swagger/OpenAPI
- **Event Handling**: EventEmitter2

### Key Modules

```typescript
@Module({
  imports: [
    AssetsModule,
    AttendanceModule,
    AuthModule,
    BranchModule,
    ClaimsModule,
    ClientsModule,
    CommunicationModule,
    // ... other modules
  ]
})
```

### Database Configuration

```typescript
TypeOrmModule.forRoot({
	type: 'mysql',
	host: process.env.DATABASE_HOST,
	port: +process.env.DATABASE_PORT,
	username: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	entities: [
		User,
		UserProfile,
		UserEmployeementProfile,
		Attendance,
		// ... other entities
	],
	synchronize: true,
	retryAttempts: 50,
	retryDelay: 2000,
	extra: {
		connectionLimit: 100,
	},
});
```

### Security Features

- Role-based access control (RBAC)
- JWT Authentication
- Route Guards
- Input Validation using class-validator

### API Documentation

The API is fully documented using Swagger/OpenAPI decorators. Example from the Assets module:

```typescript
@ApiOperation({ summary: 'create a new asset' })
@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER)
@Post()
create(@Body() createAssetDto: CreateAssetDto)
```

## Environment Setup

Required environment variables:

- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`
- `SUCCESS_MESSAGE`
- `CREATE_ERROR_MESSAGE`
- `UPDATE_ERROR_MESSAGE`
- `DELETE_ERROR_MESSAGE`
- `RESTORE_ERROR_MESSAGE`
- `SEARCH_ERROR_MESSAGE`

## Development

```bash
# Installation
npm install

# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## Code Style

The project uses ESLint and Prettier for code formatting with the following configuration:

- Single quotes
- Trailing commas
- Tab indentation (4 spaces)

## License

MIT Licensed

## Author

Brandon N Nkawu - [@Brandon-Online01](https://github.com/Brandon-Online01)
