
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, BrainCircuit, User, ArrowUpRight, ExternalLink, Map, Compass, RefreshCw, Sparkles, X, BookOpen, MessageCircle, Volume2, Globe, List, Play, Camera, Image as ImageIcon } from 'lucide-react';
import { getAiTutorResponseStream, getSuggestedReplies, getAiTutorSpeech } from '../services/geminiService';

const COURSES = ['4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico'];

const STUDY_TOPICS: Record<string, string[]> = {
  '4° Básico': ['Multiplicación y División', 'Fracciones iniciales', 'Patrones y Álgebra', 'Geometría plana'],
  '5° Básico': ['Números de hasta 6 cifras', 'Fracciones y Decimales', 'Áreas y Perímetros', 'Ecuaciones de un paso'],
  '6° Básico': ['Razones y Porcentajes', 'Álgebra y Funciones', 'Superficie y Volumen', 'Probabilidades'],
  '7° Básico': ['Números Enteros', 'Potencias', 'Geometría 3D', 'Estadística'],
  '8° Básico': ['Números Racionales', 'Teorema de Pitágoras', 'Ecuaciones e Inecuaciones', 'Funciones Lineales']
};

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isGuidedStep?: boolean;
  sources?: any[];
  imageUrl?: string;
}

interface ChatState {
  [key: string]: Message[];
}

