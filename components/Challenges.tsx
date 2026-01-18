
import React, { useState, useMemo } from 'react';
// Added HelpCircle to the imports from lucide-react
import { Lightbulb, Brain, Cpu, Star, ChevronRight, Sparkles, CheckCircle2, Trophy, Zap, Award, X, Milestone, Flame, Send, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

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
  expectedAnswer: string;
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
    expectedAnswer: '28'
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
    expectedAnswer: 'TOMAR(pan)'
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
    expectedAnswer: '21'
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
    expectedAnswer: 'calor'
  }
];

export const Challenges: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isCorrectMap, setIsCorrectMap] = useState<Record<string, boolean | null>>({});
  const [showHintMap, setShowHintMap] = useState<Record<string, boolean>>({});
  const [shakeId, setShakeId] = useState<string | null>(null);
  const streak = 5;

  const totalPoints = useMemo(() => 
    completedIds.reduce((acc, id) => acc + (CHALLENGES.find(c => c.id === id)?.points || 0), 0)
  , [completedIds]);

  const medals: Medal[] = [
    { id: 'm-lat', title: 'Explorador Lateral', description: 'Dominas soluciones creativas.', type: 'lateral', requirement: 'Completa un desafío de Pensamiento Lateral', icon: <Lightbulb size={32} />, color: 'bg-amber-500' },
    { id: 'm-log', title: 'Mente Lógica', description: 'Experto en deducción pura.', type: 'reasoning', requirement: 'Completa un desafío de Razonamiento Lógico', icon: <Brain size={32} />, color: 'bg-purple-600' },
    { id: 'm-com', title: 'Arquitecto de Código', description: 'Pensamiento algorítmico impecable.', type: 'computational', requirement: 'Completa un desafío Computacional', icon: <Cpu size={32} />, color: 'bg-blue-600' },
    { id: 'm-mast', title: 'Maestro Matemático', description: 'Máximo prestigio en Las Quezadas.', type: 'milestone', requirement: 'Alcanza 1000 puntos (Chispas)', icon: <Award size={32} />, color: 'bg-emerald-600' },
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

  const normalize = (str: string) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const handleVerify = (challenge: MathChallenge) => {
    const answer = userAnswers[challenge.id] || '';
    const normalizedUser = normalize(answer);
    const normalizedExpected = normalize(challenge.expectedAnswer);
    
    if (normalizedUser.includes(normalizedExpected) || normalizedExpected.includes(normalizedUser)) {
      setIsCorrectMap(prev => ({ ...prev, [challenge.id]: true }));
      if (!completedIds.includes(challenge.id)) {
        setCompletedIds(prev => [...prev, challenge.id]);
      }
    } else {
      setIsCorrectMap(prev => ({ ...prev, [challenge.id]: false }));
      setShakeId(challenge.id);
      setTimeout(() => setShakeId(null), 500);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-[24px] shadow-xl border border-orange-100">
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
            </div>
          </div>
        </div>
      </header>

      {/* Hall of Medals */}
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
                    <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${(earnedMedals.length / medals.length) * 100}%` }} />
                  </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {medals.map(medal => {
                    const isEarned = earnedMedals.includes(medal.id);
                    return (
                        <div key={medal.id} className={`flex flex-col items-center text-center p-8 rounded-[40px] transition-all duration-1000 border relative overflow-hidden ${
                            isEarned ? `${medal.color} text-white animate-golden-glow border-transparent scale-105 z-10 shadow-2xl` : 'bg-slate-50 text-slate-300 border-slate-100 grayscale opacity-40 grayscale-0 hover:opacity-100 cursor-help'
                        }`}>
                            <div className={`mb-6 w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 relative z-10 ${isEarned ? 'bg-white/20 shadow-inner' : 'bg-slate-100 shadow-sm'}`}>
                                {isEarned ? (
                                  <div className="animate-float">
                                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
                                    <div className="relative z-10 animate-icon-pulse">
                                      {medal.icon}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="opacity-50">{medal.icon}</div>
                                )}
                            </div>
                            <h4 className="text-[11px] font-black uppercase tracking-widest mb-2 relative z-10">{medal.title}</h4>
                            <p className="text-[9px] font-bold uppercase tracking-tighter opacity-80 leading-relaxed max-w-[120px] relative z-10">
                                {isEarned ? medal.description : `Req: ${medal.requirement}`}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
      </section>

      {/* Challenge Accordion Grid */}
      <div className="grid grid-cols-1 gap-8">
        {CHALLENGES.map((challenge) => {
          const isExpanded = expandedId === challenge.id;
          const isCompleted = completedIds.includes(challenge.id);
          const isCorrect = isCorrectMap[challenge.id];
          const isShaking = shakeId === challenge.id;
          const showHint = showHintMap[challenge.id];

          return (
            <div 
              key={challenge.id}
              className={`group relative bg-white rounded-[48px] border transition-all duration-500 overflow-hidden ${
                isExpanded ? 'shadow-3xl ring-4 ring-indigo-50 border-indigo-200' : 'hover:shadow-xl hover:-translate-y-1 border-slate-100'
              } ${isCompleted && !isExpanded ? 'border-emerald-100 bg-emerald-50/10' : ''} ${isShaking ? 'animate-shake' : ''}`}
            >
              <style>{`
                @keyframes shake {
                  0%, 100% { transform: translateX(0); }
                  25% { transform: translateX(-10px); }
                  75% { transform: translateX(10px); }
                }
                .animate-shake { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }
              `}</style>

              {/* Main Card Header (Clickable to Toggle) */}
              <div 
                onClick={() => toggleExpand(challenge.id)}
                className="p-10 cursor-pointer flex flex-col md:flex-row items-center md:items-center justify-between gap-8 relative z-10"
              >
                <div className="flex items-center gap-8 flex-1">
                  <div className={`p-6 rounded-[28px] shrink-0 transition-all duration-500 ${
                    isExpanded 
                      ? (challenge.type === 'lateral' ? 'bg-amber-500 text-white shadow-xl shadow-amber-100' : challenge.type === 'reasoning' ? 'bg-purple-600 text-white shadow-xl shadow-purple-100' : 'bg-blue-600 text-white shadow-xl shadow-blue-100')
                      : (challenge.type === 'lateral' ? 'bg-amber-50 text-amber-600' : challenge.type === 'reasoning' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600')
                  }`}>
                    {getIcon(challenge.type)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-slate-400">{getTypeLabel(challenge.type)}</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{challenge.title}</h3>
                    {!isExpanded && (
                      <p className="text-slate-500 text-sm font-medium mt-2 line-clamp-1">{challenge.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex gap-1.5 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                    {[...Array(3)].map((_, i) => <Star key={i} size={14} className={i < challenge.difficulty ? 'text-amber-500 fill-amber-500' : 'text-slate-200'} />)}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center"><Zap size={14} className="text-amber-400" /></div>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{challenge.points} Chispas</span>
                  </div>
                  <div className={`p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-indigo-600 transition-all ${isExpanded ? 'rotate-180 bg-indigo-50 text-indigo-600' : ''}`}>
                    <ChevronDown size={24} />
                  </div>
                </div>

                {isCompleted && !isExpanded && (
                  <div className="absolute top-4 right-10 flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 size={16} /> ¡Completado!
                  </div>
                )}
              </div>

              {/* Accordion Content */}
              <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="px-10 pb-10 space-y-12 border-t border-slate-100 pt-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-5 text-indigo-600"><HelpCircle size={80} /></div>
                      <p className="text-xl font-bold text-slate-800 leading-relaxed italic relative z-10">"{challenge.description}"</p>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2"><Zap size={14}/> Tu Desafío</h4>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter leading-tight uppercase">{challenge.question}</p>
                    </div>

                    {/* Interaction Area */}
                    <div className="space-y-6 pt-6">
                      {!isCompleted ? (
                        <div className="space-y-8">
                          <div className="relative group">
                            <input 
                              type="text"
                              value={userAnswers[challenge.id] || ''}
                              onChange={(e) => {
                                setUserAnswers({ ...userAnswers, [challenge.id]: e.target.value });
                                setIsCorrectMap({ ...isCorrectMap, [challenge.id]: null });
                              }}
                              placeholder="Escribe tu respuesta aquí..."
                              className={`w-full px-12 py-10 bg-slate-50 border-4 rounded-[40px] text-2xl font-black focus:bg-white outline-none transition-all ${
                                isCorrect === false ? 'border-red-500 ring-8 ring-red-50' : 
                                isCorrect === true ? 'border-emerald-500' : 'border-slate-100 focus:border-indigo-400'
                              }`}
                            />
                            <div className="absolute right-10 top-1/2 -translate-y-1/2">
                              {(userAnswers[challenge.id]?.length || 0) > 0 && (
                                <button 
                                  onClick={() => handleVerify(challenge)} 
                                  className="bg-indigo-600 text-white p-6 rounded-3xl shadow-2xl shadow-indigo-200 hover:scale-110 active:scale-95 transition-all flex items-center gap-3 font-black uppercase text-[10px] tracking-widest"
                                >
                                  Validar <Send size={24} />
                                </button>
                              )}
                            </div>
                          </div>

                          {isCorrect === false && (
                            <p className="text-red-500 font-black text-[10px] uppercase tracking-widest text-center animate-in slide-in-from-top-2">Esa respuesta no parece correcta... ¡Inténtalo de nuevo!</p>
                          )}

                          {!showHint ? (
                            <button 
                              onClick={() => setShowHintMap({ ...showHintMap, [challenge.id]: true })} 
                              className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[32px] text-[10px] font-black uppercase text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-3 group"
                            >
                              <Sparkles size={18} /> ¿Pista de QueZadin? (-50 Chispas)
                            </button>
                          ) : (
                            <div className="bg-indigo-50 border border-indigo-100 p-10 rounded-[40px] animate-in slide-in-from-top-2 flex gap-6">
                              <div className="p-4 bg-white rounded-2xl shadow-sm h-fit"><HelpCircle className="text-indigo-600" /></div>
                              <p className="text-lg text-indigo-900 font-bold italic leading-relaxed">"Psst... {challenge.hint}"</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-200 p-12 rounded-[48px] animate-in zoom-in duration-700 flex flex-col gap-8 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-12 opacity-5 text-emerald-600"><CheckCircle2 size={120} /></div>
                          <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg"><CheckCircle2 size={24} /></div>
                            <div>
                              <h4 className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.2em]">¡Excelente Razonamiento!</h4>
                              <p className="text-emerald-900 font-black text-3xl tracking-tighter mt-1 uppercase">Desafío Superado</p>
                            </div>
                          </div>
                          
                          <div className="bg-white/60 backdrop-blur-md p-8 rounded-[32px] border border-emerald-100">
                            <p className="text-emerald-900 font-bold text-xl leading-relaxed">{challenge.solution}</p>
                          </div>

                          <div className="flex items-center gap-6">
                             <div className="bg-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm border border-emerald-100">
                                <Trophy size={20} className="text-amber-500" />
                                <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">+{challenge.points} Chispas</span>
                             </div>
                             <button onClick={() => setExpandedId(null)} className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">Finalizar Actividad</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
