import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  X, 
  Send, 
  User, 
  Bot, 
  Loader2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const EMERGENCY_PILLS = [
  { label: '🚨 Emergency Protocol', command: '/emergency' },
  { label: '🚗 Accident Guide', command: '/accident' },
  { label: '🔧 Breakdown Help', command: '/breakdown' },
  { label: '🔒 Vehicle Theft', command: '/theft' },
  { label: '👮 Police Stop', command: '/police' },
  { label: '🛡️ Insurance', command: '/insurance' },
  { label: '🩹 First Aid', command: '/first-aid' },
  { label: '💰 Refund Status', command: '/refund' },
  { label: '❌ Cancellation', command: '/cancel' },
  { label: '🔑 Lost Keys', command: '/stolen-key' },
  { label: '⛽ Fuel Policy', command: '/fuel' },
  { label: '⏰ Late Surcharges', command: '/delay' },
  { label: '📞 Help Helplines', command: '/contact' },
  { label: '💳 Pay Channels', command: '/payment' },
  { label: '⭐ Chauffeur Services', command: '/vip' }
];

const EMERGENCY_COMMANDS = [
  {
    keywords: ['emergency', 'help', 'halat kharab', 'madad', 'imdad'],
    command: '/emergency',
    title: '🚨 Emergency Response Protocol',
    content: `**EliteDrive Emergency Response Protocol**:\n\n1. **Ensure Safety**: Park the vehicle safely, turn on hazard lights, and make sure everyone is safe.\n2. **Contact Hotline**: Call our 24/7 Priority Emergency Hotline immediately at **0300-ELITE-HELP (0300-35483-4357)**.\n3. **Do Not Make Deals**: Do not admit liability or sign any hand-written agreements/deals with third parties on the spot.\n4. **Stay at the Scene**: Wait for the highway/traffic police or an EliteDrive rescue representative if instructed.`
  },
  {
    keywords: ['accident', 'crash', 'collision', 'damage', 'thok', 'accidant', 'haadsa'],
    command: '/accident',
    title: '🚗 Accident & Damage Procedure',
    content: `**Accident & Damage Protocol**:\n\n- **Document Proof**: Take high-quality photos and videos of the damage, license plates of other vehicles involved, and the surrounding environment.\n- **File FIR**: For major accidents, contact local police to register an official First Information Report (FIR).\n- **Report Immediately**: Submit details and photos via the 'Report Incident' tab on your dashboard **within 6 hours**.\n- **Contact support**: Call EliteDrive Compliance Team at **0300-123-4567** within 6 hours. Late reports trigger administrative flags and cancel insurance coverage eligibility.`
  },
  {
    keywords: ['breakdown', 'tow', 'engine issue', 'mechanic', 'kharab', 'gari kharab', 'heatup', 'heat up'],
    command: '/breakdown',
    title: '🔧 Vehicle Breakdown Guide',
    content: `**Breakdown & Mechanical Assistance**:\n\n- **Safe Parking**: Pull over to a safe area, switch on hazard lights, and use the warning triangle from the boot.\n- **Do Not Self-Repair**: Do not open the engine or attempt to repair mechanical/electrical issues yourself.\n- **Call Recovery**: Contact our 24/7 Roadside Assistance & Recovery service at **0300-987-6543**.\n- **Backup Vehicle**: If the breakdown is severe, EliteDrive will dispatch a recovery vehicle and a replacement car to your location.`
  },
  {
    keywords: ['theft', 'stolen', 'chori', 'steal', 'ghayb'],
    command: '/theft',
    title: '🔒 Vehicle Theft Protocol',
    content: `**Vehicle Theft & Loss Protocol**:\n\n1. **File FIR immediately**: Go to the nearest police station to report the vehicle theft. Request an official copy of the FIR.\n2. **Emergency Notification**: Inform EliteDrive Security Hub immediately at **0300-555-SAFE (0300-555-7233)**.\n3. **Provide Details**: Report the theft through the 'Report Incident' form, attaching the FIR copy and number.\n4. **Tracking Activation**: Our command center will remotely locate, lock, and disable the vehicle starter.`
  },
  {
    keywords: ['police', 'challan', 'traffic ticket', 'warden', 'e-challan', 'wardan'],
    command: '/police',
    title: '👮 Police & Traffic Challan Procedures',
    content: `**Police Stops & Challans**:\n\n- **Documents to Show**: Show your valid driving license, CNIC, and the digital Booking Receipt (accessible under 'Active Trips' on your dashboard).\n- **Challan Handover**: If a physical paper challan is issued, hand it over to our representative at vehicle return.\n- **E-Challan Dispute**: For electronic traffic tickets, you can check details and submit a formal objection within **7 days** under the 'Support Center > Client Disputes' tab.`
  },
  {
    keywords: ['insurance', 'claim', 'coverage', 'claim policy'],
    command: '/insurance',
    title: '🛡️ EliteDrive Insurance Coverage',
    content: `**Insurance & Damage Coverage Policy**:\n\n- **Basic Cover**: Included by default. Covers up to 50% of repair costs, subject to timely incident reporting (within 6 hours).\n- **Premium Cover**: Optional. Covers up to 100% of damage repairs with a fixed deductible of PKR 5,000.\n- **Void Conditions**: Insurance is completely void if the driver is unregistered, does not hold a valid driving license, is under the influence, or fails to file the incident report within the **6-hour policy window**.`
  },
  {
    keywords: ['first aid', 'medical', 'hospital', 'rescue', 'doctor', 'ambulance', 'medical help', 'injury'],
    command: '/first-aid',
    title: '🩹 Medical Emergencies & First Aid',
    content: `**Medical & Injury Emergency**:\n\n- **Primary Rescue**: Call national emergency services immediately at Rescue **1122** or Edhi/Aman Ambulance **115** / **1021**.\n- **First Aid Kit**: A certified first aid kit is stored in the glove compartment or the trunk of every EliteDrive vehicle.\n- **Emergency Contact**: Contact our helpline as soon as you are in a safe and stable condition.`
  },
  {
    keywords: ['refund', 'deposit', 'security deposit', 'paisa wapis', 'refund status', 'refunds'],
    command: '/refund',
    title: '💰 Security Deposit & Refunds',
    content: `**Refund of Security Deposit**:\n\n- **Amount**: The standard security deposit is PKR 10,000.\n- **Timeline**: Automatically processed and refunded within **48 hours** of successful vehicle handover and inspection.\n- **Deductions**: Deductions may be made for unpaid fuel shortages, pending e-challans, late return surcharges, or physical damages.`
  },
  {
    keywords: ['cancel', 'cancellation', 'booking cancel', 'refund trip'],
    command: '/cancel',
    title: '❌ Booking Cancellation Policy',
    content: `**Cancellation & Penalty Rules**:\n\n- **Free Cancellation**: You can cancel any booking free of charge up to **24 hours** before the scheduled start time.\n- **Late Cancellation**: Cancellations within 24 hours of start time incur a penalty equal to 1 day's rental fee.\n- **No Show**: If you do not pick up the vehicle within 3 hours of start time, the booking is automatically cancelled as a 'no-show' with no refund.`
  },
  {
    keywords: ['guarantor', 'out of city', 'out-of-city', 'shehar se bahar', 'other city', 'bahr jana'],
    command: '/guarantor',
    title: '🔑 Out-of-City Guarantor Requirement',
    content: `**Out-of-City Travel Policy**:\n\n- **Requirement**: If you travel outside your pickup city boundaries, you must submit the Name, CNIC, and Phone Number of a verified Guarantor.\n- **Handover Constraint**: Handover will be denied and booking flagged if guarantor details are missing or unverified.\n- **Policy Enforcement**: This measure ensures safety and compliance for vehicles travelling across inter-city routes.`
  },
  {
    keywords: ['blacklist', 'blocked', 'suspend', 'account lock', 'unblock'],
    command: '/blacklist',
    title: '🚫 Account Blacklisting Policy',
    content: `**Account Blacklisting & Security Flags**:\n\n- **Causes**: Accounts are permanently blacklisted for:\n  1. Multiple damages within a short period.\n  2. Attempted fraud or document forgery during KYC.\n  3. Outstanding balances or unpaid traffic fines.\n  4. Out-of-city travel without guarantor credentials.\n- **Reinstatement**: Requires manual security audit and resolution of outstanding compliances with the EliteDrive Operations Hub.`
  },
  {
    keywords: ['license', 'kyc', 'verify', 'cnic', 'shnakhti card', 'shinaxti card', 'verification'],
    command: '/license',
    title: '🪪 CNIC & License Verification (KYC)',
    content: `**KYC & Document Verification**:\n\n- **Documents Required**: Clear photographs of your original CNIC front/back, and a valid, non-expired driving license.\n- **Processing Time**: Verification takes up to **2 hours** after documents are submitted.\n- **Status**: You can track verification status in your profile settings dashboard.`
  },
  {
    keywords: ['fuel', 'petrol', 'refuel', 'gasoline', 'cng', 'diesel'],
    command: '/fuel',
    title: '⛽ EliteDrive Fuel Policy',
    content: `**Handover & Return Fuel Rules**:\n\n- **Fair Return**: Return the vehicle with the exact same fuel level as received.\n- **Shortage Charge**: If returned with less fuel, charges are calculated at current PSO pump prices plus a PKR 500 service surcharge.\n- **Excess Fuel**: Extra fuel returned cannot be refunded or adjusted against rental fees.`
  },
  {
    keywords: ['delay', 'late', 'late return', 'deri', 'deir', 'overdue'],
    command: '/delay',
    title: '⏰ Late Handover & Surcharges',
    content: `**Late Return Surcharge Rules**:\n\n- **Grace Period**: We offer a **30-minute grace period** for return delays.\n- **Delay Fee**: Returns past 30 minutes are charged at **1.5x the standard hourly rate**.\n- **Security Warning**: Delays exceeding 3 hours without contacting support trigger automatic security alerts, tracking scans, and a potential recovery process.`
  },
  {
    keywords: ['contact', 'phone', 'number', 'call', 'email', 'support email', 'whatsapp', 'helpline'],
    command: '/contact',
    title: '📞 Official Contact Helplines',
    content: `**EliteDrive Contact & Channels**:\n\n- **Emergency Hotline**: 0300-ELITE-HELP\n- **Phone Support**: 021-111-ELITE (021-111-35483)\n- **WhatsApp Support**: +92 300 000 0000\n- **Corporate Email**: support@elitedrive.pk\n- **Compliance Hub**: compliance@elitedrive.pk`
  },
  {
    keywords: ['key', 'lost key', 'stolen key', 'keys', 'chabi', 'chabi gum'],
    command: '/stolen-key',
    title: '🔑 Lost / Stolen Keys Protocol',
    content: `**Lost or Damaged Vehicle Keys**:\n\n- **Secure Vehicle**: If key is lost, stay near the vehicle and ensure it is safely locked (if possible) to prevent unauthorized theft.\n- **Contact support**: Notify support immediately to request a duplicate key dispatch.\n- **Cost Recovery**: The cost of replacement keys, remote programming, or locks (ranging from PKR 5,000 to PKR 15,000) is charged directly to the renter.`
  },
  {
    keywords: ['payment', 'easypaisa', 'jazzcash', 'card payment', 'nayapay', 'pay'],
    command: '/payment',
    title: '💳 Approved Payment Channels',
    content: `**EliteDrive Payment Options**:\n\n- **Mobile Wallets**: Easypaisa, JazzCash, Nayapay.\n- **Card Payment**: Direct checkout via Visa, Mastercard, or UnionPay credit/debit cards.\n- **Bank Transfer**: Online bank transfer to our corporate account (requires uploading a transfer receipt snapshot for validation).`
  },
  {
    keywords: ['vip', 'driver', 'chauffeur', 'premium service'],
    command: '/vip',
    title: '⭐ VIP Chauffeur-Driven Services',
    content: `**VIP Chauffeur & Driver Options**:\n\n- **Availability**: Professional drivers are available for premium vehicles (Civic, Corolla, Fortuner).\n- **Daily Surcharge**: A professional EliteDrive chauffeur is provided at an additional rate of PKR 3,000 per day.\n- **Inclusions**: Driver meals and lodging are managed entirely by EliteDrive.`
  }
];

