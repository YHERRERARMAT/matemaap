
import React, { useState } from 'react';
import { 
  FileCode2, 
  Sparkles, 
  FileText, 
  BookOpen, 
  Loader2, 
  Download, 
  Copy, 
  Check, 
  AlertCircle,
  BrainCircuit,
  GraduationCap,
  Layers,
  ChevronRight,
  Target,
  Wand2
} from 'lucide-react';
import { generateAiEvaluation, generateAiLearningSequence } from '../services/geminiService';
import { COURSES } from '../constants';

type ToolMode = 'eval' | 'planning';

export const ResourceGenerator: React.FC<{selectedCourse: string}> = ({ selectedCourse }) => {
  const [mode, setMode] = useState<ToolMode>('eval');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Estados para Formulario
  const [topic, setTopic] = useState('');
  const [evalType, setEvalType] = useState('Prueba de Unidad');
  const [unit, setUnit] = useState('Unidad 1: Números');
  const [objective, setObjective] = useState('');

  const handleGenerate = async () => {
    if ((mode === 'eval' && !topic) || (mode === 'planning' && !objective)) return;
    
    setIsLoading(true);
    setResult(null);
    try {
      let content = "";
      if (mode === 'eval') {
        content = await generateAiEvaluation(selectedCourse, topic, evalType);
      } else {
        content = await generateAiLearningSequence(selectedCourse, unit, objective);
      }
      setResult(content);
    } catch (error) {
      setResult("Ocurrió un error al procesar la solicitud con QueZadin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-10 animate-fade-in bg-slate-50/30 min-h-full max-w-6xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Generador de Recursos IA</h1>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em] mt-2">Copiloto de Planificación y Evaluación • QueZadin Studio</p>
        </div>
        <div className="bg-indigo-600 px-6 py-3 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-100">
           <BrainCircuit size={18} /> {selectedCourse}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Selector de Herramienta y Parámetros */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-2 rounded-[32px] border border-slate-100 shadow-sm flex gap-1">
             <button 
                onClick={() => {setMode('eval'); setResult(null);}}
                className={`flex-1 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'eval' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
             >
                Evaluaciones
             </button>
             <button 
                onClick={() => {setMode('planning'); setResult(null);}}
                className={`flex-1 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'planning' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
             >
                Planificaciones
             </button>
          </div>

          <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 border-b border-slate-50 pb-4">
               <Layers size={18} className="text-indigo-600" /> Configuración del Recurso
            </h3>

            {mode === 'eval' ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tema Específico</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Suma de fracciones, Geometría..." 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Instrumento</label>
                  <select 
                    value={evalType}
                    onChange={(e) => setEvalType(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
                  >
                    <option>Prueba de Unidad</option>
                    <option>Control Rápido</option>
                    <option>Ticket de Salida</option>
                    <option>Guía de Trabajo</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unidad Académica</label>
                  <input 
                    type="text" 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Objetivo de Aprendizaje (OA)</label>
                  <textarea 
                    rows={4}
                    placeholder="Pega aquí el OA o describe lo que buscas lograr..." 
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none resize-none"
                  />
                </div>
              </div>
            )}

            <button 
              onClick={handleGenerate}
              disabled={isLoading || (mode === 'eval' ? !topic : !objective)}
              className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Procesando con IA...
                </>
              ) : (
                <>
                  <Wand2 size={20} className="group-hover:rotate-12 transition-transform" /> Generar con QueZadin
                </>
              )}
            </button>
          </div>

          <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 flex gap-4">
             <div className="p-3 bg-white rounded-xl text-amber-500 shadow-sm h-fit"><Sparkles size={20} /></div>
             <div>
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Tip de Maestro</p>
                <p className="text-[10px] text-amber-600 font-bold leading-relaxed">QueZadin ajustará el lenguaje y dificultad automáticamente para el nivel {selectedCourse}.</p>
             </div>
          </div>
        </div>

        {/* Preview del Resultado */}
        <div className="lg:col-span-8">
           <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl min-h-[600px] flex flex-col relative overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 backdrop-blur-md">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                       {mode === 'eval' ? <FileText size={20} /> : <BookOpen size={20} />}
                    </div>
                    <div>
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Vista Previa del Documento</h4>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Documento Editable generado por Gemini 3 Flash</p>
                    </div>
                 </div>
                 
                 {result && (
                    <div className="flex gap-3">
                       <button 
                        onClick={handleCopy}
                        className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase"
                       >
                          {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                          {copied ? 'Copiado' : 'Copiar'}
                       </button>
                       <button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2 text-[10px] font-black uppercase">
                          <Download size={16} /> Descargar PDF
                       </button>
                    </div>
                 )}
              </div>

              <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-6 text-slate-300">
                    <div className="relative">
                       <Loader2 size={80} className="animate-spin text-indigo-100" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles size={32} className="text-indigo-400 animate-pulse" />
                       </div>
                    </div>
                    <div className="text-center">
                       <p className="text-sm font-black uppercase tracking-[0.3em] text-indigo-600">Redactando Recurso...</p>
                       <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Estamos alineando el contenido al currículum nacional</p>
                    </div>
                  </div>
                ) : result ? (
                  <div className="prose prose-slate max-w-none animate-in fade-in duration-700">
                    <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-700">
                      {result}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30 grayscale">
                    <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center border-4 border-dashed border-slate-200">
                       <Wand2 size={40} className="text-slate-300" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Configura los parámetros para comenzar</p>
                  </div>
                )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
