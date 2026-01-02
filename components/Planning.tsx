
import React, { useState } from 'react';
import { Calendar, Book, Clock, CheckCircle2, Circle, AlertCircle, Sparkles, Send, X, ClipboardList, GraduationCap, Save, CheckCircle, Megaphone } from 'lucide-react';
import { PLANNING_DATA, COURSES } from '../constants';
import { generateStudyGuide } from '../services/geminiService';

export const Planning: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Estado para el Modal de Nueva Evaluación / Anuncio
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [newEval, setNewEval] = useState({
    title: '',
    date: '',
    grade: '5° Básico',
    content: ''
  });

  const handleGenerateGuide = async (unit: any) => {
    setIsGenerating(true);
    setGeneratedContent(null);
    setSelectedUnit(unit.id);
    
    const content = await generateStudyGuide(unit.title, unit.description);
    setGeneratedContent(content);
    setIsGenerating(false);
  };

  const openAnnouncementModal = (unit?: any) => {
    if (unit) {
      setNewEval({
        title: `Evaluación: ${unit.title}`,
        date: unit.upcomingExamDate || '',
        grade: unit.grade || '5° Básico',
        content: `Contenidos de la unidad: ${unit.description}`
      });
    }
    setIsCreateModalOpen(true);
  };

  const handleCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de guardado - En una app real esto actualizaría el estado global de anuncios
    console.log('Nuevo Anuncio de Evaluación Creado:', newEval);
    
    setIsCreateModalOpen(false);
    setShowSuccessToast(true);
    
    // Limpiar formulario
    setNewEval({
      title: '',
      date: '',
      grade: '5° Básico',
      content: ''
    });

    // Ocultar toast después de 3 segundos
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-fade-in h-full overflow-y-auto relative bg-white">
      
      {/* Toast de Éxito */}
      {showSuccessToast && (
        <div className="fixed top-10 right-10 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-[24px] shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-500 border border-emerald-400">
          <div className="bg-white/20 p-2 rounded-full">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] leading-none opacity-80">Sistema de Gestión</div>
            <div className="text-sm font-bold uppercase tracking-tight mt-1">Anuncio publicado con éxito</div>
          </div>
        </div>
      )}

      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Planificación Semestral</h1>
            <p className="text-slate-500 font-medium">Cronograma de unidades y progreso curricular Escuela Las Quezadas.</p>
        </div>
        <button 
          onClick={() => openAnnouncementModal()}
          className="px-6 py-4 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-3 transition-all active:scale-95 group"
        >
            <Megaphone size={18} className="group-hover:rotate-12 transition-transform" /> Crear Anuncio General
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline de Unidades */}
        <div className="lg:col-span-2 space-y-6">
            {PLANNING_DATA.map((unit, index) => {
                const isCompleted = unit.status === 'Completado';
                const isCurrent = unit.status === 'En Progreso';
                
                return (
                    <div key={unit.id} className={`relative pl-10 pb-10 ${index !== PLANNING_DATA.length - 1 ? 'border-l-2 border-slate-100' : ''}`}>
                        <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 ${
                            isCompleted ? 'bg-emerald-500 border-emerald-100' : 
                            isCurrent ? 'bg-indigo-600 border-indigo-100 animate-pulse' : 'bg-white border-slate-200'
                        }`}></div>
                        
                        <div className={`bg-white p-8 rounded-[40px] shadow-sm border transition-all ${isCurrent ? 'border-indigo-100 ring-8 ring-indigo-50/50 shadow-indigo-100' : 'border-slate-100 hover:border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-2">
                                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                      isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                      isCurrent ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                                  }`}>
                                      {unit.status}
                                  </span>
                                  {isCurrent && (
                                    <span className="px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div> Prioridad
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl">
                                    <Clock size={14} /> {unit.startDate} — {unit.endDate}
                                </span>
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tighter">{unit.title}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">{unit.description}</p>
                            
                            {unit.upcomingExamDate && (
                                <div className="flex items-center justify-between p-6 bg-orange-50/50 text-orange-800 rounded-[32px] mb-8 border border-orange-100 relative overflow-hidden group/exam">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 text-orange-500 rotate-12 group-hover/exam:scale-125 transition-transform">
                                      <Calendar size={48} />
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
                                          <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest leading-none opacity-60">Próxima Evaluación</p>
                                            <p className="font-black text-lg mt-1 tracking-tight uppercase">{unit.upcomingExamDate}</p>
                                        </div>
                                    </div>
                                    <button 
                                      onClick={() => openAnnouncementModal(unit)}
                                      className="px-5 py-2.5 bg-white text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2 relative z-10"
                                    >
                                      <Megaphone size={14} /> Anunciar
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between pt-8 border-t border-slate-50 gap-4">
                                <div className="flex gap-6">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Book size={16} />
                                      </div>
                                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{unit.resources.length} Recursos</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400">
                                        <GraduationCap size={16} />
                                      </div>
                                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{unit.grade}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                  <button 
                                      onClick={() => handleGenerateGuide(unit)}
                                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 px-5 py-3 rounded-2xl transition-all flex items-center gap-2 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50"
                                  >
                                      <Sparkles size={16} /> Tips IA
                                  </button>
                                  <button 
                                      onClick={() => openAnnouncementModal(unit)}
                                      className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-white border-2 border-indigo-50 px-5 py-3 rounded-2xl transition-all flex items-center gap-2 hover:bg-indigo-600 hover:text-white hover:shadow-xl hover:shadow-indigo-100"
                                  >
                                      <Megaphone size={16} /> Crear Anuncio
                                  </button>
                                </div>
                            </div>

                            {/* Área de Generación IA */}
                            {selectedUnit === unit.id && (
                                <div className="mt-8 bg-slate-900 rounded-[32px] p-8 text-white animate-in slide-in-from-top-4 duration-500 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                      <Sparkles size={80} />
                                    </div>
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 relative z-10">
                                        <Sparkles size={16} /> Asistente QueZadin Académico
                                    </h4>
                                    {isGenerating ? (
                                        <div className="flex items-center gap-4 py-10 justify-center">
                                            <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-sm font-bold tracking-widest uppercase opacity-60">Redactando guía para apoderados...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-sm text-slate-300 bg-white/5 p-6 rounded-[24px] border border-white/10 whitespace-pre-wrap leading-relaxed font-medium shadow-inner italic relative z-10">
                                                {generatedContent}
                                            </div>
                                            <div className="mt-8 flex justify-end gap-4 relative z-10">
                                                <button onClick={() => setSelectedUnit(null)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Descartar</button>
                                                <button onClick={() => { alert('Anuncio enviado por correo y plataforma a los apoderados.'); setSelectedUnit(null); }} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 flex items-center gap-2 shadow-xl shadow-indigo-900/50 active:scale-95">
                                                    <Send size={14} /> Publicar como Aviso
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Panel Lateral: Próximas Evaluaciones */}
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-600 group-hover:scale-110 transition-transform">
                    <ClipboardList size={64} />
                </div>
                <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-tighter text-lg">
                    <Calendar className="text-indigo-600" size={24} /> Agenda Escolar
                </h3>
                <div className="space-y-4 relative z-10">
                    <div className="p-5 rounded-[28px] bg-slate-50 border border-slate-100 group/item hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex justify-between mb-2">
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Prueba Parcial</span>
                            <span className="text-[9px] text-slate-400 font-black">25 MAR</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">Control de Multiplicación</p>
                    </div>
                    <div className="p-5 rounded-[28px] bg-slate-50 border border-slate-100 group/item hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex justify-between mb-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Control Acumulativo</span>
                            <span className="text-[9px] text-slate-400 font-black">12 ABR</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">Geometría Básica</p>
                    </div>
                </div>
                <button 
                  onClick={() => openAnnouncementModal()}
                  className="w-full mt-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 border-2 border-dashed border-slate-100 rounded-[28px] hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                >
                    <Megaphone size={16} /> Publicar Nuevo Anuncio
                </button>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[40px] shadow-2xl text-white relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <TargetIcon size={180} />
                </div>
                <h3 className="font-black text-xl mb-3 uppercase tracking-tighter relative z-10">Meta Curricular</h3>
                <p className="text-indigo-100 text-sm mb-8 leading-relaxed font-medium relative z-10">Lograr que el 90% del curso domine las tablas del 1 al 12 antes del cierre de la Unidad 1.</p>
                
                <div className="relative z-10">
                  <div className="w-full bg-black/20 rounded-full h-4 mb-3 p-1">
                      <div className="bg-white h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-1000" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Logro Actual</span>
                    <span className="text-xl font-black text-white">75%</span>
                  </div>
                </div>
            </div>
        </div>
      </div>

      {/* MODAL CREAR ANUNCIO DE EVALUACIÓN */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                <Megaphone size={80} />
              </div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-4 bg-white/10 rounded-[24px] backdrop-blur-md">
                  <Calendar size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Publicar Evaluación</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100 mt-1">Este anuncio será visible en el Portal de Apoderados</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all relative z-10"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateEvaluation} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Asignatura o Tema Central</label>
                <input 
                  type="text"
                  required
                  placeholder="Ej: Control Mensual de Fracciones"
                  value={newEval.title}
                  onChange={(e) => setNewEval({...newEval, title: e.target.value})}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-bold text-slate-800 focus:bg-white focus:ring-8 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Fecha Programada</label>
                  <input 
                    type="date"
                    required
                    value={newEval.date}
                    onChange={(e) => setNewEval({...newEval, date: e.target.value})}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-bold text-slate-800 focus:bg-white focus:ring-8 focus:ring-indigo-50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nivel Escolar</label>
                  <div className="relative">
                    <select 
                      value={newEval.grade}
                      onChange={(e) => setNewEval({...newEval, grade: e.target.value})}
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-bold text-slate-800 focus:bg-white focus:ring-8 focus:ring-indigo-50 outline-none transition-all appearance-none"
                    >
                      {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <GraduationCap size={18} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Instrucciones y Contenidos</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Redacta los contenidos que serán evaluados y recomendaciones de estudio para los alumnos..."
                  value={newEval.content}
                  onChange={(e) => setNewEval({...newEval, content: e.target.value})}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-medium text-slate-700 focus:bg-white focus:ring-8 focus:ring-indigo-50 outline-none transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-6 bg-indigo-600 text-white rounded-[28px] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 active:scale-95"
              >
                <Save size={20} /> Publicar Anuncio Oficial
              </button>
            </form>
          </div>
        </div>
      )}
      
      <div className="py-12 text-center opacity-30">
         <p className="text-[9px] font-black text-slate-400 tracking-[0.6em] uppercase">Gestión Académica Las Quezadas • Ciclo 2024</p>
      </div>
    </div>
  );
};

// Icono auxiliar para el Objetivo del Mes
const TargetIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
