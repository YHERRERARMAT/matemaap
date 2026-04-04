
import React, { useMemo } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  CalendarDays, 
  LogOut, 
  Menu as MenuIcon,
  Sparkles, 
  Puzzle, 
  Smartphone,
  Swords,
  ShieldCheck,
  ChevronRight,
  FileCode2
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

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.TEACHER, UserRole.DIRECTOR] },
  { id: 'director_panel', label: 'Panel Director', icon: ShieldCheck, roles: [UserRole.DIRECTOR] },
  { id: 'resource_generator', label: 'Generador IA', icon: FileCode2, roles: [UserRole.TEACHER, UserRole.DIRECTOR] },
  { id: 'planning', label: 'Planificación', icon: CalendarDays, roles: [UserRole.TEACHER, UserRole.DIRECTOR] },
  { id: 'students', label: 'Estudiantes', icon: Users, roles: [UserRole.TEACHER, UserRole.DIRECTOR] },
  { id: 'communication', label: 'Comunicación', icon: MessageSquare, roles: [UserRole.TEACHER, UserRole.DIRECTOR] },
  { id: 'parent_view', label: 'Vista Apoderado', icon: Smartphone, roles: [UserRole.TEACHER, UserRole.DIRECTOR] },
  { id: 'quezadin', label: 'QueZadin Chat', icon: Sparkles, roles: [UserRole.TEACHER, UserRole.DIRECTOR] },
  { id: 'math_arena', label: 'Arena de Cálculo', icon: Swords, roles: [UserRole.TEACHER, UserRole.DIRECTOR] },
  { id: 'challenges', label: 'Desafíos', icon: Puzzle, roles: [UserRole.TEACHER, UserRole.DIRECTOR] },
] as const;

const COURSES = ['4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico'] as const;

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  selectedCourse, 
  onSelectCourse,
  onToggleRole,
  userRole,
  unreadMessagesCount = 0
}) => {
  
  const filteredNavItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <aside className="h-screen sticky top-0 z-50 flex flex-col bg-[#004d55] text-white overflow-hidden shrink-0 w-64 lg:w-[18%] transition-all duration-300 shadow-2xl">
      
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <span className="text-xl font-medium tracking-tight">Menu</span>
        <button className="p-1 hover:bg-white/5 rounded-md transition-colors">
          <MenuIcon size={24} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
        <nav className="flex flex-col">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id as ViewState)}
                className={`flex items-center gap-4 px-6 py-4 border-b border-white/10 transition-all text-left group relative ${
                  isActive ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <Icon 
                  size={22} 
                  className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'} text-white`} 
                />
                <span className={`text-lg font-light tracking-tight flex-1 transition-colors ${isActive ? 'font-medium' : 'text-white/90'}`}>
                  {item.label}
                </span>
                
                {item.id === 'communication' && unreadMessagesCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                    {unreadMessagesCount}
                  </span>
                )}
                
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/40"></div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 px-6 pb-6">
          <p className="text-[10px] font-bold uppercase text-white/30 tracking-[0.2em] mb-4">Canales de Nivel</p>
          <div className="grid grid-cols-1 gap-1.5">
            {COURSES.map((course) => {
              const isSelected = selectedCourse === course;
              return (
                <button
                  key={course}
                  onClick={() => onSelectCourse(course)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all border ${
                    isSelected 
                      ? 'bg-white/10 border-white/20 text-white' 
                      : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-xs font-medium tracking-wide">{course}</span>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto p-6 flex flex-col items-center border-t border-white/10 bg-black/10">
          <div className="mb-3 opacity-60 scale-90 grayscale hover:grayscale-0 transition-all duration-500">
            <EscuelaInsignia size={54} />
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
              F-413 Tinguiririca
            </p>
            <p className="text-[8px] font-bold text-white/10 uppercase tracking-[0.1em] mt-0.5">
              Escuela Las Quezadas
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-black/20">
        <button 
          onClick={onToggleRole} 
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-white/40 hover:text-white hover:bg-red-500/20 transition-all border border-white/5 group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
