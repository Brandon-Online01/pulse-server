# LORO Enterprise Backend Service 🚀

A powerful NestJS backend service powering location tracking, geofencing, business management, and intelligent route optimization for the LORO platform.

## 🎯 Key Features

### 1. Authentication & Security 🔐
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- API rate limiting
- Request validation with class-validator
- Data encryption
- Helmet protection for HTTP headers

### 2. Location & Tracking Services 📍
- Real-time GPS tracking
- Geofencing with entry/exit events
- Intelligent stop detection
- Address resolution using Google Maps API
- Battery-optimized tracking intervals
- Offline data sync support
- Worker status management

### 3. Business Modules 💼
- **Attendance System**
  - Check-in/check-out tracking
  - Work hour calculations
  - Break management
  - Location verification

- **Task Management**
  - Task assignment and tracking
  - Priority management
  - Deadline monitoring
  - Progress tracking

- **Client & Lead Management**
  - Client profiles and communication
  - Lead tracking and conversion
  - Client location mapping
  - Client-based task organization

- **Journal & Reports**
  - Daily activity logging
  - Custom report generation
  - Performance analytics
  - Data visualization APIs

### 4. Document Management 📄
- File uploads with Google Cloud Storage integration
- Document metadata tracking
- Content-type based categorization
- Secure file access control
- Public/private file management

### 5. Route Optimization 🗺️
- Real-time route planning
- Multi-stop optimization
- Distance and duration calculations
- Assignee-based routing
- Client location optimization

## 🚀 Technical Architecture

### Core Framework
- **NestJS**: Progressive Node.js framework
- **TypeScript**: Strongly typed programming language
- **Express**: Underlying web server framework

### Database & Storage
- **TypeORM**: ORM for TypeScript
- **MySQL**: Primary database
- **Google Cloud Storage**: File storage service

### Authentication & Security
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **Helmet**: HTTP header security
- **Throttler**: Rate limiting protection

### APIs & Documentation
- **Swagger/OpenAPI**: API documentation at `/api`
- **REST**: Primary API architecture

### Real-time Communication
- **Socket.IO**: WebSocket implementation
- **Event Emitter**: Event-driven architecture

## 🔍 Module Structure

The server is organized into feature modules:

```
src/
├── auth/           # Authentication & authorization
├── user/           # User management
├── organisation/   # Organization & branch management
├── tracking/       # Location tracking services
├── attendance/     # Attendance management
├── tasks/          # Task management
├── clients/        # Client management
├── leads/          # Lead generation & tracking
├── journal/        # Activity logging
├── reports/        # Reporting & analytics
├── claims/         # Claims processing
├── docs/           # Document management
├── shop/           # E-commerce functionality
└── config/         # Application configuration
```

## 📊 API Documentation

Access Swagger docs at: `http://localhost:4400/api`

Key endpoints:

1. **Authentication**
   - POST `/auth/login`
   - POST `/auth/register`
   - POST `/auth/refresh`

2. **Location Tracking**
   - POST `/tracking/location` - Send location updates
   - GET `/tracking/history` - Get location history
   - GET `/tracking/stops` - Get stop events

3. **Business Operations**
   - GET/POST `/tasks` - Task management
   - GET/POST `/clients` - Client management
   - GET/POST `/attendance` - Attendance tracking
   - GET/POST `/reports` - Report generation

## 🧪 Testing

1. **Unit Tests**
   ```bash
   # Run all tests
   yarn test
   
   # Run specific feature tests
   yarn test tracking
   yarn test auth
   ```

2. **E2E Tests**
   ```bash
   yarn test:e2e
   ```

## 🔧 Environment Configuration

Key variables in `.env`:
```
# Server Configuration
API_PORT=4400
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=loro

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Google Cloud & Maps Configuration
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_PROJECT_BUCKET=crmapplications
GOOGLE_MAPS_API_KEY=your_api_key
```

## 🚀 Getting Started

1. **Installation**
   ```bash
   git clone <repository-url>
   cd server
   yarn install
   ```

2. **Database Setup**
   ```bash
   # Configure your database in .env
   # Run migrations
   yarn migration:run
   ```

3. **Start Development Server**
   ```bash
   yarn start:dev
   # Server runs at http://localhost:4400
   ```

## 🤝 Support

Need help? Contact: support@loro.com

## 👨‍💻 Author

[@Brandon-Online01](https://github.com/Brandon-Online01)
