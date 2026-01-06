
import React, { useState, useMemo, useEffect } from 'react';
import { Lightbulb, Brain, Cpu, Star, ChevronRight, Sparkles, CheckCircle2, HelpCircle, Trophy, Zap, Award, Hexagon, ShieldCheck, X, Milestone, Sun, Flame } from 'lucide-react';

interface MathChallenge {
  id: string;
  type: 'lateral' | 'reasoning' | 'computational';
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  points: number;
  question: string;
  hint: string;
  solution: string;
  visual?: string;
}

interface Medal {
  id: string;
  title: string;
  description: string;
  type: 'lateral' | 'reasoning' | 'computational' | 'milestone';
  requirement: string;
  icon: React.ReactNode;
  color: string;
}

const CHALLENGES: MathChallenge[] = [
  {
    id: 'c1',
    type: 'lateral',
    title: 'El Salto del Grillo',
    description: 'Un grillo quiere subir un pozo de 30 metros. Cada día sube 3 metros y cada noche resbala 2 metros.',
    difficulty: 2,
    points: 150,
    question: '¿En cuántos días saldrá el grillo del pozo?',
    hint: 'Piensa en lo que pasa el último día cuando está cerca del borde.',
    solution: '28 días. El día 28 sube los últimos 3 metros y llega al borde, por lo que no resbala esa noche.',
  },
  {
    id: 'c2',
    type: 'computational',
    title: 'Algoritmo del Sándwich',
    description: 'Debes dar instrucciones exactas a un robot para preparar un sándwich, pero el robot no sabe qué es "untar".',
    difficulty: 1,
    points: 100,
    question: 'Si solo tienes 3 comandos: TOMAR(x), PONER_SOBRE(x, y), MOVER_MANO(dir). ¿Cuál es el primer paso lógico?',
    hint: 'La descomposición es clave: antes de poner algo sobre otro, debes tenerlo en la mano.',
    solution: 'TOMAR(pan). Sin el objeto en la mano, no puedes realizar ninguna acción de ensamblaje.',
  },
  {
    id: 'c3',
    type: 'reasoning',
    title: 'Secuencia Prohibida',
    description: 'Encuentra el patrón oculto en esta serie numérica áurea.',
    difficulty: 3,
    points: 300,
    question: '¿Qué número sigue: 1, 1, 2, 3, 5, 8, 13...?',
    hint: 'Mira la relación entre los dos números anteriores.',
    solution: '21. Es la Sucesión de Fibonacci, donde cada número es la suma de los dos anteriores.',
  },
  {
    id: 'c4',
    type: 'lateral',
    title: 'Interruptores Ciegos',
    description: 'Hay 3 interruptores fuera de una habitación cerrada y 3 bombillas dentro. Solo puedes entrar una vez.',
    difficulty: 3,
    points: 450,
    question: '¿Cómo sabes qué interruptor enciende cada bombilla?',
    hint: 'La luz produce algo más que luminosidad: calor.',
    solution: 'Enciende el 1ero por 5 min y apágalo. Enciende el 2do y entra. La bombilla encendida es del 2do. La bombilla apagada pero caliente es del 1ero. La fría y apagada es del 3ero.',
  }
];

