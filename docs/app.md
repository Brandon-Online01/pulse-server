# Loro CRM - Enterprise Server Documentation

## Overview

Loro CRM is an enterprise-grade customer relationship management system built with NestJS. The system provides comprehensive business management capabilities including user management, asset tracking, attendance monitoring, and advanced licensing controls.

### Core Technologies

-   **Framework**: NestJS
-   **Database**: MySQL with TypeORM
-   **Authentication**: JWT-based with role-based access control
-   **Caching**: Built-in cache manager
-   **Event Handling**: Event emitter for async operations
-   **Scheduling**: Cron jobs for automated tasks

### Key Features

-   Multi-tenant architecture
-   Role-based access control
-   Enterprise-grade licensing system
-   Real-time notifications
-   Comprehensive audit logging
-   Automated task scheduling
-   File and asset management
-   Employee attendance tracking

## Module Documentation

### 1. Assets Module

**Purpose**: Manages all digital and physical assets within the organization.

#### Core Features:

-   Asset registration and tracking
-   Asset assignment to users/departments
-   Asset status monitoring
-   Insurance and warranty tracking
-   Asset history and audit logs

#### Asset Types Supported:

-   Hardware (computers, phones, etc.)
-   Software licenses
-   Office equipment
-   Company vehicles
-   Digital resources

### 2. Attendance Module

**Purpose**: Manages employee attendance, time tracking, and presence monitoring.

#### Core Features:

-   Check-in/check-out tracking
-   Working hours calculation
-   Leave management
-   Attendance reporting
-   Location-based verification
-   Overtime tracking

#### Special Features:

-   GPS location verification
-   Work hour calculations
-   Overtime tracking
-   Leave balance management
-   Holiday calendar integration

### 3. Auth Module

**Purpose**: Handles authentication, authorization, and user session management.

#### Core Features:

-   User authentication
-   JWT token management
-   Role-based access control
-   Password reset flow
-   Email verification
-   Session management
-   License validation integration

#### Authentication Flow:

#### Security Features:

-   Bcrypt password hashing
-   JWT token encryption
-   Rate limiting
-   Token refresh mechanism
-   Grace period handling
-   License validation
-   Multi-factor authentication support

#### Special Flows:

1. **Sign Up Flow**:

    - Email submission
    - Verification token generation
    - Email verification
    - Password setting
    - Account activation

2. **Password Reset Flow**:

    - Reset request
    - Token generation
    - Email notification
    - Password update
    - Token invalidation

3. **License Validation**:
    - Organization license check
    - Feature access validation
    - Usage limit verification
    - Token payload enhancement

#### Integration Points:

-   Connects with Licensing module for access control
-   Integrates with User module for profile management
-   Works with Notification module for alerts
-   Interfaces with Rewards module for login rewards

### 4. Branch Module

**Purpose**: Manages organization branches and their hierarchical structure.

#### Core Features:

-   Branch creation and management
-   Branch hierarchy control
-   Staff assignment to branches
-   Branch-specific settings
-   Geographic location management
-   Resource allocation tracking

#### Branch Management Features:

-   Multi-location support
-   Staff capacity planning
-   Resource allocation
-   Performance tracking
-   Geographic distribution
-   Operating hours management

#### Integration Points:

-   Links with User module for staff assignment
-   Connects with Assets module for resource tracking
-   Integrates with Attendance module for location-based tracking
-   Works with Licensing module for branch limits

### 5. Check-ins Module

**Purpose**: Manages employee check-ins, location verification, and presence tracking.

#### Core Features:

-   Real-time check-in recording
-   Location verification
-   Time stamping
-   Presence validation
-   Activity logging
-   Geofencing support

#### Check-in Types:

-   Office check-in
-   Remote work check-in
-   Client visit check-in
-   Field work check-in
-   Meeting check-in

#### Special Features:

-   GPS location validation
-   Geofence boundaries
-   Time zone handling
-   Offline check-in support
-   Photo verification option
-   Activity categorization

#### Integration Points:

-   Works with Attendance module for time tracking
-   Connects with Branch module for location validation
-   Integrates with Reports module for analytics
-   Links with User module for employee tracking

#### Security Features:

-   Location data encryption
-   Spoofing prevention
-   Data retention policies
-   Privacy controls
-   Audit logging

### 6. Claims Module

**Purpose**: Manages insurance claims processing and tracking within the organization.

#### Core Features:

-   Claim submission and processing
-   Document management
-   Status tracking
-   Claims history
-   Settlement tracking
-   Automated workflows

#### Claims Processing Features:

-   Multi-stage approval workflow
-   Document verification
-   Automated status updates
-   Settlement calculation
-   Risk assessment
-   Fraud detection
-   Claims history tracking

#### Integration Points:

-   Links with Documents module for file management
-   Connects with Notifications for status updates
-   Integrates with Reports for analytics
-   Works with Client module for customer data

