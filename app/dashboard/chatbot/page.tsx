"use client";

import { useState, useEffect, useRef, FormEvent, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, Bot, User, Loader2, ArrowDownCircle, 
  Users, MessageSquare, BarChart2, HelpCircle,
  MoreVertical,
  PlusCircle,
  Archive,
  Trash2,
  ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSession } from 'next-auth/react'; 

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ArchivedChat {
  id: string;
  name: string;
  timestamp: number;
  messages: ChatMessage[];
}

interface ActionButtonProps {
  icon: ReactNode;
  text: string;
  onClick?: () => void;
  isIconOnly?: boolean;
}

const ActionButton = ({ icon, text, onClick, isIconOnly }: ActionButtonProps) => (
  <Button
    type="button"
    variant="outline"
    className={`bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border-gray-600 rounded-full text-xs sm:text-sm
                ${isIconOnly ? 'p-2 sm:p-2.5' : 'px-3 py-1.5 sm:px-4 sm:py-2'}`}
    onClick={onClick}
  >
    {icon}
    {!isIconOnly && <span>{text}</span>}
  </Button>
);

























const cleanMessageContent = (content: string): string => {
  if (typeof content !== 'string') return '';
  return content.replace(/\*\*/g, '');
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [archivedChats, setArchivedChats] = useState<ArchivedChat[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status: sessionStatus } = useSession(); 
  const scrollableMessagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user?.id) {
      const userId = session.user.id;


      const loadActiveChat = async () => {
        try {
          const response = await fetch(`/api/chatbot/active-chat?userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.messages) {
              setMessages(data.messages);
            } else {
              setMessages([]); 
            }
          } else {
            console.error("Erro ao carregar chat ativo:", response.statusText);

          }
        } catch (error) {
          console.error("Erro ao carregar chat ativo do servidor:", error);

        }
      };


      const loadArchivedChats = async () => {
        try {
          const response = await fetch(`/api/chatbot/archived-chats?userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            setArchivedChats(data || []);
          } else {
            console.error("Erro ao carregar chats arquivados:", response.statusText);

          }
        } catch (error) {
          console.error("Erro ao carregar chats arquivados do servidor:", error);

        }
      };

      loadActiveChat();
      loadArchivedChats();
    } else if (sessionStatus === 'unauthenticated') {

      setMessages([]);
      setArchivedChats([]);

      toast.info("Faça login para acessar o chatbot.");
    }
    inputRef.current?.focus();
  }, [sessionStatus, session?.user?.id]);



  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user?.id && messages.length > 0) { 
      const saveActiveChat = async () => {
        try {
          await fetch('/api/chatbot/active-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: session.user.id, messages }),
          });
        } catch (error) {
          console.error("Erro ao salvar chat ativo no servidor:", error);
          toast.error("Não foi possível salvar seu chat ativo. Verifique sua conexão.");
        }
      };

      const debounceSave = setTimeout(saveActiveChat, 1000); 
      return () => clearTimeout(debounceSave);
    }


    const container = scrollableMessagesContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 300 || messages.length <= 1 || (messages.length > 0 && messages[messages.length -1]?.role === 'user') ) {
        scrollToBottom("smooth");
      }
    } else if (messages.length > 0) {
      scrollToBottom("smooth");
    }
  }, [messages, sessionStatus, session?.user?.id]);




  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    const container = scrollableMessagesContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollHeight - scrollTop - clientHeight > 200) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const cleanedInput = cleanMessageContent(input); 
    const userMessage: ChatMessage = { role: 'user', content: cleanedInput };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = cleanedInput; 
    setInput('');
    setIsLoading(true);




    if (currentInput.toLowerCase().startsWith('cadastrar vendedor:')) {
      const dataString = currentInput.substring('cadastrar vendedor:'.length).trim();
      const parts = dataString.split(',').map(part => part.trim());

      let sellerData: {
        name?: string;
        evolutionInstanceName: string;
        evolutionApiKey: string;
        sellerWhatsAppNumber: string;
      } | null = null;

      if (parts.length === 3) { 
        sellerData = {
          evolutionInstanceName: parts[0],
          evolutionApiKey: parts[1],
          sellerWhatsAppNumber: parts[2],
        };
      } else if (parts.length === 4) { 
        sellerData = {
          name: parts[0],
          evolutionInstanceName: parts[1],
          evolutionApiKey: parts[2],
          sellerWhatsAppNumber: parts[3],
        };
      }

      if (sellerData) {
        try {
          const response = await fetch('/api/sellers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sellerData),
          });

          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(responseData.message || 'Falha ao cadastrar vendedor.');
          }

          const successMessage: ChatMessage = {
            role: 'assistant',
            content: cleanMessageContent(`Vendedor "${sellerData.name || sellerData.evolutionInstanceName}" cadastrado com sucesso!`)
          };
          setMessages(prev => [...prev, successMessage]);

        } catch (error: any) {
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: cleanMessageContent(`Erro ao cadastrar vendedor: ${error.message}. Verifique os dados e o formato: [Nome (opcional)], Instância, API Key, WhatsApp.`)
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
          inputRef.current?.focus();
        }
        return; 
      } else {
        const formatErrorMessage: ChatMessage = {
          role: 'assistant',
          content: cleanMessageContent("Formato inválido para cadastrar vendedor. Use: cadastrar vendedor: [Nome (opcional)], Instância, API Key, WhatsApp")
        };
        setMessages(prev => [...prev, formatErrorMessage]);
        setIsLoading(false);
        inputRef.current?.focus();
        return; 
      }
    }


    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput, 
          history: messages.map(m => ({ role: m.role, content: m.content })) 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao comunicar com o assistente.');
      }


      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantResponseContent = '';
      let firstChunk = true;
      let tempAssistantMessageId = `temp_${Date.now()}`;



      if (reader) {
        const thinkingMessage: ChatMessage = { role: 'assistant', content: '...' }; 
        setMessages(prev => [...prev, thinkingMessage]);


        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantResponseContent += decoder.decode(value, { stream: true });
          

          setMessages(prevMsgs => {
            const newMsgs = [...prevMsgs];
            if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'assistant') {
              newMsgs[newMsgs.length - 1].content = cleanMessageContent(assistantResponseContent);
            }
            return newMsgs;
          });
        }
      } else {

        const data = await response.json(); 
        const assistantMessage: ChatMessage = { role: 'assistant', content: cleanMessageContent(data.response) };
        setMessages(prev => [...prev, assistantMessage]);
      }


    } catch (error: any) {
      const errorMessageContent = error.message.includes("API key not valid")
        ? "Erro de configuração: A chave da API do Gemini não é válida. Verifique suas variáveis de ambiente."
        : `Erro: ${error.message}`;
      const errorMessage: ChatMessage = { role: 'assistant', content: cleanMessageContent(errorMessageContent) };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus(); 
    }
  };
  
  const handleActionClick = (promptText: string) => {
    setInput(promptText);
    inputRef.current?.focus();
  };

  const handleNewChat = async () => {
    if (sessionStatus !== 'authenticated' || !session?.user?.id) {
      toast.error("Você precisa estar logado para gerenciar conversas.");
      return;
    }
    const userId = session.user.id;

    if (messages.length > 0) {
      try {

        const currentChatContent = JSON.stringify(messages.map(m => ({ role: m.role, content: m.content }))); 
        const isAlreadyArchivedLocally = archivedChats.some(chat => JSON.stringify(chat.messages.map(m => ({ role: m.role, content: m.content }))) === currentChatContent);

        if (!isAlreadyArchivedLocally) {
          const chatName = messages[0]?.content.substring(0, 30) + "..." || `Conversa ${new Date().toLocaleTimeString()}`;
          const response = await fetch('/api/chatbot/archived-chats', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, name: chatName, messages }),
          });

          if (response.ok) {
            const newArchivedChat = await response.json();
            setArchivedChats(prev => [newArchivedChat, ...prev]);
          } else {
            toast.error("Falha ao arquivar a conversa atual.");
            console.error("Erro ao arquivar conversa:", await response.text());
            return; 
          }
        }
      } catch (error) {
        toast.error("Erro de rede ao arquivar conversa.");
        console.error("Erro de rede ao arquivar:", error);
        return; 
      }
    }
    setMessages([]); 
    

    try {
      await fetch('/api/chatbot/active-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, messages: [] }), 
      });
    } catch (error) {
      console.error("Erro ao limpar chat ativo no servidor:", error);

    }

    inputRef.current?.focus();
    toast.success("Nova conversa iniciada.");
  };

  const handleLoadArchivedChat = async (chatId: string) => {
    if (sessionStatus !== 'authenticated' || !session?.user?.id) {
      toast.error("Você precisa estar logado para gerenciar conversas.");
      return;
    }
    const userId = session.user.id;

    const chatToLoad = archivedChats.find(chat => chat.id === chatId);
    if (chatToLoad) {

      if (messages.length > 0 && JSON.stringify(messages.map(m => ({ role: m.role, content: m.content }))) !== JSON.stringify(chatToLoad.messages.map(m => ({ role: m.role, content: m.content })))) {
        const currentChatContent = JSON.stringify(messages.map(m => ({ role: m.role, content: m.content })));
        const isCurrentChatAlreadyArchivedLocally = archivedChats.some(
          (ac) => JSON.stringify(ac.messages.map(m => ({ role: m.role, content: m.content }))) === currentChatContent
        );

        if (!isCurrentChatAlreadyArchivedLocally) {
          try {
            const archiveName = messages[0]?.content.substring(0, 30) + "..." || `Conversa (auto-arquivada ${new Date().toLocaleTimeString()})`;
            const response = await fetch('/api/chatbot/archived-chats', { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, name: archiveName, messages }),
            });
            if (response.ok) {
              const newArchivedChat = await response.json();
              setArchivedChats(prev => [newArchivedChat, ...prev.filter(c => c.id !== newArchivedChat.id)]); 
            } else {
              toast.error("Falha ao auto-arquivar a conversa atual.");
            }
          } catch (error) {
            toast.error("Erro de rede ao auto-arquivar conversa.");
          }
        }
      }

      setMessages([...chatToLoad.messages]);

      try {
        await fetch('/api/chatbot/active-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, messages: chatToLoad.messages }),
        });
        toast.info(`Conversa "${chatToLoad.name}" carregada.`);
      } catch (error) {
        console.error("Erro ao definir chat ativo no servidor:", error);
        toast.error("Não foi possível definir o chat carregado como ativo no servidor.");
      }
    }
    inputRef.current?.focus();
  };

  const handleDeleteArchivedChat = async (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (sessionStatus !== 'authenticated' || !session?.user?.id) {
      toast.error("Você precisa estar logado para gerenciar conversas.");
      return;
    }


    try {
      const response = await fetch(`/api/chatbot/archived-chats/${chatId}`, { 
        method: 'DELETE',
      });
      if (response.ok) {
        setArchivedChats(prev => prev.filter(chat => chat.id !== chatId));
        toast.warning("Conversa arquivada excluída.");
      } else {
        toast.error("Falha ao excluir conversa arquivada.");
        console.error("Erro ao excluir conversa:", await response.text());
      }
    } catch (error) {
      toast.error("Erro de rede ao excluir conversa.");
      console.error("Erro de rede ao excluir:", error);
    }
  };




  const inputAreaHeightDesktop = "240px"; 
  const inputAreaHeightMobile = "230px"; 


  return (



    <div className="flex flex-col h-full text-white overflow-hidden">
      {}
      {}
      <div 
        ref={scrollableMessagesContainerRef} 
        className={`flex-grow overflow-y-auto p-4 sm:p-6 space-y-5 relative`}
        style={{ paddingBottom: `calc(${inputAreaHeightMobile} + 20px)` }} 
      >
        {}
{messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot size={48} className="text-purple-400 mb-4" />
            <p className="text-xl text-gray-400">Olá! Como posso te ajudar hoje?</p>
            <p className="text-sm text-gray-500">Você pode me fazer perguntas sobre seus vendedores, avaliações, relatórios ou clientes.</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index} 
            className={`flex items-end gap-2.5 animate-fadeIn ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <Avatar className="h-8 w-8 border border-purple-600 shadow-md flex-shrink-0">
                <AvatarFallback className="bg-purple-500/30"><Bot size={18} /></AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[75%] p-3 rounded-xl shadow-md text-sm leading-relaxed
                ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                }`}
            >
              {}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
               <Avatar className="h-8 w-8 border border-blue-600 shadow-md flex-shrink-0">
                <AvatarFallback className="bg-blue-500/30"><User size={18} /></AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && ( 
          <div className="flex items-end gap-2.5 justify-start animate-fadeIn">
            <Avatar className="h-8 w-8 border border-purple-600 shadow-md flex-shrink-0">
              <AvatarFallback className="bg-purple-500/30"><Bot size={18} /></AvatarFallback>
            </Avatar>
            <div className="max-w-[70%] p-3 rounded-xl shadow-md bg-gray-700 text-gray-200 rounded-bl-none">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-px" />
        
        {showScrollButton && (
          <Button
            variant="outline"
            size="icon"
            className={`absolute bottom-4 left-4 sm:left-6 bg-gray-700/80 hover:bg-gray-600/90 backdrop-blur-sm border-gray-600 text-gray-300 hover:text-white rounded-full z-20 transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 ${
              showScrollButton ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
            onClick={() => scrollToBottom("smooth")}
            aria-label="Rolar para o final"
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        )}
      </div>

      {}
      {}
      <div className="fixed bottom-0 right-0 md:left-64 left-0 flex justify-center z-30 pointer-events-none"> {}
        <div 
          className="w-full max-w-3xl p-3 sm:p-4 bg-gray-500/30 backdrop-blur-md border-t border-gray-700/50 rounded-lg shadow-xl pointer-events-auto mb-5"

        >
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-300">
              R.A.I.O Assistente
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-gray-800 border-gray-700 text-gray-200">
                <DropdownMenuItem onClick={handleNewChat} className="hover:bg-gray-700 cursor-pointer">
                  <PlusCircle className="mr-2 h-4 w-4 text-green-400" />
                  <span>Nova Conversa</span>
                </DropdownMenuItem>
                
                {archivedChats.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuLabel className="text-gray-400 px-2 py-1.5 text-xs">Conversas Arquivadas</DropdownMenuLabel>
                    <div className="max-h-60 overflow-y-auto"> {}
                      {archivedChats.map(chat => (
                        <DropdownMenuItem 
                          key={chat.id} 
                          onClick={() => handleLoadArchivedChat(chat.id)}
                          className="flex justify-between items-center hover:bg-gray-700 cursor-pointer group"
                        >
                          <span className="truncate max-w-[160px] text-sm">{chat.name || `Chat de ${new Date(chat.timestamp).toLocaleTimeString()}`}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                            onClick={(e) => handleDeleteArchivedChat(chat.id, e)}
                            aria-label="Excluir conversa arquivada"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </>
                )}
                 {archivedChats.length === 0 && (
                    <>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem disabled className="text-xs text-gray-500">
                            <Archive className="mr-2 h-4 w-4" /> Nenhuma conversa arquivada
                        </DropdownMenuItem>
                    </>
                 )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center bg-transparent rounded-full p-1 sm:p-1.5">
            {}
            <Input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte alguma coisa..."
              className="flex-grow bg-transparent border-0 focus:ring-0 text-white placeholder-gray-500 pl-3 pr-2 sm:pl-4 sm:pr-2 text-sm sm:text-base h-10 sm:h-11"
              disabled={isLoading}
              autoComplete="off"
            />
            <Button
              type="submit"
              variant="default"
              size="icon"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full flex-shrink-0 mx-1 h-8 w-8 sm:h-9 sm:w-9 disabled:opacity-60 ml-4"
              disabled={isLoading || !input.trim()}
              aria-label="Enviar mensagem"
            >
              {isLoading ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Send className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
          </form>

          <div className="flex justify-center flex-wrap gap-2 mt-3 sm:mt-4">
            <ActionButton icon={<Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />} text="Listar Vendedores" onClick={() => handleActionClick("Listar meus vendedores")} />
            <ActionButton icon={<MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />} text="Últimas Avaliações" onClick={() => handleActionClick("Quais foram as últimas avaliações recebidas?")} />
            <ActionButton icon={<BarChart2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />} text="Tipos de Relatório" onClick={() => handleActionClick("Que tipos de relatórios estão disponíveis?")} />
            <ActionButton icon={<HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />} text="Ajuda Geral" onClick={() => handleActionClick("O que você pode fazer?")} />
            {}
            {}
          </div>
        </div>
      </div>
      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}