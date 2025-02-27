import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDate, IsString, IsBoolean, IsArray, IsObject, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @ApiProperty({ description: 'Latitude coordinate' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: 'Address of the location', required: false })
  @IsString()
  @IsOptional()
  address?: string;
}

export class TaskInProgressDto {
  @ApiProperty({ description: 'Task ID' })
  @IsNumber()
  uid: number;

  @ApiProperty({ description: 'Task title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'When the task was started' })
  @IsDate()
  @Type(() => Date)
  startedAt: Date;

  @ApiProperty({ description: 'Estimated completion date', required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  estimatedCompletion?: Date;

  @ApiProperty({ description: 'Task progress percentage', required: false })
  @IsNumber()
  @IsOptional()
  progress?: number;
}

export class ActivityDto {
  @ApiProperty({ description: 'Activity type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Activity timestamp' })
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @ApiProperty({ description: 'Activity description' })
  @IsString()
  description: string;
}

export class TaskMetricsDto {
  @ApiProperty({ description: 'Total number of tasks' })
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'Number of completed tasks' })
  @IsNumber()
  completed: number;

  @ApiProperty({ description: 'Number of in-progress tasks' })
  @IsNumber()
  inProgress: number;

  @ApiProperty({ description: 'Number of pending tasks' })
  @IsNumber()
  pending: number;

  @ApiProperty({ description: 'Number of overdue tasks' })
  @IsNumber()
  overdue: number;

  @ApiProperty({ description: 'Task completion rate' })
  @IsNumber()
  completionRate: number;

  @ApiProperty({ description: 'Average task completion time in minutes' })
  @IsNumber()
  averageCompletionTime: number;

  @ApiProperty({ description: 'Tasks by priority' })
  @IsObject()
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };

  @ApiProperty({ description: 'Tasks by type' })
  @IsObject()
  byType: Record<string, number>;
}

export class AttendanceMetricsDto {
  @ApiProperty({ description: 'Total working days' })
  @IsNumber()
  totalDays: number;

  @ApiProperty({ description: 'Days present' })
  @IsNumber()
  presentDays: number;

  @ApiProperty({ description: 'Days absent' })
  @IsNumber()
  absentDays: number;

  @ApiProperty({ description: 'Attendance rate percentage' })
  @IsNumber()
  attendanceRate: number;

  @ApiProperty({ description: 'Average check-in time' })
  @IsString()
  averageCheckInTime: string;

  @ApiProperty({ description: 'Average check-out time' })
  @IsString()
  averageCheckOutTime: string;

  @ApiProperty({ description: 'Average hours worked per day' })
  @IsNumber()
  averageHoursWorked: number;

  @ApiProperty({ description: 'Total overtime hours' })
  @IsNumber()
  totalOvertime: number;

  @ApiProperty({ description: 'Number of on-time check-ins' })
  @IsNumber()
  onTimeCheckIns: number;

  @ApiProperty({ description: 'Number of late check-ins' })
  @IsNumber()
  lateCheckIns: number;

  @ApiProperty({ description: 'Average break time in minutes' })
  @IsNumber()
  averageBreakTime: number;

  @ApiProperty({ description: 'Work efficiency score' })
  @IsNumber()
  efficiency: number;
}

export class ProductivityMetricsDto {
  @ApiProperty({ description: 'Overall productivity score' })
  @IsNumber()
  score: number;

  @ApiProperty({ description: 'Task efficiency score' })
  @IsNumber()
  taskEfficiency: number;

  @ApiProperty({ description: 'Client handling score' })
  @IsNumber()
  clientHandling: number;

  @ApiProperty({ description: 'Response time score' })
  @IsNumber()
  responseTime: number;

  @ApiProperty({ description: 'Quality score' })
  @IsNumber()
  qualityScore: number;
}

export class NextTaskDto {
  @ApiProperty({ description: 'Task ID' })
  @IsNumber()
  uid: number;

  @ApiProperty({ description: 'Task title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Task priority' })
  @IsString()
  priority: string;

  @ApiProperty({ description: 'Task deadline' })
  @IsDate()
  @Type(() => Date)
  deadline: Date;

