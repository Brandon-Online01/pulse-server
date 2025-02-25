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
