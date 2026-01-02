
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Sparkles, Languages, MessageSquare, Bot, User, ChevronRight, Inbox, BookOpen, Wand2, Loader2, CheckCircle2 } from 'lucide-react';
import { INITIAL_CONVERSATIONS, PLANNING_DATA, COURSES } from '../constants';
import { Conversation, Message, Student } from '../types';
import { getTeacherCopilotReply } from '../services/geminiService';

interface CommunicationProps {
  selectedCourse: string;
  onSelectCourse: (course: string) => void;
  students: Student[];
}

export const Communication: React.FC<CommunicationProps> = ({ selectedCourse, onSelectCourse, students }) => {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filtrar las conversaciones por el curso seleccionado
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const student = students.find(s => s.id === conv.studentId);
      return student?.grade === selectedCourse;
    });
  }, [conversations, selectedCourse, students]);

  // Identificar conversaciones que necesitan respuesta (último mensaje no es del profesor)
  const pendingConversations = useMemo(() => {
    return filteredConversations.filter(conv => {
      const lastMsg = conv.messages[conv.messages.length - 1];
      return lastMsg && !lastMsg.isMine;
    });
  }, [filteredConversations]);

  // Calcular cantidad de chats por curso
  const courseStats = useMemo(() => {
    return COURSES.reduce((acc, course) => {
      const chatsInCourse = conversations.filter(conv => {
        const student = students.find(s => s.id === conv.studentId);
        return student?.grade === course;
      });
      acc[course] = {
        total: chatsInCourse.length,
        unread: chatsInCourse.reduce((sum, c) => sum + c.unreadCount, 0)
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
      }
    }
  }, [selectedCourse, selectedId, conversations, students]);

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
    
    // Procesamos cada conversación pendiente
    for (const conv of pendingConversations) {
      const student = students.find(s => s.id === conv.studentId);
      if (!student) continue;

      const context = conv.messages.map(m => `${m.senderName}: ${m.content}`);
      const aiReply = await getTeacherCopilotReply(context, student, currentUnit);

      const newMessage: Message = {
        id: 'bulk-ai-' + Date.now() + Math.random(),
        senderId: 'teacher',
        senderName: 'Prof. Yonathan Herrera',
        content: aiReply,
        timestamp: new Date(),
        isMine: true,
        isAiGenerated: true
      };

      setConversations(prev => prev.map(c => {
        if (c.id === conv.id) {
          return {
            ...c,
            messages: [...c.messages, newMessage],
            lastMessage: aiReply,
            unreadCount: 0
          };
        }
        return c;
      }));
      
      // Pequeño delay para no saturar visualmente
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
    <div className="flex h-full bg-slate-50 overflow-hidden">
      {/* BARRA LATERAL DE CURSOS */}
      <div className="w-64 bg-slate-900 flex flex-col border-r border-slate-800 z-20 shrink-0">
        <div className="p-6 border-b border-slate-800">
           <div className="flex items-center gap-3 text-white mb-2">
              <Inbox size={20} className="text-blue-400" />
              <h2 className="font-black text-xs uppercase tracking-widest">Mis Cursos</h2>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-1 px-3 custom-scrollbar">
          {COURSES.map(course => {
            const isActive = selectedCourse === course;
            const stats = courseStats[course];
            
            return (
              <button
                key={course}
                onClick={() => onSelectCourse(course)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-yellow-400' : 'bg-slate-600'}`}></div>
                  <span className="font-bold text-xs uppercase tracking-tighter">{course}</span>
                </div>
                {stats.total > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-black ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
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

      {/* LISTADO DE CHATS DEL CURSO SELECCIONADO */}
      <div className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 shrink-0">
        <div className="p-6 border-b border-slate-100 space-y-4 bg-white sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{selectedCourse}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Canal de Comunicación</p>
            </div>
            <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500">
              {filteredConversations.length} CHATS
            </div>
          </div>

          {pendingConversations.length > 0 && (
            <button 
              onClick={handleAutoReplyAll}
              disabled={isBulkProcessing}
              className="w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-indigo-700 hover:to-blue-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isBulkProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Procesando con IA...
                </>
              ) : (
                <>
                  <Wand2 size={16} className="group-hover:rotate-12 transition-transform" /> 
                  Auto-Responder {pendingConversations.length} Pendientes
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto bg-slate-50/20 custom-scrollbar">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conv => {
              const student = students.find(s => s.id === conv.studentId);
              const isActive = selectedId === conv.id;
              const isPending = conv.messages[conv.messages.length - 1] && !conv.messages[conv.messages.length - 1].isMine;
              
              return (
                <div 
                  key={conv.id} 
                  onClick={() => setSelectedId(conv.id)} 
                  className={`p-5 border-b border-slate-50 cursor-pointer transition-all hover:bg-white group relative ${
                    isActive ? 'bg-white border-l-4 border-l-blue-600 shadow-sm' : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105 ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {conv.parentName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className="font-black text-slate-900 truncate text-xs uppercase tracking-tighter">{conv.parentName}</h4>
                        {isPending && (
                          <span className="flex items-center gap-1 text-[8px] font-black text-orange-500 uppercase bg-orange-50 px-1.5 py-0.5 rounded">
                             Pendiente
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-blue-600 font-black truncate uppercase tracking-tighter">ALUMNO: {student?.name}</p>
                      <p className={`text-xs mt-1 line-clamp-1 italic font-medium leading-tight ${isPending ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                        "{conv.lastMessage}"
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-30">
               <MessageSquare size={48} className="mb-4 text-slate-300" />
               <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sin mensajes en este curso</p>
            </div>
          )}
        </div>
      </div>

      {/* ÁREA DE CONVERSACIÓN ACTIVA */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {activeConversation && activeStudent ? (
          <>
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg"><User size={24} /></div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg uppercase tracking-tighter">{activeConversation.parentName}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{activeStudent.name} • {selectedCourse}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleMagicDraft}
                  disabled={isAiLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                >
                  <Sparkles size={14} /> {isAiLoading ? 'Redactando...' : 'Borrador IA'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 custom-scrollbar">
              {activeConversation.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[75%] rounded-3xl p-5 shadow-sm relative ${
                    msg.isMine 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}>
                    {msg.isAiGenerated && (
                      <div className="absolute -top-3 -left-3 bg-yellow-400 text-slate-900 p-1.5 rounded-full shadow-md">
                        <Sparkles size={10} />
                      </div>
                    )}
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                    <p className={`text-[9px] mt-2 font-black uppercase tracking-widest ${msg.isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {msg.senderName} 
                      {msg.isAiGenerated && ' (Sugerido por IA)'}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
                <div className="flex gap-3 items-end bg-slate-50 p-3 rounded-3xl border border-slate-200 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                    <textarea 
                      value={inputText} 
                      onChange={(e) => setInputText(e.target.value)} 
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      placeholder="Escribe tu respuesta docente..." 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32 font-medium" 
                      rows={1} 
                    />
                    <button 
                      onClick={() => handleSendMessage()} 
                      disabled={!inputText.trim()} 
                      className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
                    >
                      <Send size={24} />
                    </button>
                </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-20 text-center uppercase font-black tracking-widest text-sm opacity-50">
             <div className="w-24 h-24 bg-slate-100 rounded-[40px] flex items-center justify-center mb-6">
                <Bot size={48} className="text-slate-200" />
             </div>
             {isBulkProcessing ? (
               <div className="flex flex-col items-center gap-4">
                  <Loader2 size={32} className="animate-spin text-indigo-500" />
                  <span>Procesando respuestas del curso...</span>
               </div>
             ) : (
               <span>Selecciona una conversación del nivel {selectedCourse}</span>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
