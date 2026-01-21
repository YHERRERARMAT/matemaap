
export enum UserRole {
  TEACHER = 'PROFESOR',
  PARENT = 'APODERADO',
  STUDENT = 'ALUMNO'
}

export type AIModelId = 
  | 'gemini-3-flash-preview' 
  | 'gemini-3-pro-preview' 
  | 'gemini-2.5-flash-native-audio-preview-12-2025';

export interface AIModelConfig {
  id: AIModelId;
  label: string;
  description: string;
  useCase: string;
  color: string;
  tier: 'Low' | 'Medium' | 'High';
  isNew?: boolean;
}

export const AVAILABLE_MODELS: AIModelConfig[] = [
  { 
    id: 'gemini-3-pro-preview', 
    label: 'Gemini 3 Pro', 
    description: 'Razonamiento profundo', 
    useCase: 'Problemas complejos y olimpiadas',
    color: 'amber',
    tier: 'High' 
  },
  { 
    id: 'gemini-3-flash-preview', 
    label: 'Gemini 3 Flash', 
    description: 'Velocidad turbo', 
    useCase: 'Consultas rápidas y definiciones',
    color: 'indigo',
    tier: 'Low', 
    isNew: true 
  },
];

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
  modelUsed?: string;
  thoughtProcess?: string;
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
  grade?: string;
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
  grade?: string;
}

export type ViewState = 'dashboard' | 'communication' | 'students' | 'planning' | 'quezadin' | 'challenges' | 'parent_view';

export interface AuthState {
  user: Student | { name: string; role: UserRole.TEACHER } | null;
  role: UserRole | null;
}
