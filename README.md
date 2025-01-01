# Enterprise CRM Backend Service 🚀

A powerful and scalable backend service built with NestJS for enterprise-level CRM operations. This service provides comprehensive business management capabilities including user management, asset tracking, communication systems, and more.

## 🌟 Key Features

-   **🔐 Authentication & Authorization**

    -   JWT-based secure authentication
    -   Role-based access control (RBAC)
    -   Multiple access levels

-   **👥 User Management**

    -   Complete user lifecycle management
    -   Profile management
    -   Role-based permissions

-   **🏢 Organization Management**

    -   Multi-tenant architecture
    -   Branch management
    -   Hierarchical structure

-   **📱 Communication System**

    -   Email notifications
    -   Real-time updates
    -   Event-driven architecture

-   **📦 Asset Management**

    -   Asset tracking
    -   Insurance management
    -   Assignment tracking

-   **🛍️ E-commerce Platform**

    -   Product management
    -   Order processing
    -   Shopping cart functionality

-   **📊 Reporting & Analytics**
    -   Custom reports
    -   Data visualization
    -   AI-powered insights

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
├── auth/            # Authentication & authorization
├── communication/   # Communication system
├── lib/             # Shared libraries
│   ├── docs/        # Documentation
│   ├── enums/       # Enumerations
│   ├── interfaces/  # TypeScript interfaces
│   └── templates/   # Email templates
├── notifications/   # Notification system
├── organisation/    # Organization management
├── shop/           # E-commerce platform
├── tasks/          # Task management
├── tracking/       # GPS tracking
└── user/           # User management
```

## 🔒 Security

-   JWT authentication
-   Role-based authorization
-   Request validation
-   Data encryption
-   Rate limiting

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

[@Brandon-Online01](https://github.com/Brandon-Online01)