  @ApiProperty({ description: 'Estimated duration in minutes', required: false })
  @IsNumber()
  @IsOptional()
  estimatedDuration?: number;
}

export class TaskTimelineItemDto {
  @ApiProperty({ description: 'Task ID' })
  @IsNumber()
  uid: number;

  @ApiProperty({ description: 'Task title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Start time' })
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ description: 'End time', required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endTime?: Date;

  @ApiProperty({ description: 'Task status' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Whether the task is completed' })
  @IsBoolean()
  isCompleted: boolean;
}

export class OverdueTaskDto {
  @ApiProperty({ description: 'Task ID' })
  @IsNumber()
  uid: number;

  @ApiProperty({ description: 'Task title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Task deadline' })
  @IsDate()
  @Type(() => Date)
  deadline: Date;

  @ApiProperty({ description: 'Task priority' })
  @IsString()
  priority: string;

  @ApiProperty({ description: 'Days overdue' })
  @IsNumber()
  daysOverdue: number;
}

export class TaskEfficiencyDto {
  @ApiProperty({ description: 'Average completion time in minutes' })
  @IsNumber()
  averageCompletionTime: number;

  @ApiProperty({ description: 'User completion time in minutes' })
  @IsNumber()
  userCompletionTime: number;

  @ApiProperty({ description: 'Efficiency ratio (user time / average time)' })
  @IsNumber()
  efficiencyRatio: number;

  @ApiProperty({ description: 'Efficiency trend' })
  @IsEnum(['improving', 'declining', 'stable'])
  trend: 'improving' | 'declining' | 'stable';

  @ApiProperty({ description: 'Comparison to team (percentage)' })
  @IsNumber()
  comparisonToTeam: number;
}

export class LiveUserReportDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Report date' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ description: 'Last updated timestamp' })
  @IsDate()
  @Type(() => Date)
  lastUpdated: Date;

  @ApiProperty({ description: 'Whether the user is currently online' })
  @IsBoolean()
  isOnline: boolean;

  @ApiProperty({ description: 'User\'s current activity', required: false })
  @IsString()
  @IsOptional()
  currentActivity?: string;

  @ApiProperty({ description: 'User\'s current location', required: false })
  @IsObject()
  @IsOptional()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiProperty({ description: 'Tasks currently in progress', required: false })
  @IsArray()
  @IsOptional()
  @Type(() => TaskInProgressDto)
  currentTasksInProgress?: TaskInProgressDto[];

  @ApiProperty({ description: 'Upcoming tasks sorted by priority and deadline', required: false })
  @IsArray()
  @IsOptional()
  @Type(() => NextTaskDto)
  nextTasks?: NextTaskDto[];

  @ApiProperty({ description: 'Visual representation of the day\'s task schedule', required: false })
  @IsArray()
  @IsOptional()
  @Type(() => TaskTimelineItemDto)
  taskTimeline?: TaskTimelineItemDto[];

  @ApiProperty({ description: 'Critical overdue tasks', required: false })
  @IsArray()
  @IsOptional()
  @Type(() => OverdueTaskDto)
  overdueTasks?: OverdueTaskDto[];

  @ApiProperty({ description: 'Task efficiency metrics', required: false })
  @IsObject()
  @IsOptional()
  @Type(() => TaskEfficiencyDto)
  taskEfficiency?: TaskEfficiencyDto;

  @ApiProperty({ description: 'Recent user activities' })
  @IsArray()
  @Type(() => ActivityDto)
  recentActivities: ActivityDto[];

  @ApiProperty({ description: 'Attendance metrics' })
  @IsObject()
  @Type(() => AttendanceMetricsDto)
  attendance: AttendanceMetricsDto;

  @ApiProperty({ description: 'Task metrics' })
  @IsObject()
  @Type(() => TaskMetricsDto)
  tasks: TaskMetricsDto;

  @ApiProperty({ description: 'Productivity metrics' })
  @IsObject()
  @Type(() => ProductivityMetricsDto)
  productivity: ProductivityMetricsDto;

  @ApiProperty({ description: 'Report summary' })
  @IsString()
  summary: string;
} 