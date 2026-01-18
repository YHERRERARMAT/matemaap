
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Sparkles, MessageSquare, Bot, User, ArrowUpRight, Inbox, Wand2, Loader2, UserCircle2, ChevronRight, Hash } from 'lucide-react';
import { PLANNING_DATA, COURSES } from '../constants';
import { Conversation, Message, Student } from '../types';
import { getTeacherCopilotReply } from '../services/geminiService';

interface CommunicationProps {
  selectedCourse: string;
  onSelectCourse: (course: string) => void;
  students: Student[];
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

export const Communication: React.FC<CommunicationProps> = ({ 
  selectedCourse, 
  onSelectCourse, 
  students,
  conversations,
  setConversations
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const student = students.find(s => s.id === conv.studentId);
      return student?.grade === selectedCourse;
    });
  }, [conversations, selectedCourse, students]);

  const pendingConversations = useMemo(() => {
    return filteredConversations.filter(conv => {
      const lastMsg = conv.messages[conv.messages.length - 1];
      return lastMsg && !lastMsg.isMine;
    });
  }, [filteredConversations]);

  const courseStats = useMemo(() => {
    return COURSES.reduce((acc, course) => {
      const chatsInCourse = conversations.filter(conv => {
        const student = students.find(s => s.id === conv.studentId);
        return student?.grade === course;
      });
      acc[course] = {
        total: chatsInCourse.length,
        unread: chatsInCourse.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
      };
      return acc;
    }, {} as Record<string, { total: number, unread: number }>);
  }, [conversations, students]);

  const activeConversation = conversations.find(c => c.id === selectedId);
  const activeStudent = activeConversation ? students.find(s => s.id === activeConversation.studentId) : null;
  const currentUnit = PLANNING_DATA.find(u => u.status === 'En Progreso' && u.grade === selectedCourse);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  useEffect(() => {
    if (selectedId) {
      const conv = conversations.find(c => c.id === selectedId);
      const student = students.find(s => s.id === conv?.studentId);
      if (student?.grade !== selectedCourse) {
        setSelectedId(null);
      } else {
        if (conv && conv.unreadCount > 0) {
          setConversations(prev => prev.map(c => 
            c.id === selectedId ? { ...c, unreadCount: 0 } : c
          ));
        }
      }
    }
  }, [selectedCourse, selectedId, students]);

  const handleSendMessage = (textOverride?: string, isAi = false) => {
    const text = textOverride || inputText;
    if (!text.trim() || !activeConversation) return;

    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      senderId: 'teacher',
      senderName: 'Prof. Yonathan Herrera',
      content: text,
      timestamp: new Date(),
      isMine: true,
      isAiGenerated: isAi
    };

    setConversations(prev => prev.map(c => {
      if (c.id === (isAi ? activeConversation.id : selectedId)) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: text,
          unreadCount: 0
        };
      }
      return c;
    }));
    if (!textOverride) setInputText('');
  };

  const handleAutoReplyAll = async () => {
    if (pendingConversations.length === 0 || isBulkProcessing) return;
    setIsBulkProcessing(true);
    for (const conv of pendingConversations) {
      const student = students.find(s => s.id === conv.studentId);
      if (!student) continue;
      const context = conv.messages.map(m => `${m.senderName}: ${m.content}`);
      const aiReply = await getTeacherCopilotReply(context, student, currentUnit);
      const newMessage: Message = {
        id: 'bulk-ai-' + Date.now() + Math.random(),
        senderId: 'teacher', senderName: 'Prof. Yonathan Herrera',
        content: aiReply, timestamp: new Date(), isMine: true, isAiGenerated: true
      };
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, messages: [...c.messages, newMessage], lastMessage: aiReply, unreadCount: 0 } : c));
      await new Promise(r => setTimeout(r, 600));
    }
    setIsBulkProcessing(false);
  };

  const handleMagicDraft = async () => {
    if (!activeConversation || !activeStudent) return;
    setIsAiLoading(true);
    const context = activeConversation.messages.map(m => `${m.senderName}: ${m.content}`);
    const draft = await getTeacherCopilotReply(context, activeStudent, currentUnit);
    setInputText(draft);
    setIsAiLoading(false);
  };

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* BARRA LATERAL DE CURSOS: Estilo alineado con Sidebar Institucional */}
      <div className="w-64 bg-slate-50 flex flex-col border-r border-slate-200 z-20 shrink-0">
        <div className="p-8 border-b border-slate-200">
           <div className="flex items-center gap-3 text-slate-900 mb-2">
              <Inbox size={18} className="text-indigo-600" />
              <h2 className="font-black text-[10px] uppercase tracking-[0.3em]">Cursos Activos</h2>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 space-y-2 px-4 custom-scrollbar">
          {COURSES.map(course => {
            const isActive = selectedCourse === course;
            const stats = courseStats[course];
            return (
              <button
                key={course}
                onClick={() => onSelectCourse(course)}
                className={`w-full flex items-center justify-between p-4 rounded-[20px] transition-all duration-300 group ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                    : 'text-slate-400 hover:bg-white hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full transition-all ${isActive ? 'bg-indigo-400 scale-125' : 'bg-slate-200 group-hover:bg-slate-400'}`}></div>
                  <span className="font-black text-[10px] uppercase tracking-widest">{course}</span>
                </div>
                {stats.total > 0 && (
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {stats.total}
                    </span>
                    {stats.unread > 0 && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTADO DE CHATS: Diseño de Muro de Actividad */}
      <div className="w-80 md:w-96 bg-white border-r border-slate-100 flex flex-col z-10 shrink-0">
        <div className="p-8 border-b border-slate-100 space-y-6 bg-white sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{selectedCourse.split(' ')[0]}</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Canal Docente</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
              {filteredConversations.length} CONVERSACIONES
            </div>
          </div>

          {pendingConversations.length > 0 && (
            <button 
              onClick={handleAutoReplyAll}
              disabled={isBulkProcessing}
              className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
            >
              {isBulkProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  <Wand2 size={16} className="group-hover:rotate-12 transition-transform" /> 
                  Auto-Responder ({pendingConversations.length})
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conv => {
              const student = students.find(s => s.id === conv.studentId);
              const isActive = selectedId === conv.id;
              const isPending = conv.messages[conv.messages.length - 1] && !conv.messages[conv.messages.length - 1].isMine;
              
              return (
                <div 
                  key={conv.id} 
                  onClick={() => setSelectedId(conv.id)} 
                  className={`p-6 border-b border-slate-50 cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                    isActive ? 'bg-white shadow-md z-10' : 'hover:bg-white'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600"></div>}
                  <div className="flex gap-5">
                    <div className={`w-14 h-14 rounded-[22px] shrink-0 flex items-center justify-center font-black text-xl shadow-sm transition-transform duration-500 group-hover:scale-105 ${
                      isActive ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {conv.parentName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-slate-900 truncate text-[11px] uppercase tracking-tight">{conv.parentName}</h4>
                        {isPending && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full shadow-lg shadow-orange-200"></div>
                        )}
                      </div>
                      <p className="text-[9px] text-indigo-600 font-black truncate uppercase tracking-widest mb-2 opacity-70">
                        {student?.name}
                      </p>
                      <p className={`text-xs line-clamp-2 leading-snug transition-colors ${isPending ? 'text-slate-900 font-bold italic' : 'text-slate-400 font-medium'}`}>
                        "{conv.lastMessage}"
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center opacity-40">
               <MessageSquare size={48} className="mb-4 text-slate-200" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sin actividad reciente</p>
            </div>
          )}
        </div>
      </div>

      {/* ÁREA DE CONVERSACIÓN: Estilo Burbujas Áureas */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {activeConversation && activeStudent ? (
          <>
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md z-20 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-[24px] bg-slate-900 flex items-center justify-center text-white shadow-2xl shadow-slate-200 transform transition-transform hover:rotate-3">
                    <UserCircle2 size={28} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white"></div>
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-xl uppercase tracking-tighter leading-none">{activeConversation.parentName}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                    <Hash size={12} className="text-indigo-600" /> {activeStudent.name}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleMagicDraft}
                  disabled={isAiLoading}
                  className="flex items-center gap-3 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100 active:scale-95 group"
                >
                  <Sparkles size={16} className="group-hover:rotate-12 transition-transform" /> 
                  {isAiLoading ? 'Redactando...' : 'Copiloto IA'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-slate-50/20 custom-scrollbar">
              {activeConversation.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  <div className={`max-w-[80%] md:max-w-[70%] rounded-[32px] p-7 shadow-sm relative transition-all duration-500 ${
                    msg.isMine 
                      ? 'bg-slate-900 text-white rounded-tr-none shadow-xl shadow-slate-200' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-md'
                  }`}>
                    {msg.isAiGenerated && (
                      <div className="absolute -top-4 -left-4 bg-indigo-600 text-white p-2 rounded-full shadow-xl border-4 border-white animate-bounce-slow">
                        <Sparkles size={12} />
                      </div>
                    )}
                    <p className="text-[15px] font-medium leading-relaxed">{msg.content}</p>
                    <div className={`flex items-center gap-3 mt-4 pt-4 border-t ${msg.isMine ? 'border-white/10' : 'border-slate-50'}`}>
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${msg.isMine ? 'text-indigo-400' : 'text-slate-400'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${msg.isMine ? 'text-white/60' : 'text-slate-400'}`}>
                        {msg.isAiGenerated ? 'Propuesta Asistida' : msg.senderName.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-8 bg-white border-t border-slate-100">
                <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-[32px] border-2 border-slate-100 focus-within:border-indigo-500 focus-within:bg-white transition-all duration-500 shadow-inner">
                    <textarea 
                      value={inputText} 
                      onChange={(e) => setInputText(e.target.value)} 
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      placeholder="Redactar respuesta para el apoderado..." 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-3 px-2 resize-none max-h-40 font-medium placeholder:text-slate-300" 
                      rows={1} 
                    />
                    <button 
                      onClick={() => handleSendMessage()} 
                      disabled={!inputText.trim()} 
                      className="w-14 h-14 shrink-0 bg-indigo-600 text-white rounded-[22px] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-40 transition-all active:scale-90 flex items-center justify-center"
                    >
                      <Send size={24} className="transform -rotate-12 translate-x-0.5" />
                    </button>
                </div>
                <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-6 opacity-60 italic">
                  Las Quezadas • Comunicación Transparente
                </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-20 text-center animate-pulse">
             <div className="w-24 h-24 bg-slate-50 rounded-[44px] flex items-center justify-center mb-8 border-4 border-slate-100 shadow-inner">
                <Bot size={56} className="text-slate-100" />
             </div>
             <div className="max-w-xs space-y-4">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Canal Maestro Activo</span>
                <p className="text-sm font-medium text-slate-400 leading-relaxed uppercase tracking-tighter">
                  {isBulkProcessing 
                    ? `Ejecutando protocolo de respuesta automática para ${selectedCourse}...` 
                    : `Selecciona un hilo de conversación de ${selectedCourse} para iniciar el acompañamiento.`}
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
