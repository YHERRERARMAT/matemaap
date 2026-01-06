
import React, { useState } from 'react';
import { Calendar, Book, Clock, CheckCircle2, Circle, AlertCircle, Sparkles, Send, X, ClipboardList, GraduationCap, Save, CheckCircle, Megaphone, CalendarPlus } from 'lucide-react';
import { PLANNING_DATA, COURSES } from '../constants';
import { generateStudyGuide } from '../services/geminiService';

export const Planning: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [newEval, setNewEval] = useState({
    title: '',
    date: '',
    grade: '5° Básico',
    content: '',
    category: 'Evaluación' as 'Evaluación' | 'General'
  });

  const handleGenerateGuide = async (unit: any) => {
    setIsGenerating(true);
    setGeneratedContent(null);
    setSelectedUnit(unit.id);
    const content = await generateStudyGuide(unit.title, unit.description);
    setGeneratedContent(content);
    setIsGenerating(false);
  };

  const openAnnouncementModal = (unit?: any, isEval: boolean = false) => {
    setNewEval({
      title: unit ? `Próxima Evaluación: ${unit.title}` : '',
      date: unit?.upcomingExamDate || '',
      grade: unit?.grade || '5° Básico',
      content: unit ? `Contenidos a evaluar: ${unit.description}` : '',
      category: isEval ? 'Evaluación' : 'General'
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateModalOpen(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-fade-in h-full overflow-y-auto relative bg-white">
      {showSuccessToast && (
        <div className="fixed top-10 right-10 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-[24px] shadow-2xl flex items-center gap-3 animate-in slide-in-from-right border border-emerald-400">
          <CheckCircle size={20} />
          <span className="text-sm font-bold uppercase">Anuncio publicado con éxito</span>
        </div>
      )}

      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Planificación Curricular</h1>
            <p className="text-slate-500 font-medium">Gestión de unidades y cronograma de evaluaciones.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => openAnnouncementModal(null, false)}
            className="px-6 py-4 bg-slate-900 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 shadow-xl transition-all active:scale-95 flex items-center gap-3"
          >
              <Megaphone size={18} /> Comunicado General
          </button>
          <button 
            onClick={() => openAnnouncementModal(null, true)}
            className="px-6 py-4 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-3 transition-all active:scale-95"
          >
              <CalendarPlus size={18} /> Programar Evaluación
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            {PLANNING_DATA.map((unit, index) => {
                const isCurrent = unit.status === 'En Progreso';
                return (
                    <div key={unit.id} className={`relative pl-10 pb-10 ${index !== PLANNING_DATA.length - 1 ? 'border-l-2 border-slate-100' : ''}`}>
                        <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 ${isCurrent ? 'bg-indigo-600 border-indigo-100 animate-pulse' : 'bg-white border-slate-200'}`}></div>
                        <div className={`bg-white p-8 rounded-[40px] shadow-sm border text-left transition-all ${isCurrent ? 'border-indigo-100 ring-8 ring-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isCurrent ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {unit.status}
                                </span>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={14} /> {unit.startDate} — {unit.endDate}
                                </span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tighter">{unit.title}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">{unit.description}</p>
                            
                            {unit.upcomingExamDate && (
                                <div className="flex items-center justify-between p-6 bg-orange-50/50 text-orange-800 rounded-[32px] mb-8 border border-orange-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm"><AlertCircle size={24} /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Próxima Evaluación</p>
                                            <p className="font-black text-lg mt-1 uppercase tracking-tight">{unit.upcomingExamDate}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => openAnnouncementModal(unit, true)} className="px-5 py-2.5 bg-white text-orange-600 rounded-2xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-white transition-all">Anunciar</button>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                    <GraduationCap size={16} /> {unit.grade}
                                </span>
                                <div className="flex gap-3">
                                  <button onClick={() => handleGenerateGuide(unit)} className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 px-5 py-3 rounded-2xl transition-all flex items-center gap-2 border border-slate-100 hover:border-indigo-100"><Sparkles size={16} /> Tips IA</button>
                                  <button onClick={() => openAnnouncementModal(unit, true)} className="text-[10px] font-black uppercase text-indigo-600 bg-white border-2 border-indigo-50 px-5 py-3 rounded-2xl transition-all flex items-center gap-2 hover:bg-indigo-600 hover:text-white shadow-xl shadow-indigo-100"><CalendarPlus size={16} /> Programar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 text-left">
                <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-tighter text-lg">
                    <Calendar className="text-indigo-600" size={24} /> Agenda Escolar
                </h3>
                <div className="space-y-4">
                    <div className="p-5 rounded-[28px] bg-slate-50 border border-slate-100">
                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Control 25 MAR</span>
                        <p className="text-sm font-bold text-slate-800 mt-1">Multiplicación Básica</p>
                    </div>
                </div>
                <button onClick={() => openAnnouncementModal(null, true)} className="w-full mt-8 py-5 text-[10px] font-black uppercase text-slate-400 border-2 border-dashed border-slate-100 rounded-[28px] hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                    <CalendarPlus size={16} /> Nueva Evaluación
                </button>
            </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[48px] w-full max-w-xl shadow-3xl overflow-hidden animate-in zoom-in-95">
            <div className={`p-10 text-white flex justify-between items-center ${newEval.category === 'Evaluación' ? 'bg-indigo-600' : 'bg-slate-900'}`}>
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                {newEval.category === 'Evaluación' ? 'Programar Evaluación' : 'Crear Comunicado'}
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateEvaluation} className="p-10 space-y-6 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título / Tema</label>
                <input type="text" required value={newEval.title} onChange={(e) => setNewEval({...newEval, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha</label>
                  <input type="date" required value={newEval.date} onChange={(e) => setNewEval({...newEval, date: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Curso</label>
                  <select value={newEval.grade} onChange={(e) => setNewEval({...newEval, grade: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none">
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instrucciones / Contenido</label>
                <textarea rows={3} required value={newEval.content} onChange={(e) => setNewEval({...newEval, content: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none resize-none" />
              </div>
              <button type="submit" className={`w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-widest text-white shadow-2xl transition-all active:scale-95 ${newEval.category === 'Evaluación' ? 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                <Save size={18} className="inline mr-2" /> Publicar Oficialmente
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
