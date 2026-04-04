
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Users, 
  PieChart as PieChartIcon, 
  Download, 
  Printer, 
  ShieldCheck, 
  FileDown, 
  Target, 
  Activity,
  CheckCircle2,
  AlertCircle,
  Filter,
  Calendar,
  Layers,
  CalendarRange,
  ToggleLeft as ToggleIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Student } from '../types';
import { EscuelaInsignia } from './Insignia';
import { COURSES } from '../constants';
import * as XLSX from 'xlsx';

interface DirectorPanelProps {
  students: Student[];
}

const PERIODS = [
  { id: 'all', label: 'Año Completo 2026' },
  { id: 'mar', label: 'Marzo 2026 (Actual)' },
  { id: 's1', label: 'Primer Semestre' },
  { id: 's2', label: 'Segundo Semestre' }
];

const SUBJECTS = [
  'Matemáticas',
  'Lenguaje y Comunicación',
  'Ciencias Naturales',
  'Historia, Geografía y CS',
  'Inglés'
];

export const DirectorPanel: React.FC<DirectorPanelProps> = ({ students }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  // Filtros granulares para Reportes
  const [reportSubject, setReportSubject] = useState<string>(SUBJECTS[0]);
  const [reportStartDate, setReportStartDate] = useState<string>('2026-03-01');
  const [reportEndDate, setReportEndDate] = useState<string>('2026-12-15');
  const [includePieOnly, setIncludePieOnly] = useState<boolean>(false);
  const [excludePie, setExcludePie] = useState<boolean>(false);

  // Filtrado de estudiantes para el Dashboard (KPIs y Gráficos)
  const filteredStudents = useMemo(() => {
    if (courseFilter === 'all') return students;
    return students.filter(s => s.grade === courseFilter);
  }, [students, courseFilter]);

  // Estadísticas dinámicas
  const totalStudents = filteredStudents.length;
  const globalAverage = totalStudents > 0 
    ? (filteredStudents.reduce((acc, s) => acc + s.averageScore, 0) / totalStudents).toFixed(2)
    : '0.00';
  const piePercentage = totalStudents > 0 
    ? ((filteredStudents.filter(s => s.isPIE).length / totalStudents) * 100).toFixed(1)
    : '0.0';

  // Datos para gráficos
  const coverageData = useMemo(() => {
    const base = [
      { name: '4° Básico', coverage: 85, avg: 6.1 },
      { name: '5° Básico', coverage: 72, avg: 5.8 },
      { name: '6° Básico', coverage: 90, avg: 6.4 },
      { name: '7° Básico', coverage: 65, avg: 5.5 },
      { name: '8° Básico', coverage: 88, avg: 6.2 },
    ];
    if (courseFilter === 'all') return base;
    return base.filter(b => b.name === courseFilter);
  }, [courseFilter]);

  const pieData = [
    { name: 'Completado', value: 75, fill: '#10b981' },
    { name: 'En Proceso', value: 15, fill: '#6366f1' },
    { name: 'Pendiente', value: 10, fill: '#f43f5e' },
  ];

  const exportReport = (title: string) => {
    setIsExporting(true);
    
    // Aplicar filtros granulares a la data de exportación
    let dataToExport = students;
    
    // 1. Filtro de curso activo en el dashboard
    if (courseFilter !== 'all') {
      dataToExport = dataToExport.filter(s => s.grade === courseFilter);
    }

    // 2. Filtro PIE
    if (includePieOnly) {
      dataToExport = dataToExport.filter(s => s.isPIE);
    } else if (excludePie) {
      dataToExport = dataToExport.filter(s => !s.isPIE);
    }

    const contextTag = courseFilter === 'all' ? 'Global' : courseFilter.replace(/\s/g, '_');
    const subjectTag = reportSubject.replace(/\s/g, '_');

    setTimeout(() => {
      const formattedData = dataToExport.map(s => ({
        RUT: s.rut,
        Nombre: s.name,
        Curso: s.grade,
        Asignatura: reportSubject,
        Promedio: s.averageScore,
        Asistencia: s.attendance + '%',
        PIE: s.isPIE ? 'SÍ' : 'NO',
        'Rango Desde': reportStartDate,
        'Rango Hasta': reportEndDate
      }));

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte_F413");
      XLSX.writeFile(wb, `F413_Reporte_${title.replace(/\s/g, '_')}_${contextTag}_${subjectTag}_2026.xlsx`);
      setIsExporting(false);
    }, 1200);
  };

  return (
    <div className="p-10 lg:p-14 space-y-12 animate-fade-in bg-slate-50/30 min-h-full">
      
      {/* Header Institucional de Dirección */}
      <header className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-10">
        <div className="flex items-center gap-6">
          <EscuelaInsignia size={70} />
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Command Center</h1>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em] mt-2">Panel de Dirección Institucional • Escuela Las Quezadas</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all">
            <Printer size={16} /> Imprimir Todo
          </button>
        </div>
      </header>

      {/* BARRA DE FILTROS ESTRATÉGICA (DASHBOARD) */}
      <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl flex flex-col md:flex-row gap-8 items-center justify-between border border-white/10">
        <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1">
              <Filter size={12} /> Nivel Académico
            </label>
            <select 
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-2xl px-6 py-3 text-xs font-bold uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all w-full md:w-56"
            >
              <option value="all" className="bg-slate-900 text-white">Todos los Cursos</option>
              {COURSES.map(c => (
                <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1">
              <Calendar size={12} /> Periodo Académico
            </label>
            <select 
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-2xl px-6 py-3 text-xs font-bold uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all w-full md:w-56"
            >
              {PERIODS.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Contexto de Visualización</span>
          <p className="text-xl font-black text-white uppercase tracking-tighter mt-1">
            {courseFilter === 'all' ? 'Escuela Completa' : courseFilter}
          </p>
        </div>
      </div>

      {/* KPI Institucionales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Users, label: 'Matrícula Filtrada', val: totalStudents, color: 'indigo', desc: courseFilter === 'all' ? 'Total F-413' : `En ${courseFilter}` },
          { icon: TrendingUp, label: 'Promedio Segmento', val: globalAverage, color: 'emerald', desc: `Rendimiento ${periodFilter === 'all' ? 'Anual' : 'Seleccionado'}` },
          { icon: Activity, label: 'Cobertura Segmentada', val: '78%', color: 'blue', desc: 'Progreso en OA' },
          { icon: ShieldCheck, label: 'Población PIE', val: piePercentage + '%', color: 'amber', desc: 'Segmento Diferenciado' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-6 opacity-5 text-${kpi.color}-600`}><kpi.icon size={60} /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{kpi.label}</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{kpi.val}</p>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest opacity-60">{kpi.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <Target size={24} className="text-indigo-600" /> Monitoreo de Cobertura Curricular
            </h3>
            <button className="text-[10px] font-black uppercase text-indigo-600 border border-indigo-100 px-4 py-2 rounded-xl hover:bg-indigo-50">Ver Detalle por OA</button>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coverageData} layout="vertical">
                <CartesianGrid strokeDasharray="5 5" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} width={100} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="coverage" radius={[0, 12, 12, 0]} barSize={24}>
                  {coverageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.coverage > 80 ? '#10b981' : entry.coverage > 70 ? '#6366f1' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8 self-start">Estado Global OA</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  innerRadius={60} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value" 
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 w-full mt-6">
            {pieData.map(item => (
              <div key={item.name} className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                  <span className="text-slate-400">{item.name}</span>
                </div>
                <span className="text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REFINED REPORTING CENTER WITH GRANULAR FILTERS */}
      <div className="bg-slate-900 p-12 rounded-[50px] text-white shadow-3xl relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 pointer-events-none">
            <FileDown size={140} />
        </div>

        <div className="relative z-10 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Reporting Center F-413</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                Generación de informes inteligentes segmentados por parámetros granulares.
              </p>
            </div>
            <div className="flex gap-4">
               <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-2xl flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Curso Seleccionado:</span>
                  <span className="text-xs font-bold uppercase">{courseFilter === 'all' ? 'Escuela Completa' : courseFilter}</span>
               </div>
            </div>
          </div>

          {/* Granular Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-white/5 p-8 rounded-[32px] border border-white/10">
            
            {/* Subject Selector */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                <Layers size={14} /> Asignatura
              </label>
              <select 
                value={reportSubject}
                onChange={(e) => setReportSubject(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                <CalendarRange size={14} /> Rango Inicial
              </label>
              <input 
                type="date"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-xs font-bold outline-none"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                <CalendarRange size={14} /> Rango Final
              </label>
              <input 
                type="date"
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-xs font-bold outline-none"
              />
            </div>

            {/* PIE Filters */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                <ToggleIcon size={14} /> Segmento PIE
              </label>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setIncludePieOnly(false); setExcludePie(false); }}
                  className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all border ${!includePieOnly && !excludePie ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-white/10 text-slate-400'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => { setIncludePieOnly(true); setExcludePie(false); }}
                  className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all border ${includePieOnly ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-800 border-white/10 text-slate-400'}`}
                >
                  Solo PIE
                </button>
                <button 
                  onClick={() => { setExcludePie(true); setIncludePieOnly(false); }}
                  className={`flex-1 py-3 text-[9px] font-black uppercase rounded-xl transition-all border ${excludePie ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-800 border-white/10 text-slate-400'}`}
                >
                  Excluir
                </button>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              disabled={isExporting}
              onClick={() => exportReport("Cobertura Curricular")}
              className="px-8 py-5 bg-white/10 border border-white/10 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-3 group"
            >
              <FileText size={18} className="group-hover:scale-110 transition-transform" /> Cobertura de OA
            </button>
            <button 
              disabled={isExporting}
              onClick={() => exportReport("Diferenciado Academico")}
              className="px-8 py-5 bg-white/10 border border-white/10 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-3 group"
            >
              <Users size={18} className="group-hover:scale-110 transition-transform" /> Nómina Académica
            </button>
            <button 
              disabled={isExporting}
              onClick={() => exportReport("Asistencia y Retencion")}
              className="px-8 py-5 bg-white/10 border border-white/10 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-3 group"
            >
              <Activity size={18} className="group-hover:scale-110 transition-transform" /> Asistencia/Retención
            </button>
            <button 
              disabled={isExporting}
              onClick={() => exportReport("Consolidado Estrategico")}
              className="px-8 py-5 bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-900/40 transition-all flex items-center gap-3 relative overflow-hidden"
            >
              {isExporting && (
                 <div className="absolute inset-0 bg-indigo-500 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin" />
                 </div>
              )}
              <FileDown size={18} /> {isExporting ? 'Generando...' : 'Exportar Selección'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Strategico */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex items-center gap-6">
            <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[28px]"><CheckCircle2 size={32} /></div>
            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-tighter">Monitoreo Activo</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sincronización de datos en tiempo real con F-413.</p>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Alertas Críticas</span>
              <div className="flex items-center gap-2 text-red-500 font-black text-sm uppercase">
                 <AlertCircle size={14} /> {filteredStudents.filter(s => s.averageScore < 4).length} Alumnos en riesgo
              </div>
            </div>
         </div>
      </div>

    </div>
  );
};

const Loader2 = ({ size, className }: { size: number, className: string }) => (
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
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
