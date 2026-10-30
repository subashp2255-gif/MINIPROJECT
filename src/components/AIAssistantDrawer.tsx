import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { aiAssistantService, type ChatMessage } from '../services/aiAssistantService';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Languages,
} from 'lucide-react';

export const AIAssistantDrawer: React.FC = () => {
  const { user, bookings, facilities, dryProducts, language, toggleLanguage } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const initialGreeting: ChatMessage = {
    id: 'msg-welcome',
    sender: 'assistant',
    text: isTa
      ? `வணக்கம் ${user.name || 'உழவரே'}! நான் உங்கள் AgriSync AI உதவியாளர். குளிர்சாதன முன்பதிவுகள், தானியக் கையிருப்பு, அல்லது பயிர் சேமிப்பு முறைகள் பற்றி கேட்கலாம்.`
      : `Hello ${user.name || 'Farmer'}! I am your AgriSync AI Assistant. Ask me about your cold storage bookings, dry grain balances, or storage recommendations.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);

  const quickPrompts = isTa
    ? [
        'என் முன்பதிவு நிலை என்ன?',
        'தக்காளி சேமிப்பு வெப்பநிலை என்ன?',
        'தானியக் கையிருப்பு விபரம்?',
        'கிடங்கு வாடகை எவ்வளவு?',
      ]
    : [
        'What is my booking status?',
        'Tomato cold storage temperature?',
        'Show my dry goods stock',
        'Storage facility pricing & capacity?',
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const assistantMsg = await aiAssistantService.sendMessage(
        textToSend,
        messages,
        {
          user,
          bookings,
          facilities,
          dryProducts,
          language,
        }
      );
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: isTa
            ? 'மன்னிக்கவும், தகவல் பெறுவதில் சிறிய தடங்கல். மீண்டும் முயற்சிக்கவும் அல்லது இணைய இணைப்பைச் சரிபார்க்கவும்.'
            : 'Sorry, unable to fetch response. Please try again or check connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([initialGreeting]);
  };

  return (
    <>
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#14532D] text-white shadow-lg shadow-[#14532D]/30 border border-[#AFF2C2]/40 hover:bg-[#0F3D2E] active:scale-95 transition-all"
          aria-label="Open AI Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-[#C8923A] flex items-center justify-center text-white">
            <Sparkles size={14} className="animate-spin-slow" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            {isTa ? 'உழவர் AI' : 'AgriSync AI'}
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#AFF2C2] animate-pulse" />
        </button>
      )}

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div
            className="w-full max-w-[430px] h-[85vh] sm:h-[650px] bg-[#F7F4EC] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl border border-[#DFE4DC] overflow-hidden animate-in slide-in-from-bottom duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-[#14532D] text-white flex items-center justify-between border-b border-[#0F3D2E]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#C8923A] flex items-center justify-center text-white shadow-xs">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold tracking-tight">
                      {isTa ? 'அக்ரிசின்க் உழவர் உதவியாளர்' : 'AgriSync Sahayak AI'}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#AFF2C2]/20 text-[#AFF2C2] text-[9px] font-semibold">
                      Live
                    </span>
                  </div>
                  <p className="text-[10px] text-[#AFF2C2]/80">
                    {isTa ? 'தமிழ் & English • இருப்பு & முன்பதிவு' : 'Tamil & English • Real-time DB Context'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="p-1.5 rounded-lg text-[#AFF2C2] hover:bg-white/10 transition-colors"
                  title="Toggle Language"
                >
                  <Languages size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-[#AFF2C2] hover:bg-white/10 transition-colors"
                  title="Reset conversation"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors ml-1"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Advisory Invariant Badge */}
            <div className="px-3 py-1.5 bg-[#E7F5EE] border-b border-[#AFF2C2]/50 flex items-center gap-1.5 text-[10px] text-[#14532D]">
              <ShieldCheck size={13} className="flex-shrink-0 text-[#14532D]" />
              <span className="truncate">
                {isTa
                  ? 'AI ஆலோசனைகள் வழிகாட்டுதலுக்கு மட்டுமே; இருப்பு மாற்றாது.'
                  : 'Advisory only: Never modifies official stock or confirms bookings.'}
              </span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                        isUser ? 'bg-[#14532D] text-white' : 'bg-[#C8923A] text-white'
                      }`}
                    >
                      {isUser ? <User size={12} /> : <Bot size={12} />}
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                        isUser
                          ? 'bg-[#14532D] text-white rounded-tr-xs'
                          : 'bg-white text-[#1C2420] border border-[#DFE4DC] rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {msg.actionUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            navigate(msg.actionUrl!);
                          }}
                          className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E7F5EE] text-[#14532D] font-bold text-[11px] hover:bg-[#AFF2C2]/40 transition-colors border border-[#AFF2C2]"
                        >
                          <span>{isTa ? msg.actionLabelTa || msg.actionLabel : msg.actionLabel}</span>
                          <ArrowRight size={12} />
                        </button>
                      )}

                      <span
                        className={`block text-[9px] mt-1 text-right ${
                          isUser ? 'text-white/70' : 'text-[#8C9690]'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-[#5B6660]">
                  <div className="w-6 h-6 rounded-full bg-[#C8923A] flex items-center justify-center text-white">
                    <Bot size={12} />
                  </div>
                  <div className="bg-white border border-[#DFE4DC] px-3 py-2 rounded-2xl rounded-tl-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#14532D] animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#14532D] animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    />
                    <span className="text-[10px] text-[#5B6660] ml-1">
                      {isTa ? 'சிந்திக்கிறது...' : 'Consulting models...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-2 bg-[#EDE8DE]/70 border-t border-[#DFE4DC] flex gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(p)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#DFE4DC] text-[10px] font-medium text-[#14532D] whitespace-nowrap hover:bg-[#E7F5EE] active:scale-95 transition-all flex-shrink-0"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-[#DFE4DC] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isTa ? 'கேள்வியை உள்ளிடவும்...' : 'Ask storage, inventory, temperatures...'}
                className="flex-1 bg-[#F7F4EC] border border-[#DFE4DC] rounded-xl px-3 py-2 text-xs text-[#1C2420] placeholder-[#8C9690] focus:outline-none focus:border-[#14532D]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-[#14532D] text-white flex items-center justify-center hover:bg-[#0F3D2E] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

