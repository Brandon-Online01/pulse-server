import { Task } from '../entities/task.entity';
import { SubTask } from '../entities/subtask.entity';
import { TaskFlag } from '../entities/task-flag.entity';
import { User } from '../../user/entities/user.entity';
import { Client } from '../../clients/entities/client.entity';
import { TaskEmailData, TaskCompletedEmailData, TaskFlagEmailData } from '../../lib/types/email-templates.types';

export class TaskEmailDataMapper {
  
  /**
   * Map data for new task emails
   */
  static mapNewTaskData(task: Task, assignee: User): TaskEmailData {
    return {
      // Base data matching template variables
      name: assignee.name || assignee.username || 'Team Member',
      assigneeName: assignee.name || assignee.username || 'Team Member',
      taskId: task.uid.toString(),
      title: task.title,
      taskTitle: task.title,
      description: task.description || 'No description provided',
      taskDescription: task.description || 'No description provided',
      deadline: task.deadline?.toISOString(),
      dueDate: this.formatDate(task.deadline),
      priority: task.priority,
      taskType: task.taskType,
      status: task.status,
      assignedBy: this.getCreatorName(task.creator),
      
      // Additional template variables
      appName: 'Loro',
      projectName: 'General Task', // Will be updated if clients are properly populated
      estimatedTime: 'Not specified',
      taskUrl: this.generateTaskUrl(task.uid),
      projectManager: this.getCreatorName(task.creator),
      supportEmail: process.env.SUPPORT_EMAIL || 'support@loro.com',
      
      // Data structures
      attachments: this.mapAttachments(task.attachments),
      subtasks: this.mapSubtasks(task.subtasks),
      clients: this.mapClients(task.clients),
      
      // Optional fields with fallbacks
      dependencies: [],
      successCriteria: []
    };
  }

  /**
   * Map data for task update emails
   */
  static mapUpdateTaskData(task: Task, assignee: User, updatedBy: string, changes: any[]): TaskEmailData {
    const baseData = this.mapNewTaskData(task, assignee);
    return {
      ...baseData,
      updatedBy: updatedBy,
      updateDate: this.formatDate(new Date()),
      currentStatus: task.status,
      changes: changes
    };
  }

  /**
   * Map data for task completion emails
   */
  static mapCompletedTaskData(task: Task, client: Client, completedBy: string): TaskCompletedEmailData {
    return {
      name: client.contactPerson || client.name || 'Valued Client',
      assigneeName: client.contactPerson || client.name || 'Valued Client',
      taskId: task.uid.toString(),
      title: task.title,
      taskTitle: task.title,
      description: task.description || 'No description provided',
      taskDescription: task.description || 'No description provided',
      deadline: task.deadline?.toISOString(),
      dueDate: this.formatDate(task.deadline),
      priority: task.priority,
      taskType: task.taskType,
      status: task.status,
      assignedBy: this.getCreatorName(task.creator),
      completionDate: this.formatDate(task.completionDate),
      completedBy: completedBy,
      feedbackLink: this.generateFeedbackUrl(task.uid, client.uid),
      jobCards: this.mapJobCards(task.attachments),
      subtasks: this.mapSubtasks(task.subtasks),
      clients: this.mapClients(task.clients),
      attachments: this.mapAttachments(task.attachments),
      
      // Additional completion template variables
      projectName: client.name || 'Client Project',
      timeTaken: this.calculateTimeTaken(task),
      completionStatus: 'Successfully Completed',
      taskUrl: this.generateTaskUrl(task.uid),
      completionNotes: '',
      deliverables: this.mapDeliverables(task.attachments)
    };
  }

  /**
   * Map data for assignee task completion emails (internal notifications)
   */
  static mapAssigneeCompletionData(task: Task, assignee: User, completedBy: string): TaskCompletedEmailData {
    return {
      name: assignee.name || assignee.username || 'Team Member',
      assigneeName: assignee.name || assignee.username || 'Team Member',
      taskId: task.uid.toString(),
      title: task.title,
      taskTitle: task.title,
      description: task.description || 'No description provided',
      taskDescription: task.description || 'No description provided',
      deadline: task.deadline?.toISOString(),
      dueDate: this.formatDate(task.deadline),
      priority: task.priority,
      taskType: task.taskType,
      status: task.status,
      assignedBy: this.getCreatorName(task.creator),
      completionDate: this.formatDate(task.completionDate),
      completedBy: completedBy,
      feedbackLink: '',
      jobCards: this.mapJobCards(task.attachments),
      subtasks: this.mapSubtasks(task.subtasks),
      clients: this.mapClients(task.clients),
      attachments: this.mapAttachments(task.attachments),
      
      // Additional completion template variables
      projectName: 'General Task', // Will be updated if clients are properly populated
      timeTaken: this.calculateTimeTaken(task),
      completionStatus: 'Successfully Completed',
      taskUrl: this.generateTaskUrl(task.uid),
      completionNotes: '',
      deliverables: this.mapDeliverables(task.attachments)
    };
  }

