export enum InteractionType {
  MESSAGE = 'message',
  DOCUMENT = 'document',
  TASK = 'task',
  NOTE = 'note',
  APPOINTMENT = 'appointment',
  REMINDER = 'reminder',
  GENERAL = 'general',
  SALES = 'sales',
  SUPPORT = 'support',
  FOLLOWUP = 'followup',
  FEEDBACK = 'feedback',
  ONBOARDING = 'onboarding',
  EMAIL = 'email',
  CALL = 'call',
  MEETING = 'meeting',
}

export enum InteractionStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  RESOLVED = 'resolved',
  PENDING = 'pending',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  PENDING = 'pending',
}

export enum AttachmentType {
  FILE = 'file',
  IMAGE = 'image',
  DOCUMENT = 'document',
  SPREADSHEET = 'spreadsheet',
  PRESENTATION = 'presentation',
  PDF = 'pdf',
  VIDEO = 'video',
  AUDIO = 'audio',
  LINK = 'link',
  OTHER = 'other',
} 