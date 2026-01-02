
import React, { useState, useMemo } from 'react';
import { Bell, Calendar, GraduationCap, MessageCircle, FileText, CheckCircle, Bot, Sparkles, LogOut, LayoutDashboard, BrainCircuit } from 'lucide-react';
import { ANNOUNCEMENTS, PLANNING_DATA } from '../constants';
import { Student } from '../types';
import { QueZadinChat } from './QueZadinChat';

interface ParentPortalProps {
  student: Student;
  onLogout: () => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({ student, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'inicio' | 'evaluaciones' | 'tutor'>('inicio');

  // Filtrar anuncios por el curso del alumno o anuncios generales
  const filteredAnnouncements = useMemo(() => {
    return ANNOUNCEMENTS.filter(ann => !ann.grade || ann.grade === student.grade);
  }, [student.grade]);

  // Filtrar planificación para mostrar exámenes próximos del nivel
  const coursePlanning = useMemo(() => {
    return PLANNING_DATA.filter(unit => unit.grade === student.grade);
  }, [student.grade]);

  const upcomingExams = useMemo(() => {
    return coursePlanning
      .filter(unit => unit.upcomingExamDate)
      .map((unit, idx) => ({
        id: idx,
        subject: 'Matemáticas',
        title: unit.title,
        date: unit.upcomingExamDate || 'Próximamente',
        status: 'upcoming'
      }));
  }, [coursePlanning]);

  const pastExams = [
    { id: 99, subject: 'Matemáticas', title: 'Evaluación Diagnóstica', date: '01 Mar', grade: student.averageScore, status: 'graded' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans max-w-md mx-auto shadow-2xl border-x border-slate-200 relative">
      {/* Header Institucional */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center border border-blue-500 shadow-sm">
               <span className="font-serif font-bold text-white text-xs tracking-tighter">LQT</span>
            </div>
            <div>
                <h1 className="font-black text-sm uppercase tracking-tight">Escuela Las Quezadas</h1>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">MatemApp 360°</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-white transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-32 bg-slate-50">
        {activeTab === 'inicio' && (
          <div className="p-4 space-y-6 animate-fade-in">
            {/* Student Info Card */}
            <div className="bg-white rounded-[32px] shadow-sm p-6 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img src={student.avatar} className="w-14 h-14 rounded-2xl border-2 border-slate-50 shadow-md object-cover" alt="Alumno" />
                    <div>
                        <h2 className="font-black text-slate-900 uppercase text-xs tracking-tighter truncate max-w-[150px]">{student.name}</h2>
                        <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">{student.grade}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Promedio</p>
                    <p className={`text-2xl font-black ${student.averageScore >= 6.0 ? 'text-emerald-600' : 'text-blue-900'}`}>{student.averageScore}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-600 rounded-3xl p-5 text-white shadow-xl shadow-indigo-100">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Asistencia</p>
                    <p className="text-2xl font-black">{student.attendance}%</p>
                </div>
                <div onClick={() => setActiveTab('tutor')} className="bg-yellow-500 rounded-3xl p-5 text-slate-900 shadow-xl shadow-yellow-100 cursor-pointer hover:scale-[1.02] transition-transform flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Tutor IA {student.grade.split('°')[0]}°</p>
                    <p className="text-xs font-black uppercase flex items-center gap-2">Consultar <Bot size={16}/></p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MessageCircle size={14} className="text-blue-600" /> Comunicados del Nivel
                </h3>
                {filteredAnnouncements.length > 0 ? filteredAnnouncements.map(ann => (
                    <div key={ann.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 group transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${
                                ann.category === 'Evaluación' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }`}>{ann.category}</span>
                            <span className="text-[10px] font-bold text-slate-400">{ann.date}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1 text-sm">{ann.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed italic">"{ann.content}"</p>
                    </div>
                )) : (
                    <div className="bg-white p-8 rounded-[28px] text-center border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400 font-medium">No hay comunicados específicos para tu curso hoy.</p>
                    </div>
                )}
            </div>

            <div className="py-6 text-center opacity-20">
               <p className="text-[8px] font-black tracking-[0.4em] text-slate-900">Creado por YherreraR</p>
            </div>
          </div>
        )}

        {activeTab === 'evaluaciones' && (
          <div className="p-4 space-y-8 animate-fade-in">
             <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Calendar size={14} className="text-orange-500" /> Próximas Evaluaciones de {student.grade}
                </h3>
                <div className="space-y-4">
                    {upcomingExams.length > 0 ? upcomingExams.map(exam => (
                        <div key={exam.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500"></div>
                            <div className="relative z-10">
                                <h4 className="font-black text-slate-900 uppercase text-xs tracking-tighter">{exam.title}</h4>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{exam.subject} • {exam.date}</p>
                                <button 
                                    onClick={() => setActiveTab('tutor')}
                                    className="mt-6 w-full py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                                >
                                    <Sparkles size={14} /> Estudiar con QueZadin
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="bg-orange-50/50 p-6 rounded-[32px] border border-dashed border-orange-200 text-center">
                            <p className="text-xs text-orange-600 font-bold uppercase tracking-widest">Sin pruebas agendadas</p>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500" /> Historial de Calificaciones
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {pastExams.map(exam => (
                        <div key={exam.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-slate-800 text-xs">{exam.title}</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{exam.date}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-xl font-black ${exam.grade >= 6.0 ? 'text-emerald-600' : 'text-blue-900'}`}>
                                    {exam.grade}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="py-6 text-center opacity-20">
               <p className="text-[8px] font-black tracking-[0.4em] text-slate-900">Creado por YherreraR</p>
            </div>
          </div>
        )}

        {activeTab === 'tutor' && (
          <div className="h-full animate-fade-in bg-white">
            <QueZadinChat course={student.grade} isLocked={true} />
          </div>
        )}
      </div>

      {/* Tab Navigation Footer */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-100 p-4 flex justify-around items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
        <button 
            onClick={() => setActiveTab('inicio')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'inicio' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
            <LayoutDashboard size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Inicio</span>
        </button>
        <button 
            onClick={() => setActiveTab('evaluaciones')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'evaluaciones' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
            <Calendar size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Pruebas</span>
        </button>
        <button 
            onClick={() => setActiveTab('tutor')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'tutor' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
            <BrainCircuit size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Tutor IA</span>
        </button>
      </nav>
    </div>
  );
};
