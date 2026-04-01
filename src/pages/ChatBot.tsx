import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Send, User, Bot, ArrowLeft, Sparkles, History, Plus, MessageSquare, Trash2, MoreVertical, Phone, Video, Smile, Paperclip, Mic, Check, CheckCheck, Bell, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithAI } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

export const ChatBot: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('nexops_chat_sessions');
    let parsed: ChatSession[] = [];
    
    if (savedSessions) {
      parsed = JSON.parse(savedSessions);
    }

    // Add a demo reminder session if it doesn't exist
    const demoSessionId = 'demo-reminder-123';
    const hasDemo = parsed.some(s => s.id === demoSessionId);
    
    if (!hasDemo) {
      const demoSession: ChatSession = {
        id: demoSessionId,
        title: 'Clínica Nexops',
        createdAt: new Date().toISOString(),
        messages: [
          {
            role: 'model',
            content: '¡Hola Juan! 👋 Te escribo de **Clínica Nexops** para recordarte tu turno de mañana.\n\n📅 **Detalles del Turno:**\n- **Especialidad:** Cardiología\n- **Doctor:** Dr. Alejandro Sosa\n- **Fecha:** Mañana, 1 de Abril\n- **Hora:** 09:00 hs\n\n¿Podrías confirmarme si vas a asistir? \n\nPor favor, responde con el número de tu opción:\n1️⃣ **Confirmar asistencia**\n2️⃣ **Necesito reprogramar**\n3️⃣ **Cancelar turno**',
            timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          },
          {
            role: 'user',
            content: 'Hola, ¿puedo cambiar la hora?',
            timestamp: new Date(Date.now() - 3000000).toISOString() // 50 mins ago
          },
          {
            role: 'model',
            content: 'Claro Juan. Para mañana tenemos disponibilidad también a las **11:30 hs** o a las **15:00 hs**. \n\n¿Alguna de esas te queda bien?',
            timestamp: new Date(Date.now() - 2400000).toISOString() // 40 mins ago
          },
          {
            role: 'user',
            content: 'A las 15:00 hs me queda perfecto.',
            timestamp: new Date(Date.now() - 1800000).toISOString() // 30 mins ago
          },
          {
            role: 'model',
            content: '¡Excelente! He reprogramado tu turno.\n\n✅ **Turno Confirmado:**\n- **Fecha:** Mañana, 1 de Abril\n- **Hora:** 15:00 hs\n\n¿Necesitas algo más?',
            timestamp: new Date(Date.now() - 1200000).toISOString() // 20 mins ago
          }
        ]
      };
      parsed = [demoSession, ...parsed];
      localStorage.setItem('nexops_chat_sessions', JSON.stringify(parsed));
      
      // Auto-load demo on first time
      setCurrentSessionId(demoSessionId);
      setMessages(demoSession.messages);
    }

    setSessions(parsed);
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('nexops_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startNewChat = () => {
    const newId = Date.now().toString();
    setCurrentSessionId(newId);
    const initialMessage: Message = { 
      role: 'model', 
      content: '¡Hola! Soy el asistente virtual de **Clínica Nexops**. ¿En qué puedo ayudarte hoy?\n\nPuedo ayudarte a:\n- **Agendar un turno**\n- Consultar **especialidades**\n- Conocer a nuestros **doctores**', 
      timestamp: new Date().toISOString() 
    };
    setMessages([initialMessage]);
    setIsSidebarOpen(false);
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setIsSidebarOpen(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('nexops_chat_sessions', JSON.stringify(updated));
    if (currentSessionId === id) {
      setMessages([]);
      setCurrentSessionId(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = Date.now().toString();
      setCurrentSessionId(sessionId);
    }

    const userMessage: Message = { role: 'user', content: input, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAI(
        updatedMessages.map(m => ({ role: m.role, content: m.content })),
        input
      );
      
      const botMessage: Message = { 
        role: 'model', 
        content: response.text || "Lo siento, tuve un problema procesando tu solicitud.", 
        timestamp: new Date().toISOString() 
      };
      
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      // Update or create session in history
      setSessions(prev => {
        const existingIdx = prev.findIndex(s => s.id === sessionId);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], messages: finalMessages };
          return updated;
        } else {
          return [{
            id: sessionId!,
            title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
            messages: finalMessages,
            createdAt: new Date().toISOString()
          }, ...prev];
        }
      });

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "Hubo un error de conexión. Por favor, intenta de nuevo.", 
        timestamp: new Date().toISOString() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#E5DDD5] flex flex-col z-[100] md:flex-row font-sans">
      {/* Sidebar History (WhatsApp Style) */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth > 768) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`fixed md:relative z-50 w-80 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
              !isSidebarOpen && 'hidden md:flex'
            }`}
          >
            {/* Sidebar Header */}
            <div className="p-3 bg-[#F0F2F5] flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden cursor-pointer">
                <img src="https://picsum.photos/seed/admin/100/100" alt="Me" referrerPolicy="no-referrer" />
              </div>
              <div className="flex items-center gap-5 text-[#54656f]">
                <History size={20} className="cursor-pointer hover:text-gray-700" />
                <MessageSquare size={20} className="cursor-pointer hover:text-gray-700" onClick={startNewChat} />
                <MoreVertical size={20} className="cursor-pointer hover:text-gray-700" />
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1">
                  <ArrowLeft size={20} />
                </button>
              </div>
            </div>

            {/* Search Sidebar */}
            <div className="p-2 bg-white border-b border-gray-100">
              <div className="relative flex items-center bg-[#F0F2F5] rounded-lg px-3 py-1.5">
                <Search size={16} className="text-[#54656f] mr-4" />
                <input 
                  type="text" 
                  placeholder="Busca un chat o inicia uno nuevo" 
                  className="w-full bg-transparent text-sm focus:outline-none placeholder:text-[#667781]"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
              {sessions.length === 0 ? (
                <div className="text-center py-10 text-[#667781] text-sm">
                  No hay chats previos
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => loadSession(session)}
                    className={`group relative h-[72px] px-3 cursor-pointer transition-all flex items-center gap-3 ${
                      currentSessionId === session.id 
                        ? 'bg-[#F0F2F5]' 
                        : 'hover:bg-[#F5F6F6]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#dfe5e7] flex items-center justify-center text-[#54656f] flex-shrink-0 overflow-hidden">
                      {session.id === 'demo-reminder-123' ? (
                        <div className="w-full h-full bg-[#00a884] flex items-center justify-center text-white">
                          <Bell size={24} />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-[#dfe5e7] flex items-center justify-center">
                          <Bot size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 border-b border-gray-100 h-full flex flex-col justify-center pr-2">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[16px] font-normal text-[#111b21] truncate">{session.title}</p>
                        <p className="text-[12px] text-[#667781]">
                          {new Date(session.createdAt).toLocaleDateString() === new Date().toLocaleDateString() 
                            ? new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(session.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[14px] text-[#667781] truncate pr-4">
                          {session.messages[session.messages.length - 1]?.content.replace(/\n/g, ' ')}
                        </p>
                        <button 
                          onClick={(e) => deleteSession(e, session.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* WhatsApp Header */}
        <header className="bg-[#F0F2F5] p-3 flex items-center justify-between shadow-sm z-40 border-l border-gray-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1 text-gray-500"
            >
              <History size={20} />
            </button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                <Bot size={24} />
              </div>
              <div>
                <h1 className="font-medium text-gray-900 text-sm leading-tight">Asistente Nexops</h1>
                <p className="text-[11px] text-gray-500">en línea</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5 text-gray-500 mr-2">
            <Video size={20} className="cursor-pointer" />
            <Phone size={18} className="cursor-pointer" />
            <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>
            <Search size={20} className="cursor-pointer" />
            <MoreVertical size={20} className="cursor-pointer" />
          </div>
        </header>

        {/* Messages with WhatsApp Background */}
        <div 
          className="flex-1 overflow-y-auto p-4 md:px-12 md:py-6 space-y-2 relative"
          style={{ 
            backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
            backgroundSize: '400px',
            backgroundRepeat: 'repeat'
          }}
        >
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Encryption Notice */}
            <div className="flex justify-center mb-4">
              <div className="bg-[#FCF4CB] text-[11px] text-[#54656F] px-3 py-1.5 rounded-lg shadow-sm text-center max-w-xs">
                🔒 Los mensajes están cifrados de extremo a extremo. Nadie fuera de este chat puede leerlos.
              </div>
            </div>

            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                  <Bot size={64} />
                </div>
                <div className="max-w-md px-6">
                  <h2 className="text-3xl font-light text-[#41525d] mb-4">WhatsApp Nexops</h2>
                  <p className="text-[#667781] text-sm leading-relaxed">
                    Envía y recibe mensajes sin necesidad de tener tu teléfono conectado.<br/>
                    Usa WhatsApp en hasta 4 dispositivos vinculados y 1 teléfono a la vez.
                  </p>
                </div>
                <div className="mt-auto pt-20 text-[#8696a0] text-xs flex items-center gap-1">
                  🔒 Cifrado de extremo a extremo
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => {
              const showDateSeparator = idx === 0 || 
                new Date(messages[idx-1].timestamp).toLocaleDateString() !== new Date(msg.timestamp).toLocaleDateString();
              
              return (
                <React.Fragment key={idx}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-4">
                      <div className="bg-white text-[11px] text-[#54656f] px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">
                        {new Date(msg.timestamp).toLocaleDateString() === new Date().toLocaleDateString() ? 'Hoy' : 
                         new Date(msg.timestamp).toLocaleDateString() === new Date(Date.now() - 86400000).toLocaleDateString() ? 'Ayer' :
                         new Date(msg.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-1`}
                  >
                    <div className={`relative max-w-[85%] md:max-w-[65%] p-2 px-3 rounded-lg shadow-sm text-[14.2px] ${
                      msg.role === 'user' 
                        ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none' 
                        : 'bg-white text-[#111b21] rounded-tl-none'
                    }`}>
                      {/* Tail for bubbles */}
                      <div className={`absolute top-0 w-3 h-3 ${
                        msg.role === 'user' 
                          ? '-right-2 bg-[#d9fdd3] [clip-path:polygon(0_0,0_100%,100%_0)]' 
                          : '-left-2 bg-white [clip-path:polygon(100%_0,100%_100%,0_0)]'
                      }`}></div>

                      <div className="markdown-content pr-14 break-words">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      
                      <div className="absolute bottom-1 right-2 flex items-center gap-1">
                        <span className="text-[10px] text-[#667781]">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.role === 'user' && (
                          <CheckCheck size={15} className="text-[#53bdeb]" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start mb-2">
                <div className="bg-white p-2 px-4 rounded-lg shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* WhatsApp Input Area */}
        <div className="bg-[#F0F2F5] p-2 md:px-4 flex items-center gap-2 md:gap-4 sticky bottom-0 z-40">
          <div className="flex items-center gap-3 text-gray-500 px-2">
            <Smile size={24} className="cursor-pointer hover:text-gray-700" />
            <Paperclip size={22} className="cursor-pointer hover:text-gray-700" />
          </div>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe un mensaje aquí"
              className="w-full py-2.5 px-4 bg-white rounded-lg text-[15px] focus:outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center justify-center pr-2">
            {input.trim() ? (
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="w-11 h-11 bg-[#00A884] text-white rounded-full flex items-center justify-center hover:bg-[#008F70] transition-all shadow-sm"
              >
                <Send size={20} fill="currentColor" />
              </button>
            ) : (
              <button className="w-11 h-11 text-gray-500 flex items-center justify-center">
                <Mic size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
