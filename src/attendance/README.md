# ⏰ Attendance Management Module

## Overview

The Attendance Management Module provides comprehensive workforce tracking and time management capabilities for the LORO platform, enabling organizations to monitor employee check-ins, check-outs, break management, and generate detailed attendance analytics. This module handles GPS-verified attendance tracking, real-time shift monitoring, productivity insights, and provides foundational infrastructure for workforce optimization and compliance reporting.

## 🏗️ Architecture

```
attendance/
├── attendance.controller.ts          # REST API endpoints for attendance operations
├── attendance.service.ts            # Core business logic and attendance calculations
├── attendance.module.ts             # Module configuration & dependencies
├── entities/                        # Database entities
│   └── attendance.entity.ts        # Attendance entity with user/branch relationships
├── dto/                            # Data Transfer Objects
│   ├── create-attendance-check-in.dto.ts    # Check-in validation
│   ├── create-attendance-check-out.dto.ts   # Check-out validation
│   ├── create-attendance-break.dto.ts       # Break management validation
│   └── organization-report-query.dto.ts     # Report query parameters
├── interfaces/                     # Interface definitions
│   └── break-detail.interface.ts  # Break detail structure
├── services/                       # Enhanced calculation services
│   ├── attendance-calculator.service.ts     # Advanced attendance calculations
│   ├── organization-hours.service.ts        # Organization working hours logic
│   └── attendance-reports.service.ts        # Automated daily reports via email
├── utils/                          # Utility functions
│   ├── time-calculator.util.ts     # Time calculation utilities
│   └── date-range.util.ts         # Date range operations
├── attendance.controller.spec.ts   # API endpoint tests
└── attendance.service.spec.ts      # Service layer tests
```

## 🎯 Core Features

### GPS-Verified Attendance Tracking

-   **Location-Based Check-ins** with GPS coordinate validation and geofencing
-   **Real-Time Monitoring** with WebSocket updates for live attendance status
-   **Fraud Prevention** using location verification and duplicate check prevention
-   **Mobile Integration** with native mobile app support for field workers
-   **Offline Sync** capability for areas with poor connectivity

### Advanced Time Management

-   **Break Management** with detailed break tracking and automatic calculations
-   **Shift Duration** calculations with overtime detection and reporting
-   **Work Session Analytics** with productivity insights and efficiency metrics
-   **Time Zone Support** for global organizations with multiple locations
-   **Custom Work Schedules** with flexible hour configurations per organization

### Comprehensive Reporting

-   **Real-Time Dashboards** with live attendance status and metrics
-   **Historical Analytics** with trend analysis and predictive insights
-   **Compliance Reports** for labor law adherence and audit requirements
-   **Performance Metrics** with individual and team productivity tracking
-   **Export Capabilities** supporting multiple formats (PDF, Excel, CSV)
-   **📧 Automated Daily Email Reports**
    -   **Morning Reports**: Sent 5 minutes after organization opening time
    -   **Evening Reports**: Sent 30 minutes after organization closing time
    -   **Smart Scheduling**: Respects organization working hours and holidays
    -   **Management Notifications**: Auto-sent to OWNER, ADMIN, and HR users
    -   **AI-Powered Insights**: Includes recommendations and trend analysis

### Organization Integration

-   **Multi-Tenant Support** with organization-scoped attendance management
-   **Branch-Based Tracking** supporting distributed workforce management
-   **Role-Based Analytics** with manager and employee specific views
-   **XP Rewards Integration** gamifying attendance with point systems
-   **Event-Driven Architecture** with real-time notifications and triggers

## 📊 Database Schema

### Attendance Entity

```typescript
@Entity('attendance')
@Index(['owner', 'checkIn']) // User attendance queries
@Index(['status', 'checkIn']) // Status-based filtering
@Index(['checkIn', 'checkOut']) // Time range queries
@Index(['createdAt']) // Date-based reporting
export class Attendance {
	@PrimaryGeneratedColumn()
	uid: number;

	@Column({
		type: 'enum',
		enum: AttendanceStatus,
		default: AttendanceStatus.PRESENT,
	})
	status: AttendanceStatus;

	@Column({ type: 'timestamp' })
	checkIn: Date;

	@Column({ type: 'timestamp', nullable: true })
	checkOut: Date;

	@Column({ type: 'varchar', nullable: true })
	duration: string;

	@Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
	checkInLatitude: number;

	@Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
	checkInLongitude: number;

	@Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
	checkOutLatitude: number;

	@Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
	checkOutLongitude: number;

	@Column({ type: 'text', nullable: true })
	checkInNotes: string;

	@Column({ type: 'text', nullable: true })
	checkOutNotes: string;

	@Column({ type: 'timestamp', nullable: true })
	breakStartTime: Date;

	@Column({ type: 'timestamp', nullable: true })
	breakEndTime: Date;

	@Column({ type: 'varchar', nullable: true })
	totalBreakTime: string;

	@Column({ type: 'int', nullable: true, default: 0 })
	breakCount: number;

	@Column({ type: 'simple-json', nullable: true })
	breakDetails: BreakDetail[];

	@Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
	breakLatitude: number;

	@Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
	breakLongitude: number;

	@Column({ type: 'text', nullable: true })
	breakNotes: string;

	@Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Column({ type: 'timestamp', nullable: false, onUpdate: 'CURRENT_TIMESTAMP', default: () => 'CURRENT_TIMESTAMP' })
	updatedAt: Date;

	@Column({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
	verifiedAt: Date;

	// Relations
	@ManyToOne(() => User, (user) => user?.attendance)
	owner: User;

	@ManyToOne(() => User, (user) => user?.attendance, { nullable: true })
	verifiedBy: User;

	@ManyToOne(() => Organisation, (organisation) => organisation?.attendances, { nullable: true })
	organisation: Organisation;

	@ManyToOne(() => Branch, (branch) => branch?.attendances, { nullable: true })
	branch: Branch;
}
```

