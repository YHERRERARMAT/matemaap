
import React, { useState, useRef, useMemo } from 'react';
import { Search, Sparkles, X, Upload, UserPlus, AlertCircle, Loader2, FileSpreadsheet, GraduationCap, Save, FileWarning, Info, CheckCircle2, FileDown, FileText } from 'lucide-react';
import { summarizeStudentPerformance, processStudentDocument } from '../services/geminiService';
import { Student } from '../types';
import { COURSES } from '../constants';
import * as XLSX from 'xlsx';

interface StudentListProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

export const StudentList: React.FC<StudentListProps> = ({ students, setStudents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [importError, setImportError] = useState<{message: string, details?: string[]} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

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
    const dataToExport = students.map(s => ({
      'Nombre Completo': s.name,
      'RUT': s.rut,
      'Curso': s.grade,
      'Asistencia (%)': s.attendance,
      'Promedio General': s.averageScore,
      'Apoderado': s.parentName,
      'Es PIE': s.isPIE ? 'Sí' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nómina Estudiantes");
    XLSX.writeFile(wb, `Nomina_Las_Quezadas_2026.xlsx`);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleDocImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImport(true);
    setImportError(null);

    try {
      const base64 = await blobToBase64(file);
      const extractedData = await processStudentDocument(base64, file.type);
      
      const newStudents: Student[] = extractedData.map((data, idx) => ({
        id: `ai-imp-${Date.now()}-${idx}`,
        rut: data.rut || '00.000.000-0',
        name: (data.name || 'Alumno Desconocido').toUpperCase(),
        grade: data.grade || '5° Básico',
        attendance: 100,
        averageScore: 0.0,
        parentName: 'Por definir',
        parentEmail: '',
        parentPhone: '',
        isPIE: false,
        avatar: `https://picsum.photos/100/100?random=${idx + 200}`,
      }));

      setStudents(prev => [...prev, ...newStudents]);
      setShowImportModal(false);
    } catch (err: any) {
      setImportError({ message: "QueZadin no pudo leer el archivo", details: [err.message, "Asegúrate de que el archivo sea un PDF o imagen clara."] });
    } finally {
      setIsProcessingImport(false);
    }
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
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data: any[] = XLSX.utils.sheet_to_json(ws);
        const newStudents: Student[] = data.map((row, idx) => ({
          id: `imp-${Date.now()}-${idx}`,
          rut: (row.RUT || row.rut || '').toString(),
          name: (row.Nombre || row.nombre || '').toString().toUpperCase(),
          grade: (row.Curso || row.curso || '5° Básico').toString(),
          attendance: 100, averageScore: 0.0, parentName: 'Por definir', parentEmail: '', parentPhone: '', isPIE: false,
          avatar: `https://picsum.photos/100/100?random=${idx + 100}`,
        }));
        setStudents(prev => [...prev, ...newStudents]);
        setShowImportModal(false);
      } catch (err) {
        setImportError({ message: "Error al procesar Excel", details: ["Verifica el formato de las columnas."] });
      } finally { setIsProcessingImport(false); }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-6 h-full overflow-hidden flex flex-col bg-slate-50/50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Gestión de Matrícula</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Escuela Las Quezadas • Nómina 2026</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={downloadStudentReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm"
          >
            <FileDown size={14} /> Descargar Reporte
          </button>
          <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Upload size={14} /> Importar Datos
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

      {/* MODAL IMPORTACIÓN REFINADO CON SOPORTE PDF */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><Sparkles size={24} /></div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Importar Nómina Inteligente</h3>
                  <p className="text-[10px] font-black uppercase text-indigo-100 tracking-widest opacity-80">QueZadin procesará el contenido por ti</p>
                </div>
              </div>
              <button onClick={() => { setShowImportModal(false); setImportError(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="p-10 space-y-8">
              {importError && (
                <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-6 flex gap-4 animate-in slide-in-from-top-4">
                   <AlertCircle className="text-red-500 shrink-0" size={24} />
                   <div>
                      <p className="font-black text-red-700 text-xs uppercase tracking-widest mb-1">{importError.message}</p>
                      {importError.details?.map((d, i) => <p key={i} className="text-xs text-red-600 font-medium">{d}</p>)}
                   </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Opción PDF / Imagen (IA) */}
                <div 
                  onClick={() => !isProcessingImport && docInputRef.current?.click()}
                  className={`border-4 border-dashed rounded-[40px] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isProcessingImport ? 'opacity-50 cursor-wait' : 'hover:bg-indigo-50 hover:border-indigo-400 bg-slate-50'
                  }`}
                >
                  <div className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm relative">
                    {isProcessingImport ? <Loader2 size={28} className="animate-spin" /> : <FileText size={28} />}
                    <Sparkles size={14} className="absolute -top-1 -right-1 text-amber-500" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Importar PDF / Imagen</h4>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2 leading-relaxed">
                    QueZadin extraerá Nombres, RUTs y Cursos automáticamente.
                  </p>
                  <input type="file" ref={docInputRef} className="hidden" accept=".pdf,image/*" onChange={handleDocImport} />
                </div>

                {/* Opción Excel Tradicional */}
                <div 
                  onClick={() => !isProcessingImport && fileInputRef.current?.click()}
                  className={`border-4 border-dashed rounded-[40px] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isProcessingImport ? 'opacity-50 cursor-wait' : 'hover:bg-emerald-50 hover:border-emerald-400 bg-slate-50'
                  }`}
                >
                  <div className="w-16 h-16 bg-white text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <FileSpreadsheet size={28} />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Importar Excel / CSV</h4>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2 leading-relaxed">
                    Usa columnas: Nombre, RUT, Curso.
                  </p>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={processExcelFile} />
                </div>
              </div>

              {isProcessingImport && (
                <div className="flex flex-col items-center justify-center py-6 animate-pulse">
                   <div className="flex items-center gap-3 text-indigo-600">
                      <Sparkles className="animate-bounce" size={20} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">QueZadin está analizando y clasificando...</span>
                   </div>
                </div>
              )}

              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex gap-4 items-start">
                 <Info size={20} className="text-blue-500 shrink-0" />
                 <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest leading-relaxed">
                   QueZadin puede asignar el curso correspondiente basándose en el contenido del documento o agrupándolos inteligentemente por niveles detectados.
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
