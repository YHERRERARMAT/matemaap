import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, BrainCircuit, User, ArrowUpRight, Compass, RefreshCw, Sparkles, X, Volume2, Globe, Camera, ChevronDown, Check, Info, Lightbulb, Star } from 'lucide-react';
import { getAiTutorResponseStream, getSuggestedReplies, getAiTutorSpeech } from '../services/geminiService';
import { AVAILABLE_MODELS, AIModelId } from '../types';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  sources?: any[];
  modelUsed?: string;
  isThinking?: boolean;
}

export const QueZadinChat: React.FC<{course?: string; isLocked?: boolean}> = ({ course: initialCourse, isLocked = false }) => {
  const [activeCourse, setActiveCourse] = useState(initialCourse || '5° Básico');
  const [selectedModel, setSelectedModel] = useState<AIModelId>('gemini-3-flash-preview');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { 
        id: '1', 
        role: 'bot', 
        text: `¡Hola! Soy QueZadin. Estoy listo para ayudarte con las matemáticas de **${activeCourse}**. ¿Qué desafío tenemos hoy?`,
        timestamp: new Date(),
        modelUsed: 'Gemini 3 Flash'
      }
    ]);
  }, [activeCourse]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    setSuggestions([]);
    setInput('');
    setIsLoading(true);

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: new Date() };
    const botMsgId = (Date.now() + 1).toString();
    const modelConfig = AVAILABLE_MODELS.find(m => m.id === selectedModel);
    
    const botMsg: Message = { 
      id: botMsgId, 
      role: 'bot', 
      text: '', 
      timestamp: new Date(), 
      modelUsed: modelConfig?.label,
      isThinking: selectedModel.includes('pro') 
    };

    setMessages(prev => [...prev, userMsg, botMsg]);

    try {
      let fullResponse = "";
      let allSources: any[] = [];
      const stream = getAiTutorResponseStream(activeCourse, textToSend, selectedModel);
      
      getSuggestedReplies(activeCourse, textToSend).then(setSuggestions);

      for await (const chunk of stream) {
        fullResponse += chunk.text;
        if (chunk.sources) allSources = [...allSources, ...chunk.sources];
        
        setMessages(prev => {
          const newMessages = [...prev];
          const idx = newMessages.findIndex(m => m.id === botMsgId);
          if (idx !== -1) {
            newMessages[idx] = { ...newMessages[idx], text: fullResponse, sources: allSources, isThinking: false };
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 relative">
      {/* Header con Selector Áureo */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-4">
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors duration-500 ${selectedModel.includes('pro') ? 'bg-amber-500' : 'bg-indigo-600'}`}>
              <BrainCircuit size={20} />
           </div>
           <div className="relative">
              <button 
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex flex-col items-start px-2 py-1 hover:bg-slate-50 rounded-lg transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{currentModel?.label}</span>
                  <ChevronDown size={12} className={`text-slate-400 transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
                </div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{currentModel?.description}</span>
              </button>
              
              {showModelSelector && (
                <div className="absolute top-full left-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Selecciona el Cerebro de QueZadin</p>
                  </div>
                  {AVAILABLE_MODELS.map(model => (
                    <button
                      key={model.id}
                      onClick={() => { setSelectedModel(model.id); setShowModelSelector(false); }}
                      className={`w-full p-5 flex items-start gap-4 hover:bg-slate-50 transition-all text-left ${selectedModel === model.id ? 'bg-indigo-50/30' : ''}`}
                    >
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${model.id.includes('pro') ? 'bg-amber-500' : 'bg-indigo-600'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{model.label}</span>
                          {model.isNew && <span className="bg-emerald-500 text-[7px] font-black px-1.5 py-0.5 rounded text-white uppercase">Nuevo</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">{model.useCase}</p>
                      </div>
                      {selectedModel === model.id && <Check size={14} className="ml-auto text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           {!isLocked && (
             <button className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                <Info size={14} /> Guía de Uso
             </button>
           )}
           <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2 active:scale-95 transition-all">
              <Compass size={14} /> Misiones
           </button>
        </div>
      </div>

      {/* Area de Chat */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar relative">
        {messages.map((msg) => {
          const isBot = msg.role === 'bot';
          const isPro = msg.modelUsed?.toLowerCase().includes('pro');

          return (
            <div key={msg.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[85%] md:max-w-[70%] rounded-[32px] p-7 shadow-sm relative ${
                isBot 
                  ? `bg-white text-slate-800 border border-slate-100 rounded-bl-none ${isPro ? 'bot-glow-pro' : 'bot-glow-flash'}` 
                  : 'bg-indigo-600 text-white rounded-br-none shadow-xl shadow-indigo-100'
              }`}>
                {isBot && msg.modelUsed && (
                  <div className={`absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border border-white/20 shadow-sm flex items-center gap-1.5 ${
                    isPro ? 'bg-amber-500 text-white' : 'bg-slate-800 text-indigo-300'
                  }`}>
                    {isPro && <Star size={8} fill="currentColor" className="text-white" />}
                    {msg.modelUsed}
                  </div>
                )}

                {isBot && msg.isThinking && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 rounded-2xl border border-amber-100 animate-pulse">
                    <RefreshCw size={14} className="animate-spin text-amber-600" />
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Razonando Pasos Matemáticos...</span>
                  </div>
                )}

                <div className="prose prose-sm max-w-none text-sm font-medium leading-relaxed">
                  {msg.text || (isBot && !msg.isThinking && <div className="h-4 w-24 bg-slate-100 animate-pulse rounded"></div>)}
                </div>

                {isBot && msg.sources && msg.sources.length > 0 && (
                   <div className="mt-6 pt-4 border-t border-slate-50 space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Recursos de Refuerzo:</p>
                      {msg.sources.map((s, i) => s.web && (
                        <a key={i} href={s.web.uri} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100 group">
                          <span className="text-[11px] font-bold text-slate-700 truncate max-w-[85%] group-hover:text-indigo-600">{s.web.title}</span>
                          <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
                        </a>
                      ))}
                   </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && !messages[messages.length-1].text && (
          <div className="flex items-center gap-3 text-indigo-600 animate-pulse">
            <Sparkles size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">QueZadin está pensando...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 md:p-10 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto space-y-6">
          {suggestions.length > 0 && !isLoading && (
            <div className="flex flex-wrap gap-2 animate-in fade-in duration-500">
               {suggestions.map((s, idx) => (
                 <button 
                  key={idx} 
                  onClick={() => handleSend(s)}
                  className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 hover:bg-white transition-all shadow-sm"
                 >
                   {s}
                 </button>
               ))}
            </div>
          )}

          <div className="flex gap-4 items-end">
            <button className="w-14 h-14 shrink-0 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100">
              <Camera size={24} />
            </button>
            <div className="flex-1 bg-slate-50 rounded-[28px] border-2 border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all duration-500 shadow-inner px-6 py-2">
              <textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                placeholder="Pregúntale a QueZadin sobre fracciones, geometría..." 
                className="w-full bg-transparent border-none focus:ring-0 text-[15px] font-medium py-3 resize-none max-h-32" 
                rows={1} 
              />
            </div>
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`w-14 h-14 shrink-0 rounded-[24px] flex items-center justify-center text-white shadow-2xl transition-all active:scale-90 ${
                !input.trim() || isLoading ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 shadow-indigo-200'
              }`}
            >
              <Send size={24} className="transform -rotate-12 translate-x-0.5" />
            </button>
          </div>
          <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em]">
            MatemApp 360° • Potenciado por {currentModel?.label}
          </p>
        </div>
      </div>
    </div>
  );
};