### Attendance Status Enum

```typescript
export enum AttendanceStatus {
	PRESENT = 'PRESENT', // Currently checked in
	COMPLETED = 'COMPLETED', // Shift completed (checked out)
	ON_BREAK = 'ON_BREAK', // Currently on break
	LATE = 'LATE', // Late arrival
	EARLY_DEPARTURE = 'EARLY_DEPARTURE', // Left early
}
```

### Break Detail Interface

```typescript
export interface BreakDetail {
	startTime: Date;
	endTime?: Date;
	duration?: number;
	notes?: string;
	latitude?: number;
	longitude?: number;
}
```

## 📚 API Endpoints

### Check-In Management

#### `POST /att/in` 🔒 Protected

**Record Employee Check-In**

```typescript
// Request
{
  "checkIn": "2025-01-15T08:00:00.000Z",
  "checkInLatitude": -26.2041,
  "checkInLongitude": 28.0473,
  "checkInNotes": "Starting morning shift",
  "status": "PRESENT",
  "branch": { "uid": 12 },
  "owner": { "uid": 45 }
}

// Response
{
  "success": true,
  "message": "Check-in recorded successfully",
  "data": {
    "uid": 1234,
    "status": "PRESENT",
    "checkIn": "2025-01-15T08:00:00.000Z",
    "checkInLatitude": -26.2041,
    "checkInLongitude": 28.0473,
    "checkInNotes": "Starting morning shift",
    "owner": {
      "uid": 45,
      "name": "John",
      "surname": "Doe",
      "email": "john.doe@company.com"
    },
    "branch": {
      "uid": 12,
      "name": "Main Branch",
      "address": "123 Main Street, City"
    },
    "xpAwarded": 10,
    "createdAt": "2025-01-15T08:00:00.000Z"
  }
}
```

#### `POST /att/out` 🔒 Protected

**Record Employee Check-Out**

```typescript
// Request
{
  "checkOut": "2025-01-15T17:30:00.000Z",
  "checkOutLatitude": -26.2041,
  "checkOutLongitude": 28.0473,
  "checkOutNotes": "Completed all daily tasks",
  "owner": { "uid": 45 }
}

// Response
{
  "success": true,
  "message": "Check-out recorded successfully",
  "data": {
    "uid": 1234,
    "status": "COMPLETED",
    "checkIn": "2025-01-15T08:00:00.000Z",
    "checkOut": "2025-01-15T17:30:00.000Z",
    "duration": "9h 30m",
    "checkOutLatitude": -26.2041,
    "checkOutLongitude": 28.0473,
    "checkOutNotes": "Completed all daily tasks",
    "totalBreakTime": "45m",
    "breakCount": 2,
    "netWorkTime": "8h 45m",
    "overtime": "30m",
    "xpAwarded": 15,
    "updatedAt": "2025-01-15T17:30:00.000Z"
  }
}
```

### Break Management

#### `POST /att/break` 🔒 Protected

**Manage Employee Breaks**

```typescript
// Start Break Request
{
  "type": "start",
  "breakStartTime": "2025-01-15T12:00:00.000Z",
  "breakLatitude": -26.2041,
  "breakLongitude": 28.0473,
  "breakNotes": "Lunch break",
  "owner": { "uid": 45 }
}

// End Break Request
{
  "type": "end",
  "breakEndTime": "2025-01-15T12:30:00.000Z",
  "breakLatitude": -26.2041,
  "breakLongitude": 28.0473,
  "breakNotes": "Returned from lunch",
  "owner": { "uid": 45 }
}

// Response
{
  "success": true,
  "message": "Break recorded successfully",
  "data": {
    "uid": 1234,
    "status": "PRESENT", // or "ON_BREAK"
    "breakStartTime": "2025-01-15T12:00:00.000Z",
    "breakEndTime": "2025-01-15T12:30:00.000Z",
    "breakDuration": "30m",
    "totalBreakTime": "1h 15m",
    "breakCount": 2,
    "breakDetails": [
      {
        "startTime": "2025-01-15T10:15:00.000Z",
        "endTime": "2025-01-15T10:30:00.000Z",
        "duration": 15,
        "notes": "Coffee break"
      },
      {
        "startTime": "2025-01-15T12:00:00.000Z",
        "endTime": "2025-01-15T12:30:00.000Z",
        "duration": 30,
        "notes": "Lunch break"
      }
    ],
    "updatedAt": "2025-01-15T12:30:00.000Z"
  }
}
```

