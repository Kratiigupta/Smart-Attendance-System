'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
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
    setIsRecording(true);
    showToast('Listening (Hindi + English enabled)... Speak now', 'info');
    
    setTimeout(() => {
      setIsRecording(false);
      const voiceQueries = [
        "mera attendance kitna hai?",
        "kal ki classes kya hain?",
        "DSA notes do",
        "free period mein kya padhu?"
      ];
      const randomQuery = voiceQueries[Math.floor(Math.random() * voiceQueries.length)];
      setInputValue(randomQuery);
      showToast(`Voice transcribed: "${randomQuery}"`, 'success');
    }, 2000);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: `📂 Uploaded: ${file.name} (PDF notes)`,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    
    setTimeout(() => {
      const summaryText = `📄 **PDF Summary: ${file.name}**\n\nI have parsed and summarized the document:\n- **Topic**: Data Structures & SQL Normalization notes.\n- **Core details**: Covers Stack & Queue implementation, binary trees traversal, and database forms (1NF, 2NF, 3NF).\n- **Key Takeaways**: Stacks follow LIFO, databases require atomic values for 1NF, and key dependencies for 2NF.\n\nLet me know if you want to generate a practice quiz from this text!`;
      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: summaryText,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
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

      if (!user) {
        if (query.includes('what is') || query.includes('smartedu') || query.includes('ecosystem')) {
          responseText = `🏫 **SmartEdu Campus** is a comprehensive, modern campus automation and learning platform.\n\nIt features: \n1. **Smart Attendance**: Rotating dynamic QR verification.\n2. **AI Timetable Generator**: Conflict-free schedule allocation via constraint solver algorithms.\n3. **Unified ERP & Finance**: Digital student ledgers, hostel lists, and fees gateways.\n4. **Rural Sync**: Offline PWA storage for low-bandwidth environments.`;
        } else if (query.includes('attendance') || query.includes('qr') || query.includes('demo')) {
          responseText = `📲 **Smart Attendance System:**\n\n- Eliminates proxy attendance with rotating QR codes refreshed every 30s.\n- Supports device fingerprint verification to prevent scanning for absent peers.\n- Facewise snapshot verification can be configured by institutions.`;
        } else if (query.includes('schedule') || query.includes('timetable') || query.includes('ai')) {
          responseText = `📅 **AI Constraint Timetable Roster:**\n\n- Solves the complex academic timetabling task in seconds using Google OR-Tools.\n- Automatically balances teacher hours, student workload constraints, classroom availability, and elective slots.`;
        } else if (query.includes('onboard') || query.includes('register') || query.includes('college')) {
          responseText = `🏫 **Ready to bring your institution onboard?**\n\nClick **"Onboard College"** in the top-right corner to register your campus. Once registered, a database tenant and an administrator account are instantly generated for your college!`;
        } else {
          responseText = `Welcome to SmartEdu Campus! You can explore the site features, try out the browser mockup controls, or click "Onboard College" to start. Let me know if you want to know about our smart modules!`;
        }
      } else if (user.role === 'student') {
        if (query.includes('attendance') || query.includes('stats') || query.includes('shortage') || query.includes('kitna')) {
          responseText = `📊 **Aapki Attendance Report (Overall: 86%):**\n\n- **Total Attended:** 93 classes\n- **Total Absent:** 15 classes\n- **Status:** Safe limit (Threshold: 75%)\n\n*Course-wise Standing:*\n- CSC-201 (Data Structures): 90% (18/20)\n- CSC-305 (DBMS): 80% (16/20)\n- ECE-301 (Digital Electronics): 85% (17/20)\n- MAT-301 (Math): 95% (19/20)\n- SEC-201 (Web Dev): 77% (14/18)\n- VAC-101 (Env Sci): 90% (9/10)`;
        } else if (query.includes('timetable') || query.includes('class') || query.includes('schedule') || query.includes('kal की') || query.includes('kal ki')) {
          responseText = `📅 **Kal ki Classes Schedule (Tomorrow):**\n\n1. **10:00 AM:** Data Structures (CSC-201) — Room LH-301\n2. **11:00 AM:** DBMS (CSC-305) — Room LH-401\n3. **01:30 PM:** Digital Electronics (ECE-301) — Room LH-302\n\n*Baki kal doopehr me aapka free period rahega!*`;
        } else if (query.includes('dsa notes') || query.includes('dsa') || query.includes('notes')) {
          responseText = `📚 **Here are your Data Structures & Algorithms notes summary:**\n\n- **Topic 1: Linked Lists**: Singly, Doubly, and Circular. Key ops: insertion, deletion, and reversal.\n- **Topic 2: Trees & Graphs**: Binary Search Trees, BFS/DFS traversal, and Dijkstra algorithm.\n\n*Aap study material and full notes read karne ke liye [Learning Hub](/student/learn) par ja sakte hain.*`;
        } else if (query.includes('free period') || query.includes('kya padhu') || query.includes('padhu')) {
          responseText = `💡 **AI Recommendation (Free Period Activities):**\n\n1. 🎥 **Watch DSA Video**: Trees & Graphs implementation guide.\n2. 📝 **Practice Quiz**: SQL Normalization (First, Second, and Third Normal Form).\n3. 💼 **Resume Building**: Update your project details and experience keywords.\n\n*In me se kisi par bhi click karke direct practice start kar sakte hain!*`;
        } else if (query.includes('fee') || query.includes('due') || query.includes('balance') || query.includes('money')) {
          responseText = `💳 **Pending Fee Ledger Status:**\n\n- **Total Paid Dues:** ₹48,000 (Tuition, Library, Computer Lab)\n- **Outstanding Balance:** ₹24,500\n\n*Unpaid Fee Breakdown:*\n- Exam Fee (Sem-3): ₹2,500 (Due: June 15, 2026)\n- Hostel & Mess Charges: ₹22,000 (Due: June 15, 2026)\n\n*Tip: You can pay securely from your portal under "My Fees" using UPI or Cards.*`;
        } else {
          responseText = `I understand you have questions about your campus studies, Amit. As a **student**, you can view your real-time attendance standing, pay pending semester fees, read study notes on the "Learning Hub" tab, or schedule classes directly. Is there anything specific you would like me to retrieve?`;
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
          responseText = `🏢 **SmartEdu Campus Overview Stats:**\n\n- **Total Students:** 1,220 active enrollments\n- **Total Faculty Members:** 69 lecturers across 5 departments\n- **Average Daily Attendance:** 91.2% (920 present today)\n- **Hostel Occupancy:** 86%\n- **Total Fee Collection:** ₹18.5 Lakhs this month`;
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
