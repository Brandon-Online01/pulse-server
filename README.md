# LORO Enterprise Backend Service 🚀

A powerful NestJS backend service powering location tracking, geofencing, business management, and intelligent route optimization for the LORO platform.

## 🎯 Key Features

### 1. Authentication & Security 🔐
- JWT-based authentication
- Role-based access control
- API rate limiting
- Request validation
- Data encryption
- Helmet protection for HTTP headers

### 2. File Storage & Document Management 📄
- Google Cloud Storage integration
- File uploads stored in dedicated 'loro' folder
- Document metadata tracking
- Content-type based categorization
- Automatic organization and user association
- Secure file access control
- Public/private file management

### 3. Location Services 📍
- Real-time tracking
- Geofencing with entry/exit events
- Intelligent stop detection
- Address resolution using Google Maps API
- Battery-optimized tracking intervals
- Offline data sync support

### 4. Business Logic 💼
- Multi-tenant architecture
- Organization management
- Branch management with location mapping
- User management with role-based permissions
- Task tracking and assignment
- Client management
- Analytics and reporting

### 5. Route Optimization 🗺️
- Real-time route planning
- Google Maps integration
- Multi-stop optimization
- Distance and duration calculations
- Automatic route updates
- Route caching for performance
- Assignee-based routing
- Client location optimization

### 6. Real-time Communication 📨
- WebSocket support
- Real-time notifications
- Event-driven architecture
- Socket.IO integration
- Communication logs

## 🚀 Technical Architecture

### Core Framework
- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications
- **TypeScript**: Strongly typed programming language that builds on JavaScript
- **Express**: Underlying web server framework

### Database & Storage
- **TypeORM**: ORM for TypeScript and JavaScript
- **MySQL**: Primary database
- **Google Cloud Storage**: File storage service
  - Files stored in 'loro' folder within bucket
  - Automatic metadata extraction and association
  - User and organization mapping from file metadata

### Authentication & Security
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **Helmet**: HTTP header security
- **Throttler**: Rate limiting protection

### APIs & Documentation
- **Swagger/OpenAPI**: API documentation
- **GraphQL**: Alternative query language support
- **REST**: Primary API architecture

### Caching & Performance
- **Cache Manager**: Configurable caching
- **Compression**: Response compression
- **Redis**: Optional distributed caching

### Real-time Communication
- **Socket.IO**: WebSocket implementation
- **Event Emitter**: Event-driven architecture

## 📊 API Documentation

Access Swagger docs at: http://localhost:4400/api

Key endpoints:

1. **Authentication**
   - POST /auth/login
   - POST /auth/register
   - POST /auth/refresh

2. **File Management**
   - POST /docs/upload - Upload files to 'loro' folder in Google Cloud Storage
   - GET /docs/:id - Get document by ID
   - GET /docs/download/:id - Get download URL for document

3. **Location Services**
   - POST /gps - Save location data
   - POST /gps/stops - Record stop events
   - GET /gps/stops - Retrieve stop history

4. **Route Optimization**
   - GET /tasks/routes - Get optimized routes
   - Parameters:
     - date (optional): YYYY-MM-DD format
   - Returns optimized routes with details

## 🧪 Testing Guide

1. **Unit Tests**
   ```bash
   # Run all tests
   yarn test
   
   # Run specific feature tests
   yarn test storage
   yarn test tracking
   ```

2. **E2E Tests**
   ```bash
   yarn test:e2e
   ```

## 🔧 Environment Variables

Key variables:
```env
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

# Google Cloud Storage Configuration
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_PROJECT_BUCKET=crmapplications
GOOGLE_CLOUD_KEYFILE_JSON=your_keyfile_json

# Google Maps Configuration
GOOGLE_MAPS_API_KEY=your_api_key
GOOGLE_MAPS_GEOCODING_ENABLED=true
GOOGLE_MAPS_DIRECTIONS_ENABLED=true
GOOGLE_MAPS_PLACES_ENABLED=true

# Email Configuration
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=user@example.com
MAIL_PASS=password
MAIL_FROM=noreply@example.com
```

## 📁 File Storage Setup

The system uses Google Cloud Storage for file management with the following features:

1. **Folder Structure**:
   - Files are stored in a dedicated `loro` folder within the bucket
   - This provides organization and separation from other files

2. **File Naming**:
   - Files are stored with a unique hash-based filename to prevent collisions
   - Original filenames are preserved in the document metadata

3. **Metadata Handling**:
   - File metadata includes:
     - Original filename
     - MIME type
     - File size
     - Upload timestamp
     - User information (from uploadedBy metadata)
     - Branch information (from branch metadata)

4. **Document Entity**:
   - Files are tracked in the database with the following key fields:
     - `content`: Uses the content type (e.g., 'image' for image files)
     - `description`: Contains the document ID for reference
     - `fileType`: Type of file (image, document, etc.)
     - `url`: Public URL to access the file
     - Relationships to user, branch, and organization

5. **Security Considerations**:
   - Files can be marked as public or private
   - Access control based on user permissions
   - Signed URLs for temporary access

## 🤝 Support

Need help? Contact: support@loro.com

## 👨‍💻 Author

[@Brandon-Online01](https://github.com/Brandon-Online01)
