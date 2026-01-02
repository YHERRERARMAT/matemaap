
import React, { useState, useRef, useMemo } from 'react';
import { Search, Sparkles, X, Upload, UserPlus, ClipboardList, AlertCircle, Check, Loader2, FileSpreadsheet, UserCircle2, GraduationCap, Save, BarChart3, TrendingUp, Target } from 'lucide-react';
import { summarizeStudentPerformance } from '../services/geminiService';
import { Student } from '../types';
import { COURSES } from '../constants';
import * as XLSX from 'xlsx';

interface StudentListProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

export const StudentList: React.FC<StudentListProps> = ({ students, setStudents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Modales
  const [showImportModal, setShowImportModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  
  // Formulario Manual
  const [manualStudent, setManualStudent] = useState({
    name: '',
    rut: '',
    grade: '5° Básico'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rut.includes(searchTerm)
  );

  const selectedStudent = useMemo(() => 
    students.find(s => s.id === selectedStudentId), 
    [students, selectedStudentId]
  );

  // Agrupar alumnos por curso
  const groupedStudents = useMemo(() => {
    const groups: Record<string, Student[]> = {};
    COURSES.forEach(course => {
      groups[course] = filteredStudents.filter(s => s.grade === course);
    });
    return groups;
  }, [filteredStudents]);

  const handleGenerateReport = async (student: Student) => {
    setLoadingAi(true);
    setAiSummary(null);
    setSelectedStudentId(student.id);
    
    const dataString = `
      Nivel: ${student.grade}, 
      Promedio General: ${student.averageScore}, 
      Asistencia: ${student.attendance}%, 
      Programa Integración Escolar (PIE): ${student.isPIE ? 'Sí' : 'No'},
      Apoderado: ${student.parentName}
    `;

    try {
      const summary = await summarizeStudentPerformance(student.name, dataString);
      setAiSummary(summary);
    } catch (error) {
      setAiSummary("Error al generar el análisis técnico. Reintente en unos momentos.");
    } finally {
      setLoadingAi(false);
    }
  };

  const formatRut = (value: string) => {
    const clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length <= 1) return clean;
    let result = clean.slice(-1);
    let rest = clean.slice(0, -1);
    result = '-' + result;
    let formattedBody = '';
    let count = 0;
    for (let i = rest.length - 1; i >= 0; i--) {
      formattedBody = rest[i] + formattedBody;
      count++;
      if (count === 3 && i !== 0) {
        formattedBody = '.' + formattedBody;
        count = 0;
      }
    }
    return formattedBody + result;
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudent.name || manualStudent.rut.length < 8) return;

    const newStudent: Student = {
      id: `manual-${Date.now()}`,
      rut: manualStudent.rut,
      name: manualStudent.name.toUpperCase(),
      grade: manualStudent.grade,
      attendance: 100,
      averageScore: 0.0,
      parentName: 'Por definir',
      parentEmail: '',
      parentPhone: '',
      isPIE: false,
      avatar: `https://picsum.photos/100/100?random=${students.length + 500}`,
    };

    setStudents(prev => [newStudent, ...prev]);
    setManualStudent({ name: '', rut: '', grade: '5° Básico' });
    setShowManualModal(false);
  };

  const processExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImport(true);
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const newStudents: Student[] = data.map((row: any, idx: number) => {
          const name = row.Nombre || row.nombre || row['Nombre Completo'] || row.Name || 'Sin Nombre';
          const rut = row.RUT || row.rut || row.Rut || row.Id || `TEMP-${idx}`;
          const grade = row.Curso || row.curso || row.Grade || '5° Básico';

          return {
            id: `imported-${Date.now()}-${idx}`,
            rut: rut.toString().trim(),
            name: name.toString().trim(),
            grade: grade.toString().trim(),
            attendance: 100,
            averageScore: 0.0,
            parentName: 'Por definir',
            parentEmail: '',
            parentPhone: '',
            isPIE: false,
            avatar: `https://picsum.photos/100/100?random=${idx + 200}`,
          };
        });

        setStudents(prev => [...prev, ...newStudents]);
        setShowImportModal(false);
      } catch (err) {
        alert("Error al procesar el archivo Excel.");
      } finally {
        setIsProcessingImport(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-6 h-full overflow-hidden flex flex-col animate-fade-in bg-slate-50/50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Matrícula</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Nómina oficial de la Escuela Las Quezadas.</p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 border border-indigo-100 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-sm"
            >
                <Upload size={16} /> Importar Lista
            </button>
            <button 
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all"
            >
                <UserPlus size={16} /> Ingreso Manual
            </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 flex-1 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-50 bg-white flex gap-4">
            <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por Nombre o RUT..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
            </div>
            <div className="flex items-center gap-3 px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-500 tracking-widest">
               <AlertCircle size={14} className="text-blue-500" /> {students.length} Total Matrícula
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
            {COURSES.map(course => {
              const studentsInCourse = groupedStudents[course];
              if (studentsInCourse.length === 0 && searchTerm) return null;

              return (
                <div key={course} className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                          <GraduationCap size={18} />
                       </div>
                       <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">{course}</h2>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                      {studentsInCourse.length} Alumnos
                    </span>
                  </div>

                  <div className="overflow-hidden border border-slate-100 rounded-[24px]">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Identidad</th>
                                <th className="px-6 py-4">RUT</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Análisis</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {studentsInCourse.length > 0 ? studentsInCourse.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={student.avatar} alt="" className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
                                            <div>
                                              <span className="font-bold text-slate-900 block text-xs">{student.name}</span>
                                              {student.isPIE && <span className="text-[8px] font-black uppercase text-blue-600">Apoyo PIE</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] font-mono text-slate-500">{student.rut}</td>
                                    <td className="px-6 py-4">
                                       <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                          <span className="text-[9px] font-black text-slate-400 uppercase">Activo</span>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleGenerateReport(student)}
                                            className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5 ml-auto"
                                        >
                                            <Sparkles size={16} />
                                            <span className="text-[10px] font-black uppercase">Análisis</span>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                              <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-xs italic">
                                  No hay alumnos registrados en este curso.
                                </td>
                              </tr>
                            )}
                        </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            
            <div className="py-10 text-center opacity-30">
               <p className="text-[8px] font-black tracking-[0.4em] text-slate-400">Creado por YherreraR</p>
            </div>
        </div>
      </div>

      {/* MODAL INGRESO MANUAL */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <UserCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Nuevo Alumno</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registro Individual</p>
                </div>
              </div>
              <button onClick={() => setShowManualModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleManualSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</label>
                <input 
                  type="text"
                  required
                  value={manualStudent.name}
                  onChange={(e) => setManualStudent({...manualStudent, name: e.target.value})}
                  placeholder="EJ: JUAN PEREZ SOTO"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RUT</label>
                  <input 
                    type="text"
                    required
                    maxLength={12}
                    value={manualStudent.rut}
                    onChange={(e) => setManualStudent({...manualStudent, rut: formatRut(e.target.value)})}
                    placeholder="12.345.678-9"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curso</label>
                  <select 
                    value={manualStudent.grade}
                    onChange={(e) => setManualStudent({...manualStudent, grade: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-50 transition-all appearance-none"
                  >
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
              >
                <Save size={18} /> Guardar Alumno
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE IMPORTACIÓN EXCEL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
              <div className="flex items-center gap-4">
                <FileSpreadsheet size={32} />
                <div>
                  <h3 className="text-xl font-bold">Carga Masiva</h3>
                  <p className="text-sm text-indigo-100 opacity-80">Importar nómina desde archivo Excel.</p>
                </div>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border-4 border-dashed border-slate-100 bg-slate-50/50 rounded-[40px] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
              >
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-800">Haz clic para seleccionar</h4>
                <p className="text-xs text-slate-400 mt-2">Columnas: Nombre, RUT, Curso</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={processExcelFile} 
                />
              </div>

              {isProcessingImport && (
                <div className="flex items-center justify-center gap-3 text-indigo-600 font-bold animate-pulse">
                  <Loader2 size={24} className="animate-spin" /> Procesando...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL REPORTE IA REDISEÑADO */}
      {selectedStudentId && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
            <div className="bg-white rounded-[48px] w-full max-w-2xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500 relative">
                {/* Header Premium */}
                <div className="p-10 border-b border-slate-100 flex justify-between items-start bg-indigo-600 text-white relative">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <BarChart3 size={120} />
                    </div>
                    <div className="flex gap-6 items-center relative z-10">
                        <img 
                          src={selectedStudent?.avatar} 
                          className="w-24 h-24 rounded-[32px] border-4 border-white/20 shadow-2xl object-cover" 
                          alt="" 
                        />
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-yellow-400 text-slate-900 text-[10px] font-black uppercase rounded-full tracking-widest shadow-lg">Informe QueZadin 360°</span>
                                <span className="text-indigo-100 text-[10px] font-black uppercase tracking-widest opacity-80">{selectedStudent?.grade}</span>
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{selectedStudent?.name}</h3>
                            <p className="text-indigo-100 text-xs mt-3 font-medium opacity-90 flex items-center gap-2">
                                <Target size={14} className="text-yellow-400" /> Preparado para el Profesor Yonathan Herrera
                            </p>
                        </div>
                    </div>
                    <button 
                      onClick={() => { setSelectedStudentId(null); setAiSummary(null); }} 
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all relative z-10"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-10 bg-slate-50/50">
                    {loadingAi ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-6">
                            <div className="relative">
                                <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles size={32} className="text-indigo-600 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-indigo-600 font-black uppercase text-xs tracking-[0.3em]">IA QueZadin</p>
                                <p className="text-slate-400 text-sm font-medium mt-1">Analizando trayectoria académica...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* KPI Quick Look */}
                            <div className="grid grid-cols-3 gap-6 mb-10">
                                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Promedio</p>
                                    <p className="text-2xl font-black text-slate-900">{selectedStudent?.averageScore}</p>
                                </div>
                                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asistencia</p>
                                    <p className="text-2xl font-black text-slate-900">{selectedStudent?.attendance}%</p>
                                </div>
                                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Programa</p>
                                    <p className="text-sm font-black text-indigo-600 uppercase mt-1">{selectedStudent?.isPIE ? 'Apoyo PIE' : 'Regular'}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-600">
                                    <TrendingUp size={64} />
                                </div>
                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Sparkles size={14} /> Análisis Pedagógico Estructurado
                                </h4>
                                <div className="text-slate-700 leading-relaxed space-y-4 text-sm font-medium whitespace-pre-line">
                                    {aiSummary}
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button 
                                  onClick={() => { setSelectedStudentId(null); setAiSummary(null); }} 
                                  className="flex-1 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                                >
                                  Cerrar Informe
                                </button>
                                <button 
                                  onClick={() => window.print()}
                                  className="px-8 py-5 bg-white text-slate-400 border-2 border-slate-100 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all"
                                >
                                  Exportar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Footer Modal */}
                <div className="p-6 bg-white border-t border-slate-50 text-center">
                    <p className="text-[9px] font-black text-slate-300 tracking-[0.4em] uppercase">Escuela Las Quezadas • Sistema de Gestión Académica</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