### 7. Clients Module

**Purpose**: Manages client relationships, profiles, and interactions.

#### Core Features:

-   Client profile management
-   Interaction history
-   Contact management
-   Client segmentation
-   Activity tracking
-   Relationship scoring

#### Client Management Features:

-   Contact information tracking
-   Interaction history
-   Document management
-   Communication preferences
-   Custom fields support
-   Client categorization
-   Lead conversion tracking

#### Integration Points:

-   Works with Communication module for client interactions
-   Links with Documents for file management
-   Connects with Tasks for follow-ups
-   Integrates with Analytics for insights

### 8. Communication Module

**Purpose**: Handles all communication channels and message management.

#### Core Features:

-   Multi-channel messaging
-   Template management
-   Communication history
-   Automated responses
-   Campaign management
-   Delivery tracking

#### Communication Types:

-   Email communications
-   SMS messages
-   Push notifications
-   In-app messages
-   Campaign broadcasts
-   Automated responses

#### Special Features:

-   Template personalization
-   Delivery scheduling
-   Read receipts
-   A/B testing
-   Campaign analytics
-   Bounce handling
-   Unsubscribe management

#### Integration Points:

-   Works with Clients module for recipient management
-   Links with Templates for message formatting
-   Connects with Analytics for tracking
-   Integrates with Automation for workflows

### 9. Configuration Module

**Purpose**: Manages system-wide configurations and settings.

#### Core Features:

-   System settings management
-   Environment configurations
-   Feature toggles
-   Integration settings
-   Storage configurations
-   Security settings

### 10. Decorators and Guards

**Purpose**: Provides security and authorization control across the application.

#### Key Features:

-   Role-based access control
-   License validation
-   Feature access control
-   Public route marking
-   Authentication checks
-   Permission validation

### 11. Journal Module

**Purpose**: Manages activity logging and audit trail across the system.

#### Core Features:

-   Activity tracking
-   Audit logging
-   Event recording
-   Change history
-   User actions
-   System events

#### Journal Entry Types:

-   User actions
-   System events
-   Security events
-   Data changes
-   Access logs
-   Error logs
-   Performance metrics

#### Integration Points:

-   Works with all modules for activity tracking
-   Links with Users for action attribution
-   Connects with Analytics for insights
-   Integrates with Security for audit trails

### 12. Leads Module

**Purpose**: Manages sales leads and opportunity tracking.

#### Core Features:

-   Lead capture
-   Lead scoring
-   Lead nurturing
-   Pipeline management
-   Conversion tracking
-   Follow-up automation

#### Lead Management Features:

-   Source tracking
-   Score calculation
-   Status management
-   Task automation
-   Follow-up scheduling
-   Pipeline visualization
-   Conversion analytics

#### Integration Points:

-   Works with Clients for conversion
-   Links with Tasks for follow-ups
-   Connects with Communication for outreach
-   Integrates with Analytics for insights

### 13. Licensing Module

**Purpose**: Manages system licensing and feature access control.

#### Core Features:

-   License management
-   Feature control
-   Usage tracking
-   Limit enforcement
-   Subscription handling
-   Compliance monitoring

#### License Types:

-   Perpetual licenses
-   Subscription licenses
-   Trial licenses
-   Enterprise licenses

#### Special Features:

-   Usage monitoring
-   Feature toggling
-   Limit enforcement
-   Grace period handling
-   Auto-renewal
-   Usage analytics
-   Compliance reporting

#### Integration Points:

-   Works with Auth for access control
-   Links with Users for permissions
-   Connects with Billing for payments
-   Integrates with Analytics for usage tracking

#### License Management:

-   License key generation
-   Validation checks
-   Feature matrix
-   Usage quotas
-   Expiration handling
-   Renewal processing
-   Upgrade paths

### 14. News Module

**Purpose**: Manages internal news and announcements within the organization.

#### Core Features:

-   News article management
-   Announcement distribution
-   Category management
-   Content scheduling
-   Audience targeting
-   Engagement tracking

#### News Types:

-   Company announcements
-   Product updates
-   Policy changes
-   Event notifications
-   Industry news
-   Team updates

#### Integration Points:

-   Works with Notifications for distribution
-   Links with Users for targeting
-   Connects with Analytics for tracking
-   Integrates with Communication for delivery

### 15. Notifications Module

**Purpose**: Handles system-wide notifications and alerts.

#### Core Features:

-   Real-time notifications
-   Multi-channel delivery
-   Notification preferences
-   Alert management
-   Delivery tracking
-   Template management

#### Notification Types:

-   System alerts
-   Task reminders
-   Update notifications
-   Security alerts
-   Custom notifications
-   Broadcast messages

#### Special Features:

-   Real-time delivery
-   Priority levels
-   Read receipts
-   Notification grouping
-   Custom templates
-   Delivery scheduling
-   Channel preferences

