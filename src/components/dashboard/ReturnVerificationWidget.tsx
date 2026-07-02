import React, { useState, useEffect } from 'react';
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
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Gauge,
  Info,
  Key,
  Flame,
  UserCheck,
  MapPin,
  ClipboardCheck,
  AlertCircle,
  Upload
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

const FUEL_LEVEL_VALUES: Record<string, number> = {
  "Empty": 0,
  "25%": 1,
  "50%": 2,
  "75%": 3,
  "Full": 4
};

const ReturnVerificationWidget: React.FC = () => {
  const { vehicles, allBookings, allUsers, updateBooking, updateVehicle, queueBookingTransaction, refreshData, showToast, user } = useStore();
  
  // Background Job States (Queue system)
  const [activeJob, setActiveJob] = useState<{
    id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    statusText: string;
  } | null>(null);

  const pollJobStatus = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('elitedrive_token');
        const res = await fetch(`/api/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch job');
        const job = await res.json();
        
        setActiveJob({
          id: job.id,
          status: job.status,
          progress: job.progress,
          statusText: job.statusText
        });

        if (job.status === 'completed') {
          clearInterval(interval);
          setTimeout(() => {
            setActiveJob(null);
            setIsModalOpen(false);
            setSelectedBooking(null);
            refreshData();
          }, 1000);
        } else if (job.status === 'failed') {
          clearInterval(interval);
          showToast(`Transaction queue failed: ${job.error || 'Unknown error'}`, 'error');
          setTimeout(() => {
            setActiveJob(null);
          }, 4000);
        }
      } catch (err) {
        console.error('Error polling job status:', err);
        clearInterval(interval);
        setActiveJob(null);
        showToast('Lost connection to background synchronization service.', 'error');
      }
    }, 500);
  };

  // Dashboard Tabs: 'checkout' (Pre-Rental Handover) or 'checkin' (Return Verification)
  const [activeTab, setActiveTab] = useState<'checkout' | 'checkin'>('checkout');
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Tab 1: Checkout Form States
  const [checkoutFuel, setCheckoutFuel] = useState<string>('Full');
  const [checkoutMileage, setCheckoutMileage] = useState<number>(35000);
  const [checkoutExterior, setCheckoutExterior] = useState<string>('No major scratches, perfect paint coat.');
  const [checkoutInterior, setCheckoutInterior] = useState<string>('Spotless cabin, vacuumed seats.');
  const [checkoutKeysHanded, setCheckoutKeysHanded] = useState<boolean>(false);
  const [checkoutAgreementSigned, setCheckoutAgreementSigned] = useState<boolean>(false);

  // Tab 2: Check-In Return Form States
  const [returnFuel, setReturnFuel] = useState<string>('Full');
  const [returnMileage, setReturnMileage] = useState<number>(35000);
  const [returnExterior, setReturnExterior] = useState<string>('');
  const [returnInterior, setReturnInterior] = useState<string>('');
  const [returnKeysCollected, setReturnKeysCollected] = useState<boolean>(false);
  
  // Return penalty calculators
  const [hasPenalty, setHasPenalty] = useState(false);
  const [penaltyType, setPenaltyType] = useState<'minor_scratch' | 'major_accident' | 'cleaning_issue' | 'late' | 'fuel_shortage' | 'other'>('minor_scratch');
  const [penaltyAmount, setPenaltyAmount] = useState<number>(0);
  const [penaltyNotes, setPenaltyNotes] = useState('');
  
  // Automatic pricing rules based on differences
  const [autoFuelFine, setAutoFuelFine] = useState<number>(0);
  const [autoLateFine, setAutoLateFine] = useState<number>(0);
  const [fuelShortageSteps, setFuelShortageSteps] = useState<number>(0);
  const [lateHoursCount, setLateHoursCount] = useState<number>(0);

  // 50/50 payment & Baseline condition photos states
  const [remainingPaymentCollected, setRemainingPaymentCollected] = useState<boolean>(false);
  const [localPrimaryImage, setLocalPrimaryImage] = useState<string>('');
  const [localGalleryImages, setLocalGalleryImages] = useState<string[]>(['', '', '', '']);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number | 'primary') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (index === 'primary') {
        setLocalPrimaryImage(base64);
      } else {
        setLocalGalleryImages(prev => {
          const next = [...prev];
          next[index] = base64;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter Bookings
  // Handover (Checkout) Desk: Show bookings that are approved but not yet active
  const approvedBookings = allBookings.filter(b => b.status === 'pending' && (b.paymentMethod !== 'bank_transfer' || b.bankReceiptApproved === 'approved'));
  
  // Return (Check-In) Desk: Show bookings that are active
  const activeBookings = allBookings.filter(b => b.status === 'active');
  
  // Overdue Returns
  const overdueBookings = activeBookings.filter(b => {
    const end = new Date(b.endDate);
    return end <= new Date();
  });

  const ongoingBookings = activeBookings.filter(b => {
    const end = new Date(b.endDate);
    return end > new Date();
  });

  // Calculate automatic penalty fees when return options modify
  useEffect(() => {
    if (activeTab === 'checkin' && selectedBooking) {
      // 1. Calculate Fuel Fine
      // Compare preRentalChecklist fuel level with returned fuel level
      const preChecklist = selectedBooking.preRentalChecklist || { fuelLevel: "Full", mileage: 35000 };
      const preFuelVal = FUEL_LEVEL_VALUES[preChecklist.fuelLevel] ?? 4;
      const retFuelVal = FUEL_LEVEL_VALUES[returnFuel] ?? 4;
      
      const stepDiff = Math.max(0, preFuelVal - retFuelVal);
      setFuelShortageSteps(stepDiff);
      
      // Penalty: PKR 2,500 per 25% shortage step
      const fuelFine = stepDiff * 2500;
      setAutoFuelFine(fuelFine);

      // 2. Calculate Late Return Fine
      const end = new Date(selectedBooking.endDate);
      const now = new Date();
      let lateFine = 0;
      let hoursLate = 0;
      
      if (now > end) {
        const msDiff = now.getTime() - end.getTime();
        hoursLate = Math.ceil(msDiff / (1000 * 60 * 60));
        setLateHoursCount(hoursLate);
        
        // Late Fine: PKR 1,500 per hour late
        lateFine = hoursLate * 1500;
        setAutoLateFine(lateFine);
      } else {
        setLateHoursCount(0);
        setAutoLateFine(0);
      }

      // 3. Set penalty states based on calculations
      if (stepDiff > 0 || hoursLate > 0) {
        setHasPenalty(true);
        let calculatedSum = fuelFine + lateFine;
        setPenaltyAmount(calculatedSum);
        
        let notesArr: string[] = [];
        if (stepDiff > 0) {
          notesArr.push(`Fuel Shortage: Returned at ${returnFuel} vs Handover at ${preChecklist.fuelLevel} (${stepDiff} steps shortage). Fine: PKR ${fuelFine.toLocaleString()}`);
        }
        if (hoursLate > 0) {
          notesArr.push(`Late Return: Returned ${hoursLate} hours past schedule. Fine: PKR ${lateFine.toLocaleString()}`);
        }
        setPenaltyNotes(notesArr.join(' | '));
      }
    }
  }, [returnFuel, returnMileage, selectedBooking, activeTab]);

  const handleOpenReviewModal = (booking: Booking) => {
    setSelectedBooking(booking);
    
    // Initialize 50/50 payment status
    setRemainingPaymentCollected(booking.remainingPaymentStatus === 'paid');

    // Initialize baseline vehicle condition photos
    const vehicleObj = vehicles.find(v => v.id === booking.vehicleId);
    setLocalPrimaryImage(vehicleObj?.image || '');
    if (vehicleObj?.images && vehicleObj.images.length > 0) {
      const loaded = [...vehicleObj.images];
      while (loaded.length < 4) {
        loaded.push('');
      }
      setLocalGalleryImages(loaded);
    } else {
      // Use fallback baseline images so we have a consistent baseline!
      const fallbacks = [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600'
      ];
      setLocalGalleryImages(fallbacks);
    }

    if (activeTab === 'checkout') {
      // Find current vehicle mileage as default
      const defaultMileage = vehicleObj?.mileage || 35000;
      setCheckoutMileage(defaultMileage);
      setCheckoutFuel('Full');
      setCheckoutExterior('No major scratches, perfect paint coat.');
      setCheckoutInterior('Spotless cabin, vacuumed seats.');
      setCheckoutKeysHanded(false);
      setCheckoutAgreementSigned(false);
    } else {
      // Set default values for return
      const preChecklist = booking.preRentalChecklist || { fuelLevel: "Full", mileage: 35000, exteriorNotes: "No major scratches", interiorNotes: "Spotless cabin" };
      setReturnFuel(preChecklist.fuelLevel || 'Full');
      setReturnMileage((Number(preChecklist.mileage) || 35000) + 120); // estimate some trip kms
      setReturnExterior('No new damage detected.');
      setReturnInterior('Cabin returned clean.');
      setReturnKeysCollected(false);
      setHasPenalty(false);
      setPenaltyAmount(0);
      setPenaltyType('minor_scratch');
      setPenaltyNotes('');
      setAutoFuelFine(0);
      setAutoLateFine(0);
    }
    
    setIsModalOpen(true);
  };

  const handlePenaltyTypeChange = (type: 'minor_scratch' | 'major_accident' | 'cleaning_issue' | 'late' | 'fuel_shortage' | 'other') => {
    setPenaltyType(type);
    setHasPenalty(true);
    
    // Add custom base values on top of auto calculated values
    if (type === 'minor_scratch') {
      setPenaltyAmount(prev => (autoFuelFine + autoLateFine) + 12000);
      setPenaltyNotes(prev => `Minor exterior body panels scratch detected. Fee: PKR 12,000. ` + (autoFuelFine || autoLateFine ? `[Auto Fines Included]` : ''));
    } else if (type === 'major_accident') {
      setPenaltyAmount(prev => (autoFuelFine + autoLateFine) + 50000);
      setPenaltyNotes(prev => `Significant Front bumper/body damage. Retaining security deposit. Fee: PKR 50,000. ` + (autoFuelFine || autoLateFine ? `[Auto Fines Included]` : ''));
    } else if (type === 'cleaning_issue') {
      setPenaltyAmount(prev => (autoFuelFine + autoLateFine) + 2500);
      setPenaltyNotes(prev => `Severe cabin interior stains/litter. Deep clean fee: PKR 2,500. ` + (autoFuelFine || autoLateFine ? `[Auto Fines Included]` : ''));
    } else if (type === 'fuel_shortage') {
      setPenaltyAmount(prev => prev); // keep current
    } else if (type === 'late') {
      setPenaltyAmount(prev => prev); // keep current
    } else {
      setPenaltyAmount(autoFuelFine + autoLateFine);
      setPenaltyNotes(`Custom return penalty adjustments logged.`);
    }
  };

  const handleCompleteHandover = async () => {
    if (!selectedBooking) return;
    
    if (!checkoutKeysHanded) {
      showToast('Please confirm physical vehicle keys have been handed over.', 'error');
      return;
    }
    if (!checkoutAgreementSigned) {
      showToast('Please verify customer has signed physical / digital rental agreement form.', 'error');
      return;
    }
    if (selectedBooking.paymentType === 'partial' && !remainingPaymentCollected) {
      showToast('Please collect and confirm the remaining 50% handover payment.', 'error');
      return;
    }

    try {
      const cleanGallery = localGalleryImages.filter(img => !!img);

      // 1. Prepare Pre-Rental Checklist & transition status to Active
      const bookingUpdates: any = { 
        status: 'active',
        preRentalChecklist: {
          fuelLevel: checkoutFuel,
          mileage: checkoutMileage,
          existingDamage: checkoutExterior,
          interiorNotes: checkoutInterior,
          photos: cleanGallery,
          timestamp: new Date().toISOString()
        }
      };

      if (selectedBooking.paymentType === 'partial') {
        bookingUpdates.remainingPaymentStatus = remainingPaymentCollected ? 'paid' : 'pending';
      }

      const vehicleUpdates = {
        status: 'rented',
        mileage: checkoutMileage,
        image: localPrimaryImage,
        images: cleanGallery
      };

      // Call our high-speed queued transaction API
      const res = await queueBookingTransaction(selectedBooking.id, bookingUpdates, vehicleUpdates);
      
      if (res && res.status === 'queued') {
        showToast('Handover registered! Synchronizing in background queue...', 'info');
        setActiveJob({
          id: res.jobId,
          status: 'queued',
          progress: 5,
          statusText: 'Placed in background queue.'
        });
        pollJobStatus(res.jobId);
      } else {
        showToast('Pre-Rental Handover Complete!', 'success');
        setIsModalOpen(false);
        setSelectedBooking(null);
      }

    } catch (error) {
      console.error('Error completing checkout:', error);
      showToast('Failed to complete vehicle checkout handover.', 'error');
    }
  };

  const handleSubmitReturn = async () => {
    if (!selectedBooking) return;
    
    if (!returnKeysCollected) {
      showToast('Please confirm physical vehicle keys have been collected.', 'error');
      return;
    }

    if (selectedBooking.paymentType === 'partial' && !remainingPaymentCollected) {
      showToast('Please collect and confirm the remaining 50% handover payment.', 'error');
      return;
    }

    try {
      // 1. Process Booking with penalty rates & updates
      const bookingUpdates: any = { 
        status: 'completed',
        penaltyAmount: hasPenalty ? penaltyAmount : 0,
        penaltyReason: hasPenalty ? penaltyNotes : '',
        returnChecklist: {
          fuelLevel: returnFuel,
          mileage: returnMileage,
          exteriorNotes: returnExterior,
          interiorNotes: returnInterior,
          timestamp: new Date().toISOString()
        }
      };

      if (selectedBooking.paymentType === 'partial') {
        bookingUpdates.remainingPaymentStatus = remainingPaymentCollected ? 'paid' : 'pending';
      }

      const finalReturnMileage = Number(returnMileage) || 0;
      const baseMileage = Number(selectedBooking.preRentalChecklist?.mileage) || 0;
      const finalMileage = Math.max(finalReturnMileage, baseMileage);

      const vehicleUpdates = {
        status: 'available',
        mileage: finalMileage
      };

      // Call our high-speed queued transaction API
      const res = await queueBookingTransaction(selectedBooking.id, bookingUpdates, vehicleUpdates);
      
      if (res && res.status === 'queued') {
        showToast('Return registered! Synchronizing in background queue...', 'info');
        setActiveJob({
          id: res.jobId,
          status: 'queued',
          progress: 5,
          statusText: 'Placed in background queue.'
        });
        pollJobStatus(res.jobId);
      } else {
        showToast('Vehicle return checked in!', 'success');
        setIsModalOpen(false);
        setSelectedBooking(null);
      }

    } catch (error) {
      console.error('Error submitting return inspection:', error);
      showToast('Failed to complete return inspection.', 'error');
    }
  };

  return (
    <div className="bg-white rounded-[40px] border border-slate-150 p-8 shadow-sm space-y-6">
      
      {/* Upper Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Fleet Handover & Return Release Command</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Verify checklists before dispatch and inspect returned units. Ensure physical key status, record dynamic fuel shortages, and log accident penalties.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('checkout')}
            className={`px-4 py-2 text-xs font-black uppercase rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'checkout' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Key size={14} />
            Check-Out ({approvedBookings.length})
          </button>
          <button 
            onClick={() => setActiveTab('checkin')}
            className={`px-4 py-2 text-xs font-black uppercase rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'checkin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <ClipboardCheck size={14} />
            Check-In ({activeBookings.length})
          </button>
        </div>
      </div>

      {/* Main Lists of Tabs */}
      {activeTab === 'checkout' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Calendar size={14} />
              Upcoming Shipments / Awaiting Key Delivery ({approvedBookings.length})
            </h3>
          </div>
          
          {approvedBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedBookings.map((b) => {
                const vehicle = vehicles.find(v => v.id === b.vehicleId);
                const customer = allUsers.find(u => u.id === b.userId);
                
                return (
                  <div key={b.id} className="bg-slate-50 border border-slate-200 p-5 rounded-3xl flex flex-col justify-between gap-4 hover:border-blue-400/40 hover:bg-slate-50/50 transition-all">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="size-12 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
                          {vehicle?.image ? (
                            <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                          ) : (
                            <Car size={18} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">{vehicle?.name || 'Assigned Car'}</h4>
                          <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold text-[8px] uppercase tracking-wide mt-1">
                            Awaiting Dispatch Handover
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 border-t border-slate-200/60 pt-3 text-[11px] font-semibold text-slate-500">
                        <div className="flex justify-between">
                          <span>Booking ID:</span>
                          <span className="text-slate-800 font-bold">{b.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Client:</span>
                          <span className="text-slate-800 font-bold">{customer?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Period:</span>
                          <span className="text-slate-700 font-bold">{formatReturnDate(b.startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Mode:</span>
                          <span className="text-blue-600 font-extrabold uppercase text-[9px]">{b.paymentType === 'partial' ? '50% Upfront' : '100% Full Paid'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenReviewModal(b)}
                      className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-1"
                    >
                      <Key size={12} />
                      Log Pre-Rental Handover
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 p-12 rounded-3xl text-center text-slate-450 text-xs font-semibold max-w-xl mx-auto">
              <Key className="mx-auto mb-3 text-slate-300" size={36} />
              <h4 className="font-bold text-slate-900 uppercase">No upcoming handovers pending</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed mt-1">
                All approved rental bookings have been dispatched, or no approved reservations exist awaiting dispatch right now.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overdue Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                <AlertTriangle size={14} />
                Due / Overdue Returns ({overdueBookings.length})
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
                          <div className="size-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
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
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-red-100 shrink-0"
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
                          <div className="size-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
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
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all border border-slate-200 shrink-0"
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
        </div>
      )}

      {/* Unified Handover & Return Modal */}
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
              className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden z-10 max-h-[90vh] overflow-y-auto"
            >
              {activeJob && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-[120] flex flex-col items-center justify-center p-8 text-center">
                  <div className="relative size-24 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-black text-blue-600">
                        {activeJob.progress}%
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    Transaction Queue Processing
                  </h3>
                  <p className="text-slate-500 text-sm max-w-sm mb-6">
                    Your handover/return details and 50% remaining payment status are updating securely in the background synchronization queue.
                  </p>
                  
                  <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${activeJob.progress}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 justify-center bg-slate-50 px-4 py-2 border border-slate-100 rounded-full">
                    <div className="size-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-slate-600">
                      {activeJob.statusText}
                    </span>
                  </div>

                  {activeJob.status === 'completed' && (
                    <div className="mt-6 flex items-center gap-2 text-emerald-600 font-black text-sm animate-bounce">
                      <CheckCircle2 size={18} />
                      Sync Completed Successfully!
                    </div>
                  )}
                </div>
              )}

              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 rounded-full mb-2 inline-block">
                      {activeTab === 'checkout' ? 'Pre-Rental Dispatched checklist' : 'Active Return Verification'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                      {activeTab === 'checkout' ? 'Vehicle Outbound Handover' : 'Process Vehicle Inbound Return'}
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
                  
                  {/* Left Column: Handover (Checkout) OR Return (Checkin) Forms */}
                  {activeTab === 'checkout' ? (
                    // OUTBOUND HANDOVER FORM
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Dispatch Vehicle</p>
                        <div className="flex items-center gap-3">
                          <div className="size-14 rounded-2xl overflow-hidden bg-white border border-slate-200 shrink-0">
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
                              Plate ID: {selectedBooking.vehicleId.toUpperCase()}
                            </p>
                            <p className="text-[10px] text-slate-450 font-bold capitalize">
                              Driver: {selectedBooking.chauffeurSelected ? 'Professional Captain Selected' : 'Customer Self-Drive'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Outbound Fields */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatch Baseline Stats</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-slate-500">Outbound Fuel level *</label>
                            <select 
                              value={checkoutFuel}
                              onChange={(e) => setCheckoutFuel(e.target.value)}
                              className="w-full text-xs font-bold p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                            >
                              <option value="Full">Full Fuel Tank</option>
                              <option value="75%">75% Fuel Tank</option>
                              <option value="50%">50% Fuel Tank</option>
                              <option value="25%">25% Fuel Tank</option>
                              <option value="Empty">Empty / Fuel Warning Light</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-slate-500">Outbound Mileage (KM) *</label>
                            <input 
                              type="number"
                              value={checkoutMileage}
                              onChange={(e) => setCheckoutMileage(parseInt(e.target.value) || 0)}
                              className="w-full text-xs font-bold p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                              placeholder="e.g. 42100"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black text-slate-500">Existing Exterior Wear / Scratches *</label>
                          <textarea 
                            rows={2}
                            value={checkoutExterior}
                            onChange={(e) => setCheckoutExterior(e.target.value)}
                            className="w-full text-xs font-bold p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none resize-none"
                            placeholder="Detail any pre-existing blemishes, scratches, paint chips..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black text-slate-500">Existing Cabin Interior Wear *</label>
                          <textarea 
                            rows={2}
                            value={checkoutInterior}
                            onChange={(e) => setCheckoutInterior(e.target.value)}
                            className="w-full text-xs font-bold p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none resize-none"
                            placeholder="Detail any internal spots, dashboard status, leather condition..."
                          />
                        </div>

                        {/* Baseline Vehicle Photos Uploader / Editor */}
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Baseline Vehicle Photos</p>
                            {user?.role === 'admin' || user?.role === 'manager' ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase rounded-md border border-emerald-100">Editable by {user?.role}</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase rounded-md border border-slate-200">Read Only (Staff Only)</span>
                            )}
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {/* Primary photo */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 block truncate">Primary Photo</span>
                              <div className="relative group aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                                <img src={localPrimaryImage || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'} alt="Primary" className="w-full h-full object-cover" />
                                {(user?.role === 'admin' || user?.role === 'manager') && (
                                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white text-[8px] font-black uppercase tracking-wider text-center p-1">
                                    <Upload size={12} className="mb-0.5" />
                                    Replace
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'primary')} className="hidden" />
                                  </label>
                                )}
                              </div>
                            </div>
                            {/* Gallery angles */}
                            {localGalleryImages.map((img, idx) => (
                              <div key={idx} className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 block truncate">Angle {idx + 1}</span>
                                <div className="relative group aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 border border-dashed border-slate-200">
                                  {img ? (
                                    <>
                                      <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                                      {(user?.role === 'admin' || user?.role === 'manager') && (
                                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white text-[8px] font-black uppercase tracking-wider text-center p-1">
                                          <Upload size={12} className="mb-0.5" />
                                          Replace
                                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, idx)} className="hidden" />
                                        </label>
                                      )}
                                    </>
                                  ) : (
                                    (user?.role === 'admin' || user?.role === 'manager') ? (
                                      <label className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition-all cursor-pointer">
                                        <Plus size={12} className="mb-0.5" />
                                        <span className="text-[8px] font-black uppercase tracking-wider">Add</span>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, idx)} className="hidden" />
                                      </label>
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-[8px] font-bold uppercase">Empty</div>
                                    )
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          {(user?.role === 'admin' || user?.role === 'manager') && (
                            <p className="text-[9px] text-slate-450 font-medium">As an authorized staff member, you can click on any slot above to upload recent condition photos. These will overwrite the vehicle's official baseline photos to compare against on return.</p>
                          )}
                        </div>

                        {/* 50/50 payment scenario */}
                        {selectedBooking.paymentType === 'partial' && (
                          <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl space-y-3 mt-4">
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg mt-0.5 shrink-0">
                                <Info size={14} />
                              </div>
                              <div>
                                <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-wider">50/50 Payment Scenario Detected</h4>
                                <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                                  This customer has paid 50% upfront. The remaining 50% must be collected in person at checkout/handover.
                                </p>
                                <p className="text-xs font-black text-amber-900 mt-1">
                                  Amount to Collect: <span className="text-sm font-black text-blue-600">PKR {(selectedBooking.remainingAmount || (selectedBooking.totalPrice / 2)).toLocaleString()}</span>
                                </p>
                              </div>
                            </div>
                            
                            <label className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-amber-200 cursor-pointer hover:bg-amber-50 transition-all text-xs font-black select-none text-amber-900">
                              <input 
                                type="checkbox" 
                                checked={remainingPaymentCollected}
                                onChange={(e) => setRemainingPaymentCollected(e.target.checked)}
                                className="size-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0"
                              />
                              <span>Confirm Remaining 50% Handover Payment Received (In Person Cash/Card)</span>
                            </label>
                          </div>
                        )}

                        {/* Handover checklists */}
                        <div className="space-y-2 pt-2">
                          <label className="flex items-center gap-3 p-3 bg-blue-50/20 rounded-2xl border border-blue-100 cursor-pointer hover:bg-blue-50/40 transition-all text-xs font-extrabold select-none text-blue-800">
                            <input 
                              type="checkbox" 
                              checked={checkoutKeysHanded}
                              onChange={(e) => setCheckoutKeysHanded(e.target.checked)}
                              className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                            />
                            <span>Confirm vehicle physical keys delivered successfully</span>
                          </label>

                          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/50 transition-all text-xs font-extrabold select-none text-slate-700">
                            <input 
                              type="checkbox" 
                              checked={checkoutAgreementSigned}
                              onChange={(e) => setCheckoutAgreementSigned(e.target.checked)}
                              className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                            />
                            <span>Confirm signed rental agreement & verified CNIC details</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // INBOUND RETURN INSPECTION FORM
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pre-Rental baseline (OUTBOUND RECORD)</p>
                        
                        {selectedBooking.preRentalChecklist ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                              <div>
                                <span className="block text-[9px] uppercase font-black text-slate-400">Baseline Fuel:</span>
                                <span className="text-slate-800 font-bold">{selectedBooking.preRentalChecklist.fuelLevel}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] uppercase font-black text-slate-400">Baseline Mileage:</span>
                                <span className="text-slate-800 font-bold">{selectedBooking.preRentalChecklist.mileage.toLocaleString()} KM</span>
                              </div>
                              <div className="col-span-2">
                                <span className="block text-[9px] uppercase font-black text-slate-400">Exterior Baseline scratches:</span>
                                <p className="text-slate-700 italic font-medium">{selectedBooking.preRentalChecklist.existingDamage}</p>
                              </div>
                            </div>

                            {/* Outbound Baseline Photos Grid */}
                            <div>
                              <span className="block text-[9px] uppercase font-black text-slate-400 mb-1.5">Outbound Baseline Photos:</span>
                              <div className="grid grid-cols-5 gap-2">
                                {/* Primary photo */}
                                <div className="space-y-1">
                                  <span className="text-[8px] font-bold text-slate-400 block truncate text-center">Primary</span>
                                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs">
                                    <img 
                                      src={vehicles.find(v => v.id === selectedBooking.vehicleId)?.image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'} 
                                      alt="Baseline Primary" 
                                      className="w-full h-full object-cover" 
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                </div>
                                {/* Gallery photos */}
                                {(() => {
                                  const savedPhotos = selectedBooking.preRentalChecklist.photos || [];
                                  const finalPhotos = [...savedPhotos];
                                  if (finalPhotos.length === 0) {
                                    // Use vehicle images as fallback
                                    const vObj = vehicles.find(v => v.id === selectedBooking.vehicleId);
                                    if (vObj?.images) {
                                      finalPhotos.push(...vObj.images);
                                    }
                                  }
                                  // Pad or limit to 4 gallery images
                                  while (finalPhotos.length < 4) {
                                    finalPhotos.push('');
                                  }
                                  const displayPhotos = finalPhotos.slice(0, 4);
                                  
                                  const fallbacks = [
                                    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
                                    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600',
                                    'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600',
                                    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600'
                                  ];

                                  return displayPhotos.map((photo, pIdx) => (
                                    <div key={pIdx} className="space-y-1">
                                      <span className="text-[8px] font-bold text-slate-400 block truncate text-center">Angle {pIdx + 1}</span>
                                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs">
                                        <img 
                                          src={photo || fallbacks[pIdx]} 
                                          alt={`Angle ${pIdx + 1}`} 
                                          className="w-full h-full object-cover" 
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-50 border border-amber-100 text-[11px] text-amber-700 font-bold rounded-2xl flex gap-2">
                            <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                            No recorded digital pre-rental baseline exists. Standard Full fuel and vehicle mileage stats are assumed.
                          </div>
                        )}
                      </div>

                      {/* Return Entry Checklist */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inbound Return checklist</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-slate-500">Return Fuel level *</label>
                            <select 
                              value={returnFuel}
                              onChange={(e) => setReturnFuel(e.target.value)}
                              className="w-full text-xs font-bold p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                            >
                              <option value="Full">Full Fuel Tank</option>
                              <option value="75%">75% Fuel Tank</option>
                              <option value="50%">50% Fuel Tank</option>
                              <option value="25%">25% Fuel Tank</option>
                              <option value="Empty">Empty / Fuel Warning Light</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-slate-500">Return Mileage (KM) *</label>
                            <input 
                              type="number"
                              value={returnMileage}
                              onChange={(e) => setReturnMileage(parseInt(e.target.value) || 0)}
                              className="w-full text-xs font-bold p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                              placeholder="e.g. 42300"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black text-slate-500">Returned Exterior Blemishes / New Damage *</label>
                          <textarea 
                            rows={2}
                            value={returnExterior}
                            onChange={(e) => setReturnExterior(e.target.value)}
                            className="w-full text-xs font-bold p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none resize-none"
                            placeholder="Detail any scratches, dents, or new paint defects. Leave empty if clean return..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black text-slate-500">Returned Cabin Interior Cleanliness *</label>
                          <textarea 
                            rows={2}
                            value={returnInterior}
                            onChange={(e) => setReturnInterior(e.target.value)}
                            className="w-full text-xs font-bold p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none resize-none"
                            placeholder="Detail any interior spots, litter, deep stains..."
                          />
                        </div>

                        {/* 50/50 payment scenario */}
                        {selectedBooking.paymentType === 'partial' && (
                          <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg mt-0.5 shrink-0">
                                <Info size={14} />
                              </div>
                              <div>
                                <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-wider">50/50 Payment Scenario (Check-In Collection)</h4>
                                <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                                  This customer has paid 50% upfront. If not collected at checkout, please collect the remaining 50% now on early/normal return.
                                </p>
                                <p className="text-xs font-black text-amber-900 mt-1">
                                  Amount to Collect: <span className="text-sm font-black text-blue-600">PKR {(selectedBooking.remainingAmount || (selectedBooking.totalPrice / 2)).toLocaleString()}</span>
                                </p>
                              </div>
                            </div>
                            
                            <label className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-amber-200 cursor-pointer hover:bg-amber-50 transition-all text-xs font-black select-none text-amber-900">
                              <input 
                                type="checkbox" 
                                checked={remainingPaymentCollected}
                                onChange={(e) => setRemainingPaymentCollected(e.target.checked)}
                                className="size-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0"
                              />
                              <span>Confirm Remaining 50% Handover Payment Received (In Person Cash/Card)</span>
                            </label>
                          </div>
                        )}

                        <label className="flex items-center gap-3 p-3 bg-blue-50/20 rounded-2xl border-2 border-blue-100 cursor-pointer hover:bg-blue-50/40 transition-all text-xs font-extrabold select-none text-blue-800">
                          <input 
                            type="checkbox" 
                            checked={returnKeysCollected}
                            onChange={(e) => setReturnKeysCollected(e.target.checked)}
                            className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                          />
                          <span>Confirm physical vehicle keys successfully reclaimed</span>
                        </label>
                      </div>
                    </div>
                  )}
                  
                  {/* Right Column: Calculations, Penalties, and Confirm Action Panels */}
                  <div className="space-y-6">
                    
                    {/* Customer overview detail */}
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-150">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Client Overview</p>
                      {allUsers.find(u => u.id === selectedBooking.userId) ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-black text-sm uppercase">
                            {allUsers.find(u => u.id === selectedBooking.userId)?.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                              {allUsers.find(u => u.id === selectedBooking.userId)?.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                              {allUsers.find(u => u.id === selectedBooking.userId)?.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-450 font-bold">Unregistered user details.</span>
                      )}
                    </div>

                    {/* ONLY SHOW INCIDENTS & AUTOMATIC RATE LAWS IF TAB IS CHECKIN */}
                    {activeTab === 'checkin' && (
                      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inbound Fines & Penalties</p>
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
                            <span className="text-xs font-black uppercase text-red-500">Record Mishaps?</span>
                          </label>
                        </div>

                        {/* Automatic calculations report */}
                        <div className="space-y-2 text-[11px] bg-white p-3.5 rounded-2xl border border-slate-150">
                          <span className="text-[9px] uppercase font-black text-slate-400 block">Automatic Policy Calculations</span>
                          <div className="flex justify-between font-bold text-slate-600">
                            <span>Fuel Shortage Step Penalty:</span>
                            <span className={fuelShortageSteps > 0 ? "text-red-500 font-black" : "text-slate-700"}>
                              PKR {autoFuelFine.toLocaleString()} ({fuelShortageSteps} steps)
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-600">
                            <span>Late Return Hour Penalty:</span>
                            <span className={lateHoursCount > 0 ? "text-red-500 font-black" : "text-slate-700"}>
                              PKR {autoLateFine.toLocaleString()} ({lateHoursCount} hours)
                            </span>
                          </div>
                        </div>

                        {hasPenalty ? (
                          <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-black text-slate-450">Select Damage Incident Fee Type</span>
                              <select
                                value={penaltyType}
                                onChange={(e) => handlePenaltyTypeChange(e.target.value as any)}
                                className="w-full text-xs font-black p-3 rounded-xl bg-white border border-slate-200 outline-none"
                              >
                                <option value="minor_scratch">Minor Exterior Scratch (+ PKR 12k)</option>
                                <option value="major_accident">Major Collision Incident (+ PKR 50k)</option>
                                <option value="cleaning_issue">Dirty Cabin Interior stain (+ PKR 2.5k)</option>
                                <option value="fuel_shortage">Fuel Shortage fine Only</option>
                                <option value="late">Late Return Penalty Only</option>
                                <option value="other">Custom Violation Adjustment</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-black text-slate-440">Adjust Total Penalty Amount manually (PKR)</span>
                              <input 
                                type="number"
                                value={penaltyAmount}
                                onChange={(e) => setPenaltyAmount(parseInt(e.target.value) || 0)}
                                className="w-full text-xs font-black p-3 rounded-xl bg-white border border-slate-200 outline-none"
                                placeholder="PKR Amount"
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-black text-slate-440">Logged Incident Notes</span>
                              <textarea
                                rows={2}
                                value={penaltyNotes}
                                onChange={(e) => setPenaltyNotes(e.target.value)}
                                className="w-full text-xs font-bold p-3 rounded-xl bg-white border border-slate-200 outline-none resize-none text-[11px]"
                                placeholder="Record blemish details or reasons for adjustment..."
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-450 font-bold leading-relaxed text-center py-2">
                            No outbound / inbound damage recorded. Clean sheet return check-in!
                          </p>
                        )}
                      </div>
                    )}

                    {/* Operational Summary Card */}
                    <div className="p-5 bg-blue-50/20 border border-blue-100/50 rounded-3xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Release Summary</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-bold text-slate-500">
                          <span>Target State:</span>
                          <span className="text-blue-600 font-extrabold uppercase text-[10px]">
                            {activeTab === 'checkout' ? "BOOKING ACTIVE • RENTED" : "COMPLETED • DISPATCH AVAILABLE"}
                          </span>
                        </div>
                        {activeTab === 'checkin' && (
                          <div className="flex justify-between font-bold text-slate-500">
                            <span>Total Applied Penalties:</span>
                            <span className={hasPenalty ? "text-red-600 font-black" : "text-emerald-600 font-black"}>
                              PKR {penaltyAmount.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Confirmations & releases button */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3.5 bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  {activeTab === 'checkout' ? (
                    <button
                      onClick={handleCompleteHandover}
                      disabled={!checkoutKeysHanded || !checkoutAgreementSigned}
                      className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-white shadow-xl ${
                        checkoutKeysHanded && checkoutAgreementSigned
                          ? 'bg-[#2563EB] hover:bg-blue-700 shadow-blue-105 cursor-pointer' 
                          : 'bg-slate-300 cursor-not-allowed opacity-60'
                      }`}
                    >
                      Verify Outbound & Hand Over Keys
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitReturn}
                      disabled={!returnKeysCollected}
                      className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-white shadow-xl ${
                        returnKeysCollected 
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-105 cursor-pointer' 
                          : 'bg-slate-300 cursor-not-allowed opacity-60'
                      }`}
                    >
                      Verify Inbound & Release Car
                    </button>
                  )}
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