### Attendance Queries

#### `GET /att/all` 🔒 Protected

**Get All Attendance Records**

```typescript
// Response
{
  "success": true,
  "message": "All attendance records retrieved successfully",
  "data": {
    "checkIns": [
      {
        "uid": 1234,
        "status": "COMPLETED",
        "checkIn": "2025-01-15T08:00:00.000Z",
        "checkOut": "2025-01-15T17:30:00.000Z",
        "duration": "9h 30m",
        "totalBreakTime": "45m",
        "breakCount": 2,
        "owner": {
          "uid": 45,
          "username": "john.doe",
          "name": "John",
          "surname": "Doe",
          "email": "john.doe@company.com",
          "role": "employee",
          "accessLevel": "USER"
        },
        "branch": {
          "uid": 12,
          "name": "Main Branch",
          "address": "123 Main Street, City"
        },
        "organisation": {
          "uid": 1,
          "name": "ABC Corporation"
        },
        "createdAt": "2025-01-15T08:00:00.000Z"
      }
    ],
    "summary": {
      "totalRecords": 1,
      "activeShifts": 0,
      "completedShifts": 1,
      "totalHours": "8h 45m"
    }
  }
}
```

#### `GET /att/date/:date` 🔒 Protected

**Get Attendance by Date**

```typescript
// Response
{
  "success": true,
  "message": "Attendance records for 2025-01-15 retrieved successfully",
  "data": {
    "date": "2025-01-15",
    "checkIns": [
      {
        "uid": 1234,
        "status": "PRESENT",
        "checkIn": "2025-01-15T08:00:00.000Z",
        "checkInLatitude": -26.2041,
        "checkInLongitude": 28.0473,
        "owner": {
          "uid": 45,
          "name": "John",
          "surname": "Doe",
          "email": "john.doe@company.com"
        },
        "branch": {
          "uid": 12,
          "name": "Main Branch"
        }
      }
    ],
    "dailyStats": {
      "totalEmployees": 25,
      "checkedIn": 23,
      "onBreak": 3,
      "checkedOut": 15,
      "attendanceRate": 92.0,
      "totalHours": "184h 30m",
      "averageHours": "8h 2m"
    }
  }
}
```

#### `GET /att/user/:ref` 🔒 Protected

**Get User Attendance History**

```typescript
// Response
{
  "success": true,
  "message": "User attendance history retrieved successfully",
  "data": {
    "user": {
      "uid": 45,
      "name": "John",
      "surname": "Doe",
      "email": "john.doe@company.com",
      "role": "employee"
    },
    "checkIns": [
      {
        "uid": 1234,
        "status": "COMPLETED",
        "checkIn": "2025-01-15T08:00:00.000Z",
        "checkOut": "2025-01-15T17:30:00.000Z",
        "duration": "9h 30m",
        "totalBreakTime": "45m"
      }
    ],
    "summary": {
      "totalShifts": 22,
      "totalHours": "176h 30m",
      "averageHours": "8h 2m",
      "attendanceStreak": 5,
      "punctualityScore": 95.5
    }
  }
}
```

#### `GET /att/status/:ref` 🔒 Protected

**Get Current User Status**

```typescript
// Response
{
  "success": true,
  "message": "User status retrieved successfully",
  "data": {
    "user": {
      "uid": 45,
      "name": "John",
      "surname": "Doe"
    },
    "currentStatus": {
      "checkedIn": true,
      "isLatestCheckIn": true,
      "status": "PRESENT",
      "startTime": "08:00:00",
      "currentDuration": "4h 30m",
      "nextAction": "check-out",
      "breakStatus": "not-on-break",
      "totalBreakTime": "15m"
    },
    "attendance": {
      "uid": 1234,
      "checkIn": "2025-01-15T08:00:00.000Z",
      "checkInLatitude": -26.2041,
      "checkInLongitude": 28.0473,
      "breakCount": 1,
      "totalBreakTime": "15m"
    },
    "suggestedActions": [
      "Take a break",
      "Update location",
      "Add work notes"
    ]
  }
}
```

### Analytics & Reporting

#### `GET /att/branch/:ref` 🔒 Protected

**Get Branch Attendance Overview**

```typescript
// Response
{
  "success": true,
  "message": "Branch attendance overview retrieved successfully",
  "data": {
    "branch": {
      "uid": 12,
      "name": "Main Branch",
      "address": "123 Main Street, City"
    },
    "checkIns": [
      {
        "uid": 1234,
        "status": "PRESENT",
        "owner": {
          "uid": 45,
          "name": "John",
          "surname": "Doe"
        },
        "checkIn": "2025-01-15T08:00:00.000Z"
      }
    ],
    "stats": {
      "totalUsers": 25,
      "checkedIn": 23,
      "onBreak": 3,
      "checkedOut": 15,
      "attendanceRate": 92.0,
      "productivityScore": 87.5
    },
    "insights": {
      "peakCheckInTime": "08:00",
      "averageShiftDuration": "8h 15m",
      "totalBreakTime": "45m",
      "overtimeCount": 3
    }
  }
}
```

#### `GET /att/daily-stats/:uid` 🔒 Protected

**Get Daily Statistics for User**

