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
  User as UserIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Bot,
  Loader2,
  ShieldAlert,
  FileWarning,
  DollarSign,
  AlertOctagon,
  Check,
  Shield,
  Activity,
  UserCheck
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
  const { 
    user, 
    allUsers, 
    vehicles, 
    allBookings,
    incidents, 
    disputes, 
    eChallans, 
    updateIncidentStatus, 
    updateDisputeStatus, 
    createEChallan 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'incidents' | 'disputes' | 'echallans' | 'chat' | 'kb'>('incidents');
  const [searchQuery, setSearchQuery] = useState('');

  // E-Challan form state
  const [challanVehicleId, setChallanVehicleId] = useState('');
  const [challanCode, setChallanCode] = useState('');
  const [challanAmount, setChallanAmount] = useState('');
  const [challanDate, setChallanDate] = useState('');
  const [challanDescription, setChallanDescription] = useState('');
  const [submittingChallan, setSubmittingChallan] = useState(false);

  // Resolution state
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [incidentNotes, setIncidentNotes] = useState('');
  const [incidentStatusField, setIncidentStatusField] = useState('under_review');
  const [incidentActionType, setIncidentActionType] = useState('insurance_claim');

  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [disputeResolutionText, setDisputeResolutionText] = useState('');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! I'm your EliteDrive AI assistant. How can I help you with resolving disputes, logging traffic fines, or reviewing accident reports today?`,
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
      const api_key = process.env.GEMINI_API_KEY;
      if (!api_key) {
        throw new Error("Missing Gemini API Key");
      }

      // Build comprehensive context for the admin/manager
      const incidentCount = incidents?.length || 0;
      const disputeCount = disputes?.length || 0;
      const challanCount = eChallans?.length || 0;
      const vehicleCount = vehicles?.length || 0;
      const bookingCount = allBookings?.length || 0;
      const userCount = allUsers?.length || 0;

      const pendingIncidents = incidents?.filter((i: any) => i.status === 'under_review').length || 0;
      const pendingDisputes = disputes?.filter((d: any) => d.status === 'pending').length || 0;
      const pendingChallans = eChallans?.filter((c: any) => c.status === 'pending').length || 0;

      const ai = new GoogleGenAI({ apiKey: api_key });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `You are an expert EliteDrive Compliance & Support Assistant helping the admin/manager resolve operational issues. 
            Admin Context: ${user?.name} (${user?.role?.toUpperCase()})
            Current Platform State:
            - Total Incidents: ${incidentCount} (${pendingIncidents} under review)
            - Total Disputes: ${disputeCount} (${pendingDisputes} pending resolution)
            - Total E-Challans: ${challanCount} (${pendingChallans} pending)
            - Active Vehicles: ${vehicleCount}
            - Total Bookings: ${bookingCount}
            - Registered Users: ${userCount}
            
            User query: ${inputMessage}` }]
          }
        ],
        config: {
          systemInstruction: `You are an expert support assistant for EliteDrive's Compliance & Safety Hub. You help admin and manager staff resolve disputes, process damage claims, handle traffic violations (e-challans), and manage incidents. Your responses must be professional, actionable, and grounded in EliteDrive's policies.

ELITEDRIVE COMPLIANCE POLICIES:

🚨 INCIDENT MANAGEMENT:
- 6-hour filing window: Incidents filed after 6 hours trigger administrative flags
- Types: minor accident, major accident, theft, breakdown, flat tire, third-party damage
- Statuses: pending → under_review → approved/rejected
- Can request insurance claims or initiate internal investigations
- Late reports require manual security audit

📋 DISPUTE RESOLUTION:
- Types: damage charges, late return penalties, traffic violations (e-challans), payment issues, document issues
- Process: pending → under_review → resolved or rejected
- Provide formal adjudication with resolution terms
- Document all decisions for compliance records
- 7-day dispute window for e-challan tickets

🚗 E-CHALLAN MANAGEMENT:
- Auto-matches traffic citations to active bookings by vehicle plate & date
- If matched: customer auto-notified and amount added to outstanding balance
- 7-day dispute window before finalization
- Can manually create new e-challan tickets with vehicle & violation details
- Disputed e-challans trigger formal dispute record creation

⚖️ FRAUD DETECTION & BLACKLISTING:
- Monitor for multiple claims, same-incident filing, fake damages
- Outstanding balance blocks new bookings and payment gateway
- Blacklisted users cannot proceed at checkout
- Document fraud flags for auditing

💡 ACTIONABLE SUPPORT GUIDELINES:
- Use **bold** for action items and button names
- Use bullet points for step-by-step procedures
- Provide specific recommendations based on policy
- Always reference incident/dispute IDs when discussing cases
- For complex cases, recommend escalation to senior management
- Maintain professional tone while being empathetic to customers
- Cross-reference incidents with disputes and e-challans for pattern analysis`
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
        content: "I'm having trouble connecting to the support server. Please make sure GEMINI_API_KEY is configured or try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleChallanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challanVehicleId || !challanCode || !challanAmount || !challanDate) return;

    setSubmittingChallan(true);
    try {
      await createEChallan({
        vehicleId: challanVehicleId,
        challanNumber: challanCode,
        amount: parseFloat(challanAmount),
        date: challanDate,
      });
      // Reset form
      setChallanVehicleId('');
      setChallanCode('');
      setChallanAmount('');
      setChallanDate('');
      setChallanDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingChallan(false);
    }
  };

  const handleIncidentStatusUpdate = async (id: string) => {
    try {
      await updateIncidentStatus(id, incidentStatusField, incidentActionType, incidentNotes);
      setSelectedIncidentId(null);
      setIncidentNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisputeResolve = async (id: string) => {
    if (!disputeResolutionText.trim()) return;
    try {
      await updateDisputeStatus(id, 'resolved', disputeResolutionText);
      setSelectedDisputeId(null);
      setDisputeResolutionText('');
    } catch (err) {
      console.error(err);
    }
  };

  const faqs = [
    { q: 'How does E-Challan auto-coordination work?', a: 'When you file a traffic ticket with vehicle plate number and date, the system matches it with the active booking at that timestamp. It automatically issues an email, notifies the customer, and adds the fine amount to their outstanding balance.' },
    { q: 'What is the dispute window for customer traffic ticket citations?', a: 'Customers can pledge a dispute against an auto-charged E-challan within 7 days of citation filing. Pending disputes are listed in the Customer Disputes Tab.' },
    { q: 'What happens when a customer is blacklisted?', a: 'A blacklisted customer cannot place any new bookings, and is prevented from proceeding at the payment gateway checkout. Their details remain in the system for tracking history and pending outstanding balances.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Compliance & Safety Hub</h1>
          <p className="text-slate-500 font-medium">Process damage claims, resolve billing disputes, and issue traffic citations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-slate-100 rounded-[24px] w-fit flex-wrap gap-1">
        {[
          { id: 'incidents', label: 'Damage Incidents', icon: ShieldAlert },
          { id: 'disputes', label: 'Client Disputes', icon: AlertOctagon },
          { id: 'echallans', label: 'E-Challan Issue Desk', icon: FileWarning },
          { id: 'chat', label: 'AI Resolution Copilot', icon: Bot },
          { id: 'kb', label: 'Knowledge Base', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Incidents Desk */}
          {activeTab === 'incidents' && (
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="text-red-600" />
                Active Damage Reports ({incidents.length})
              </h3>
              
              <div className="space-y-4">
                {incidents.length > 0 ? (
                  incidents.map((inc: any) => {
                    const matchedUser = allUsers.find(u => u.id === inc.userId);
                    const matchedVehicle = vehicles.find(v => v.id === inc.vehicleId);
                    const isOverdueReport = inc.isLateReport;

                    return (
                      <div key={inc.id} className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 font-extrabold text-[9px] uppercase tracking-wider rounded">
                                {(inc.type || '').replace('_', ' ')}
                              </span>
                              {isOverdueReport && (
                                <span className="px-2 py-0.5 bg-rose-600 text-white font-extrabold text-[9px] uppercase tracking-wider rounded animate-pulse">
                                  LATENCY EXCEEDED (&gt;24H)
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-black text-slate-905 mt-2">
                              {matchedVehicle ? `${matchedVehicle.name} (${matchedVehicle.licensePlate})` : 'Unknown Vehicle'}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5 font-bold">
                              Reported by: <span className="text-slate-700">{matchedUser?.name || 'Customer'}</span> on {new Date(inc.submittedAt || inc.occurredAt).toLocaleString()}
                            </p>
                          </div>

                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${
                            inc.status === 'closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            inc.status === 'action_taken' ? 'bg-indigo-50 text-indigo-700 border-indigo-150' :
                            inc.status === 'under_review' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-red-50 text-red-600 border-red-150'
                          }`}>
                            {(inc.status || '').replace('_', ' ')}
                          </span>
                        </div>

                        {/* Statement/Narrative */}
                        <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-700 font-medium">
                          <p className="font-bold text-slate-900 mb-1">Incident Event Date: {new Date(inc.occurredAt).toLocaleString()}</p>
                          <p className="italic">"{inc.statement}"</p>
                          <p className="mt-2 text-[10px] text-slate-430">Location: {inc.location}</p>
                          {inc.firNumber && (
                            <p className="text-[10px] text-blue-700 font-black">FIR Registration Entry No: {inc.firNumber}</p>
                          )}
                        </div>

                        {/* Photo Attachments */}
                        {inc.photos && inc.photos.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Damage Attachment Proofs</p>
                            <div className="flex gap-2.5 overflow-x-auto py-1">
                              {inc.photos.map((p: string, idx: number) => (
                                <img key={idx} src={p} alt="Damage Scan" className="size-20 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0 hover:scale-105 transition-all cursor-pointer" />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action status note */}
                        {inc.actionType && (
                          <div className="p-3 bg-indigo-50/50 rounded-xl text-[11px] text-indigo-800 border border-indigo-100">
                            <span className="font-extrabold uppercase text-[9px] block mb-0.5">Administrative Action log</span>
                            <strong>Resolved Category:</strong> {(inc.actionType || '').replace('_', ' ')} • <em>{inc.notes || 'No notes added'}</em>
                          </div>
                        )}

                        {/* Expandable action zone */}
                        {selectedIncidentId === inc.id ? (
                          <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-inner">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Assigned Status</label>
                                <select 
                                  value={incidentStatusField}
                                  onChange={(e) => setIncidentStatusField(e.target.value)}
                                  className="w-full text-xs bg-white border border-slate-200 h-11 px-4 rounded-xl font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 transition-all cursor-pointer"
                                >
                                  <option value="under_review">Under Review</option>
                                  <option value="action_taken">Action Taken (Deducted/Logged)</option>
                                  <option value="closed">Closed / Resolved Case</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Resolution Category</label>
                                <select 
                                  value={incidentActionType}
                                  onChange={(e) => setIncidentActionType(e.target.value)}
                                  className="w-full text-xs bg-white border border-slate-200 h-11 px-4 rounded-xl font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 transition-all cursor-pointer"
                                >
                                  <option value="insurance_claim">Insurance Claim Processing</option>
                                  <option value="deposit_deduction">Security Deposit Chargeback</option>
                                  <option value="customer_settled">Direct User Handover Cash payment</option>
                                  <option value="no_action_required">Negligible Damage Waived</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Resolving Notes / Memo</label>
                              <textarea 
                                value={incidentNotes}
                                onChange={(e) => setIncidentNotes(e.target.value)}
                                placeholder="Describe final verdict or details on penalties/deductions..."
                                className="w-full text-xs bg-white border border-slate-200 rounded-xl p-4 h-24 font-medium text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 transition-all resize-none"
                              />
                            </div>

                            <div className="flex gap-2.5">
                              <button
                                type="button"
                                onClick={() => setSelectedIncidentId(null)}
                                className="px-5 py-2.5 text-xs font-black uppercase border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl shadow-xs transition-all active:scale-95"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleIncidentStatusUpdate(inc.id)}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                              >
                                Commit Status
                              </button>
                            </div>
                          </div>
                        ) : (
                          inc.status !== 'closed' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedIncidentId(inc.id);
                                setIncidentStatusField(inc.status);
                                setIncidentActionType(inc.actionType || 'insurance_claim');
                                setIncidentNotes(inc.notes || '');
                              }}
                              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-black uppercase rounded-xl transition-all"
                            >
                              Resolve / Change Action Status
                            </button>
                          )
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-205">
                    <p className="text-sm font-bold text-slate-400">No damage reports logged in system.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Disputes Desk */}
          {activeTab === 'disputes' && (
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <AlertOctagon className="text-amber-500" />
                Customer Grievance & Disputes ({disputes.length})
              </h3>

              <div className="space-y-4">
                {disputes.length > 0 ? (
                  disputes.map((dsp: any) => {
                    const matchedUser = allUsers.find(u => u.id === dsp.userId);

                    return (
                      <div key={dsp.id} className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-[9px] uppercase tracking-wider rounded">
                              {(dsp.type || '').replace('_', ' ')} Dispute
                            </span>
                            <h4 className="text-base font-black text-slate-905 mt-2">
                              Subject: "{dsp.title}"
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5 font-bold">
                              Booking Ref: <span className="text-blue-600">ID {dsp.bookingId ? dsp.bookingId.slice(-6).toUpperCase() : 'N/A'}</span> • Filed by: <span className="text-slate-700">{matchedUser?.name || 'Customer'}</span>
                            </p>
                          </div>

                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${
                            dsp.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {dsp.status}
                          </span>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-700 font-medium">
                          <p className="font-bold text-slate-900 mb-1">Details Contexted:</p>
                          <p className="italic">"{dsp.description}"</p>
                          <p className="mt-2 text-[10px] text-slate-420">Timestamp context: {new Date(dsp.createdAt).toLocaleString()}</p>
                        </div>

                        {dsp.resolution && (
                          <div className="p-3.5 bg-emerald-50 text-emerald-850 rounded-2xl border border-emerald-100 text-xs">
                            <span className="font-extrabold uppercase text-[9px] text-emerald-600 block">Resolution Memo</span>
                            <p className="font-medium">Resolved at: {new Date(dsp.resolvedAt || '').toLocaleString()}</p>
                            <p className="mt-1 italic">"{dsp.resolution}"</p>
                          </div>
                        )}

                        {selectedDisputeId === dsp.id ? (
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-200">
                            <div>
                              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Resolution Response Memo *</label>
                              <textarea 
                                value={disputeResolutionText}
                                onChange={(e) => setDisputeResolutionText(e.target.value)}
                                placeholder="Describe decision, refunds issued, or actions to satisfy grievance..."
                                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-3 h-20 font-medium text-slate-800"
                                required
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedDisputeId(null)}
                                className="px-4 py-2 text-xs font-black uppercase border border-slate-200 text-slate-600 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDisputeResolve(dsp.id)}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase rounded-lg"
                              >
                                Confirm Resolution
                              </button>
                            </div>
                          </div>
                        ) : (
                          dsp.status !== 'resolved' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDisputeId(dsp.id);
                                setDisputeResolutionText('');
                              }}
                              className="px-4 py-2 border border-slate-200 text-blue-600 hover:bg-blue-50 text-[10px] font-black uppercase rounded-xl transition-all"
                            >
                              Process Resolve Dispute
                            </button>
                          )
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-205">
                    <p className="text-sm font-bold text-slate-400">No active customer disputes.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* E-Challans Issue Desk */}
          {activeTab === 'echallans' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Log new E-Challan */}
              <div className="bg-white p-8 rounded-3xl border border-slate-150 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-905">Issue / Log E-Challan Fine Ticket</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    System will automatically scan active booking overlapping citation date to penalize the correct customer.
                  </p>
                </div>

                <form onSubmit={handleChallanSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Select Offending Vehicle *</label>
                      <select
                        value={challanVehicleId}
                        onChange={(e) => setChallanVehicleId(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 h-11 px-4 font-bold text-slate-800 bg-white"
                        required
                      >
                        <option value="">-- Choose Vehicle Plate --</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.name} ({v.licensePlate || v.id})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Citation/Ticket Doc ID *</label>
                      <input 
                        type="text" 
                        value={challanCode}
                        onChange={(e) => setChallanCode(e.target.value)}
                        placeholder="e.g. PK-771239-A"
                        className="w-full text-xs rounded-xl border border-slate-200 h-11 px-4 font-semibold text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Violation Ticket Amount (PKR) *</label>
                      <input 
                        type="number" 
                        value={challanAmount}
                        onChange={(e) => setChallanAmount(e.target.value)}
                        placeholder="e.g. 1500"
                        className="w-full text-xs rounded-xl border border-slate-200 h-11 px-4 font-semibold text-slate-800 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Offense Date &amp; Time *</label>
                      <input 
                        type="datetime-local" 
                        value={challanDate}
                        onChange={(e) => setChallanDate(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 h-11 px-4 font-semibold text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Description / Location Details</label>
                    <textarea 
                      value={challanDescription}
                      onChange={(e) => setChallanDescription(e.target.value)}
                      placeholder="e.g. Speeding citation recorded at Lahore-Islamabad Motorway Km 210 North."
                      className="w-full text-xs rounded-xl border border-slate-200 p-4 font-medium h-16 text-slate-805"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingChallan}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-red-100 transition-all disabled:opacity-50"
                  >
                    {submittingChallan ? 'Checking Registry...' : 'Lodge Fine & Auto-Penalize User'}
                  </button>
                </form>
              </div>

              {/* Historical logged citations */}
              <div className="space-y-4">
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileWarning className="text-amber-500" />
                  Traffic Fines Registry ({eChallans.length})
                </h4>

                <div className="space-y-3">
                  {eChallans.length > 0 ? (
                    eChallans.map((chall: any) => {
                      const matchedVeh = vehicles.find(v => v.id === chall.vehicleId);
                      const matchedBook = allBookings.find(b => b.id === chall.bookingId);
                      const matchedUsr = matchedBook ? allUsers.find(u => u.id === matchedBook.userId) : null;

                      return (
                        <div key={chall.id} className="bg-white p-5 rounded-3xl border border-slate-150 flex items-center justify-between gap-4 flex-wrap hover:shadow-xs transition-all">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase">
                                Ticket {chall.challanCode}
                              </span>
                              <span className={`text-[9px] font-black uppercase tracking-wider border px-2 py-0.5 rounded ${
                                chall.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                chall.status === 'disputed' ? 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse' :
                                'bg-red-105 text-red-700 border-red-100'
                              }`}>
                                {chall.status}
                              </span>
                            </div>
                            <h5 className="font-extrabold text-sm text-slate-900 mt-2">
                              {matchedVeh ? `${matchedVeh.name} (${matchedVeh.licensePlate})` : 'Unknown Vehicle'}
                            </h5>
                            <p className="text-xs text-slate-430 font-medium">
                              Offense: <strong>{new Date(chall.date).toLocaleString()}</strong> • Matched Driver: <strong>{matchedUsr?.name || 'Unmatched (Toll/Staff)'}</strong>
                            </p>
                            <p className="text-[11px] font-light text-slate-500 mt-0.5 italic">"{chall.description}"</p>
                          </div>

                          <div className="text-right">
                            <p className="text-base font-black text-red-600">PKR {chall.amount.toLocaleString()}</p>
                            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Penalized fine</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-205">
                      <p className="text-xs font-bold text-slate-400">No citations logged in system history.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* AI assistant Copilot tab */}
          {activeTab === 'chat' && (
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden h-[600px] flex flex-col">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-blue-600 text-white animate-in fade-in">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight font-sans">AI Safety Helpdesk</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">EliteDrive Assistant • Connected</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Online</span>
                </div>
              </div>

              <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/30">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`size-10 rounded-xl flex items-center justify-center text-white shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                      {msg.role === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
                    </div>
                    <div className={`p-4 shadow-sm border border-slate-100 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-3xl rounded-tr-none border-blue-500' 
                        : 'bg-white text-slate-700 rounded-3xl rounded-tl-none'
                    }`}>
                      <div className={`text-xs font-medium leading-relaxed prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
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
                      <span className="text-xs font-bold text-slate-400">EliteDrive is scanning safety registries...</span>
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
                    placeholder="Ask about fine amounts, damage waivers, or blacklisting policies..." 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isTyping}
                    className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20 transition-all disabled:opacity-50"
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

          {/* FAQ panel */}
          {activeTab === 'kb' && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-xl font-black text-slate-900">Policies & FAQ Database</h3>
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

        </div>

        {/* Sidebar statistics columns */}
        <div className="col-span-12 lg:col-span-4 space-y-8 animate-in slide-in-from-right-3 duration-500">
          
          {/* Quick Registry Metrics Counters */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-905">Compliance Registry</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50/50 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total damage files</p>
                  <p className="font-semibold text-slate-600 mt-0.5">Active claims & FIRs</p>
                </div>
                <span className="size-8 rounded-full bg-red-100 text-red-650 flex items-center justify-center font-black">
                  {incidents.filter((i: any) => i.status !== 'closed').length}
                </span>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unresolved disputes</p>
                  <p className="font-semibold text-slate-600 mt-0.5">Client objections</p>
                </div>
                <span className="size-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                  {disputes.filter((d: any) => d.status !== 'resolved').length}
                </span>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Citations Filed</p>
                  <p className="font-semibold text-slate-600 mt-0.5">E-Challan penal logs</p>
                </div>
                <span className="size-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                  {eChallans.length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-150 shadow-sm relative overflow-hidden">
            <h3 className="text-xl font-black mb-2 text-slate-900 relative z-10">Safe Drive Policy</h3>
            <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed relative z-10">
              EliteDrive coordinates with traffic regulatory database in real-time. Unassigned citations are audited weekly by staff members.
            </p>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 relative z-10 flex items-center gap-3">
              <ShieldAlert className="text-amber-500 shrink-0" />
              <div className="text-[10px] font-bold leading-none">
                <p className="uppercase text-amber-600 tracking-wider">Automated Audit Panel</p>
                <p className="text-slate-550 mt-1">Status: Online and Enforcing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;
