
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Communication } from './components/Communication';
import { StudentList } from './components/StudentList';
import { Planning } from './components/Planning';
import { ParentPortal } from './components/ParentPortal';
import { QueZadinChat } from './components/QueZadinChat';
import { Login } from './components/Login';
import { ViewState, UserRole, AuthState, Student } from './types';
import { STUDENTS as INITIAL_STUDENTS } from './constants';

function App() {
  const [auth, setAuth] = useState<AuthState>({ user: null, role: null });
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<string>('5° Básico');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);

  const cleanRut = (r: string) => r.replace(/[^0-9kK]/g, '').toUpperCase();

  const handleLogin = (rutToLogin: string) => {
    const cleanedInput = cleanRut(rutToLogin);
    
    // RUT PROFESOR: 15.977.022-2 (YONATHAN MATÍAS HERRERA RAVELLO)
    if (cleanedInput === '159770222') {
      setAuth({ 
        user: { name: 'Yonathan Herrera', role: UserRole.TEACHER }, 
        role: UserRole.TEACHER 
      });
      setCurrentView('dashboard');
      return;
    }

    // Acceso para alumnos / apoderados
    const student = students.find(s => cleanRut(s.rut) === cleanedInput);
    if (student) {
      setAuth({ user: student, role: UserRole.STUDENT });
      setSelectedCourse(student.grade);
    } else {
      throw new Error('El RUT no se encuentra registrado en el sistema docente.');
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, role: null });
  };

  if (!auth.role) {
    return <Login onLogin={handleLogin} students={students} />;
  }

  // VISTA PARA ALUMNOS / APODERADOS
  if (auth.role === UserRole.STUDENT) {
    return (
      <ParentPortal 
        student={auth.user as Student} 
        onLogout={handleLogout} 
      />
    );
  }

  // VISTA PARA EL PROFESOR YONATHAN
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard selectedCourse={selectedCourse} students={students} />;
      case 'communication':
        return (
          <Communication 
            selectedCourse={selectedCourse} 
            onSelectCourse={setSelectedCourse} 
            students={students}
          />
        );
      case 'students':
        return <StudentList students={students} setStudents={setStudents} />;
      case 'planning':
        return <Planning />;
      case 'quezadin':
        return <QueZadinChat course={selectedCourse} />;
      default:
        return <Dashboard selectedCourse={selectedCourse} students={students} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView}
        selectedCourse={selectedCourse}
        onSelectCourse={setSelectedCourse}
        userRole={auth.role}
        onToggleRole={handleLogout}
        userName={auth.user?.name || ''}
      />
      <main className="flex-1 max-h-screen overflow-y-auto relative bg-white">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