```typescript
// Response
{
  "success": true,
  "message": "Daily statistics retrieved successfully",
  "data": {
    "user": {
      "uid": 45,
      "name": "John",
      "surname": "Doe"
    },
    "date": "2025-01-15",
    "stats": {
      "dailyWorkTime": 510, // minutes
      "dailyBreakTime": 45,  // minutes
      "checkIn": "08:00:00",
      "checkOut": "17:30:00",
      "netWorkTime": 465,    // minutes
      "overtime": 30,        // minutes
      "breakCount": 2,
      "productivityScore": 91.2
    },
    "timeline": [
      {
        "time": "08:00:00",
        "action": "check-in",
        "location": "Main Branch"
      },
      {
        "time": "10:15:00",
        "action": "break-start",
        "duration": "15m"
      },
      {
        "time": "12:00:00",
        "action": "break-start",
        "duration": "30m"
      },
      {
        "time": "17:30:00",
        "action": "check-out",
        "location": "Main Branch"
      }
    ]
  }
}
```

#### `GET /att/metrics/:uid` 🔒 Protected

**Get User Attendance Metrics**

```typescript
// Response
{
  "success": true,
  "message": "User attendance metrics retrieved successfully",
  "data": {
    "user": {
      "uid": 45,
      "name": "John",
      "surname": "Doe"
    },
    "metrics": {
      "firstAttendance": {
        "date": "2024-12-01",
        "checkInTime": "08:00:00",
        "daysAgo": 45
      },
      "lastAttendance": {
        "date": "2025-01-15",
        "checkInTime": "08:00:00",
        "checkOutTime": "17:30:00",
        "daysAgo": 0
      },
      "totalHours": {
        "allTime": 1560.5,
        "thisMonth": 120.5,
        "thisWeek": 40.5,
        "today": 8.5
      },
      "totalShifts": {
        "allTime": 195,
        "thisMonth": 15,
        "thisWeek": 5,
        "today": 1
      },
      "averageHoursPerDay": 8.0,
      "attendanceStreak": 12,
      "breakAnalytics": {
        "totalBreakTime": {
          "allTime": 146.25,
          "thisMonth": 11.25,
          "thisWeek": 3.75,
          "today": 0.75
        },
        "averageBreakDuration": 22.5,
        "breakFrequency": 1.8,
        "longestBreak": 45,
        "shortestBreak": 10
      },
      "timingPatterns": {
        "averageCheckInTime": "08:05",
        "averageCheckOutTime": "17:25",
        "punctualityScore": 94.5,
        "overtimeFrequency": 15.4
      },
      "productivityInsights": {
        "workEfficiencyScore": 92.3,
        "shiftCompletionRate": 98.7,
        "lateArrivalsCount": 3,
        "earlyDeparturesCount": 1
      }
    }
  }
}
```

#### `GET /att/organization/report` 🔒 Protected (Admin/Manager)

**Generate Organization Attendance Report**

```typescript
// Query Parameters
?fromDate=2025-01-01&toDate=2025-01-31&includeBranches=true&includeUsers=false&format=detailed

// Response
{
  "success": true,
  "message": "Organization attendance report generated successfully",
  "data": {
    "report": {
      "reportPeriod": {
        "from": "2025-01-01",
        "to": "2025-01-31",
        "totalDays": 31,
        "generatedAt": "2025-01-15T10:00:00.000Z"
      },
      "organizationMetrics": {
        "averageTimes": {
          "startTime": "08:12",
          "endTime": "17:18",
          "shiftDuration": 485.5,
          "breakDuration": 42.3
        },
        "totals": {
          "totalEmployees": 125,
          "totalHours": 4250.5,
          "totalShifts": 520,
          "overtimeHours": 89.5
        },
        "byBranch": [
          {
            "branchId": 12,
            "branchName": "Main Branch",
            "employeeCount": 50,
            "totalHours": 1700.5,
            "attendanceRate": 94.2,
            "punctualityScore": 91.8
          }
        ],
        "byRole": [
          {
            "role": "employee",
            "count": 100,
            "totalHours": 3400.0,
            "averageHours": 34.0,
            "attendanceRate": 93.5
          }
        ],
        "insights": {
          "attendanceRate": 93.8,
          "punctualityRate": 91.2,
          "averageHoursPerDay": 8.17,
          "peakCheckInTime": "08:00",
          "peakCheckOutTime": "17:30"
        }
      }
    },
    "exportOptions": {
      "pdfUrl": "/exports/attendance-report-2025-01.pdf",
      "excelUrl": "/exports/attendance-report-2025-01.xlsx",
      "csvUrl": "/exports/attendance-report-2025-01.csv"
    }
  }
}
```

## 🔧 Service Layer

### AttendanceService Core Methods

#### Attendance CRUD Operations

```typescript
// Record check-in
async checkIn(checkInDto: CreateCheckInDto): Promise<{ message: string }>

// Record check-out
async checkOut(checkOutDto: CreateCheckOutDto): Promise<{ message: string; duration?: string }>

// Manage breaks (start/end)
async manageBreak(breakDto: CreateBreakDto): Promise<{ message: string }>

// Get all attendance records
async allCheckIns(): Promise<{ message: string; checkIns: Attendance[] }>

// Get attendance by date
async checkInsByDate(date: string): Promise<{ message: string; checkIns: Attendance[] }>
```

