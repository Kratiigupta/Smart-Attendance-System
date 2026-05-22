'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineXMark,
  HiOutlinePaperAirplane,
  HiOutlineSparkles,
  HiOutlineCpuChip,
  HiOutlineBookmarkSquare
} from 'react-icons/hi2';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

export function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set initial welcome message depending on user role
  useEffect(() => {
    if (!user) return;
    const name = user.name;
    const roleText = user.role === 'student' ? 'Student' : user.role === 'faculty' ? 'Faculty' : 'Campus Admin';
    setMessages([
      {
        id: 'init-1',
        sender: 'ai',
        text: `Hello ${name}! 👋 I am your USCDLE Campus AI Assistant. As a logged-in **${roleText}**, I have full access to your campus record dashboards. Ask me anything about your attendance stats, classes, fees ledger, or timetable scheduler!`,
        timestamp: new Date()
      }
    ]);
  }, [user]);

  // Autoscroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!user) return null;

  // Configuration of dynamic action pills by user role
  const getPills = () => {
    if (user.role === 'student') {
      return [
        { label: '📊 Check Attendance Stats', query: 'attendance stats' },
        { label: '📅 Show My Timetable', query: 'today timetable' },
        { label: '💳 Check Pending Dues', query: 'fees balance' },
        { label: '🔍 How to scan QR?', query: 'how to scan' }
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

    // Simulate AI thinking and reply
    setTimeout(() => {
      let responseText = '';
      const query = text.toLowerCase();

      // Core custom NLP Router mapping user info:
      if (user.role === 'student') {
        if (query.includes('attendance') || query.includes('stats') || query.includes('shortage')) {
          responseText = `📊 **Attendance Check-in Summary:**\n\n- **Overall Attendance:** 90.7% (Excellent status)\n- **Total Enrolled Courses:** 6 subjects\n- **Standing:** Safe (Required threshold: 75%)\n\n*Detailed course Standing:*\n- CSC-201 (Data Structures): 90% (18/20 classes)\n- CSC-305 (DBMS): 80% (16/20 classes)\n- ECE-301 (Digital Electronics): 85% (17/20 classes)\n- MAT-301 (Engineering Math): 95% (19/20 classes)\n- SEC-201 (Web Dev): 77.7% (14/18 classes)\n- VAC-101 (Ev. Science): 90% (9/10 classes)`;
        } else if (query.includes('timetable') || query.includes('class') || query.includes('schedule')) {
          responseText = `📅 **Your Today's Timetable Schedule:**\n\n1. **10:00 AM:** Data Structures (CSC-201) — Room LH-301 *(Status: Completed)*\n2. **11:00 AM:** DS Lab (CSC-201P) — Room Lab-101 *(Status: Completed)*\n3. **01:30 PM:** DBMS (CSC-305) — Room LH-401 *(Status: Upcoming)*\n4. **03:30 PM:** Web Dev Lab (SEC-201) — Room Lab-201 *(Status: Upcoming)*`;
        } else if (query.includes('fee') || query.includes('due') || query.includes('balance') || query.includes('money')) {
          responseText = `💳 **Pending Fee Ledger Status:**\n\n- **Total Paid Dues:** ₹48,000 (Tuition, Library, Computer Lab)\n- **Outstanding Balance:** ₹24,500\n\n*Unpaid Fee Breakdown:*\n- Exam Fee (Sem-3): ₹2,500 (Due: June 15, 2026)\n- Hostel & Mess Charges: ₹22,000 (Due: June 15, 2026)\n\n*Tip: You can pay securely from your portal under "My Fees" using UPI or Cards.*`;
        } else if (query.includes('scan') || query.includes('qr') || query.includes('mark') || query.includes('how')) {
          responseText = `🔍 **How to Mark Smart Attendance:**\n\n1. Navigate to **Mark Attendance** tab in the sidebar.\n2. Allow your browser camera access when prompted. This activates face detection simulation.\n3. Hold your phone up to scan the active **Dynamic QR Code** displayed on the classroom screen, or check the 6-digit **OTP fallback code**.\n4. Submit check-in! Verification is logged to the MongoDB database in real-time.`;
        } else {
          responseText = `I understand you have questions about your campus studies, Amit. As a **student**, you can view your real-time attendance standing, pay pending semester fees, read study notes on the "Learn" tab, or schedule classes directly. Is there anything specific you would like me to retrieve?`;
        }
      } else if (user.role === 'faculty' || user.role === 'hod') {
        if (query.includes('timetable') || query.includes('class') || query.includes('schedule') || query.includes('today')) {
          responseText = `📅 **Dr. Rajesh, here is your Lecture Schedule today:**\n\n- **10:00 AM - 10:50 AM:** Data Structures (CSC-201) — Room LH-301 *(Completed — 45/48 present)*\n- **11:00 AM - 11:50 AM:** DS Lab (CSC-201P) — Room Lab-101 *(Completed — 22/24 present)*\n- **01:30 PM - 02:20 PM:** Algorithm Design (CSC-401) — Room LH-302 *(Upcoming)*\n- **03:30 PM - 04:20 PM:** DS Tutorial — Room LH-301 *(Upcoming)*`;
        } else if (query.includes('course') || query.includes('assigned') || query.includes('subject')) {
          responseText = `📚 **Assigned Courses & Student Count:**\n\n1. **CSC-201 (Data Structures):** 48 students enrolled (CSE Sem-3)\n2. **CSC-201P (DS Lab):** 24 students enrolled (CSE Sem-3 A)\n3. **CSC-401 (Algorithm Design):** 45 students enrolled (CSE Sem-5)`;
        } else if (query.includes('attendance') || query.includes('average') || query.includes('standing') || query.includes('student')) {
          responseText = `📈 **Student Performance Standing:**\n\n- **Average Class Attendance:** 90.2% (Excellent turnout)\n- **Students Under Shortage Alert (<75%):** 4 students flagged.\n- You can export attendance logs as a CSV file from the **Attendance Analytics** section.`;
        } else {
          responseText = `Hello Dr. Rajesh Kumar. As a **faculty member**, you can initialize live check-in sessions with rotating QR codes on your "Start Class" panel, review attendance trends, manage student roll lists, and apply for academic leave proxies. How can I help you today?`;
        }
      } else {
        // Admin
        if (query.includes('stat') || query.includes('overview') || query.includes('campus')) {
          responseText = `🏢 **USCDLE Smart Campus Overview Stats:**\n\n- **Total Students:** 1,220 active enrollments\n- **Total Faculty Members:** 69 lecturers across 5 departments\n- **Average Daily Attendance:** 91.2% (920 present today)\n- **Hostel Occupancy:** 86%\n- **Total Fee Collection:** ₹18.5 Lakhs this month`;
        } else if (query.includes('event') || query.includes('recent') || query.includes('activity')) {
          responseText = `🔔 **Recent Campus Activity Log (Real-time):**\n\n1. **Dr. Rajesh Kumar** marked attendance for CSC-201 (45/48 present) — *5m ago*\n2. **Admin** added 25 new students to CSE department — *15m ago*\n3. **System** auto-scheduled the FYUP timetable slots — *1h ago*\n4. **Priya Sharma** cleared semester fees of ₹18,500 via UPI — *2h ago*`;
        } else {
          responseText = `System Admin console active. I can retrieve overall college statistics, database records, department allocations, admissions statuses, or security configurations. What would you like me to inspect?`;
        }
      }

      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
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
                  USCDLE Assistant
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
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask USCDLE Assistant..."
              className="flex-1 bg-bg-input border border-border/50 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/40 font-semibold"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-8 h-8 rounded-xl gradient-primary text-white flex items-center justify-center shadow-md shadow-primary/10 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none cursor-pointer"
            >
              <HiOutlinePaperAirplane className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