  /**
   * Map data for task flag emails
   */
  static mapTaskFlagData(taskFlag: TaskFlag, task: Task, user: User, recipientName: string = 'Team Member'): TaskFlagEmailData {
    return {
      name: recipientName,
      taskId: task.uid,
      taskTitle: task.title,
      flagId: taskFlag.uid,
      flagTitle: taskFlag.title,
      flagDescription: taskFlag.description || 'No description provided',
      flagStatus: taskFlag.status,
      flagDeadline: taskFlag.deadline?.toISOString(),
      createdBy: {
        name: `${user.name || ''} ${user.surname || ''}`.trim() || user.username || 'System',
        email: user.email || ''
      },
      items: taskFlag.items?.map(item => ({
        title: item.title,
        description: item.description || '',
        status: item.status
      })) || [],
      attachments: taskFlag.attachments || [],
      comments: this.transformCommentsForEmail(taskFlag.comments || [])
    };
  }

  /**
   * Track changes between original and updated task
   */
  static trackTaskChanges(original: Task, updates: any): Array<{field: string, oldValue: string, newValue: string}> {
    const changes = [];
    
    if (updates.title && updates.title !== original.title) {
      changes.push({
        field: 'Title', 
        oldValue: original.title, 
        newValue: updates.title
      });
    }
    
    if (updates.deadline && new Date(updates.deadline).getTime() !== original.deadline?.getTime()) {
      changes.push({
        field: 'Due Date', 
        oldValue: this.formatDate(original.deadline), 
        newValue: this.formatDate(new Date(updates.deadline))
      });
    }
    
    if (updates.priority && updates.priority !== original.priority) {
      changes.push({
        field: 'Priority', 
        oldValue: original.priority, 
        newValue: updates.priority
      });
    }
    
    if (updates.status && updates.status !== original.status) {
      changes.push({
        field: 'Status', 
        oldValue: original.status, 
        newValue: updates.status
      });
    }

    if (updates.description && updates.description !== original.description) {
      changes.push({
        field: 'Description', 
        oldValue: original.description || 'No description', 
        newValue: updates.description
      });
    }
    
    return changes;
  }

  /**
   * Utility Methods
   */
  private static formatDate(date?: Date): string {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  }

  private static getCreatorName(creator: any): string {
    if (!creator) return 'System';
    
    // Handle array format
    if (Array.isArray(creator) && creator[0]) {
      const user = creator[0];
      return `${user.name || ''} ${user.surname || ''}`.trim() || user.username || 'System';
    }
    
    // Handle single object format
    return `${creator.name || ''} ${creator.surname || ''}`.trim() || creator.username || 'System';
  }

  private static generateTaskUrl(taskId: number): string {
    const baseUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'https://app.loro.com';
    return `${baseUrl}/tasks/${taskId}`;
  }

  private static generateFeedbackUrl(taskId: number, clientId: number): string {
    const baseUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'https://app.loro.com';
    const token = Buffer.from(`${clientId}-${taskId}-${Date.now()}`).toString('base64');
    return `${baseUrl}/feedback?token=${token}&type=TASK`;
  }

  private static calculateTimeTaken(task: Task): string {
    if (!task.jobStartTime || !task.completionDate) {
      // Fallback: try to calculate from created date if job times aren't available
      if (task.createdAt && task.completionDate) {
        const startTime = new Date(task.createdAt).getTime();
        const endTime = new Date(task.completionDate).getTime();
        const diffMs = endTime - startTime;
        
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) {
          return `${days} day${days > 1 ? 's' : ''} ${hours}h`;
        }
        return `${hours} hours`;
      }
      return 'Not tracked';
    }
    
    const startTime = new Date(task.jobStartTime).getTime();
    const endTime = new Date(task.completionDate).getTime();
    const diffMs = endTime - startTime;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  }

  private static mapAttachments(attachments?: string[]): Array<{name: string, url: string}> {
    if (!attachments || !Array.isArray(attachments)) return [];
    
    return attachments.map((url, index) => ({
      name: `Attachment ${index + 1}`,
      url: url
    }));
  }

  private static mapJobCards(attachments?: string[]): Array<{name: string, url: string}> {
    if (!attachments || !Array.isArray(attachments)) return [];
    
    return attachments.map((url, index) => ({
      name: `Job Card ${index + 1}`,
      url: url
    }));
  }

  private static mapSubtasks(subtasks?: SubTask[]): Array<{title: string, status: string, description: string}> {
    if (!subtasks || !Array.isArray(subtasks)) return [];
    
    return subtasks
      .filter(st => !st.isDeleted)
      .map(st => ({
        title: st.title,
        status: st.status,
        description: st.description || ''
      }));
  }

  private static transformCommentsForEmail(comments: any[]): Array<{
    content: string;
    createdAt: string;
    createdBy: { name: string };
  }> {
    if (!comments || !Array.isArray(comments)) return [];
    
    return comments.map(comment => ({
      content: comment.content || '',
      createdAt: comment.createdAt instanceof Date 
        ? comment.createdAt.toISOString()
        : typeof comment.createdAt === 'string' 
        ? comment.createdAt 
        : new Date().toISOString(),
      createdBy: {
        name: comment.createdBy?.name || 'Unknown User'
      }
    }));
  }

  /**
   * Map clients for templates
   */
  private static mapClients(clients?: any[]): Array<{name: string, category?: string}> {
    if (!clients || !Array.isArray(clients)) return [];
    
    return clients.map(client => ({
      name: client.name || 'Unnamed Client',
      category: client.category || client.type || 'Standard'
    }));
  }

  /**
   * Map deliverables for completion templates
   */
  private static mapDeliverables(attachments?: string[]): string[] {
    if (!attachments || !Array.isArray(attachments)) return [];
    
    return attachments.map((_, index) => `Deliverable ${index + 1}`);
  }
} 