#### User-Specific Operations

```typescript
// Get user attendance history
async checkInsByUser(ref: number): Promise<{ message: string; checkIns: Attendance[]; user: any }>

// Get current user status
async checkInsByStatus(ref: number): Promise<{
    message: string;
    startTime: string;
    endTime: string;
    nextAction: string;
    isLatestCheckIn: boolean;
    checkedIn: boolean;
    user: any;
    attendance: Attendance
}>

// Get user daily stats
async getDailyStats(userId: number, dateStr?: string): Promise<{
    message: string;
    dailyWorkTime: number;
    dailyBreakTime: number
}>

// Get comprehensive user metrics
async getUserAttendanceMetrics(userId: number): Promise<{ message: string; metrics: any }>
```

#### Analytics & Reporting

```typescript
// Get branch attendance
async checkInsByBranch(ref: string): Promise<{
    message: string;
    checkIns: Attendance[];
    branch: any;
    totalUsers: number
}>

// Generate organization report
async generateOrganizationReport(
    queryDto: OrganizationReportQueryDto,
    orgId?: number,
    branchId?: number
): Promise<{ message: string; report: any }>

// Get attendance percentage
async getAttendancePercentage(): Promise<{ percentage: number; totalHours: number }>

// Get monthly stats
async getMonthlyAttendanceStats(): Promise<{ message: string; stats: any }>
```

#### Time Calculations

```typescript
// Get current shift hours
async getCurrentShiftHours(userId: number): Promise<number>

// Get attendance for specific date
async getAttendanceForDate(date: Date): Promise<{
    totalHours: number;
    activeShifts: Attendance[];
    attendanceRecords: Attendance[]
}>

// Get monthly attendance total
async getAttendanceForMonth(ref: string): Promise<{ totalHours: number }>
```

## 🔄 Integration Points

### User Module Integration

```typescript
// Get user details for attendance
async getUserForAttendance(userId: number): Promise<User>

// Update user attendance streak
async updateUserAttendanceStreak(userId: number): Promise<void>

// Get user organization and branch
async getUserOrgAndBranch(userId: number): Promise<{ org: Organisation; branch: Branch }>
```

### Rewards Module Integration

```typescript
// Award XP for check-in
await rewardsService.awardXP({
	owner: userId,
	amount: XP_VALUES.CHECK_IN,
	action: XP_VALUES_TYPES.ATTENDANCE,
	source: { id: userId.toString(), type: 'ATTENDANCE', details: 'Check-in reward' },
});

// Award XP for check-out
await rewardsService.awardXP({
	owner: userId,
	amount: XP_VALUES.CHECK_OUT,
	action: XP_VALUES_TYPES.ATTENDANCE,
	source: { id: userId.toString(), type: 'ATTENDANCE', details: 'Check-out reward' },
});
```

### Event-Driven Integration

```typescript
// Emit events for attendance changes
this.eventEmitter.emit('daily-report', { userId });
this.eventEmitter.emit('user.target.update.required', { userId });
this.eventEmitter.emit('user.metrics.update.required', userId);
this.eventEmitter.emit('attendance.check-in', { attendanceId, userId, timestamp });
this.eventEmitter.emit('attendance.check-out', { attendanceId, userId, duration });
```

### Organization Hours Integration

```typescript
// Get organization working hours
async getOrganizationHours(orgId: number): Promise<OrganizationHours>

// Validate check-in against working hours
async validateCheckInTime(checkInTime: Date, orgId: number): Promise<boolean>

// Calculate overtime based on organization rules
async calculateOvertime(workMinutes: number, orgId: number): Promise<number>
```

## 🔒 Access Control & Permissions

### Attendance Permissions

```typescript
export enum AttendancePermission {
	CHECK_IN = 'attendance:check_in',
	CHECK_OUT = 'attendance:check_out',
	MANAGE_BREAKS = 'attendance:manage_breaks',
	VIEW_OWN = 'attendance:view_own',
	VIEW_TEAM = 'attendance:view_team',
	VIEW_ALL = 'attendance:view_all',
	GENERATE_REPORTS = 'attendance:generate_reports',
	EXPORT_DATA = 'attendance:export_data',
}
```

### Role-Based Access

```typescript
// Check-in/out permissions (All authenticated users)
@Roles(
    AccessLevel.ADMIN,
    AccessLevel.MANAGER,
    AccessLevel.SUPPORT,
    AccessLevel.DEVELOPER,
    AccessLevel.USER,
    AccessLevel.OWNER,
    AccessLevel.TECHNICIAN,
)

// Report generation (Admin/Manager only)
@Roles(AccessLevel.ADMIN, AccessLevel.MANAGER)

// Organization-wide data (Enterprise only)
@EnterpriseOnly('reports')
```

### Data Scoping

```typescript
// Automatic scoping based on user organization/branch
async getUserAccessibleAttendance(userId: number): Promise<Attendance[]> {
    const userScope = await this.getUserScope(userId);
    return this.attendanceRepository.find({
        where: {
            organisation: { uid: userScope.organisationId },
            ...(userScope.branchId && { branch: { uid: userScope.branchId } })
        },
        relations: ['owner', 'branch', 'organisation']
    });
}
```

