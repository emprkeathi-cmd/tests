
export enum RoomType {
  CHAT = 'CHAT',
  KALANDER = 'KALANDER',
  TODO = 'TODO',
  PROJECT = 'PROJECT'
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface ProjectPost {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  author: string;
  imageUrls?: string[];
}

export interface Room {
  id: string;
  type: RoomType;
  name: string;
  icon?: string;
  webhookUrl?: string;
  inputLink?: string;
  voiceLink?: string;
  recordingTimer?: number; // in seconds
  messages?: ChatMessage[];
  calendarEntries?: CalendarEntry[];
  todoItems?: TodoItem[];
  projectContent?: string;
  projectPosts?: ProjectPost[];
}

export enum CalendarCategory {
  OBLIGATION = 'Obligation',
  SOCIAL = 'Social Engagements',
  ADMIN = 'Administrative Tasks',
  PERSONAL = 'Personal Developments',
  LOGISTICS = 'Logistics'
}

export interface CalendarEntry {
  id: string;
  date: string; // ISO format or MM.DD.YYYY as per requirement
  category: CalendarCategory;
  notes: string;
}

export interface GlobalSettings {
  userName: string;
  avatar: string;
}
