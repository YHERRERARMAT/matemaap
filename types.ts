
export enum UserRole {
  TEACHER = 'PROFESOR',
  PARENT = 'APODERADO',
  STUDENT = 'ALUMNO'
}

export interface Student {
  id: string;
  rut: string; 
  name: string;
  grade: string;
  attendance: number;
  averageScore: number;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  isPIE: boolean;
  avatar: string;
  notes?: string;
  lastLogin?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isAiGenerated?: boolean;
  isMine: boolean;
}

export interface Conversation {
  id: string;
  studentId: string;
  parentName: string;
  lastMessage: string;
  unreadCount: number;
  messages: Message[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Urgente' | 'General' | 'Evaluación';
  grade?: string; // Nuevo: Para filtrar por curso
}

export interface PlanningUnit {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Completado' | 'En Progreso' | 'Pendiente';
  upcomingExamDate?: string;
  resources: string[];
  grade?: string; // Nuevo: Para filtrar por curso
}

export type ViewState = 'dashboard' | 'communication' | 'students' | 'planning' | 'quezadin';

export interface AuthState {
  user: Student | { name: string; role: UserRole.TEACHER } | null;
  role: UserRole | null;
}