## 📧 Automated Daily Reporting System

The attendance module includes an intelligent automated reporting system that sends comprehensive daily attendance reports via email to management staff.

### 🏗️ Architecture Overview

The `AttendanceReportsService` leverages NestJS cron jobs and event-driven email notifications to provide:

-   **Smart Scheduling**: Organization-specific timing based on working hours
-   **Duplicate Prevention**: In-memory caching prevents multiple reports per day
-   **Professional Templates**: Handlebars email templates for clean formatting
-   **Targeted Recipients**: Automatically identifies OWNER, ADMIN, and HR users

### 🌅 Morning Reports

**Schedule**: Every minute (`@Cron('*/1 * * * *')`) with 2-minute tolerance window  
**Timing**: 5 minutes after each organization's opening time  
**Template**: `src/lib/templates/handlebars/emails/attendance/morning-report.hbs`  
**Manual Trigger**: `POST /att/reports/morning/send` (Admin/Owner/HR only)

#### Report Content

```typescript
interface MorningReportData {
	organizationName: string;
	reportDate: string;
	organizationStartTime: string;
	summary: {
		totalEmployees: number;
		presentCount: number;
		absentCount: number;
		attendanceRate: number;
	};
	punctuality: {
		earlyArrivals: AttendanceReportUser[];
		onTimeArrivals: AttendanceReportUser[];
		lateArrivals: AttendanceReportUser[];
		earlyPercentage: number;
		onTimePercentage: number;
		latePercentage: number;
	};
	insights: string[];
	recommendations: string[];
	generatedAt: string;
	dashboardUrl: string;
}
```

#### AI-Generated Insights

-   Attendance rate assessment (Excellent ≥90%, Good ≥75%, Needs Attention <75%)
-   Punctuality analysis and late arrival notifications
-   Early arrival recognition for high-performing teams
-   Present employee count acknowledgment

#### Smart Recommendations

-   Punctuality reminders when late percentage >20%
-   Absent employee follow-up suggestions when attendance <80%
-   Recognition suggestions for punctual teams when on-time >80%
-   Positive reinforcement for strong attendance patterns

### 🌇 Evening Reports

**Schedule**: Every 30 minutes (`@Cron('*/30 * * * *')`) with 5-minute tolerance window  
**Timing**: 30 minutes after each organization's closing time  
**Template**: `src/lib/templates/handlebars/emails/attendance/evening-report.hbs`  
**Manual Trigger**: `POST /att/reports/evening/send` (Admin/Owner/HR only)

#### Report Content

```typescript
interface EveningReportData {
	organizationName: string;
	reportDate: string;
	employeeMetrics: EmployeeAttendanceMetric[];
	summary: {
		totalEmployees: number;
		completedShifts: number;
		averageHours: number;
		totalOvertimeMinutes: number;
	};
	insights: string[];
}

interface EmployeeAttendanceMetric {
	user: AttendanceReportUser;
	todayCheckIn: string | null;
	todayCheckOut: string | null;
	hoursWorked: number;
	isLate: boolean;
	lateMinutes: number;
	yesterdayHours: number;
	comparisonText: string;
	timingDifference: string; // ↗️ ↘️ →
}
```

#### Performance Analytics

-   Individual employee productivity metrics
-   Day-over-day performance comparison
-   Overtime tracking and identification
-   Shift completion statistics
-   High performer recognition

#### Advanced Insights

-   Completed shift count and average working hours
-   Late arrival tracking with employee counts
-   Above-average performance identification
-   Incomplete checkout notifications
-   Productivity trend analysis

### 🎯 Smart Features

#### Organization-Aware Scheduling

```typescript
private async processMorningReportForOrganization(organization: Organisation, currentTime: Date) {
  // Get organization-specific working hours
  const workingDayInfo = await this.organizationHoursService.getWorkingDayInfo(
    organization.uid,
    currentTime
  );

  // Skip non-working days and holidays
  if (!workingDayInfo.isWorkingDay || !workingDayInfo.startTime) {
    return;
  }

  // Calculate precise timing (5 minutes after opening)
  const startTimeMinutes = TimeCalculatorUtil.timeToMinutes(workingDayInfo.startTime);
  const reportTimeMinutes = startTimeMinutes + 5;

  // Check timing window (±2 minutes for accuracy)
  const currentTimeMinutes = TimeCalculatorUtil.timeToMinutes(
    currentTime.toTimeString().substring(0, 5)
  );
  const timeDifference = Math.abs(currentTimeMinutes - reportTimeMinutes);

  if (timeDifference > 2) {
    return; // Not time yet or too late
  }

  // Prevent duplicate reports
  const cacheKey = `morning_report_${organization.uid}_${format(today, 'yyyy-MM-dd')}`;
  if (this.hasReportBeenSent(cacheKey)) {
    return;
  }

  // Generate and send report
  await this.generateAndSendMorningReport(organization.uid);
  this.markReportAsSent(cacheKey);
}
```

#### Recipient Management