export const Challenges: React.FC = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<MathChallenge | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [streak, setStreak] = useState(5); // Simulación de racha de 5 días

  const totalPoints = useMemo(() => 
    completedIds.reduce((acc, id) => acc + (CHALLENGES.find(c => c.id === id)?.points || 0), 0)
  , [completedIds]);

  const medals: Medal[] = [
    { 
      id: 'm-lat', 
      title: 'Explorador Lateral', 
      description: 'Dominas soluciones creativas.', 
      type: 'lateral', 
      requirement: 'Completa un desafío de Pensamiento Lateral',
      icon: <Lightbulb size={32} />,
      color: 'bg-amber-500'
    },
    { 
      id: 'm-log', 
      title: 'Mente Lógica', 
      description: 'Experto en deducción pura.', 
      type: 'reasoning', 
      requirement: 'Completa un desafío de Razonamiento Lógico',
      icon: <Brain size={32} />,
      color: 'bg-purple-600'
    },
    { 
      id: 'm-com', 
      title: 'Arquitecto de Código', 
      description: 'Pensamiento algorítmico impecable.', 
      type: 'computational', 
      requirement: 'Completa un desafío Computacional',
      icon: <Cpu size={32} />,
      color: 'bg-blue-600'
    },
    { 
      id: 'm-mast', 
      title: 'Maestro Matemático', 
      description: 'Máximo prestigio en Las Quezadas.', 
      type: 'milestone', 
      requirement: 'Alcanza 1000 puntos (Chispas)',
      icon: <Award size={32} />,
      color: 'bg-emerald-600'
    },
  ];

  const earnedMedals = useMemo(() => {
    const earned: string[] = [];
    const completedChallenges = CHALLENGES.filter(c => completedIds.includes(c.id));
    
    if (completedChallenges.some(c => c.type === 'lateral')) earned.push('m-lat');
    if (completedChallenges.some(c => c.type === 'reasoning')) earned.push('m-log');
    if (completedChallenges.some(c => c.type === 'computational')) earned.push('m-com');
    if (totalPoints >= 1000) earned.push('m-mast');
    
    return earned;
  }, [completedIds, totalPoints]);

  const handleComplete = (id: string) => {
    if (!completedIds.includes(id)) {
      setCompletedIds([...completedIds, id]);
      // Trigger celebrate logic here if needed
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'lateral': return <Lightbulb className="text-amber-500" size={24} />;
      case 'reasoning': return <Brain className="text-purple-500" size={24} />;
      case 'computational': return <Cpu className="text-blue-500" size={24} />;
      default: return <Sparkles size={24} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lateral': return 'Pensamiento Lateral';
      case 'reasoning': return 'Razonamiento Lógico';
      case 'computational': return 'Pensamiento Computacional';
      default: return 'Desafío';
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-700 max-w-[1400px] mx-auto overflow-y-auto h-full no-scrollbar">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Laboratorio de Ingenio</h1>
          <p className="text-slate-400 font-bold uppercase mt-4 text-[10px] tracking-[0.3em]">Entrena tu mente • Supera los límites de la lógica</p>
        </div>
        <div className="flex gap-4 items-center">
          {/* Streak Indicator */}
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-[24px] shadow-xl border border-orange-100 group">
             <div className="animate-fire text-orange-500">
               <Flame size={24} fill="currentColor" />
             </div>
             <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none text-slate-400 mb-1">Racha</p>
                <p className="text-xl font-black leading-none text-slate-900 tracking-tighter">{streak} días</p>
             </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-amber-400/20 blur-xl group-hover:bg-amber-400/40 transition-all rounded-full"></div>
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white px-8 py-4 rounded-[24px] flex items-center gap-4 shadow-2xl border border-white/10 ring-2 ring-amber-500/20">
              <div className="p-2 bg-amber-500 rounded-xl animate-float">
                <Trophy size={22} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none text-amber-400 mb-1">Chispas</p>
                <p className="text-2xl font-black leading-none tracking-tighter">{totalPoints}</p>
              </div>
              <Sparkles className="absolute -top-1 -right-1 text-amber-400 animate-pulse" size={16} />
            </div>
          </div>
        </div>
      </header>

      {/* Hall of Medals Section */}
      <section className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-600 rotate-12">
            <Award size={120} />
        </div>
        <div className="relative z-10">
            <div className="flex justify-between items-center mb-10 px-2">
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                      <Milestone size={18} className="text-indigo-600" /> Salón de Logros
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tu progreso legendario en MatemApp</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                      {earnedMedals.length} de {medals.length} Medallas
                  </span>
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-1000" 
                      style={{ width: `${(earnedMedals.length / medals.length) * 100}%` }}
                    />
                  </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {medals.map(medal => {
                    const isEarned = earnedMedals.includes(medal.id);
                    return (
                        <div key={medal.id} className={`flex flex-col items-center text-center p-8 rounded-[40px] transition-all duration-1000 border relative overflow-hidden ${
                            isEarned 
                                ? `${medal.color} text-white animate-golden-glow border-transparent scale-105 z-10 shadow-2xl` 
                                : 'bg-slate-50 text-slate-300 border-slate-100 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 cursor-help'
                        }`}>
                            {isEarned && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                                <div className="w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,0.4)_0%,transparent_70%)] animate-rotate-slow">
                                  {[...Array(8)].map((_, i) => (
                                    <div 
                                      key={i} 
                                      className="absolute top-1/2 left-1/2 w-full h-[1px] bg-white origin-left"
                                      style={{ transform: `rotate(${i * 45}deg)` }}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className={`mb-6 w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 relative z-10 ${
                                isEarned ? 'bg-white/20 shadow-inner' : 'bg-slate-100 shadow-sm'
                            }`}>
                                {isEarned ? (
                                  <div className="animate-float">
                                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
                                    <div className="relative z-10 animate-icon-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                                      {medal.icon}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="opacity-50">{medal.icon}</div>
                                )}
                            </div>
                            
                            <h4 className="text-[11px] font-black uppercase tracking-widest leading-tight mb-2 relative z-10">{medal.title}</h4>
                            <p className="text-[9px] font-bold uppercase tracking-tighter opacity-80 leading-relaxed max-w-[120px] relative z-10">
                                {isEarned ? medal.description : `Req: ${medal.requirement}`}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
      </section>

      {/* Grid de Desafíos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {CHALLENGES.map((challenge) => (
          <div 
            key={challenge.id}
            onClick={() => { setSelectedChallenge(challenge); setShowSolution(false); setShowHint(false); }}
            className={`group cursor-pointer relative bg-white p-10 rounded-[48px] border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${completedIds.includes(challenge.id) ? 'ring-4 ring-emerald-500/10 border-emerald-100' : ''}`}
          >
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-150 transition-transform duration-1000">
              {getIcon(challenge.type)}
            </div>

            <div className="flex justify-between items-start mb-8">
              <div className={`p-5 rounded-2xl shadow-sm ${
                challenge.type === 'lateral' ? 'bg-amber-50 text-amber-600' : 
                challenge.type === 'reasoning' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {getIcon(challenge.type)}
              </div>
              <div className="flex gap-1.5 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                {[...Array(3)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < challenge.difficulty ? 'text-amber-500 fill-amber-500' : 'text-slate-200'} 
                  />
                ))}
              </div>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-slate-400">{getTypeLabel(challenge.type)}</p>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter uppercase">{challenge.title}</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 line-clamp-2">
              {challenge.description}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
                  <Zap size={14} className="text-amber-400" />
                </div>
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{challenge.points} Chispas</span>
              </div>
              {completedIds.includes(challenge.id) ? (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-sm border border-emerald-100">
                  <CheckCircle2 size={16} /> Completado
                </div>
              ) : (
                <button className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:translate-x-1 transition-transform bg-indigo-50 px-5 py-2.5 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white">
                  Aceptar Reto <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Desafío Detallado con Efecto Confetti */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-2xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500 relative">
            <div className={`p-12 border-b border-slate-100 flex justify-between items-center text-white relative ${
              selectedChallenge.type === 'lateral' ? 'bg-amber-500' : 
              selectedChallenge.type === 'reasoning' ? 'bg-purple-600' : 'bg-blue-600'
            }`}>
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                {getIcon(selectedChallenge.type)}
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">{getTypeLabel(selectedChallenge.type)}</p>
                <h3 className="text-3xl font-black uppercase tracking-tighter">{selectedChallenge.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedChallenge(null)}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all relative z-10"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-12 space-y-10 overflow-y-auto max-h-[65vh] custom-scrollbar">
              <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 relative">
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100">
                  <HelpCircle size={20} className="text-slate-400" />
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">El Escenario</h4>
                <p className="text-xl font-bold text-slate-800 leading-relaxed italic">"{selectedChallenge.description}"</p>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      <Zap size={14} />
                   </div>
                   <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">Tu Desafío</h4>
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{selectedChallenge.question}</p>
              </div>

              <div className="flex flex-col gap-5 pt-4">
                {!showHint ? (
                  <button 
                    onClick={() => setShowHint(true)}
                    className="w-full py-5 border-2 border-dashed border-slate-200 rounded-3xl text-[10px] font-black uppercase text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-3 group"
                  >
                    <Sparkles size={18} className="group-hover:rotate-12 transition-transform" /> ¿Pista de QueZadin? (-50 Chispas)
                  </button>
                ) : (
                  <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[32px] animate-in slide-in-from-top-2 flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 text-white shadow-lg">
                      <Sparkles size={20} />
                    </div>
                    <p className="text-sm text-indigo-900 font-bold italic leading-relaxed">"Psst... {selectedChallenge.hint}"</p>
                  </div>
                )}

                {!showSolution ? (
                  <button 
                    onClick={() => { 
                      setShowSolution(true); 
                      handleComplete(selectedChallenge.id);
                    }}
                    className="w-full py-8 bg-slate-900 text-white rounded-[32px] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-slate-300 hover:bg-slate-800 transition-all flex items-center justify-center gap-4 group"
                  >
                    Resolver y Reclamar {selectedChallenge.points} Chispas
                    <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 p-10 rounded-[40px] animate-in slide-in-from-bottom-2 flex flex-col gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-600">
                      <CheckCircle2 size={100} />
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                        <CheckCircle2 size={16} />
                      </div>
                      <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Solución Maestra</h4>
                    </div>
                    <p className="text-emerald-900 font-black text-lg leading-relaxed relative z-10">{selectedChallenge.solution}</p>
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl inline-flex items-center gap-2 self-start relative z-10 border border-emerald-100">
                      <Trophy size={14} className="text-amber-500" />
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">+{selectedChallenge.points} Chispas ganadas</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 tracking-[0.5em] uppercase">Mente Afilada • Escuela Las Quezadas • {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
