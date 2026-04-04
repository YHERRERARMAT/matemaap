
import React, { useState } from 'react';
import { 
  LogIn,
  AlertCircle, 
  Loader2,
  Users,
  ShieldCheck
} from 'lucide-react';
import { Student, UserRole } from '../types';
import { EscuelaInsignia } from './Insignia';

interface LoginProps {
  onLogin: (rut: string) => void;
  students: Student[];
}

export const Login: React.FC<LoginProps> = ({ onLogin, students }) => {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatRut = (value: string) => {
    let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length > 9) clean = clean.slice(0, 9);
    if (clean.length < 2) return clean;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);
    let formatted = '';
    let j = 0;
    for (let i = body.length - 1; i >= 0; i--) {
      formatted = body[i] + (j > 0 && j % 3 === 0 ? '.' : '') + formatted;
      j++;
    }
    return `${formatted}-${dv}`;
  };

  const handleLogin = async (role: UserRole) => {
    if (!rut || !password) {
      setError('Campos incompletos.');
      setSelectedRole(role);
      return;
    }
    if (password !== '1234') {
      setError('Clave incorrecta (1234).');
      setSelectedRole(role);
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSelectedRole(role);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      onLogin(rut);
    } catch (err: any) {
      setError(err.message || 'RUT no registrado.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start pt-10 md:pt-16 p-4">
      <div className="w-full max-w-3xl">
        
        {/* Header Institucional Ultra-Compacto */}
        <div className="mb-6 text-center flex flex-col items-center justify-center">
          <EscuelaInsignia size={48} className="mb-1" />
          <h1 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none">MatemApp 360°</h1>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-[0.2em]">Escuela Las Quezadas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
          
          {/* Portal Alumnos / Apoderados */}
          <div className="bg-white rounded-[32px] shadow-lg shadow-blue-900/5 border-2 border-[#0070c0] overflow-hidden flex flex-col p-7 transition-all hover:scale-[1.01]">
            <div className="mb-5 flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-[#0070c0] rounded-xl"><Users size={20} /></div>
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Estudiantes</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Portal Apoderados</p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">RUT Estudiante:</label>
                <input 
                  type="text" 
                  value={selectedRole === UserRole.STUDENT ? rut : ''} 
                  onChange={(e) => { setRut(formatRut(e.target.value)); setSelectedRole(UserRole.STUDENT); }}
                  placeholder="Ej: 25.381.370-9"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-50 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña (1234):</label>
                <input 
                  type="password" 
                  value={selectedRole === UserRole.STUDENT ? password : ''}
                  onChange={(e) => { setPassword(e.target.value); setSelectedRole(UserRole.STUDENT); }}
                  placeholder="••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-50 outline-none"
                />
              </div>
              
              {error && selectedRole === UserRole.STUDENT && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 border border-red-100">
                  <AlertCircle size={12} className="shrink-0" />
                  <p className="text-[9px] font-bold uppercase">{error}</p>
                </div>
              )}

              <button 
                onClick={() => handleLogin(UserRole.STUDENT)}
                disabled={isLoading}
                className="w-full py-3.5 bg-[#0070c0] hover:bg-[#005ba1] text-white rounded-2xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading && selectedRole === UserRole.STUDENT ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                Ingresar
              </button>
            </div>
          </div>

          {/* Portal Docentes / Directivos */}
          <div className="bg-white rounded-[32px] shadow-lg shadow-blue-900/5 border-2 border-[#0070c0] overflow-hidden flex flex-col p-7 transition-all hover:scale-[1.01]">
            <div className="mb-5 flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-[#0070c0] rounded-xl"><ShieldCheck size={20} /></div>
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Docentes</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Panel Directivo</p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">RUT Docente:</label>
                <input 
                  type="text" 
                  value={selectedRole === UserRole.TEACHER ? rut : ''} 
                  onChange={(e) => { setRut(formatRut(e.target.value)); setSelectedRole(UserRole.TEACHER); }}
                  placeholder="Ej: 15.977.022-2"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-50 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña:</label>
                <input 
                  type="password" 
                  value={selectedRole === UserRole.TEACHER ? password : ''}
                  onChange={(e) => { setPassword(e.target.value); setSelectedRole(UserRole.TEACHER); }}
                  placeholder="••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-50 outline-none"
                />
              </div>

              {error && selectedRole === UserRole.TEACHER && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 border border-red-100">
                  <AlertCircle size={12} className="shrink-0" />
                  <p className="text-[9px] font-bold uppercase">{error}</p>
                </div>
              )}

              <button 
                onClick={() => handleLogin(UserRole.TEACHER)}
                disabled={isLoading}
                className="w-full py-3.5 bg-[#0070c0] hover:bg-[#005ba1] text-white rounded-2xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading && selectedRole === UserRole.TEACHER ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                Acceso
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