#### Integration Points:

-   Works with all modules for alerts
-   Links with Users for preferences
-   Connects with WebSocket for real-time
-   Integrates with Email/SMS services

### 16. Products Module

**Purpose**: Manages product catalog and inventory.

#### Core Features:

-   Product management
-   Category organization
-   Pricing control
-   Inventory tracking
-   Variant handling
-   Product analytics

#### Product Management:

-   SKU generation
-   Price management
-   Stock tracking
-   Category organization
-   Image handling
-   Variant control
-   Attribute management

#### Special Features:

-   Bulk operations
-   Price history
-   Stock alerts
-   Sales tracking
-   Product analytics
-   Related products
-   Custom attributes

#### Integration Points:

-   Works with Shop for sales
-   Links with Inventory for stock
-   Connects with Analytics for insights
-   Integrates with Orders for processing

### 17. Reports Module

**Purpose**: Generates and manages system-wide reports and analytics.

#### Core Features:

-   Report generation
-   Data analytics
-   Custom reporting
-   Scheduled reports
-   Export capabilities
-   Dashboard metrics

#### Report Types:

-   Sales reports
-   Performance metrics
-   Usage analytics
-   Compliance reports
-   Financial reports
-   Custom reports
-   Audit reports

#### Special Features:

-   Custom templates
-   Multiple formats
-   Scheduled generation
-   Email distribution
-   Interactive dashboards
-   Data visualization
-   Export options

#### Integration Points:

-   Works with all modules for data
-   Links with Analytics for insights
-   Connects with Notifications for delivery
-   Integrates with Storage for exports

### 18. Resellers Module

**Purpose**: Manages reseller relationships and operations.

#### Core Features:

-   Reseller management
-   Commission tracking
-   Performance monitoring
-   Territory management
-   Quote generation
-   Order processing

#### Reseller Features:

-   Profile management
-   Commission structure
-   Territory assignment
-   Performance tracking
-   Quote management
-   Order handling
-   Support access

#### Integration Points:

-   Works with Orders for processing
-   Links with Products for catalog
-   Connects with Billing for commissions
-   Integrates with Support for assistance

### 19. Rewards Module

**Purpose**: Manages loyalty programs and reward systems.

#### Core Features:

-   Point system
-   Reward tracking
-   Achievement system
-   Redemption management
-   Program rules
-   Engagement tracking

#### Reward Types:

-   Point rewards
-   Achievement badges
-   Milestone rewards
-   Referral bonuses
-   Activity rewards
-   Special promotions

#### Special Features:

-   Point calculation
-   Achievement tracking
-   Redemption validation
-   Progress monitoring
-   Expiration handling
-   Bonus multipliers
-   Level system

#### Integration Points:

-   Works with Users for tracking
-   Links with Shop for redemption
-   Connects with Activities for points
-   Integrates with Notifications for alerts

### 20. Shop Module

**Purpose**: Manages e-commerce operations and online store functionality.

#### Core Features:

-   Product catalog
-   Shopping cart
-   Order processing
-   Payment handling
-   Inventory management
-   Discount management

#### Shop Features:

-   Cart management
-   Checkout process
-   Payment processing
-   Order tracking
-   Discount handling
-   Inventory sync
-   Price management

#### Integration Points:

-   Works with Products for catalog
-   Links with Payments for processing
-   Connects with Inventory for stock
-   Integrates with Shipping for delivery

### 21. Tasks Module

**Purpose**: Manages task assignments and workflow automation.

#### Core Features:

-   Task management
-   Assignment handling
-   Progress tracking
-   Deadline monitoring
-   Priority management
-   Workflow automation

#### Task Types:

-   Individual tasks
-   Team tasks
-   Project tasks
-   Follow-up tasks
-   Recurring tasks
-   Automated tasks

#### Special Features:

-   Due date tracking
-   Priority levels
-   Status updates
-   Progress tracking
-   Time tracking
-   Dependency management
-   Automated workflows

#### Integration Points:

-   Works with Users for assignments
-   Links with Calendar for scheduling
-   Connects with Projects for tracking
-   Integrates with Notifications for alerts

### 22. Tracking Module

**Purpose**: Manages activity and performance tracking across the system.

#### Core Features:

-   Activity tracking
-   Performance monitoring
-   Usage analytics
-   Time tracking
-   Progress monitoring
-   Metric collection

#### Tracking Types:

-   User activity
-   System performance
-   Resource usage
-   Time tracking
-   Progress monitoring
-   Custom metrics

#### Special Features:

-   Real-time tracking
-   Custom metrics
-   Performance alerts
-   Usage analysis
-   Trend detection
-   Report generation
-   Dashboard integration

#### Integration Points:

-   Works with all modules for data
-   Links with Analytics for insights
-   Connects with Reports for analysis
-   Integrates with Monitoring for alerts