```typescript
private async getReportRecipients(organizationId: number): Promise<string[]> {
  // Target management-level users
  const [ownerResult, adminResult, hrResult] = await Promise.all([
    this.userService.findAll({
      organisationId: organizationId,
      accessLevel: AccessLevel.OWNER,
      status: AccountStatus.ACTIVE,
    }),
    this.userService.findAll({
      organisationId: organizationId,
      accessLevel: AccessLevel.ADMIN,
      status: AccountStatus.ACTIVE,
    }),
    this.userService.findAll({
      organisationId: organizationId,
      accessLevel: AccessLevel.HR,
      status: AccountStatus.ACTIVE,
    }),
  ]);

  // Combine and deduplicate recipients
  const allRecipients = [
    ...(ownerResult.data || []),
    ...(adminResult.data || []),
    ...(hrResult.data || [])
  ];

  const uniqueRecipients = allRecipients.filter(
    (user, index, self) =>
      user.email && self.findIndex((u) => u.uid === user.uid) === index
  );

  return uniqueRecipients.map((user) => user.email);
}
```

#### Event-Driven Email Delivery

```typescript
// Morning report email dispatch
this.eventEmitter.emit('send.email', EmailType.ATTENDANCE_MORNING_REPORT, recipients, reportData);

// Evening report email dispatch
this.eventEmitter.emit('send.email', EmailType.ATTENDANCE_EVENING_REPORT, recipients, reportData);
```

### 🔧 Configuration & Deployment

#### Environment Variables

```bash
# Email service configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourcompany.com
SMTP_PASS=your_app_password

# Application URL for dashboard links
APP_URL=https://loro.co.za
```

#### Module Integration

```typescript
@Module({
	imports: [
		// Required dependencies
		TypeOrmModule.forFeature([Attendance, User, Organisation]),
		UserModule,
		ScheduleModule.forRoot(), // Essential for cron jobs
	],
	providers: [
		AttendanceService,
		OrganizationHoursService,
		AttendanceCalculatorService,
		AttendanceReportsService, // ← Reports service
	],
	exports: [
		AttendanceService,
		AttendanceReportsService, // ← Export for external use
	],
})
export class AttendanceModule {}
```

### 📊 Performance & Monitoring

#### Caching Strategy

```typescript
// In-memory report cache with 24-hour TTL
private reportCache = new Set<string>();

private markReportAsSent(cacheKey: string): void {
  this.reportCache.add(cacheKey);
  // Automatic cleanup after 24 hours
  setTimeout(() => this.reportCache.delete(cacheKey), 24 * 60 * 60 * 1000);
}
```

#### Logging & Observability

```typescript
// Comprehensive logging for monitoring
this.logger.log(`Morning report sent for organization ${organization.name} (ID: ${organization.uid})`);
this.logger.warn(`No recipients found for morning report - Organization ID: ${organizationId}`);
this.logger.error(`Error processing morning report for organization ${organization.uid}:`, error);
```

#### Error Handling

-   **Graceful Degradation**: Failed reports don't affect core attendance functionality
-   **Retry Logic**: Built-in error recovery for temporary failures
-   **Monitoring**: Detailed logging for troubleshooting and performance tracking
-   **Circuit Breaker**: Prevents cascade failures in email service disruptions

### 🚀 Usage Examples

#### Manual Report Generation

```typescript
// Generate immediate morning report
await attendanceReportsService.generateAndSendMorningReport(organizationId);

// Generate immediate evening report
await attendanceReportsService.generateAndSendEveningReport(organizationId);
```

#### Integration with Other Services

```typescript
// Listen for attendance events to trigger custom reports
@OnEvent('attendance.checkout.completed')
async handleCheckoutCompleted(payload: AttendanceCheckoutEvent) {
  // Custom logic for immediate notifications
  if (payload.isOvertimeShift) {
    await this.generateOvertimeAlert(payload.organizationId, payload.userId);
  }
}
```

## 📊 Performance Optimizations

### Database Indexes

```sql
-- Attendance performance indexes
CREATE INDEX IDX_ATTENDANCE_OWNER_CHECKIN ON attendance(owner, checkIn);
CREATE INDEX IDX_ATTENDANCE_STATUS_CHECKIN ON attendance(status, checkIn);
CREATE INDEX IDX_ATTENDANCE_CHECKIN_CHECKOUT ON attendance(checkIn, checkOut);
CREATE INDEX IDX_ATTENDANCE_CREATED_AT ON attendance(createdAt);
CREATE INDEX IDX_ATTENDANCE_ORG_DATE ON attendance(organisation, DATE(checkIn));
CREATE INDEX IDX_ATTENDANCE_BRANCH_DATE ON attendance(branch, DATE(checkIn));

-- Compound indexes for common queries
CREATE INDEX IDX_ATTENDANCE_USER_DATE_STATUS ON attendance(owner, DATE(checkIn), status);
CREATE INDEX IDX_ATTENDANCE_ORG_STATUS_DATE ON attendance(organisation, status, checkIn);
```

### Caching Strategy

