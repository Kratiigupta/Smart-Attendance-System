'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineXMark,
  HiOutlinePaperAirplane,
  HiOutlineSparkles,
  HiOutlineCpuChip,
  HiOutlineBookmarkSquare,
  HiOutlineMicrophone,
  HiOutlinePaperClip
} from 'react-icons/hi2';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

export function AIChatbot() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleOpen = () => setIsOpen(true);

    window.addEventListener('toggle-chatbot', handleToggle);
    window.addEventListener('open-chatbot', handleOpen);
    return () => {
      window.removeEventListener('toggle-chatbot', handleToggle);
      window.removeEventListener('open-chatbot', handleOpen);
    };
  }, []);

  const handleVoiceInput = () => {
    showToast('Coming Soon', 'warning');
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    showToast('Upload analysis coming soon.', 'warning');
  };

  // Set initial welcome message depending on user role
  useEffect(() => {
    if (!user) {
      setMessages([
        {
          id: 'init-guest',
          sender: 'ai',
          text: `Welcome to SmartEdu Campus! 👋 I am your AI Assistant. Ask me anything about our educational ecosystem, smart attendance tracking, AI scheduling, ERP ledgers, or how to onboard your college!`,
          timestamp: new Date()
        }
      ]);
      return;
    }
    const name = user.name;
    const roleText = user.role === 'student' ? 'Student' : user.role === 'faculty' ? 'Faculty' : 'Campus Admin';
    setMessages([
      {
        id: 'init-1',
        sender: 'ai',
        text: `Hello ${name}! 👋 I am your SmartEdu Campus AI Assistant. As a logged-in **${roleText}**, I have full access to your campus record dashboards. Ask me anything about your attendance stats, classes, fees ledger, or timetable scheduler!`,
        timestamp: new Date()
      }
    ]);
  }, [user]);

  // Autoscroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Configuration of dynamic action pills by user role
  const getPills = () => {
    if (!user) {
      return [
        { label: '🚀 What is SmartEdu?', query: 'what is smartedu' },
        { label: '📲 Smart Attendance Demo', query: 'attendance demo' },
        { label: '📅 AI Timetable Scheduling', query: 'ai schedule description' },
        { label: '🏫 How to Onboard?', query: 'how to onboard' }
      ];
    }
    if (user.role === 'student') {
      return [
        { label: '📊 mera attendance kitna hai?', query: 'mera attendance kitna hai?' },
        { label: '📅 kal ki classes kya hain?', query: 'kal ki classes kya hain?' },
        { label: '📚 DSA notes do', query: 'DSA notes do' },
        { label: '🧠 free period mein kya padhu?', query: 'free period mein kya padhu?' }
      ];
    } else if (user.role === 'faculty' || user.role === 'hod') {
      return [
        { label: '📅 Today\'s Classes', query: 'faculty timetable' },
        { label: '📚 My Assigned Courses', query: 'faculty courses' },
        { label: '📈 Avg Attendance Standing', query: 'faculty average' }
      ];
    } else {
      return [
        { label: '🏢 Campus Overview Stats', query: 'admin stats' },
        { label: '🔔 Recent Campus Events', query: 'recent activity' }
      ];
    }
  };

  const chatMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await api.post('/chatbot/message', { message: text });
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (data) => {
      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: data.reply,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    },
    onError: () => {
      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: "Error connecting to AI service. Please try again later.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }
  });

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    chatMutation.mutate(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white cursor-pointer shadow-2xl transition-all duration-300 ${
          isOpen
            ? 'bg-rose hover:bg-rose-dark rotate-90 scale-95'
            : 'gradient-primary hover:scale-105 active:scale-95 animate-pulse-glow'
        }`}
      >
        {isOpen ? (
          <HiOutlineXMark className="w-6 h-6" />
        ) : (
          <div className="relative">
            <HiOutlineChatBubbleLeftRight className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary" />
          </div>
        )}
      </button>

      {/* Glassmorphic Chat Widget Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[500px] rounded-2xl glass-strong border border-border-light shadow-2xl flex flex-col overflow-hidden animate-fadeIn relative">
          <div className="absolute top-0 left-0 w-full h-[3px] gradient-primary" />

          {/* Chat Header */}
          <div className="px-4 py-3 bg-bg-secondary/90 border-b border-border/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
                <HiOutlineSparkles className="w-4 h-4 animate-[spin-slow_6s_linear_infinite]" />
              </div>
              <div>
                <div className="text-xs font-heading font-black text-text-primary flex items-center gap-1.5">
                  SmartEdu Assistant
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                </div>
                <p className="text-[9px] text-text-muted font-semibold tracking-wide uppercase">Campus Copilot AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
            >
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-scaleIn`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-bg-elevated border border-border/40 flex items-center justify-center text-xs shrink-0 self-start text-primary-light">
                    <HiOutlineCpuChip className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10'
                      : 'bg-bg-elevated/70 border border-border/20 text-text-secondary rounded-tl-none'
                  } whitespace-pre-line`}
                >
                  {msg.text}
                  <span className="block text-[8px] text-text-dim text-right mt-1 font-mono">
                    {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-bg-elevated border border-border/40 flex items-center justify-center text-xs shrink-0 text-primary-light">
                  <HiOutlineCpuChip className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-bg-elevated/70 border border-border/20 rounded-2xl rounded-tl-none px-3.5 py-3 flex gap-1.5 items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Smart suggestions pills scrollable */}
          <div className="px-4 py-2 border-t border-border/20 bg-bg-secondary/40 shrink-0 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
            <HiOutlineBookmarkSquare className="w-3.5 h-3.5 text-text-dim shrink-0" />
            {getPills().map((pill, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(pill.query)}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-bg-elevated border border-border/30 hover:border-primary/45 hover:bg-primary/8 text-text-secondary hover:text-primary-light transition-all cursor-pointer inline-block"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="px-3 py-3 border-t border-border/30 bg-bg-secondary flex gap-2 items-center shrink-0"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePdfUpload}
              accept="application/pdf"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 rounded-xl bg-bg-input border border-border/50 text-text-secondary hover:text-text-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Upload PDF notes for AI summarization"
            >
              <HiOutlinePaperClip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleVoiceInput}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 ${
                isRecording
                  ? 'bg-rose/15 border-rose text-rose animate-pulse'
                  : 'bg-bg-input border-border/50 text-text-secondary hover:text-text-primary'
              }`}
              title="Voice Input (Hindi/English)"
            >
              <HiOutlineMicrophone className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask SmartEdu Assistant..."
              className="flex-1 bg-bg-input border border-border/50 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/40 font-semibold"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-8 h-8 rounded-xl gradient-primary text-white flex items-center justify-center shadow-md shadow-primary/10 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none cursor-pointer shrink-0"
            >
              <HiOutlinePaperAirplane className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
