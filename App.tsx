
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Communication } from './components/Communication';
import { StudentList } from './components/StudentList';
import { Planning } from './components/Planning';
import { ParentPortal } from './components/ParentPortal';
import { QueZadinChat } from './components/QueZadinChat';
import { Challenges } from './components/Challenges';
import { Login } from './components/Login';
import { EscuelaInsignia } from './components/Insignia';
import { ViewState, UserRole, AuthState, Student, Conversation } from './types';
import { STUDENTS as INITIAL_STUDENTS, INITIAL_CONVERSATIONS } from './constants';
import { Smartphone, Info, Loader2 } from 'lucide-react';

function App() {
  const [auth, setAuth] = useState<AuthState>({ user: null, role: null });
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<string>('5° Básico');
  
  // OPTIMIZACIÓN: Carga diferida de datos pesados
  const [students, setStudents] = useState<Student[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    // Simulamos una carga asíncrona para no bloquear el hilo principal durante el arranque
    const bootstrapData = async () => {
      // Pequeño retardo para permitir que el splash screen se vea y el navegador respire
      await new Promise(resolve => setTimeout(resolve, 800));
      setStudents(INITIAL_STUDENTS);
      setConversations(INITIAL_CONVERSATIONS);
      setIsDataLoaded(true);
    };
    bootstrapData();
  }, []);

  const cleanRut = (r: string) => r.replace(/[^0-9kK]/g, '').toUpperCase();

  const handleLogin = (rutToLogin: string) => {
    const cleanedInput = cleanRut(rutToLogin);
    // Acceso directo para el profesor Yonathan
    if (cleanedInput === '159770222') {
      setAuth({ user: { name: 'Yonathan Herrera', role: UserRole.TEACHER }, role: UserRole.TEACHER });
      setCurrentView('dashboard');
      return;
    }
    
    // Verificamos si el alumno existe en la base cargada
    const student = students.find(s => cleanRut(s.rut) === cleanedInput);
    if (student) {
      setAuth({ user: student, role: UserRole.STUDENT });
      setSelectedCourse(student.grade);
    } else {
      throw new Error('El RUT no se encuentra registrado en el sistema oficial.');
    }
  };

  const handleLogout = () => setAuth({ user: null, role: null });

  const previewStudent = useMemo(() => {
    if (students.length === 0) return null;
    return students.find(s => s.grade === selectedCourse) || students[0];
  }, [students, selectedCourse]);

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
  }, [conversations]);

  // Pantalla de Carga Inicial Institucional
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-500">
        <div className="animate-float">
          <EscuelaInsignia size={120} />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">MatemApp 360°</h1>
          <div className="flex items-center justify-center gap-3 text-indigo-400">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Hidratando Base de Datos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!auth.role) return <Login onLogin={handleLogin} students={students} />;
  
  if (auth.role === UserRole.STUDENT) return <ParentPortal student={auth.user as Student} onLogout={handleLogout} />;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard selectedCourse={selectedCourse} students={students} />;
      case 'communication': return (
        <Communication 
          selectedCourse={selectedCourse} 
          onSelectCourse={setSelectedCourse} 
          students={students} 
          conversations={conversations}
          setConversations={setConversations}
        />
      );
      case 'students': return <StudentList students={students} setStudents={setStudents} />;
      case 'planning': return <Planning />;
      case 'quezadin': return <QueZadinChat course={selectedCourse} />;
      case 'challenges': return <Challenges />;
      case 'parent_view':
        return (
          <div className="bg-slate-900 min-h-full flex flex-col items-center justify-center p-8 overflow-y-auto">
            <div className="max-w-xl w-full text-center mb-10">
               <div className="inline-flex items-center gap-3 px-6 py-2 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <Smartphone size={14} /> Modo Espejo Docente Activo
               </div>
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Vista de Apoderado</h2>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                 {previewStudent ? `Previsualizando la experiencia de ${previewStudent.name}` : 'Cargando datos de alumno...'}
               </p>
            </div>

            {/* IPHONE MOCKUP */}
            <div className="relative mx-auto border-slate-800 bg-slate-800 border-[14px] rounded-[3rem] h-[750px] w-[360px] shadow-2xl ring-1 ring-slate-700 overflow-hidden">
               <div className="h-[32px] w-[3px] bg-slate-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
               <div className="h-[46px] w-[3px] bg-slate-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
               <div className="h-[46px] w-[3px] bg-slate-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
               <div className="h-[64px] w-[3px] bg-slate-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
               
               {/* Notch */}
               <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-[70] pointer-events-none">
                  <div className="bg-slate-900 w-32 h-6 rounded-b-2xl"></div>
               </div>

               <div className="h-full w-full bg-white overflow-hidden relative">
                  {previewStudent && <ParentPortal student={previewStudent} onLogout={() => setCurrentView('dashboard')} />}
               </div>
            </div>

            <div className="mt-12 max-w-sm flex gap-4 p-6 bg-white/5 border border-white/10 rounded-3xl">
               <Info size={24} className="text-blue-400 shrink-0" />
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Esta vista permite al profesor validar que los anuncios y contenidos de la unidad se visualicen correctamente para los padres.
               </p>
            </div>
          </div>
        );
      default: return <Dashboard selectedCourse={selectedCourse} students={students} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar 
        currentView={currentView} onChangeView={setCurrentView}
        selectedCourse={selectedCourse} onSelectCourse={setSelectedCourse}
        userRole={auth.role} onToggleRole={handleLogout} userName={auth.user?.name || ''}
        unreadMessagesCount={totalUnreadCount}
      />
      <main className="flex-1 max-h-screen overflow-y-auto relative bg-white">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
