import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Check, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Car, 
  User as UserIcon, 
  Calendar, 
  X,
  Plus,
  HelpCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Booking } from '../../types';

const formatReturnDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const hasTime = dateStr.includes('T') && !dateStr.endsWith('T00:00:00.000Z') && !dateStr.endsWith('T00:00:00Z');
    
    if (hasTime) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

const ReturnVerificationWidget: React.FC = () => {
  const { vehicles, allBookings, allUsers, updateBooking, updateVehicle, showToast } = useStore();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Inspection Checklist State
  const [exteriorChecked, setExteriorChecked] = useState(false);
  const [interiorClean, setInteriorClean] = useState(false);
  const [fuelChecked, setFuelChecked] = useState(false);
  const [keysCollected, setKeysCollected] = useState(false);
  
  // Penalty / Return States
  const [hasPenalty, setHasPenalty] = useState(false);
  const [penaltyType, setPenaltyType] = useState<'minor_scratch' | 'major_accident' | 'cleaning_issue' | 'late' | 'other'>('minor_scratch');
  const [penaltyAmount, setPenaltyAmount] = useState<number>(0);
  const [penaltyNotes, setPenaltyNotes] = useState('');
  
  // Group logic: Get all bookings that are 'active' (Approved and on trip)
  const activeBookings = allBookings.filter(b => b.status === 'active');
  
  // Categorize bookings
  const overdueBookings = activeBookings.filter(b => {
    const end = new Date(b.endDate);
    return end <= new Date();
  });

  const ongoingBookings = activeBookings.filter(b => {
    const end = new Date(b.endDate);
    return end > new Date();
  });

  const handleOpenReviewModal = (booking: Booking) => {
    setSelectedBooking(booking);
    
    // Set default values
    setExteriorChecked(false);
    setInteriorClean(false);
    setFuelChecked(false);
    setKeysCollected(false);
    setHasPenalty(false);
    setPenaltyAmount(0);
    setPenaltyType('minor_scratch');
    setPenaltyNotes('');
    
    setIsModalOpen(true);
  };

  const handlePenaltyTypeChange = (type: 'minor_scratch' | 'major_accident' | 'cleaning_issue' | 'late' | 'other') => {
    setPenaltyType(type);
    if (type === 'minor_scratch') {
      setPenaltyAmount(12000);
      setPenaltyNotes('Minor exterior body panels scratch detected on return inspection.');
    } else if (type === 'major_accident') {
      setPenaltyAmount(50000);
      setPenaltyNotes('Significant front bumper/body damage. Retaining security deposit for insurance claim process.');
    } else if (type === 'cleaning_issue') {
      setPenaltyAmount(2500);
      setPenaltyNotes('Severe cabin interior stains/litter. Standard deep cleaning fee applied.');
    } else if (type === 'late') {
      setPenaltyAmount(4000);
      setPenaltyNotes('Late return penalty. Vehicle returned past scheduled window.');
    } else {
      setPenaltyAmount(0);
      setPenaltyNotes('');
    }
  };

  const handleSubmitReturn = async () => {
    if (!selectedBooking) return;
    
    if (!keysCollected) {
      showToast('Please confirm physical vehicle keys have been collected.', 'error');
      return;
    }

    try {
      // 1. Update the booking status to completed
      await updateBooking(selectedBooking.id, { 
        status: 'completed'
      });

      // 2. Double check vehicle status is set to available
      await updateVehicle(selectedBooking.vehicleId, {
        status: 'available'
      });

      // 3. Create a staff notification about the logged return & details
      const vehicle = vehicles.find(v => v.id === selectedBooking.vehicleId);
      const customer = allUsers.find(u => u.id === selectedBooking.userId);
      const penaltyText = hasPenalty ? ` with applied penalty of PKR ${penaltyAmount.toLocaleString()} (${penaltyNotes})` : '';
      
      showToast(`Vehicle return processed successfully! ${vehicle?.name || 'Car'} is now live and AVAILABLE on Explore Fleet.`, 'success');
      setIsModalOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error submitting return inspection:', error);
      showToast('Failed to complete return inspection. Please try again.', 'error');
    }
  };

  if (activeBookings.length === 0) {
    return null; // Don't block screen space if no active rentals are live
  }

  return (
    <div className="bg-white rounded-[40px] border border-slate-150 p-8 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-xl font-black text-slate-1000 tracking-tight">Active Fleet Return & Release Desk</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            As soon as a client's booking period ends, verify return satisfaction, resolve incidents, and click 'Release' to restore the car to the active rental fleet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-wider">
            {activeBookings.length} Active Rentals
          </span>
          {overdueBookings.length > 0 && (
            <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-[10px] font-black uppercase tracking-wider animate-bounce">
              {overdueBookings.length} Pending Return
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overdue Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
            <AlertTriangle size={14} />
            Due / Pending Returns ({overdueBookings.length})
          </h3>
          {overdueBookings.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {overdueBookings.map((b) => {
                const vehicle = vehicles.find(v => v.id === b.vehicleId);
                const customer = allUsers.find(u => u.id === b.userId);
                const hrsPassed = Math.max(1, Math.ceil((new Date().getTime() - new Date(b.endDate).getTime()) / (1000 * 60 * 60)));
                
                return (
                  <div key={b.id} className="bg-red-50/20 border border-red-100 p-4 rounded-3xl flex justify-between items-center gap-4 hover:bg-red-50/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                        {vehicle?.image ? (
                          <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                        ) : (
                          <Car size={18} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">{vehicle?.name || 'Reserved Car'}</h4>
                        <p className="text-[10px] text-red-600 font-bold">
                          Overdue by {hrsPassed} {hrsPassed === 1 ? 'hour' : 'hours'}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium">Scheduled return: {formatReturnDate(b.endDate)}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">Renter: {customer?.name || 'Verified Member'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenReviewModal(b)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-red-100"
                    >
                      Process Return
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 p-6 rounded-3xl text-center text-slate-450 text-xs font-semibold">
              No pending returns overdue at the moment. All live rentals are on schedule!
            </div>
          )}
        </div>

        {/* Ongoing Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Clock size={14} />
            Ongoing Active Trips ({ongoingBookings.length})
          </h3>
          {ongoingBookings.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {ongoingBookings.map((b) => {
                const vehicle = vehicles.find(v => v.id === b.vehicleId);
                const customer = allUsers.find(u => u.id === b.userId);
                
                return (
                  <div key={b.id} className="bg-slate-50 border border-slate-150 p-4 rounded-3xl flex justify-between items-center gap-4 hover:bg-slate-100/60 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                        {vehicle?.image ? (
                          <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                        ) : (
                          <Car size={18} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-1000 leading-tight">{vehicle?.name || 'Active Car'}</h4>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                          On trip • Ends {formatReturnDate(b.endDate)}
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold">Renter: {customer?.name || 'Verified Member'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenReviewModal(b)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all border border-slate-200"
                    >
                      Early Return
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 p-6 rounded-3xl text-center text-slate-450 text-xs font-semibold">
              No ongoing trips active right now.
            </div>
          )}
        </div>
      </div>

      {/* Return Inspection Modal */}
      <AnimatePresence>
        {isModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden z-10"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 rounded-full mb-2 inline-block">
                      Official Inspection Desk
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                      Process Vehicle Return
                    </h2>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  
                  {/* Left panel: Vehicle Info & Inspection Checklist */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Vehicle Details</p>
                      <div className="flex items-center gap-3">
                        <div className="size-14 rounded-2xl overflow-hidden bg-white border border-slate-200">
                          <img 
                            src={vehicles.find(v => v.id === selectedBooking.vehicleId)?.image} 
                            alt="Car" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">
                            {vehicles.find(v => v.id === selectedBooking.vehicleId)?.name}
                          </h4>
                          <p className="text-[10px] text-slate-450 font-bold">
                            Plate ID: {selectedBooking.vehicleId.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-[10px] text-slate-450 font-bold">
                            Chauffeur: {selectedBooking.chauffeurSelected ? 'Included' : 'Self-Drive'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Inspection Checklist */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inspection Checklist</p>
                      
                      <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-150 cursor-pointer hover:bg-slate-100/50 transition-all text-sm font-semibold select-none">
                        <input 
                          type="checkbox" 
                          checked={exteriorChecked}
                          onChange={(e) => setExteriorChecked(e.target.checked)}
                          className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-slate-700">Exterior body inspected</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-150 cursor-pointer hover:bg-slate-100/50 transition-all text-sm font-semibold select-none">
                        <input 
                          type="checkbox" 
                          checked={interiorClean}
                          onChange={(e) => setInteriorClean(e.target.checked)}
                          className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-slate-700">Cabin interior stain-free</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-150 cursor-pointer hover:bg-slate-100/50 transition-all text-sm font-semibold select-none">
                        <input 
                          type="checkbox" 
                          checked={fuelChecked}
                          onChange={(e) => setFuelChecked(e.target.checked)}
                          className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-slate-700">Fuel level matched & verified</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border-2 border-[#2563EB]/20 bg-blue-50/5 cursor-pointer hover:bg-blue-50/10 transition-all text-sm font-bold select-none text-blue-700">
                        <input 
                          type="checkbox" 
                          checked={keysCollected}
                          onChange={(e) => setKeysCollected(e.target.checked)}
                          className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span>Physical vehicle keys collected</span>
                      </label>
                    </div>
                  </div>

                  {/* Right panel: Incidents, Mishaps & Penalty charges */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incidents & Mishaps</p>
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={hasPenalty}
                            onChange={(e) => {
                              setHasPenalty(e.target.checked);
                              if (e.target.checked) {
                                handlePenaltyTypeChange('minor_scratch');
                              } else {
                                setPenaltyAmount(0);
                                setPenaltyNotes('');
                              }
                            }}
                            className="size-4 rounded text-blue-600 focus:ring-blue-600" 
                          />
                          <span className="text-xs font-black uppercase text-red-500">Mishap Fees?</span>
                        </label>
                      </div>

                      {hasPenalty ? (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-black text-slate-450">Violation / Incident Type</span>
                            <select
                              value={penaltyType}
                              onChange={(e) => handlePenaltyTypeChange(e.target.value as any)}
                              className="w-full text-xs font-black p-3 rounded-xl bg-white border border-slate-200 outline-none"
                            >
                              <option value="minor_scratch">Minor Scratch (PKR 12k)</option>
                              <option value="major_accident">Major Crash (Security Hold - PKR 50k)</option>
                              <option value="cleaning_issue">Deep Cleaning Penalty (PKR 2.5k)</option>
                              <option value="late">Late Return Past Schedule (PKR 4k)</option>
                              <option value="other">Other Customs Mishap</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-black text-slate-440">Adjust Amount manually (PKR)</span>
                            <input 
                              type="number"
                              value={penaltyAmount}
                              onChange={(e) => setPenaltyAmount(parseInt(e.target.value) || 0)}
                              className="w-full text-xs font-black p-3 rounded-xl bg-white border border-slate-200 outline-none"
                              placeholder="PKR Amount"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-black text-slate-440">Notes & Incident Report Log</span>
                            <textarea
                              rows={2}
                              value={penaltyNotes}
                              onChange={(e) => setPenaltyNotes(e.target.value)}
                              className="w-full text-xs font-bold p-3 rounded-xl bg-white border border-slate-200 outline-none resize-none"
                              placeholder="Record scratches or reasons..."
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-450 font-bold">
                          No mishaps reported or checked during physical vehicle handover inspection.
                        </p>
                      )}
                    </div>

                    {/* Operational Summary */}
                    <div className="p-5 bg-blue-50/20 border border-blue-100/50 rounded-3xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Release Summary</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-bold text-slate-500">
                          <span>Return Status</span>
                          <span className={keysCollected ? "text-green-600" : "text-amber-500"}>
                            {keysCollected ? "Handed Over" : "Awaiting Keys"}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-500">
                          <span>Mishap Penalty Due</span>
                          <span className={hasPenalty ? "text-red-500 font-extrabold" : "text-slate-500"}>
                            PKR {penaltyAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Confirmations & releases button */}
                <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3.5 bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReturn}
                    disabled={!keysCollected}
                    className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-white shadow-xl ${
                      keysCollected 
                        ? 'bg-[#2563EB] hover:bg-blue-700 shadow-blue-105 cursor-pointer' 
                        : 'bg-slate-300 cursor-not-allowed opacity-60'
                    }`}
                  >
                    Complete return & release vehicle
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReturnVerificationWidget;
