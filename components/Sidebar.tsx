
import React from 'react';
import { LayoutDashboard, MessageSquare, Users, CalendarDays, Settings, LogOut, GraduationCap, ChevronRight, UserCircle, Sparkles, Puzzle, Smartphone, Shield } from 'lucide-react';
import { ViewState, UserRole } from '../types';

// Reusable School Logo component
const SchoolLogo = ({ className = "w-14 h-14" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-slate-900 rounded-2xl shadow-xl transform rotate-3"></div>
    <div className="absolute inset-0 bg-indigo-600 rounded-2xl shadow-lg transform -rotate-3 opacity-80"></div>
    <div className="relative z-10 text-white flex flex-col items-center">
      <Shield size={24} className="mb-[-4px]" />
      <span className="font-serif text-lg font-black tracking-tighter">LQ</span>
    </div>
  </div>
);

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  selectedCourse: string;
  onSelectCourse: (course: string) => void;
  userRole: UserRole;
  onToggleRole: () => void;
  userName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  selectedCourse, 
  onSelectCourse,
  userRole,
  onToggleRole,
  userName
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
    { id: 'communication', label: 'Mensajes', icon: MessageSquare },
    { id: 'students', label: 'Alumnos', icon: Users },
    { id: 'planning', label: 'Planificación', icon: CalendarDays },
    { id: 'quezadin', label: 'Tutor QueZadin', icon: Sparkles },
    { id: 'challenges', label: 'Ingenio Lab', icon: Puzzle },
    { id: 'parent_view', label: 'Vista Apoderado', icon: Smartphone },
  ];

  const courses = ['4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico'];

  return (
    <aside className="w-20 lg:w-[280px] bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 transition-all duration-500 z-50 shadow-sm overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
        <svg width="100" height="100" viewBox="0 0 100 100">
           <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="p-8 flex flex-col items-center lg:items-start border-b border-slate-100">
        <div className="mb-6 transform hover:scale-110 transition-transform cursor-pointer">
             <SchoolLogo />
        </div>
        <div className="hidden lg:block">
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] leading-none">MatemApp 360°</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Escuela Las Quezadas</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-8 space-y-12 overflow-y-auto no-scrollbar">
        <nav className="space-y-2">
          <p className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4 hidden lg:block">Navegación Áurea</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isSpecial = item.id === 'quezadin' || item.id === 'challenges';
            const isPreview = item.id === 'parent_view';
            
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id as ViewState)}
                className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all duration-300 group ${
                  isActive 
                    ? (isPreview ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : isSpecial ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-900 text-white shadow-xl shadow-slate-200')
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`p-2 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-transparent'}`}>
                  <Icon size={18} />
                </div>
                <span className="hidden lg:block font-black text-[11px] uppercase tracking-widest">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <nav className="space-y-2">
          <p className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4 hidden lg:block">Niveles</p>
          {courses.map((course) => {
            const isSelected = selectedCourse === course;
            return (
              <button
                key={course}
                onClick={() => onSelectCourse(course)}
                className={`w-full flex items-center justify-between p-4 rounded-[18px] transition-all duration-300 group ${
                  isSelected ? 'bg-slate-50 text-slate-900' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full transition-all border-2 ${isSelected ? 'bg-indigo-600 border-indigo-100 scale-125' : 'bg-white border-slate-200 group-hover:border-slate-400'}`}></div>
                  <span className="hidden lg:block font-black text-[10px] uppercase tracking-widest">{course}</span>
                </div>
                {isSelected && <ChevronRight size={14} className="text-indigo-600 hidden lg:block" />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-100">
        <button 
          onClick={onToggleRole} 
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 group"
        >
          <LogOut size={18} />
          <span className="hidden lg:block font-black text-[10px] uppercase tracking-widest">Desconectar</span>
        </button>
      </div>
    </aside>
  );
};
