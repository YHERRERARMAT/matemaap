
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Swords, 
  Timer, 
  Zap, 
  Trophy, 
  Flame, 
  Play, 
  RefreshCcw, 
  Award, 
  ChevronRight,
  Target,
  Crown,
  CheckCircle2
} from 'lucide-react';
import { Student } from '../types';

interface MathGamesProps {
  selectedCourse: string;
  students: Student[];
  isTeacherView?: boolean;
}

interface GameState {
  isActive: boolean;
  score: number;
  timeLeft: number;
  currentProblem: { a: number; b: number; op: string; result: number };
  combo: number;
}

export const MathGames: React.FC<MathGamesProps> = ({ selectedCourse, students, isTeacherView = true }) => {
  const [gameState, setGameState] = useState<GameState>({
    isActive: false,
    score: 0,
    timeLeft: 60,
    currentProblem: { a: 0, b: 0, op: '+', result: 0 },
    combo: 0
  });
  const [userAnswer, setUserAnswer] = useState('');
  const [gameEnded, setGameEnded] = useState(false);
  const [highScores] = useState<Array<{ name: string; score: number }>>([
    { name: 'SANTIAGO AHUMADA', score: 1250 },
    { name: 'JULIETA DÍAZ', score: 1100 },
    { name: 'MAXIMILIANO ASTORGA', score: 980 }
  ]);

  const generateProblem = useCallback(() => {
    const isAdvanced = selectedCourse.includes('7°') || selectedCourse.includes('8°');
    const a = Math.floor(Math.random() * (isAdvanced ? 15 : 10)) + 1;
    const b = Math.floor(Math.random() * (isAdvanced ? 12 : 10)) + 1;
    const op = 'x'; 
    return { a, b, op, result: a * b };
  }, [selectedCourse]);

  const startGame = () => {
    setGameState({
      isActive: true,
      score: 0,
      timeLeft: 60,
      currentProblem: generateProblem(),
      combo: 0
    });
    setGameEnded(false);
    setUserAnswer('');
  };

  useEffect(() => {
    let timer: any;
    if (gameState.isActive && gameState.timeLeft > 0) {
      timer = setInterval(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (gameState.timeLeft === 0 && gameState.isActive) {
      setGameState(prev => ({ ...prev, isActive: false }));
      setGameEnded(true);
    }
    return () => clearInterval(timer);
  }, [gameState.isActive, gameState.timeLeft]);

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(userAnswer);
    if (val === gameState.currentProblem.result) {
      const points = 100 + (gameState.combo * 10);
      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        combo: prev.combo + 1,
        currentProblem: generateProblem()
      }));
      setUserAnswer('');
    } else {
      setGameState(prev => ({ ...prev, combo: 0 }));
      setUserAnswer('');
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-700 max-w-[1400px] mx-auto overflow-y-auto h-full no-scrollbar">
      
      {/* HEADER LIMPIO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-2xl text-slate-900 border border-slate-200">
              <Swords size={32} />
            </div>
            Arena de Cálculo
          </h1>
          <p className="text-slate-400 font-bold uppercase mt-4 text-[10px] tracking-[0.3em]">Olimpiada Mensual • Escuela Las Quezadas</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white px-6 py-4 rounded-[28px] shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center border border-slate-100">
              <Target size={24} />
            </div>
            <div className="text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Misión Mensual</p>
              <p className="text-lg font-black text-slate-900 tracking-tighter uppercase">Multiplicación Blitz</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* AREA DE JUEGO (FONDO CLARO) */}
        <div className="lg:col-span-2 space-y-8">
          {!gameState.isActive && !gameEnded ? (
            <div className="bg-white rounded-[60px] p-16 text-center shadow-xl relative overflow-hidden group border border-slate-100">
              <div className="relative z-10 space-y-8">
                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto border border-slate-100">
                  <Play size={40} className="text-slate-900 fill-slate-900 ml-2" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">¿Listo para el Desafío?</h2>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-4">60 Segundos • Multiplicaciones • Puntos por Combo</p>
                </div>
                <button 
                  onClick={startGame}
                  className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-4 mx-auto"
                >
                  Iniciar Misión <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ) : gameState.isActive ? (
            <div className="bg-white rounded-[60px] p-12 shadow-xl border border-slate-100 relative overflow-hidden">
               <div className="flex justify-between items-start mb-16">
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 text-slate-900 px-8 py-4 rounded-[28px]">
                    <Timer size={24} className="text-slate-400" />
                    <span className="text-3xl font-black tracking-tighter w-12">{gameState.timeLeft}s</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Puntaje</p>
                    <p className="text-5xl font-black text-slate-900 tracking-tighter">{gameState.score}</p>
                  </div>
               </div>

               <div className="flex flex-col items-center gap-12">
                  <div className="flex items-center gap-8 md:gap-16">
                    <span className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter">{gameState.currentProblem.a}</span>
                    <span className="text-5xl md:text-7xl font-black text-blue-600">{gameState.currentProblem.op}</span>
                    <span className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter">{gameState.currentProblem.b}</span>
                    <span className="text-5xl md:text-7xl font-black text-slate-200">=</span>
                  </div>

                  <form onSubmit={checkAnswer} className="w-full max-w-sm relative">
                    <input 
                      autoFocus
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="?"
                      className="w-full text-center py-8 text-6xl font-black bg-slate-50 rounded-[40px] border border-slate-200 focus:border-blue-500 focus:bg-white outline-none transition-all"
                    />
                    {gameState.combo > 1 && (
                      <div className="absolute -right-12 -top-8 bg-blue-600 text-white px-4 py-2 rounded-2xl font-black text-sm animate-bounce shadow-lg">
                        COMBO x{gameState.combo}
                      </div>
                    )}
                  </form>
               </div>
            </div>
          ) : (
            <div className="bg-emerald-50 rounded-[60px] p-16 text-center shadow-xl relative overflow-hidden border border-emerald-100">
               <div className="relative z-10 space-y-8 text-emerald-900">
                  <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto border border-emerald-100 shadow-sm text-emerald-600">
                    <Award size={48} />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter">¡Misión Cumplida!</h2>
                    <p className="text-emerald-700 text-sm font-black uppercase tracking-widest mt-4">Has obtenido un excelente desempeño</p>
                  </div>
                  <div className="text-7xl font-black tracking-tighter">{gameState.score} PUNTOS</div>
                  <button 
                    onClick={startGame}
                    className="px-12 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-lg transition-all active:scale-95 flex items-center gap-4 mx-auto"
                  >
                    Intentar de Nuevo <RefreshCcw size={18} />
                  </button>
               </div>
            </div>
          )}

          {/* CARDS DE RECOMPENSA (BLANCAS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 border border-amber-100"><Zap size={28} /></div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Bonus Racha</h4>
              <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-tight">+50% puntos x 5 días</p>
            </div>
            <div className="p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100"><Trophy size={28} /></div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Premio Mes</h4>
              <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-tight">Insignia "Relámpago"</p>
            </div>
            <div className="p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100"><Award size={28} /></div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Estatus Áureo</h4>
              <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-tight">Misiones de QueZadin</p>
            </div>
          </div>
        </div>

        {/* SIDEBAR RANKING (LIMPIO) */}
        <div className="space-y-8">
          <div className="bg-white rounded-[48px] p-10 shadow-xl border border-slate-100">
            <h3 className="text-lg font-black uppercase tracking-tighter mb-8 flex items-center gap-3 text-slate-900">
              <Trophy className="text-amber-500" size={24} /> Hall of Fame
            </h3>
            
            <div className="space-y-6">
              {highScores.map((player, idx) => (
                <div key={idx} className="flex items-center gap-5 p-4 hover:bg-slate-50 rounded-3xl border border-transparent hover:border-slate-100 transition-all">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${
                     idx === 0 ? 'bg-amber-100 text-amber-600' : 
                     idx === 1 ? 'bg-slate-100 text-slate-400' : 
                     'bg-slate-50 text-slate-300'
                   }`}>
                     {idx + 1}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-xs font-black uppercase tracking-tight truncate text-slate-900">{player.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{player.score} Chispas</p>
                   </div>
                   {idx === 0 && <Flame size={18} className="text-orange-500" />}
                </div>
              ))}
            </div>

            <button className="w-full mt-10 py-5 bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-3xl font-black uppercase text-[9px] tracking-[0.4em] transition-all">Ver Ranking Completo</button>
          </div>

          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-6 flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={24} /> Desempeño Nivel
            </h3>
            <div className="space-y-6">
               <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span className="text-slate-400">Promedio Arena</span>
                    <span className="text-blue-600">642 pts</span>
                  </div>
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div className="h-full bg-blue-600 w-[64%]"></div>
                  </div>
               </div>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed italic">
                 +15% de velocidad este mes.
               </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
