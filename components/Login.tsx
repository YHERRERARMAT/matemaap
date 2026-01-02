
import React, { useState } from 'react';
import { ShieldCheck, GraduationCap, UserCircle2, ArrowRight, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Student } from '../types';

interface LoginProps {
  onLogin: (rut: string) => void;
  students: Student[];
}

export const Login: React.FC<LoginProps> = ({ onLogin, students }) => {
  const [rut, setRut] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Validación de RUT chileno (Módulo 11)
  const validateRut = (rutStr: string) => {
    const clean = rutStr.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length < 8) return false;

    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);

    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDv = 11 - (sum % 11);
    const calculatedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();

    return dv === calculatedDv;
  };

  const formatRut = (value: string) => {
    const clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length === 0) return '';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatRut(input);
    setRut(formatted);
    setError('');

    const cleanLength = formatted.replace(/[^0-9kK]/g, '').length;
    if (cleanLength >= 8) {
      setIsValid(validateRut(formatted));
    } else {
      setIsValid(null);
    }
  };

  const handleLogin = async () => {
    const cleanInput = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    
    // Validar formato
    if (!validateRut(rut)) {
      setError('El RUT ingresado no tiene un formato válido.');
      setIsValid(false);
      return;
    }

    setIsLoading(true);
    setError('');

    // Simular un pequeño delay de red para feedback visual
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Verificar existencia (Profesor o Alumno)
      const isTeacher = cleanInput === '159770222';
      const isStudent = students.some(s => s.rut.replace(/[^0-9kK]/g, '').toUpperCase() === cleanInput);

      if (isTeacher || isStudent) {
        onLogin(rut);
      } else {
        throw new Error('El RUT no figura en la nómina oficial 2024.');
      }
    } catch (e: any) {
      setError(e.message);
      setIsValid(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-white rounded-[32px] mx-auto flex items-center justify-center shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500 ring-8 ring-white/5">
             <GraduationCap size={48} className="text-indigo-600" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">MatemApp</h1>
          <p className="text-slate-400 font-medium tracking-wide uppercase text-[10px]">Escuela Las Quezadas • Tutoría QueZadin</p>
        </div>

        <div className="bg-white rounded-[48px] p-10 shadow-3xl border border-white/10 relative overflow-hidden">
          <div className="mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Portal de Acceso</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">Ingresa tu identificador escolar para comenzar.</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">RUT Alumno o Profesor</label>
              <div className="relative">
                <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                  isValid === true ? 'text-emerald-500' : isValid === false ? 'text-red-500' : 'text-slate-300'
                }`}>
                  <UserCircle2 size={24} />
                </div>
                
                <input 
                  type="text"
                  value={rut}
                  onChange={handleChange}
                  placeholder="12.345.678-9"
                  maxLength={12}
                  className={`w-full pl-14 pr-14 py-5 bg-slate-50 border-2 rounded-[24px] text-xl font-bold text-slate-800 focus:bg-white transition-all outline-none ${
                    isValid === true 
                      ? 'border-emerald-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50' 
                      : isValid === false 
                        ? 'border-red-100 focus:border-red-500 focus:ring-4 focus:ring-red-50' 
                        : 'border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
                  }`}
                />

                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  {isValid === true && <CheckCircle2 className="text-emerald-500 animate-in zoom-in duration-300" size={24} />}
                  {isValid === false && <XCircle className="text-red-500 animate-in zoom-in duration-300" size={24} />}
                </div>
              </div>
              
              {error && (
                <div className="flex items-center gap-3 text-red-600 text-xs font-black uppercase tracking-tight bg-red-50 p-4 rounded-2xl border border-red-100 animate-in slide-in-from-top-2">
                  <AlertCircle size={18} /> {error}
                </div>
              )}
            </div>

            <button 
              onClick={handleLogin}
              disabled={isLoading || !isValid}
              className={`w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group ${
                isValid 
                  ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95' 
                  : 'bg-slate-100 text-slate-300'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Verificando...
                </>
              ) : (
                <>
                  Entrar al Aula Virtual <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="mt-12 pt-10 border-t border-slate-50 flex flex-col items-center gap-6">
             <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                <ShieldCheck size={14} /> Acceso Biométrico Compatible
             </div>
             <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest leading-loose">
                Plataforma de estudio segura para la Comunidad Educativa Las Quezadas.
             </p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
            <div className="flex justify-center gap-8 mb-4">
                <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Cursos</p>
                    <p className="text-sm font-bold text-white">4° - 8°</p>
                </div>
                <div className="w-px h-8 bg-slate-800"></div>
                <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Soporte</p>
                    <p className="text-sm font-bold text-white">24/7 IA</p>
                </div>
            </div>
            <p className="text-[9px] font-black text-slate-600 tracking-[0.5em] uppercase mt-8 opacity-40">Creado por YherreraR</p>
        </div>
      </div>
    </div>
  );
};
