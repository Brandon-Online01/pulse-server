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

## Feedback Module

The feedback module allows clients to submit feedback on various aspects of the service, including tasks, quotations, claims, and general feedback. Each feedback submission is associated with client data, organization, branch, and feedback type.

### Features

- **Multiple Feedback Types**: Support for different types of feedback (General, Product, Service, Task, Quotation, Claim, Support, Suggestion)
- **Media Attachments**: Clients can attach files (images, documents) to their feedback
- **Organization & Branch Association**: All feedback is properly linked to organizations and branches
- **Rating System**: Optional 1-5 star rating
- **Token-Based Submission**: Secure token system for feedback submission from external links
- **Admin Response System**: Admins can respond to feedback and manage statuses
- **Analytics & Reporting**: View statistics and trends for feedback

### API Endpoints

- `POST /feedback` - Submit new feedback
- `POST /feedback/submit-with-token` - Submit feedback using a token from email link
- `GET /feedback` - Get all feedback (with filters)
- `GET /feedback/:id` - Get a specific feedback
- `PATCH /feedback/:id` - Update a feedback
- `DELETE /feedback/:id` - Delete a feedback
- `GET /feedback/validate-token` - Validate a feedback token
- `GET /feedback/stats` - Get feedback statistics

### Feedback Form Integration

To integrate the feedback system in client-facing applications:

1. **Automatic Token Generation**: When a task is completed, the system automatically generates a secure token for each client containing client ID, task ID, and timestamp
2. **Token Format**: `clientId-taskId-timestamp` (Base64 encoded)
3. **Email Links**: Task completion emails include a feedback link in the format: `/feedback?token={encodedToken}&type=TASK`
4. **Token Validation**: When a client clicks the link, the token is validated to ensure:
   - It's not expired (valid for 30 days)
   - The client and task exist in the system
5. **Automatic Association**: When feedback is submitted with a token, it's automatically associated with the correct client, task, organization, and branch
6. **Feedback Collection**: The feedback system supports ratings, comments, and file attachments

### Client Notification System

- When tasks are completed, clients receive an email notification
- The email includes task details and a personalized feedback link
- Organization admins can configure whether task completion notifications are sent
- Each notification is customized with client name, task details, and completion information

### Organization Settings

Organizations can configure their feedback system through organization settings:

- **Task Notifications**: Toggle client email notifications for completed tasks (`sendTaskNotifications`)
- **Feedback Token Expiry**: Set how many days feedback tokens remain valid (`feedbackTokenExpiryDays`, default: 30 days)
- **File Attachments**: Feedback attachments accept file URLs uploaded through the system's standard file upload mechanisms

## 👨‍💻 Author

[@Brandon-Online01](https://github.com/Brandon-Online01)
