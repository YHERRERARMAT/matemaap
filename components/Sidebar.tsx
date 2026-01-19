
import React, { useMemo } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  CalendarDays, 
  LogOut, 
  ChevronRight, 
  Sparkles, 
  Puzzle, 
  Smartphone 
} from 'lucide-react';
import { ViewState, UserRole } from '../types';
import { EscuelaInsignia } from './Insignia';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  selectedCourse: string;
  onSelectCourse: (course: string) => void;
  userRole: UserRole;
  onToggleRole: () => void;
  userName?: string;
  unreadMessagesCount?: number;
}

// Estructuras de datos estables fuera del componente
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
  { id: 'communication', label: 'Mensajes', icon: MessageSquare },
  { id: 'students', label: 'Alumnos', icon: Users },
  { id: 'planning', label: 'Planificación', icon: CalendarDays },
  { id: 'quezadin', label: 'Tutor QueZadin', icon: Sparkles },
  { id: 'challenges', label: 'Ingenio Lab', icon: Puzzle },
  { id: 'parent_view', label: 'Vista Apoderado', icon: Smartphone },
] as const;

const COURSES = ['4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico'] as const;

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  selectedCourse, 
  onSelectCourse,
  onToggleRole,
  unreadMessagesCount = 0
}) => {
  
  // Memoización para evitar re-cálculos de UI
  const navContent = useMemo(() => (
    <nav className="space-y-2">
      <p className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4 hidden lg:block text-center">
        Navegación Áurea
      </p>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        const isSpecial = item.id === 'quezadin' || item.id === 'challenges';
        const isPreview = item.id === 'parent_view';
        const hasBadge = item.id === 'communication' && unreadMessagesCount > 0;
        
        return (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id as ViewState)}
            className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all duration-300 group relative ${
              isActive 
                ? (isPreview ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : isSpecial ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-900 text-white shadow-xl shadow-slate-200')
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className={`p-2 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-transparent'} shrink-0`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 flex items-center justify-between hidden lg:flex min-w-0">
              <span className="font-black text-[11px] uppercase tracking-widest truncate text-left">
                {item.label}
              </span>
              {hasBadge && (
                <span className="bg-red-50 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full border border-red-100">
                  {unreadMessagesCount}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </nav>
  ), [currentView, unreadMessagesCount, onChangeView]);

  return (
    <aside className="h-screen sticky top-0 z-50 flex flex-col bg-white border-r border-slate-200 shadow-sm overflow-hidden shrink-0 w-20 lg:w-[18%] lg:min-w-[18%] lg:max-w-[18%]">
      {/* Background Decorator */}
      <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
        <svg width="100" height="100" viewBox="0 0 100 100">
           <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Brand Header: Centrado absoluto */}
      <div className="p-8 flex flex-col items-center border-b border-slate-100 text-center w-full bg-white relative z-10">
        <div className="mb-6 transform hover:scale-105 transition-all cursor-pointer">
             <EscuelaInsignia size={76} />
        </div>
        <div className="hidden lg:block w-full px-4 overflow-hidden">
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] leading-none truncate">
            MatemApp 360°
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-3 tracking-widest truncate">
            Escuela Las Quezadas
          </p>
        </div>
      </div>

      {/* Main Navigation Area */}
      <div className="flex-1 px-4 py-8 space-y-12 overflow-y-auto no-scrollbar">
        {navContent}

        {/* Cursos Selector */}
        <nav className="space-y-2">
          <p className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4 hidden lg:block text-center">
            Niveles Académicos
          </p>
          {COURSES.map((course) => {
            const isSelected = selectedCourse === course;
            return (
              <button
                key={course}
                onClick={() => onSelectCourse(course)}
                className={`w-full flex items-center justify-between p-4 rounded-[18px] transition-all duration-300 group ${
                  isSelected ? 'bg-slate-50 text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full transition-all border-2 shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-100 scale-125' : 'bg-white border-slate-200 group-hover:border-slate-400'}`}></div>
                  <span className="hidden lg:block font-black text-[10px] uppercase tracking-widest truncate">
                    {course}
                  </span>
                </div>
                {isSelected && <ChevronRight size={14} className="text-indigo-600 hidden lg:block shrink-0" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-6 border-t border-slate-100 bg-white">
        <button 
          onClick={onToggleRole} 
          className="w-full flex items-center justify-center gap-4 p-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 group"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="hidden lg:block font-black text-[10px] uppercase tracking-widest truncate">
            Desconectar
          </span>
        </button>
      </div>
    </aside>
  );
};