const SupportChatWidget: React.FC = () => {
  const { user, isChatOpen: isOpen, setIsChatOpen: setIsOpen } = useStore();
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);
  
  const isSupportPage = location.search.includes('view=support-center');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hi ${user?.name || 'there'}! I'm your EliteDrive AI assistant. How can I help you today?`,
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
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

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
      const token = localStorage.getItem('elitedrive_token');
      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          messages: messages.slice(-5), // Send last few messages for rolling history context
          inputMessage: userMessage.content
        })
      });

      if (!response.ok) {
        throw new Error('Support API returned error status');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.text || "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Look up locally in case of failure
      const cleanInput = userMessage.content.trim().toLowerCase();
      const matchedLocal = EMERGENCY_COMMANDS.find(cmd => {
        if (cleanInput === cmd.command || cleanInput === cmd.command.substring(1)) {
          return true;
        }
        return cmd.keywords.some(kw => {
          if (cleanInput === kw) return true;
          const regex = new RegExp(`\\b${kw}\\b`, 'i');
          return regex.test(cleanInput);
        });
      });

      if (matchedLocal) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `### ${matchedLocal.title}\n\n${matchedLocal.content}\n\n*Emergency mode active (Loaded from local device storage).*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm having trouble connecting to the support server. Please try again later.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendPill = async (command: string) => {
    if (isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: command,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('elitedrive_token');
      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          messages: messages.slice(-5),
          inputMessage: command
        })
      });

      if (!response.ok) {
        throw new Error('Support API returned error status');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.text || "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const cleanInput = command.trim().toLowerCase();
      const matchedLocal = EMERGENCY_COMMANDS.find(cmd => {
        if (cleanInput === cmd.command || cleanInput === cmd.command.substring(1)) {
          return true;
        }
        return cmd.keywords.some(kw => {
          if (cleanInput === kw) return true;
          const regex = new RegExp(`\\b${kw}\\b`, 'i');
          return regex.test(cleanInput);
        });
      });

      if (matchedLocal) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `### ${matchedLocal.title}\n\n${matchedLocal.content}\n\n*Emergency mode active (Loaded from local device storage).*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm having trouble connecting to the support server. Please try again later.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  if (isSupportPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '64px' : '500px'
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`w-[350px] bg-white rounded-[24px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col mb-4 transition-all duration-300`}
          >
            {/* Header */}
            <div className="p-4 bg-blue-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">EliteDrive Support</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 custom-scrollbar">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`size-8 rounded-lg flex items-center justify-center text-white shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`p-3 shadow-sm border border-slate-100 ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none border-blue-500' 
                          : 'bg-white text-slate-700 rounded-2xl rounded-tl-none'
                      }`}>
                        <div className={`text-xs font-medium leading-relaxed prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        <p className={`text-[9px] font-bold mt-1.5 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                        <Bot size={16} />
                      </div>
                      <div className="p-3 bg-white rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-blue-600" />
                        <span className="text-[10px] font-bold text-slate-400">Assistant is typing...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-100 bg-white">
                  {/* Quick Emergency Commands Row */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-slate-50 shrink-0 select-none no-scrollbar">
                    <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-1 shrink-0 animate-pulse">
                      🚨 Safety Hub
                    </span>
                    {EMERGENCY_PILLS.map((pill) => (
                      <button
                        key={pill.command}
                        type="button"
                        onClick={() => handleSendPill(pill.command)}
                        disabled={isTyping}
                        className="text-[9px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 transition-all px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200/40 cursor-pointer"
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="relative"
                  >
                    <input 
                      type="text" 
                      placeholder="Ask me anything..." 
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      disabled={isTyping}
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20 transition-all disabled:opacity-50"
                    />
                    <button 
                      type="submit"
                      disabled={!inputMessage.trim() || isTyping}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 size-9 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:bg-slate-300"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={`size-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare size={24} />
      </motion.button>
    </div>
  );
};

export default SupportChatWidget;
