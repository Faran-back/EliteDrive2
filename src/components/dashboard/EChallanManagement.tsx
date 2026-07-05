import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Calendar, 
  Banknote, 
  User, 
  Car, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Scale, 
  ShieldCheck, 
  Sparkles, 
  SearchCode,
  Fingerprint,
  TrendingDown,
  Trash2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

const EChallanManagement: React.FC = () => {
  const { eChallans, vehicles, allBookings, allUsers, createEChallan, disputeEChallan, removeEChallan, showToast } = useStore();
  
  // Form states
  const [ticketNumber, setTicketNumber] = useState('');
  const [violationDate, setViolationDate] = useState(new Date().toISOString().split('T')[0]);
  const [fineAmount, setFineAmount] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  
  // Search / filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'finalized' | 'disputed'>('all');
  
  // Interactive Live Lookup calculation
  const lookupResult = useMemo(() => {
    if (!selectedVehicleId || !violationDate) return null;
    
    // Look up active/completed bookings for this vehicle that encompass the violation date
    const matchedBooking = allBookings.find(b => {
      if (b.vehicleId !== selectedVehicleId) return false;
      if (b.status !== 'active' && b.status !== 'completed') return false;
      return (b.startDate <= violationDate && b.endDate >= violationDate);
    });
    
    if (matchedBooking) {
      const driver = allUsers.find(u => u.id === matchedBooking.userId);
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      return {
        found: true,
        booking: matchedBooking,
        driver: driver,
        vehicle: vehicle,
        outstandingBalance: driver?.outstandingBalance || 0
      };
    }
    
    return { found: false };
  }, [selectedVehicleId, violationDate, allBookings, allUsers, vehicles]);

  // Handle Log Ticket Submit
  const handleLogViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNumber || !violationDate || !fineAmount || !selectedVehicleId) {
      showToast('Please complete all form fields.', 'error');
      return;
    }

    try {
      await createEChallan({
        challanNumber: ticketNumber,
        date: violationDate,
        amount: Number(fineAmount),
        vehicleId: selectedVehicleId
      });
      
      // Success is notified by context toast, clear ticket state but keep date/vehicle for batch entries
      setTicketNumber('');
      setFineAmount('');
    } catch (err) {
      console.error(err);
      showToast('Could not log traffic ticket.', 'error');
    }
  };

  // Filtered Challans
  const filteredChallans = useMemo(() => {
    return eChallans.filter(chal => {
      const vehicle = vehicles.find(v => v.id === chal.vehicleId);
      const driverName = chal.matchedUserName || '';
      
      const matchesSearch = 
        chal.challanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle?.licensePlate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chal.id.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = statusFilter === 'all' || chal.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [eChallans, vehicles, searchQuery, statusFilter]);

  const handleDispute = async (id: string) => {
    try {
      await disputeEChallan(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Dynamic Header */}
      <div className="bg-white rounded-[40px] p-8 md:p-10 relative overflow-hidden border border-slate-150 shadow-sm">
        <div className="absolute right-0 bottom-0 opacity-5 rotate-12 translate-y-1/4 translate-x-1/8 text-blue-600">
          <Scale size={280} />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={12} className="text-blue-500 animate-pulse" />
            Integrative E-Traffic Violation Bridge
          </div>
          <h1 className="text-3xl md:text-4.5xl font-black tracking-tight leading-none text-slate-900">
            E-Challan Registry Desk
          </h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Record state traffic tickets, automate associated driver lookup, and immediately debit current liabilities. If a vehicle is flagged on a violation date, the matching active renter is charged instantly and sent a digital notification alert.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form & Live Lookup Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Log Violation Ticket</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Input ticket coordinates to execute automated driver lookup.</p>
            </div>

            <form onSubmit={handleLogViolation} className="space-y-4">
              {/* Ticket number */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Challan / Ticket Number *</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    placeholder="e.g. LHR-76543210"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all text-slate-900 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Violation Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="date" 
                    value={violationDate}
                    onChange={(e) => setViolationDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all text-slate-900 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fine Amount (PKR) *</label>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="number" 
                    value={fineAmount}
                    onChange={(e) => setFineAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all text-slate-900 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Vehicle selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Offending Vehicle *</label>
                <div className="relative">
                  <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select 
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all text-slate-900 outline-none appearance-none"
                    required
                  >
                    <option value="">-- Choose fleet vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.licensePlate || 'No Plate ID'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Driver Lookup Box */}
              <AnimatePresence mode="wait">
                {lookupResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="pt-2"
                  >
                    {lookupResult.found ? (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-3xl space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl mt-0.5">
                            <SearchCode size={18} />
                          </div>
                          <div className="space-y-1 flex-1">
                            <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-wider">Associated Driver Identified!</h4>
                            <p className="text-[11px] text-emerald-700 font-semibold leading-relaxed">
                              On {violationDate}, the vehicle was rented under booking <span className="font-mono bg-emerald-100 px-1 rounded text-emerald-800">{lookupResult.booking?.id ? lookupResult.booking.id.slice(-6).toUpperCase() : 'N/A'}</span>.
                            </p>
                          </div>
                        </div>

                        {lookupResult.driver && (
                          <div className="bg-white/80 p-3 rounded-2xl border border-emerald-100/50 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="size-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-black text-slate-600 text-[10px] uppercase">
                                {lookupResult.driver.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 leading-tight">{lookupResult.driver.name}</p>
                                <p className="text-[10px] text-slate-450 font-bold">{lookupResult.driver.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block text-[8px] font-black text-slate-400 uppercase">Outstanding Balance</span>
                              <span className="font-extrabold text-slate-800">PKR {lookupResult.outstandingBalance.toLocaleString()}</span>
                            </div>
                          </div>
                        )}

                        <div className="text-[10px] text-emerald-800 font-bold bg-emerald-100/40 p-2.5 rounded-xl border border-emerald-100">
                          ⚡ <strong>Auto-Debit:</strong> PKR {fineAmount ? Number(fineAmount).toLocaleString() : '0'} will be added directly to this user's balance and they will be instantly notified.
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl mt-0.5">
                            <AlertTriangle size={18} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-wider">No Active Booking Matched</h4>
                            <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                              No driver matched for this vehicle on {violationDate}. The ticket can still be filed against the vehicle's registry, but no auto-debit will occur.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit btn */}
              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                {lookupResult?.found ? 'Log Challan & Auto-Debit' : 'Log Vehicle Ticket'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Registry Feed & Filters */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            
            {/* Filter controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-1000">Violation Ledger</h3>
                <p className="text-xs text-slate-500 font-semibold">Track outstanding and cleared traffic violations.</p>
              </div>

              <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                {(['all', 'pending', 'disputed'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      statusFilter === tab
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Search inputs */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by ticket #, driver, license plate..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all text-slate-900 outline-none"
              />
            </div>

            {/* Challans ledger list */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredChallans.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-12 border border-dashed border-slate-150 rounded-3xl text-center text-slate-400 space-y-2"
                  >
                    <CheckCircle2 size={32} className="mx-auto text-slate-300" />
                    <p className="text-xs font-black uppercase tracking-wider">No Violations Found</p>
                    <p className="text-[11px] text-slate-400 font-medium">No recorded ticket entries match the filter criteria.</p>
                  </motion.div>
                ) : (
                  filteredChallans.map((chal) => {
                    const vehicleObj = vehicles.find(v => v.id === chal.vehicleId);
                    return (
                      <motion.div
                        key={chal.id}
                        layoutId={`challan-card-${chal.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-slate-50 hover:bg-white border border-slate-150 hover:border-slate-300 p-5 rounded-3xl transition-all relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="size-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 mt-0.5">
                            <Scale size={20} />
                          </div>
                          
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[9px] font-mono text-slate-400 font-black tracking-wider uppercase bg-white px-1.5 py-0.5 rounded border border-slate-150">
                                Ticket: {chal.challanNumber}
                              </span>
                              
                              {chal.status === 'disputed' ? (
                                <span className="bg-amber-50 text-amber-700 text-[8px] px-2 py-0.5 rounded-full font-black uppercase border border-amber-200">
                                  Disputed
                                </span>
                              ) : chal.matchedUserId ? (
                                <span className="bg-emerald-50 text-emerald-700 text-[8px] px-2 py-0.5 rounded-full font-black uppercase border border-emerald-200">
                                  Auto-Debited
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-600 text-[8px] px-2 py-0.5 rounded-full font-black uppercase border border-slate-200">
                                  Vehicle Only
                                </span>
                              )}

                              <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider flex items-center gap-1">
                                <Clock size={11} />
                                {new Date(chal.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>

                            <div className="text-xs">
                              Vehicle: <span className="text-slate-900 font-black">{vehicleObj?.name || 'Rented Vehicle'}</span>
                              {vehicleObj?.licensePlate && (
                                <span className="font-mono bg-white border border-slate-150 text-[9px] px-1 py-0.5 rounded text-slate-600 font-black ml-1 uppercase">{vehicleObj.licensePlate}</span>
                              )}
                            </div>

                            {chal.matchedUserName && (
                              <div className="text-[11px] font-bold text-slate-500">
                                Driver Matched: <span className="text-blue-600 font-black">{chal.matchedUserName}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Amount & action */}
                        <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-3 w-full md:w-auto pt-3 md:pt-0 border-t border-slate-200 md:border-t-0">
                          <div className="text-left md:text-right">
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Fine Liability</span>
                            <span className="text-sm font-black text-slate-900">PKR {chal.amount.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {chal.status === 'pending' && (
                              <button
                                onClick={() => handleDispute(chal.id)}
                                className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all border border-amber-200 shrink-0 cursor-pointer"
                              >
                                File Dispute
                              </button>
                            )}

                            <button
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to waive and remove this E-Challan ticket (${chal.challanNumber})? This will clear PKR ${chal.amount.toLocaleString()} from the driver's outstanding balance.`)) {
                                  try {
                                    await removeEChallan(chal.id);
                                  } catch (err: any) {
                                    showToast?.(err.message || 'Failed to waive challan.', 'error');
                                  }
                                }
                              }}
                              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all border border-rose-200 shrink-0 cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 size={11} />
                              Waive Fine
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default EChallanManagement;