export const QueZadinChat: React.FC<{course?: string; isLocked?: boolean}> = ({ course: initialCourse, isLocked = false }) => {
  const [activeCourse, setActiveCourse] = useState(initialCourse || '5° Básico');
  const [chatHistories, setChatHistories] = useState<ChatState>(
    COURSES.reduce((acc, c) => ({
      ...acc,
      [c]: [{ 
        id: '1', 
        role: 'bot', 
        text: `¡Hola! Soy QueZadin. ¿Qué desafío de matemáticas de **${c}** vamos a conquistar hoy?`,
        timestamp: new Date()
      }]
    }), {})
  );
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGuidedMode, setIsGuidedMode] = useState(false);
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  const messages = chatHistories[activeCourse] || [];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleVisualInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // En una implementación real enviaríamos esto a Gemini Vision
      handleSend(`He subido una imagen de mi cuaderno para que me ayudes con el ejercicio.`);
    }
  };

  const playSpeech = async (msgId: string, text: string) => {
    if (isSpeaking === msgId) {
      audioRef.current?.pause();
      setIsSpeaking(null);
      return;
    }
    
    setIsSpeaking(msgId);
    const base64Audio = await getAiTutorSpeech(text);
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      const decodeBase64 = (base64: string) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      };

      const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length / numChannels;
        const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
        for (let channel = 0; channel < numChannels; channel++) {
          const channelData = buffer.getChannelData(channel);
          for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
          }
        }
        return buffer;
      };

      const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsSpeaking(null);
      source.start();
    } else {
      setIsSpeaking(null);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    setSuggestions([]);
    setInput('');
    setIsLoading(true);

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: textToSend, 
      timestamp: new Date(),
      isGuidedStep: isGuidedMode
    };
    
    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = { id: botMsgId, role: 'bot', text: '', timestamp: new Date(), isGuidedStep: isGuidedMode, sources: [] };

    setChatHistories(prev => ({
      ...prev,
      [activeCourse]: [...(prev[activeCourse] || []), userMsg, botMsg]
    }));

    try {
      let fullResponse = "";
      let allSources: any[] = [];
      
      const stream = getAiTutorResponseStream(activeCourse, textToSend);
      getSuggestedReplies(activeCourse, textToSend).then(setSuggestions);

      for await (const chunk of stream) {
        fullResponse += chunk.text;
        if (chunk.sources) {
          const uniqueSources = chunk.sources.filter((s: any) => 
            !allSources.some((existing: any) => existing.web?.uri === s.web?.uri)
          );
          allSources = [...allSources, ...uniqueSources];
        }
        
        setChatHistories(prev => {
          const currentHistory = [...prev[activeCourse]];
          const lastIdx = currentHistory.length - 1;
          if (currentHistory[lastIdx].id === botMsgId) {
            currentHistory[lastIdx] = { 
              ...currentHistory[lastIdx], 
              text: fullResponse,
              sources: allSources
            };
          }
          return { ...prev, [activeCourse]: currentHistory };
        });
      }
    } catch (error) {
      console.error("Stream error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (msg: Message) => {
    const { text, role, sources } = msg;
    const isBot = role === 'bot';
    
    return (
      <div className="space-y-4">
        <div className={`prose prose-sm max-w-none font-medium leading-relaxed ${isBot ? 'text-white' : 'text-white'}`}>
          {text.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
          ))}
        </div>

        {isBot && sources && sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={14} className="text-purple-200" />
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-100">Búsqueda Inteligente</span>
            </div>
            <div className="flex flex-col gap-2">
              {sources.map((src, i) => (
                src.web && (
                  <a key={i} href={src.web.uri} target="_blank" rel="noopener" className="flex items-center justify-between p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group backdrop-blur-sm border border-white/10">
                    <span className="text-[10px] font-bold text-white truncate pr-4">{src.web.title || 'Ver referencia'}</span>
                    <ArrowUpRight size={14} className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                )
              ))}
            </div>
          </div>
        )}

        {isBot && text.length > 10 && (
          <button 
            onClick={() => playSpeech(msg.id, text)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
              isSpeaking === msg.id 
                ? 'bg-white text-purple-600 animate-pulse' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {isSpeaking === msg.id ? <RefreshCw size={14} className="animate-spin" /> : <Volume2 size={14} />} 
            {isSpeaking === msg.id ? 'Hablando...' : 'Escuchar QueZadin'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden relative transition-all duration-700 ${isGuidedMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
           <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center text-white shadow-xl ${isGuidedMode ? 'bg-purple-600 ring-4 ring-purple-100' : 'bg-slate-900 shadow-slate-200'}`}>
              <BrainCircuit size={24} />
           </div>
           <div className="text-left">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tutor de IA</h2>
              <span className="text-lg font-black text-slate-900 tracking-tighter">QueZadin Turbo</span>
           </div>
        </div>
        {!isLocked && (
          <button onClick={() => setShowTopicPicker(true)} className="px-5 py-2.5 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-100 flex items-center gap-2 hover:bg-purple-700 transition-all active:scale-95">
            <Compass size={14} /> Misiones de Estudio
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar relative z-10">
        {messages.map((msg, index) => {
          const isBot = msg.role === 'bot';
          const isLast = index === messages.length - 1;
          return (
            <div key={msg.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out`}>
              <div className={`max-w-[85%] md:max-w-[70%] flex gap-4 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 self-end ${isBot ? 'bg-purple-600 shadow-purple-200' : 'bg-blue-600 shadow-blue-200'}`}>
                  {isBot ? <Bot size={22} /> : <User size={22} />}
                </div>
                <div className={`flex flex-col gap-2 ${isBot ? 'items-start' : 'items-end'}`}>
                  <div className={`px-6 py-4 shadow-2xl transition-all duration-500 relative ${
                    isBot 
                      ? 'bg-purple-600 text-white rounded-[32px] rounded-bl-none shadow-purple-100' 
                      : 'bg-blue-600 text-white rounded-[32px] rounded-br-none shadow-blue-100'
                  }`}>
                    {renderMessageContent(msg)}
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-2">
                    {isBot ? 'QueZadin' : 'Alumno'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {isBot && isLast && suggestions.length > 0 && !isLoading && !isGuidedMode && (
                    <div className="flex flex-wrap gap-3 pt-4 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                      {suggestions.map((s, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => handleSend(s)} 
                          className="px-6 py-3 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50 hover:shadow-xl hover:shadow-purple-100 transition-all duration-300 active:scale-95 flex items-center gap-2 group whitespace-nowrap shadow-sm"
                        >
                          <Sparkles size={12} className="text-purple-400 group-hover:text-purple-600 group-hover:rotate-12 transition-transform" />
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
          <div className="flex items-center gap-3 animate-in fade-in duration-500">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
              <RefreshCw size={20} className="animate-spin" />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">Pensando en tu respuesta...</p>
          </div>
        )}
        <div ref={scrollRef} className="h-4" />
      </div>

      {/* Footer del Chat con botón de Cámara */}
      <div className="p-4 md:p-8 shrink-0 z-30 bg-white/95 backdrop-blur-2xl border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto flex gap-4 items-end">
          {/* Cámara / Visual Input */}
          <button 
            onClick={handleVisualInput}
            className="w-14 h-14 shrink-0 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-90 shadow-inner group"
          >
            <Camera size={24} className="group-hover:rotate-12 transition-transform" />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </button>

          <div className="flex-1 relative bg-slate-100 border-2 border-slate-100 focus-within:border-purple-400 focus-within:bg-white rounded-[28px] overflow-hidden transition-all shadow-inner">
            <textarea 
              value={input} onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}} 
              placeholder="Pregúntame lo que sea o sube una foto..." 
              className="w-full bg-transparent border-none focus:ring-0 text-sm px-7 py-5 resize-none font-medium placeholder:text-slate-400" 
              rows={1} 
            />
          </div>
          <button 
            onClick={() => handleSend()} 
            disabled={!input.trim() || isLoading} 
            className="w-16 h-16 shrink-0 bg-purple-600 rounded-[24px] text-white flex items-center justify-center shadow-2xl shadow-purple-200 hover:bg-purple-700 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? <RefreshCw size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </div>
        <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4">MatemApp 360° • Tutoría Inteligente</p>
      </div>

      {showTopicPicker && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-3xl overflow-hidden text-left animate-in zoom-in-95 duration-500">
            <div className="p-10 bg-purple-600 text-white relative">
              <button onClick={() => setShowTopicPicker(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"><X size={24}/></button>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Misiones de Estudio</h3>
              <p className="text-purple-100 text-xs font-bold uppercase tracking-widest opacity-80 leading-relaxed">Elige un tema y QueZadin te guiará paso a paso hacia la maestría.</p>
            </div>
            <div className="p-10 grid grid-cols-1 gap-4 bg-slate-50">
              {STUDY_TOPICS[activeCourse]?.map((topic, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setShowTopicPicker(false);
                    setIsGuidedMode(true);
                    handleSend(`¡Vamos! Quiero dominar la misión de **${topic}**.`);
                  }} 
                  className="p-6 bg-white border-2 border-slate-100 rounded-3xl text-left hover:border-purple-300 hover:bg-purple-50 group transition-all shadow-sm flex items-center justify-between"
                >
                  <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight group-hover:text-purple-700">{topic}</h4>
                  <Play size={16} className="text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