```typescript
// Cache keys
ATTENDANCE_CACHE_PREFIX = 'attendance:'
USER_ATTENDANCE_CACHE_PREFIX = 'user_attendance:'
DAILY_STATS_CACHE_PREFIX = 'daily_stats:'
MONTHLY_REPORT_CACHE_PREFIX = 'monthly_report:'

// Cache operations with TTL
async getCachedUserAttendance(userId: number): Promise<Attendance[] | null>
async cacheUserAttendance(userId: number, data: Attendance[]): Promise<void>
async invalidateUserAttendanceCache(userId: number): Promise<void>

// Report caching (longer TTL)
async getCachedReport(cacheKey: string): Promise<any | null>
async cacheReport(cacheKey: string, report: any, ttl: number): Promise<void>
```

### Query Optimizations

```typescript
// Optimized queries with proper joins
async getAttendanceWithRelations(filters: any): Promise<Attendance[]> {
    return this.attendanceRepository.find({
        where: filters,
        relations: ['owner', 'owner.userProfile', 'branch', 'organisation'],
        select: {
            owner: {
                uid: true,
                username: true,
                name: true,
                surname: true,
                email: true
            },
            branch: {
                uid: true,
                name: true,
                address: true
            },
            organisation: {
                uid: true,
                name: true
            }
        }
    });
}
```

## 🧪 Testing Strategy

### Unit Tests

-   **Service Method Testing**: All CRUD operations and calculations
-   **Time Calculation Testing**: Break calculations, overtime, duration formatting
-   **Validation Testing**: Input validation and business rules
-   **Integration Testing**: User, branch, and organization relationships

### Integration Tests

-   **API Endpoint Testing**: All controller endpoints with various scenarios
-   **Database Integration**: Entity relationships and constraints
-   **Event Integration**: Event emission and handling
-   **Cache Integration**: Caching mechanisms and invalidation

### Performance Tests

-   **Load Testing**: High volume check-in/out operations
-   **Concurrent User Testing**: Multiple simultaneous attendance operations
-   **Report Generation Testing**: Large dataset report generation
-   **Database Performance**: Query optimization validation

## 🔗 Dependencies

### Internal Dependencies

-   **UserModule**: User authentication and profile management
-   **BranchModule**: Branch assignment and location validation
-   **OrganisationModule**: Organization-scoped data and settings
-   **RewardsModule**: XP and gamification integration
-   **AuthModule**: Authentication and authorization

### External Dependencies

-   **TypeORM**: Database ORM and advanced querying
-   **class-validator**: Input validation and sanitization
-   **class-transformer**: Data transformation and serialization
-   **date-fns**: Date manipulation and calculations
-   **@nestjs/event-emitter**: Event-driven architecture
-   **@nestjs/cache-manager**: Performance caching
-   **@nestjs/swagger**: API documentation generation

## 🚀 Usage Examples

### Basic Attendance Operations

```typescript
// Record check-in
const checkInResult = await attendanceService.checkIn({
	checkIn: new Date(),
	checkInLatitude: -26.2041,
	checkInLongitude: 28.0473,
	checkInNotes: 'Starting work',
	branch: { uid: 12 },
	owner: { uid: 45 },
});

// Record check-out
const checkOutResult = await attendanceService.checkOut({
	checkOut: new Date(),
	checkOutLatitude: -26.2041,
	checkOutLongitude: 28.0473,
	checkOutNotes: 'Finished work',
	owner: { uid: 45 },
});
```

### Break Management

```typescript
// Start break
await attendanceService.manageBreak({
	type: 'start',
	breakStartTime: new Date(),
	breakLatitude: -26.2041,
	breakLongitude: 28.0473,
	breakNotes: 'Lunch break',
	owner: { uid: 45 },
});

// End break
await attendanceService.manageBreak({
	type: 'end',
	breakEndTime: new Date(),
	breakLatitude: -26.2041,
	breakLongitude: 28.0473,
	breakNotes: 'Back from lunch',
	owner: { uid: 45 },
});
```

### Analytics and Reporting

```typescript
// Get user metrics
const userMetrics = await attendanceService.getUserAttendanceMetrics(45);

// Generate organization report
const orgReport = await attendanceService.generateOrganizationReport({
	fromDate: '2025-01-01',
	toDate: '2025-01-31',
	includeBranches: true,
	includeUsers: false,
});

// Get daily stats
const dailyStats = await attendanceService.getDailyStats(45, '2025-01-15');
```

## 🔮 Future Enhancements

### Planned Features

1. **Facial Recognition**: Biometric verification for enhanced security
2. **Geofencing**: Automated check-in/out based on location
3. **Shift Scheduling**: Advanced shift planning and assignment
4. **Mobile Offline Mode**: Robust offline attendance tracking
5. **AI Analytics**: Predictive attendance and productivity insights
6. **Integration APIs**: Third-party HR system integrations

### Scalability Improvements

-   **Microservice Architecture**: Service decomposition for scale
-   **Real-time Dashboards**: WebSocket-based live attendance monitoring
-   **Advanced Caching**: Redis-based distributed caching
-   **Data Archiving**: Automated historical data management
-   **Global Time Zones**: Enhanced multi-timezone support

---

This Attendance Management module provides comprehensive workforce tracking with enterprise-grade features including GPS verification, break management, advanced analytics, and compliance reporting for effective workforce optimization and management.
