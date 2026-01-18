
import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, TrendingUp, AlertTriangle, Calendar, Star, CheckCircle, Shield, Sparkles, Lightbulb, Loader2, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Student } from '../types';
import { EscuelaInsignia } from './Insignia';

interface DashboardProps {
  selectedCourse?: string;
  students: Student[];
}

export const Dashboard: React.FC<DashboardProps> = ({ selectedCourse = '5° Básico', students }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCourses, setAppliedCourses] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);

  const courseStudents = students.filter(s => s.grade === selectedCourse);
  const totalInCourse = courseStudents.length;
  
  const avgGrade = totalInCourse > 0 
    ? (courseStudents.reduce((acc, s) => acc + s.averageScore, 0) / totalInCourse).toFixed(1)
    : '0.0';

  const atRisk = courseStudents.filter(s => s.averageScore < 4.0 && s.averageScore > 0).length;
  const pieStudents = courseStudents.filter(s => s.isPIE).length;

  const isAlreadyApplied = appliedCourses.has(selectedCourse);

  const handleApplyStrategy = async () => {
    if (isAlreadyApplied || isApplying) return;

    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAppliedCourses(prev => new Set(prev).add(selectedCourse));
    setIsApplying(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const data = [
    { name: '4° Básico', count: students.filter(s => s.grade === '4° Básico').length },
    { name: '5° Básico', count: students.filter(s => s.grade === '5° Básico').length },
    { name: '6° Básico', count: students.filter(s => s.grade === '6° Básico').length },
    { name: '7° Básico', count: students.filter(s => s.grade === '7° Básico').length },
    { name: '8° Básico', count: students.filter(s => s.grade === '8° Básico').length },
  ];

  const getInsightText = () => {
    if (selectedCourse.includes('4°') || selectedCourse.includes('5°')) {
      return `Detectamos una caída del 12% en el promedio de la Unidad 1 en el nivel **${selectedCourse}**. Te sugerimos enviar el **Desafío Lateral n°4** para reactivar el interés antes de la prueba del 25 de Marzo.`;
    }
    return `El nivel **${selectedCourse}** muestra una brecha en Razonamiento Lógico. Recomendamos asignar la **Misión de Refuerzo n°7** para estabilizar los promedios antes del cierre de unidad.`;
  };

  return (
    <div className="p-12 lg:p-16 space-y-12 animate-fade-in bg-transparent min-h-full max-w-[1600px] mx-auto relative">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-10 right-10 z-[100] bg-emerald-600 text-white px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-500 border border-emerald-400">
          <div className="bg-white/20 p-2 rounded-xl">
             <Check size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Estrategia Asignada</p>
            <p className="text-sm font-bold uppercase tracking-tight">Plan aplicado a {selectedCourse}</p>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-12 relative">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <svg width="200" height="60" viewBox="0 0 200 60">
            <path d="M0,30 C50,-20 150,80 200,30" fill="none" stroke="#6366f1" strokeWidth="2" />
          </svg>
        </div>

        <div>
            <div className="flex items-center gap-4 mb-4 animate-in fade-in slide-in-from-left duration-700">
                <EscuelaInsignia size={50} />
                <div className="h-px w-8 bg-slate-200"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sello Institucional</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Gestión Áurea</h1>
            <p className="text-slate-400 font-medium mt-3 text-sm tracking-widest uppercase">Análisis Geométrico • Escuela Las Quezadas</p>
        </div>
        <div className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-slate-200 flex items-center gap-3">
            <CheckCircle size={16} className="text-indigo-400" /> Nivel: {selectedCourse}
        </div>
      </header>

      {/* AI INSIGHT CARD DINÁMICA */}
      <div className={`p-10 rounded-[48px] shadow-3xl border transition-all duration-700 relative overflow-hidden group ${
        isAlreadyApplied 
          ? 'bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 border-emerald-500/30' 
          : 'bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border-white/10'
      }`}>
        <div className="absolute top-0 right-0 p-12 text-white/5 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
           {isAlreadyApplied ? <Check size={120} /> : <Sparkles size={120} />}
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
            <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${
              isAlreadyApplied ? 'bg-emerald-600 shadow-emerald-500/40' : 'bg-indigo-600 shadow-indigo-500/40'
            }`}>
                {isAlreadyApplied ? <CheckCircle size={32} /> : <Lightbulb size={32} />}
            </div>
            <div className="flex-1 text-center md:text-left">
                <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 ${
                  isAlreadyApplied ? 'text-emerald-400' : 'text-indigo-400'
                }`}>Análisis de Red Neuronal</h3>
                <h4 className="text-2xl font-black text-white uppercase tracking-tight">
                  {isAlreadyApplied ? `Estrategia Activa en ${selectedCourse}` : `IA Insight: Refuerzo para ${selectedCourse}`}
                </h4>
                <p className="text-slate-300 text-sm font-medium mt-4 leading-relaxed">
                   {getInsightText()}
                </p>
            </div>
            <button 
              onClick={handleApplyStrategy}
              disabled={isAlreadyApplied || isApplying}
              className={`px-8 py-4 rounded-[24px] font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 whitespace-nowrap shadow-xl flex items-center gap-3 ${
                isAlreadyApplied 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default' 
                  : 'bg-white text-indigo-900 hover:bg-indigo-50'
              }`}
            >
               {isApplying ? (
                 <>
                   <Loader2 size={16} className="animate-spin" /> Procesando...
                 </>
               ) : isAlreadyApplied ? (
                 <>
                   <Check size={16} /> Estrategia Aplicada
                 </>
               ) : (
                 'Aplicar Estrategia'
               )}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: Users, label: 'Alumnos', val: totalInCourse, color: 'indigo', desc: `Total en ${selectedCourse}` },
          { icon: TrendingUp, label: 'Promedio', val: avgGrade, color: 'violet', desc: 'Rendimiento Curricular' },
          { icon: AlertTriangle, label: 'En Riesgo', val: atRisk, color: 'orange', desc: 'Soporte Requerido' },
          { icon: Star, label: 'Nivel PIE', val: pieStudents, color: 'blue', desc: 'Apoyo Diferenciado' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 bg-${kpi.color}-600 text-white rounded-2xl shadow-lg shadow-${kpi.color}-100`}>
                   <kpi.icon size={24} />
                </div>
                <span className={`text-[10px] font-black text-${kpi.color}-600 uppercase tracking-[0.3em]`}>{kpi.label}</span>
              </div>
              <p className="text-5xl font-black text-slate-900 tracking-tighter">{kpi.val}</p>
              <p className="text-[10px] text-slate-400 mt-4 font-black uppercase tracking-widest">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden">
          <h3 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-4 uppercase tracking-tighter">
            <BookOpen size={24} className="text-indigo-600" /> Distribución Proporcional
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={12}>
                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px' }}
                />
                <Bar dataKey="count" radius={[12, 12, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === selectedCourse ? '#4f46e5' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-12 rounded-[50px] text-white shadow-3xl relative overflow-hidden">
            <h3 className="text-xl font-black mb-10 flex items-center gap-4 uppercase tracking-tighter relative z-10">
                <Calendar size={24} className="text-indigo-400" /> Ciclo de Evaluación
            </h3>
            <div className="space-y-8 relative z-10">
                {[
                  { m: 'Mar', d: '25', tag: 'Evaluación 5°', title: 'Cálculo de Fracciones' },
                  { m: 'Abr', d: '05', tag: 'Prueba Unidad', title: 'Geometría Áurea' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group cursor-pointer p-2 rounded-3xl hover:bg-white/5 transition-all">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/10 group-hover:bg-indigo-500 group-hover:border-indigo-400 transition-all duration-500">
                          <span className="text-[10px] font-black uppercase tracking-widest">{item.m}</span>
                          <span className="text-xl font-black">{item.d}</span>
                      </div>
                      <div className="flex-1">
                          <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{item.tag}</p>
                          <p className="text-base font-bold text-white mt-1">{item.title}</p>
                      </div>
                  </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
