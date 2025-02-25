# LORO Enterprise Backend ��

A powerful NestJS backend service powering location tracking, geofencing, and business management features for the LORO platform.

## 🎯 Demo Features

### 1. Location Services 📍
- **Real-time Tracking**
  - High-frequency location updates
  - Automatic address resolution using Google Maps API
  - Battery-optimized tracking intervals
  - Offline data sync support

- **Geofencing**
  - Create and manage work areas
  - Real-time entry/exit event processing
  - Customizable tracking rules per area
  - Historical geofence reports

- **Stop Detection**
  - Intelligent stop detection algorithm
  - Address resolution for stops
  - Duration and distance calculations
  - Stop event analytics

### 2. Authentication & Security 🔐
- JWT-based authentication
- Role-based access control
- API rate limiting
- Request validation
- Data encryption

### 3. Business Logic 💼
- Multi-tenant architecture
- Organization management
- User management
- Task tracking
- Analytics and reporting

## 🚀 Quick Demo Guide

1. **Setup (3 minutes)**
   ```bash
   git clone <repository-url>
   cd server
   yarn install
   ```

2. **Environment Setup (2 minutes)**
   ```bash
   cp .env.example .env
   # Update these key variables:
   API_PORT=4400
   DB_HOST=localhost
   DB_PORT=3306
   GOOGLE_MAPS_API_KEY=your_key
   ```

3. **Start Server (1 minute)**
   ```bash
   yarn start:dev
   ```

4. **Demo Flow (10 minutes)**

   a. **Authentication Demo**
   ```bash
   # Login request
   curl -X POST http://localhost:4400/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"demo@loro.com","password":"demo123"}'
   ```

   b. **Location Tracking Demo**
   ```bash
   # Save location
   curl -X POST http://localhost:4400/gps \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"latitude":1.23,"longitude":4.56}'
   ```

   c. **Geofence Demo**
   ```bash
   # Create geofence
   curl -X POST http://localhost:4400/geofence \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Office","latitude":1.23,"longitude":4.56,"radius":100}'
   ```

## 📊 API Documentation

Access Swagger docs at: http://localhost:4400/api

Key endpoints for demo:
1. **Authentication**
   - POST /auth/login
   - POST /auth/register
   - POST /auth/refresh

2. **Location Tracking**
   - POST /gps
   - POST /gps/stops
   - GET /gps/stops

3. **Geofencing**
   - POST /geofence
   - POST /geofence/event
   - GET /geofence/areas

## 🧪 Testing Guide

1. **Unit Tests**
   ```bash
   # Run all tests
   yarn test
   
   # Run specific feature tests
   yarn test tracking
   yarn test geofence
   ```

2. **E2E Tests**
   ```bash
   yarn test:e2e
   ```

## 📊 Demo Data

Test accounts available:
- Admin: admin@loro.com / admin123
- Manager: manager@loro.com / manager123
- Employee: employee@loro.com / employee123

## 🔧 Environment Variables

Key variables for demo:
```env
API_PORT=4400
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your_secret
GOOGLE_MAPS_API_KEY=your_key
```

## 🤝 Support

Need help with the demo?
Contact: support@loro.com

# Enterprise CRM Backend Service 🚀

A powerful and scalable backend service built with NestJS for enterprise-level CRM operations. This service provides comprehensive business management capabilities including user management, asset tracking, communication systems, licensing, and more.

## 🌟 Key Features

-   **🔐 Authentication & Authorization**

    -   JWT-based secure authentication
    -   Role-based access control (RBAC)
    -   Multiple access levels
    -   Password reset functionality
    -   Signup verification

-   **👥 User Management**

    -   Complete user lifecycle management
    -   Profile management
    -   Role-based permissions
    -   Employment profiles
    -   Rewards and achievements system

-   **🏢 Organization Management**

    -   Multi-tenant architecture
    -   Branch management
    -   Hierarchical structure
    -   Organization settings
    -   Appearance customization
    -   Business hours

-   **📱 Communication System**

    -   Email notifications
    -   Real-time updates
    -   Event-driven architecture
    -   WebSocket integration
    -   Communication logs

-   **📦 Asset Management**

    -   Asset tracking
    -   Insurance management
    -   Assignment tracking

-   **🛍️ E-commerce Platform**

    -   Product management with analytics
    -   Order processing
    -   Shopping cart functionality
    -   Quotation system with items
    -   Banner management

-   **📊 Reporting & Analytics**
    -   Custom reports
    -   Data visualization
    -   AI-powered insights
    -   Product analytics
    -   Performance tracking

-   **🔑 Licensing System**
    -   License management
    -   Usage tracking
    -   License events
    -   Subscription handling
    -   Feature access control

-   **📲 Mobile Integration**
    -   API endpoints for mobile usage
    -   Offline data synchronization
    -   Push notification support
    -   GPS tracking integration
    -   Check-in system

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 14
MySQL >= 8.0
Yarn
```

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd server
```

2. Install dependencies:

```bash
yarn install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:

```bash
yarn start:dev
```

The API will be available at `http://localhost:4400`

## 🛠️ Development

### Available Scripts

```bash
# Development
yarn start:dev

# Production build
yarn build
yarn start:prod

# Run tests
yarn test
yarn test:e2e
yarn test:cov

# Linting
yarn lint
yarn format
```

### Database Migrations

```bash
# Generate migration
yarn migration:generate

# Run migrations
yarn migration:run

# Revert migration
yarn migration:revert
```

## 📚 API Documentation

Once the server is running, access the Swagger documentation at:

```
http://localhost:4400/api
```

## 🧪 Testing

### Unit Tests

```bash
yarn test
```

### E2E Tests

```bash
yarn test:e2e
```

### Test Coverage

```bash
yarn test:cov
```

## 📦 Project Structure

```
src/
├── assets/           # Asset management module
├── attendance/       # Attendance tracking
├── auth/             # Authentication & authorization
├── branch/           # Branch management
├── check-ins/        # Check-in system
├── claims/           # Claims processing
├── clients/          # Client management
├── communication/    # Communication system
├── config/           # Configuration
├── decorators/       # Custom decorators
├── docs/             # Documentation
├── guards/           # Security guards
├── journal/          # Journal system
├── leads/            # Lead management
├── licensing/        # Licensing system
├── lib/              # Shared libraries
│   ├── docs/         # Documentation
│   ├── enums/        # Enumerations
│   ├── interfaces/   # TypeScript interfaces
│   └── templates/    # Email templates
├── news/             # News management
├── notifications/    # Notification system
├── organisation/     # Organization management
├── products/         # Product management
├── reports/          # Reporting system
├── resellers/        # Reseller management
├── rewards/          # Rewards system
├── shop/             # E-commerce platform
├── tasks/            # Task management
├── tracking/         # GPS tracking
├── user/             # User management
└── utils/            # Utility functions
```

## 🔒 Security

-   JWT authentication
-   Role-based authorization
-   Request validation
-   Data encryption
-   Rate limiting
-   CORS protection
-   Helmet security
-   Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Code Style

-   Follow TypeScript best practices
-   Use ESLint and Prettier for code formatting
-   Follow NestJS architectural patterns
-   Write comprehensive tests
-   Document your code with JSDoc comments

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

[@Brandon-Online01](https://github.com/Brandon-Online01)
