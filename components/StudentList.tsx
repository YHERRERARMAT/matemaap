
import React, { useState, useRef, useMemo } from 'react';
import { Search, Sparkles, X, Upload, UserPlus, AlertCircle, Loader2, FileSpreadsheet, GraduationCap, Save, FileWarning, Info, CheckCircle2, FileDown } from 'lucide-react';
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
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [importError, setImportError] = useState<{message: string, details?: string[]} | null>(null);
  
  const [manualStudent, setManualStudent] = useState({ name: '', rut: '', grade: '5° Básico' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rut.includes(searchTerm)
  );

  const groupedStudents = useMemo(() => {
    const groups: Record<string, Student[]> = {};
    COURSES.forEach(course => {
      groups[course] = filteredStudents.filter(s => s.grade === course);
    });
    return groups;
  }, [filteredStudents]);

  const downloadStudentReport = () => {
    // Preparar los datos para el Excel
    const dataToExport = students.map(s => ({
      'Nombre Completo': s.name,
      'RUT': s.rut,
      'Curso': s.grade,
      'Asistencia (%)': s.attendance,
      'Promedio General': s.averageScore,
      'Apoderado': s.parentName,
      'Email Apoderado': s.parentEmail,
      'Teléfono Apoderado': s.parentPhone,
      'Es PIE': s.isPIE ? 'Sí' : 'No'
    }));

    // Crear la hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    
    // Ajustar anchos de columna básicos
    const wscols = [
      { wch: 40 }, // Nombre
      { wch: 15 }, // RUT
      { wch: 15 }, // Curso
      { wch: 15 }, // Asistencia
      { wch: 15 }, // Promedio
      { wch: 25 }, // Apoderado
      { wch: 25 }, // Email
      { wch: 20 }, // Teléfono
      { wch: 10 }, // PIE
    ];
    ws['!cols'] = wscols;

    // Crear el libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nómina Estudiantes");

    // Generar archivo y descargar
    XLSX.writeFile(wb, `Nomina_Estudiantes_Las_Quezadas_${new Date().getFullYear()}.xlsx`);
  };

  const processExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    if (!validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setImportError({
        message: "Formato no soportado",
        details: ["El archivo debe ser Excel (.xlsx, .xls) o CSV."]
      });
      return;
    }

    setIsProcessingImport(true);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) throw new Error("El archivo está vacío.");

        const columnMap = {
          name: ['nombre', 'nombre completo', 'name', 'estudiante', 'alumno'],
          rut: ['rut', 'id', 'run', 'identificador'],
          grade: ['curso', 'grade', 'nivel', 'grado']
        };

        const firstRow = data[0];
        const keys = Object.keys(firstRow).map(k => k.toLowerCase().trim());
        
        const missing: string[] = [];
        if (!keys.some(k => columnMap.name.includes(k))) missing.push("Nombre");
        if (!keys.some(k => columnMap.rut.includes(k))) missing.push("RUT");
        if (!keys.some(k => columnMap.grade.includes(k))) missing.push("Curso");

        if (missing.length > 0) {
          setImportError({
            message: "Faltan columnas obligatorias",
            details: [`No detectamos las columnas: ${missing.join(", ")}`, "Asegúrate de que los encabezados estén en la primera fila."]
          });
          setIsProcessingImport(false);
          return;
        }

        const newStudents: Student[] = data.map((row, idx) => {
          const find = (opts: string[]) => {
            const k = Object.keys(row).find(key => opts.includes(key.toLowerCase().trim()));
            return k ? row[k] : null;
          };
          return {
            id: `imp-${Date.now()}-${idx}`,
            rut: (find(columnMap.rut) || '').toString(),
            name: (find(columnMap.name) || '').toString().toUpperCase(),
            grade: (find(columnMap.grade) || '5° Básico').toString(),
            attendance: 100, averageScore: 0.0, parentName: 'Por definir', parentEmail: '', parentPhone: '', isPIE: false,
            avatar: `https://picsum.photos/100/100?random=${idx + 100}`,
          };
        });

        setStudents(prev => [...prev, ...newStudents]);
        setShowImportModal(false);
      } catch (err: any) {
        setImportError({ message: "Error crítico", details: [err.message] });
      } finally {
        setIsProcessingImport(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-6 h-full overflow-hidden flex flex-col bg-slate-50/50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Gestión de Matrícula</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Escuela Las Quezadas • Nómina 2024</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={downloadStudentReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm"
          >
            <FileDown size={14} /> Descargar Reporte
          </button>
          <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Upload size={14} /> Importar Excel
          </button>
          <button onClick={() => setShowManualModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all">
            <UserPlus size={14} /> Nuevo Alumno
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
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
            {COURSES.map(course => (
              <div key={course} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                    <GraduationCap size={18} className="text-indigo-600" /> {course}
                  </h2>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    {groupedStudents[course].length} Alumnos
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedStudents[course].map(student => (
                    <div key={student.id} className="p-4 bg-white border border-slate-100 rounded-3xl flex items-center gap-4 hover:shadow-lg transition-all group">
                       <img src={student.avatar} className="w-12 h-12 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                       <div className="min-w-0">
                          <p className="font-black text-slate-900 text-[11px] truncate uppercase">{student.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-0.5">{student.rut}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* MODAL IMPORTACIÓN REFINADO */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><FileSpreadsheet size={24} /></div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Importar Nómina</h3>
                  <p className="text-[10px] font-black uppercase text-indigo-100 tracking-widest opacity-80">Procesador Inteligente de Excel</p>
                </div>
              </div>
              <button onClick={() => { setShowImportModal(false); setImportError(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="p-10 space-y-8">
              {importError && (
                <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-6 flex gap-4 animate-in slide-in-from-top-4">
                   <FileWarning className="text-red-500 shrink-0" size={24} />
                   <div>
                      <p className="font-black text-red-700 text-xs uppercase tracking-widest mb-1">{importError.message}</p>
                      {importError.details?.map((d, i) => <p key={i} className="text-xs text-red-600 font-medium">{d}</p>)}
                   </div>
                </div>
              )}

              <div 
                onClick={() => !isProcessingImport && fileInputRef.current?.click()}
                className={`border-4 border-dashed rounded-[48px] p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isProcessingImport ? 'opacity-50 cursor-wait' : 'hover:bg-slate-50 hover:border-indigo-400'
                } ${importError ? 'border-red-100' : 'border-slate-100'}`}
              >
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  {isProcessingImport ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                </div>
                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
                  {isProcessingImport ? 'Procesando Datos...' : 'Subir Archivo Excel'}
                </h4>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Formatos: .xlsx, .xls o .csv</p>
                
                <div className="mt-8 flex gap-2">
                   {['Nombre', 'RUT', 'Curso'].map(c => (
                     <span key={c} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">{c}</span>
                   ))}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={processExcelFile} />
              </div>

              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex gap-4 items-start">
                 <Info size={20} className="text-blue-500 shrink-0" />
                 <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest leading-relaxed">
                   Consejo: El sistema reconoce sinónimos. "Alumno" se mapeará a "Nombre" automáticamente.
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
