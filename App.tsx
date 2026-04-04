
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Communication } from './components/Communication';
import { StudentList } from './components/StudentList';
import { Planning } from './components/Planning';
import { ParentPortal } from './components/ParentPortal';
import { QueZadinChat } from './components/QueZadinChat';
import { Challenges } from './components/Challenges';
import { MathGames } from './components/MathGames';
import { Login } from './components/Login';
import { DirectorPanel } from './components/DirectorPanel';
import { ResourceGenerator } from './components/ResourceGenerator';
import { EscuelaInsignia } from './components/Insignia';
import { ViewState, UserRole, AuthState, Student, Conversation } from './types';
import { STUDENTS as INITIAL_STUDENTS, INITIAL_CONVERSATIONS } from './constants';
import { Smartphone, Info, Loader2 } from 'lucide-react';

function App() {
  const [auth, setAuth] = useState<AuthState>({ user: null, role: null });
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<string>('5° Básico');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const bootstrapData = async () => {
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
    
    // Director Login
    if (cleanedInput === '180011186') {
      setAuth({ user: { name: 'Director F-413', role: UserRole.DIRECTOR }, role: UserRole.DIRECTOR });
      setCurrentView('director_panel');
      return;
    }

    // Teacher Login
    if (cleanedInput === '159770222') {
      setAuth({ user: { name: 'Yonathan Herrera', role: UserRole.TEACHER }, role: UserRole.TEACHER });
      setCurrentView('dashboard');
      return;
    }
    
    // Student Login
    const student = students.find(s => cleanRut(s.rut) === cleanedInput);
    if (student) {
      setAuth({ user: student, role: UserRole.STUDENT });
      setSelectedCourse(student.grade);
    } else {
      throw new Error('El RUT no se encuentra registrado en el establecimiento.');
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
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Conectando a Red F-413...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!auth.role) return <Login onLogin={handleLogin} students={students} />;
  
  if (auth.role === UserRole.STUDENT) return <ParentPortal student={auth.user as Student} onLogout={handleLogout} />;

  const renderView = () => {
    switch (currentView) {
      case 'director_panel': return <DirectorPanel students={students} />;
      case 'dashboard': return <Dashboard selectedCourse={selectedCourse} students={students} />;
      case 'resource_generator': return <ResourceGenerator selectedCourse={selectedCourse} />;
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
      case 'math_arena': return <MathGames selectedCourse={selectedCourse} students={students} isTeacherView={true} />;
      case 'challenges': return <Challenges />;
      case 'parent_view':
        return (
          <div className="bg-slate-900 min-h-full flex flex-col items-center justify-center p-8 overflow-y-auto">
            <div className="relative mx-auto border-slate-800 bg-slate-800 border-[14px] rounded-[3rem] h-[750px] w-[360px] shadow-2xl ring-1 ring-slate-700 overflow-hidden">
               <div className="h-full w-full bg-white overflow-hidden relative">
                  {previewStudent && <ParentPortal student={previewStudent} onLogout={() => setCurrentView('dashboard')} />}
               </div>
            </div>
          </div>
        );
      default: return auth.role === UserRole.DIRECTOR ? <DirectorPanel students={students} /> : <Dashboard selectedCourse={selectedCourse} students={students} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView}
        selectedCourse={selectedCourse} 
        onSelectCourse={setSelectedCourse}
        userRole={auth.role} 
        onToggleRole={handleLogout} 
        userName={auth.user?.name || ''}
        unreadMessagesCount={totalUnreadCount}
      />
      <main className="flex-1 h-full overflow-hidden relative bg-white">
        <div className="h-full w-full overflow-y-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;
