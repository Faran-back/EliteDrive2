import React, { useState, useRef, useEffect } from 'react';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  FileText, 
  LifeBuoy, 
  ChevronRight, 
  ExternalLink, 
  Send, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Bot,
  Loader2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SupportCenter: React.FC = () => {
  const { user } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'kb' | 'tickets' | 'chat'>('kb');
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! I'm your EliteDrive AI assistant. How can I help you with the fleet management system today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `You are EliteDrive Support Assistant. You help admins and managers manage their car rental fleet. 
            Context: The user is ${user?.name}, role is ${user?.role}.
            System features: Fleet Inventory (add/edit/delete vehicles), Bookings (approve/cancel), Customers (view details/history), Reports (revenue/performance), Role Assignment.
            User query: ${inputMessage}` }]
          }
        ],
        config: {
          systemInstruction: `You are a helpful, professional support assistant for EliteDrive, a premium car rental management system. 
          Your goal is to provide clean, structured, and concise responses.
          - Use **bold** for key terms or actions.
          - Use bullet points for lists of options or steps.
          - Keep paragraphs short and readable.
          - If the user asks for help with a specific feature, provide clear instructions.
          - Be polite and professional at all times.`
        }
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting to the support server. Please check your connection or try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const faqs = [
    { q: 'How do I add a new vehicle to the fleet?', a: 'Navigate to the Fleet Inventory section and click on the "Add Vehicle" button. Fill in the required details and save.' },
    { q: 'How can I cancel a customer booking?', a: 'Go to the Bookings section, find the specific booking, and click the "Cancel" button. The customer will be notified automatically.' },
    { q: 'Where can I download revenue reports?', a: 'Revenue reports are available in the Reports section. You can export them as PDF or Excel files.' },
    { q: 'How do I manage user permissions?', a: 'System administrators can manage roles and permissions in the Role Assignment section.' },
  ];

  const tickets = [
    { id: 'T-8821', subject: 'Payment Gateway Error', status: 'Open', priority: 'High', date: '2024-03-24' },
    { id: 'T-8819', subject: 'Vehicle Status Sync Issue', status: 'In Progress', priority: 'Medium', date: '2024-03-23' },
    { id: 'T-8815', subject: 'New Manager Invitation', status: 'Resolved', priority: 'Low', date: '2024-03-22' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Support Center</h1>
          <p className="text-slate-500 font-medium">Help, troubleshooting, and system resources</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
          <Plus size={20} />
          Create New Ticket
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
        <input 
          type="text" 
          placeholder="Search knowledge base, FAQs, or documentation..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-16 pr-8 py-6 bg-white border border-slate-200 rounded-[32px] text-lg font-bold focus:ring-4 focus:ring-blue-600/10 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="flex p-1.5 bg-slate-100 rounded-[24px] w-fit">
        {[
          { id: 'kb', label: 'Knowledge Base', icon: FileText },
          { id: 'tickets', label: 'My Tickets', icon: LifeBuoy },
          { id: 'chat', label: 'Live Support', icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {activeTab === 'kb' && (
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900">Frequently Asked Questions</h3>
              <div className="grid grid-cols-1 gap-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:border-blue-200 transition-all cursor-pointer group">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">{faq.q}</h4>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900">Recent Support Tickets</h3>
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket ID</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-5 text-xs font-black text-blue-600">{ticket.id}</td>
                        <td className="px-8 py-5 text-sm font-black text-slate-900">{ticket.subject}</td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            ticket.status === 'Open' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {ticket.status === 'Resolved' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            ticket.priority === 'High' ? 'text-rose-600' :
                            ticket.priority === 'Medium' ? 'text-amber-600' :
                            'text-slate-400'
                          }`}>{ticket.priority}</span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden h-[600px] flex flex-col">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-blue-600 text-white">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Support Chat</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">EliteDrive Assistant • Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
                </div>
              </div>

              <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/30">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`size-10 rounded-xl flex items-center justify-center text-white shrink-0 ${msg.role === 'user' ? 'bg-slate-900' : 'bg-blue-600'}`}>
                      {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                    </div>
                    <div className={`p-4 shadow-sm border border-slate-100 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-3xl rounded-tr-none border-blue-500' 
                        : 'bg-white text-slate-700 rounded-3xl rounded-tl-none'
                    }`}>
                      <div className={`text-sm font-medium leading-relaxed prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      <p className={`text-[10px] font-bold mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-4 max-w-[80%]">
                    <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                      <Bot size={20} />
                    </div>
                    <div className="p-4 bg-white rounded-3xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                      <span className="text-xs font-bold text-slate-400">EliteDrive is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-6 border-t border-slate-100 bg-white">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative"
                >
                  <input 
                    type="text" 
                    placeholder="Type your message here..." 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isTyping}
                    className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 transition-all disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:bg-slate-300"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6">Quick Resources</h3>
            <div className="space-y-4">
              {[
                { label: 'User Manual', icon: FileText, color: 'blue' },
                { label: 'API Documentation', icon: ExternalLink, color: 'emerald' },
                { label: 'System Status', icon: AlertCircle, color: 'amber' },
                { label: 'Community Forum', icon: MessageSquare, color: 'purple' },
              ].map((res, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-blue-50 hover:border-blue-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      res.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      res.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                      res.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <res.icon size={18} />
                    </div>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{res.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-[40px] shadow-2xl shadow-blue-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <h3 className="text-xl font-black text-white mb-2 relative z-10">Need Urgent Help?</h3>
            <p className="text-white/80 text-xs font-medium mb-6 leading-relaxed relative z-10">Our premium support team is available 24/7 for critical system issues.</p>
            <button className="w-full py-4 bg-white text-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all relative z-10">
              Call Support Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;
