
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Trash2, BrainCircuit, User, BookCheck, Zap, ArrowUpRight, ExternalLink } from 'lucide-react';
import { getAiTutorResponse, getSuggestedReplies } from '../services/geminiService';

const COURSES = ['4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico'];

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ChatState {
  [key: string]: Message[];
}

interface QueZadinChatProps {
  course?: string;
  isLocked?: boolean; 
}

export const QueZadinChat: React.FC<QueZadinChatProps> = ({ course: initialCourse, isLocked = false }) => {
  const [activeCourse, setActiveCourse] = useState(initialCourse || '5° Básico');
  const [chatHistories, setChatHistories] = useState<ChatState>(
    COURSES.reduce((acc, c) => ({
      ...acc,
      [c]: [{ 
        id: '1', 
        role: 'bot', 
        text: `Hola, soy QueZadin. He configurado este espacio bajo la proporción áurea para tu máxima concentración. ¿Qué desafío matemático de ${c} resolveremos hoy?`,
        timestamp: new Date()
      }]
    }), {})
  );
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = chatHistories[activeCourse] || [];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    setSuggestions([]);

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: textToSend,
      timestamp: new Date()
    };

    setChatHistories(prev => ({
      ...prev,
      [activeCourse]: [...(prev[activeCourse] || []), userMsg]
    }));
    
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAiTutorResponse(activeCourse, "Tutoría Áurea", textToSend);
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'bot', 
        text: response,
        timestamp: new Date()
      };
      
      setChatHistories(prev => ({
        ...prev,
        [activeCourse]: [...(prev[activeCourse] || []), botMsg]
      }));

      const newSuggestions = await getSuggestedReplies(activeCourse, response);
      setSuggestions(newSuggestions);
      
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const lines = text.split('\n');

    return lines.map((line, i) => {
      const parts = line.split(urlRegex);
      return (
        <div key={i} className={`${i > 0 ? 'mt-4' : ''}`}>
          {parts.map((part, j) => {
            if (part.match(urlRegex)) {
              const isKhan = part.includes('khanacademy.org');
              let topicName = 'Recurso Académico';
              
              if (isKhan) {
                try {
                  const url = new URL(part);
                  topicName = `Khan Academy: ${url.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Práctica'}`;
                } catch (e) {}
              }

              return (
                <a 
                  key={j} 
                  href={part} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`flex items-center gap-4 p-5 my-4 rounded-[20px] border border-white/30 bg-white/10 hover:bg-white/25 transition-all group/link shadow-inner`}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white shrink-0 group-hover/link:scale-110 transition-transform">
                    {isKhan ? <BookCheck size={22} /> : <ExternalLink size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Sugerencia de Estudio</p>
                    <p className="font-bold text-sm truncate uppercase tracking-tight">{topicName}</p>
                  </div>
                  <ArrowUpRight size={18} className="opacity-50" />
                </a>
              );
            }
            return part ? <span key={j} className="text-sm font-medium leading-[1.618]">{part}</span> : null;
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden font-sans relative">
      {/* Background SVG Grid Lines - Subtly Natural */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none">
        <pattern id="math-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="20" cy="20" r="1" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#math-grid)" />
      </svg>
      
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 z-20 shrink-0 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-slate-900 rounded-[16px] flex items-center justify-center text-white shadow-xl transform -rotate-2">
              <BrainCircuit size={28} />
           </div>
           <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none">QueZadin Tutor</h2>
              <div className="flex items-center gap-2 mt-1.5">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">{activeCourse} • Matemáticas Áureas</p>
              </div>
           </div>
        </div>
        {!isLocked && (
          <button onClick={() => setChatHistories(prev => ({...prev, [activeCourse]: []}))} className="p-2.5 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-xl">
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 bg-transparent custom-scrollbar">
        {messages.map((msg, index) => {
          const isBot = msg.role === 'bot';
          const isLast = index === messages.length - 1;

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isBot ? 'items-start animate-in fade-in slide-in-from-left-8' : 'items-end animate-in fade-in slide-in-from-right-8'} duration-500 fill-mode-both`}
            >
              {/* Identity Label */}
              <div className={`mb-2 px-4 text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${isBot ? 'text-purple-600' : 'text-blue-600'}`}>
                {isBot ? <><Bot size={12}/> QueZadin</> : <>Tú <User size={12}/></>}
              </div>

              <div className={`max-w-[85%] flex gap-4 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar with Glow */}
                <div className={`w-12 h-12 rounded-[18px] shrink-0 flex items-center justify-center text-white shadow-2xl self-end mb-1 transform transition-transform hover:scale-110 ${
                  isBot 
                    ? 'bg-gradient-to-br from-violet-700 to-purple-900 shadow-purple-500/20' 
                    : 'bg-gradient-to-br from-cyan-500 to-blue-700 shadow-blue-500/20'
                }`}>
                  {isBot ? <Bot size={24} /> : <User size={24} />}
                </div>

                <div className="flex flex-col gap-4">
                  {/* Bubble: High Distinction Forms */}
                  <div className={`p-7 shadow-2xl transition-all relative overflow-hidden ${
                    isBot 
                      ? 'bg-gradient-to-br from-violet-600 to-purple-800 text-white rounded-[32px] rounded-bl-none shadow-purple-900/20 border-l-4 border-white/20' 
                      : 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-[32px] rounded-br-none shadow-blue-900/20 border-r-4 border-white/20'
                  }`}>
                    {/* Math corner decoration */}
                    <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                       <svg width="30" height="30" viewBox="0 0 100 100">
                          <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="4" />
                       </svg>
                    </div>

                    {renderMessageContent(msg.text)}
                    
                    <div className={`flex items-center gap-2 mt-4 opacity-40 text-[8px] font-black uppercase tracking-[0.2em] ${isBot ? 'justify-start' : 'justify-end'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Suggestions Chips - Visually Interactive */}
                  {isBot && isLast && suggestions.length > 0 && !isLoading && (
                    <div className="flex flex-wrap gap-2.5 pt-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(s)}
                          className="px-5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-xl active:scale-95 flex items-center gap-2 group"
                        >
                          <Zap size={12} className="text-yellow-500 group-hover:scale-125 transition-transform" />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col items-start animate-in fade-in slide-in-from-left-4 duration-300">
             <div className="mb-2 px-4 text-[9px] font-black uppercase tracking-[0.3em] text-purple-600 flex items-center gap-2">
                <Bot size={12}/> Pensando...
             </div>
             <div className="flex gap-4 items-end">
                <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-violet-700 to-purple-900 flex items-center justify-center text-white shadow-xl animate-pulse">
                  <BrainCircuit size={24} />
                </div>
                <div className="bg-white border border-slate-100 rounded-[32px] rounded-bl-none p-6 flex gap-2 items-center shadow-lg">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-purple-800 rounded-full animate-bounce"></span>
                </div>
             </div>
          </div>
        )}
        <div ref={scrollRef} className="h-8" />
      </div>

      {/* INPUT AREA - Geometric Perfection */}
      <div className="p-8 bg-white border-t border-slate-100 shrink-0 shadow-[0_-15px_50px_rgba(0,0,0,0.04)]">
        <div className="max-w-4xl mx-auto relative">
          {/* Subtle decoration */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-[0.05] pointer-events-none">
             <svg width="200" height="20" viewBox="0 0 200 20">
                <path d="M0,10 C50,-10 150,30 200,10" fill="none" stroke="black" strokeWidth="1" />
             </svg>
          </div>

          <div className="relative flex gap-5 items-end bg-slate-50 p-5 rounded-[35px] border-2 border-slate-100 focus-within:border-slate-900 focus-within:bg-white focus-within:ring-[20px] focus-within:ring-slate-900/5 transition-all shadow-sm">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
              placeholder={`Escribe tu duda matemática para QueZadin...`}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-5 resize-none max-h-40 font-medium placeholder:text-slate-300"
              rows={1}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`p-5 rounded-[25px] transition-all shadow-2xl flex items-center justify-center ${
                input.trim() && !isLoading
                  ? 'bg-slate-900 text-white hover:scale-110 active:scale-95 shadow-slate-200' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <Send size={24} />
            </button>
          </div>
          
          <div className="flex justify-between items-center mt-6 px-10 opacity-25">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Conexión Segura Las Quezadas</p>
             </div>
             <p className="text-[9px] font-black text-slate-500 uppercase italic tracking-tighter">Geometric Interface v4.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};
