import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomCalendar from '../components/ui/CustomCalendar';
import { MapPlacesAutocomplete } from '../components/ui/MapPlacesAutocomplete';
import { 
  MapPin, 
  Navigation, 
  Search, 
  TrendingUp, 
  Mountain, 
  ChevronRight, 
  BadgeCheck, 
  XCircle,
  Minus,
  Plus,
  RefreshCw,
  Calendar,
  Sparkles,
  Scale,
  Wallet,
  Car,
  Clock,
  ShieldCheck,
  CreditCard,
  Copy,
  Lock,
  Upload,
  Check,
  ChevronDown,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currentView = queryParams.get('view') || 'overview';
  const { vehicles, allBookings, user, eChallans, showToast, refreshData } = useStore();

  // Penalty Payment Form State
  const [payPenaltyType, setPayPenaltyType] = useState('Late return penalty');
  const [payAmount, setPayAmount] = useState('');
  const [paySenderBank, setPaySenderBank] = useState('');
  const [payTid, setPayTid] = useState('');
  const [payReceiptName, setPayReceiptName] = useState('');
  const [payReceiptBase64, setPayReceiptBase64] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [paymentOption, setPaymentOption] = useState<'bank' | 'card'>('bank');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [myBalancePayments, setMyBalancePayments] = useState<any[]>([]);

  const fetchMyBalancePayments = async () => {
    try {
      const token = localStorage.getItem('elitedrive_token');
      const res = await fetch('/api/my-balance-payments', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMyBalancePayments(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (currentView === 'balance' && user) {
      fetchMyBalancePayments();
    }
  }, [currentView, user]);

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`${fieldName} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePayPenaltySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(payAmount);
    const outstandingBalance = user?.outstandingBalance || 0;

    if (!payAmount || amountNum <= 0) {
      showToast('Please enter a valid amount to pay.', 'error');
      return;
    }
    if (amountNum > outstandingBalance) {
      showToast('Payment amount cannot be greater than your total outstanding balance.', 'error');
      return;
    }
    if (!paySenderBank) {
      showToast('Please select your issuing bank.', 'error');
      return;
    }
    if (!payTid.trim()) {
      showToast('Please enter your Transaction ID (TID).', 'error');
      return;
    }

    const selectedReason = myReasons.find(r => r.title === payPenaltyType);

    setIsSubmittingPay(true);
    try {
      const token = localStorage.getItem('elitedrive_token');
      const res = await fetch('/api/users/pay-penalty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          penaltyTitle: payPenaltyType,
          amount: amountNum,
          senderBank: paySenderBank,
          transactionRef: payTid,
          receiptImage: payReceiptBase64,
          sourceId: selectedReason?.sourceId,
          sourceType: selectedReason?.sourceType
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit penalty payment');
      }

      showToast('Penalty payment submitted successfully for verification! Admin will review it shortly.', 'success');
      // Reset form
      setPayAmount('');
      setPaySenderBank('');
      setPayTid('');
      setPayReceiptName('');
      setPayReceiptBase64('');
      await refreshData();
      await fetchMyBalancePayments();
    } catch (err: any) {
      showToast(err.message || 'Error submitting payment', 'error');
    } finally {
      setIsSubmittingPay(false);
    }
  };

  const handleCardPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(payAmount);
    const outstandingBalance = user?.outstandingBalance || 0;

    if (!payAmount || amountNum <= 0) {
      showToast('Please enter a valid amount to pay.', 'error');
      return;
    }
    
    if (cardNumber.replace(/\s/g, '').length < 16) {
      showToast('Please enter a valid 16-digit card number.', 'error');
      return;
    }

    if (!cardHolder.trim()) {
      showToast('Please enter the card holder name.', 'error');
      return;
    }

    setIsSubmittingPay(true);
    try {
      const token = localStorage.getItem('elitedrive_token');
      const res = await fetch('/api/users/pay-penalty-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          amount: amountNum,
          cardNumber,
          cardHolder,
          cardExpiry,
          cardCvv
        })
      });

      if (!res.ok) {
        throw new Error('Card payment failed');
      }

      showToast('Balance cleared successfully via card! Your account is now in good standing.', 'success');
      setPayAmount('');
      setCardNumber('');
      setCardHolder('');
      setCardExpiry('');
      setCardCvv('');
      await refreshData();
      await fetchMyBalancePayments();
    } catch (err: any) {
      showToast(err.message || 'Error processing card payment', 'error');
    } finally {
      setIsSubmittingPay(false);
    }
  };
  
  // AI Recommendation State
  const [aiBudget, setAiBudget] = useState('');
  const [aiTravelType, setAiTravelType] = useState('in_city');
  const [aiPreferences, setAiPreferences] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const recommendedVehicles = useMemo(() => {
    if (!aiResult || !aiResult.recommendations) return [];
    return aiResult.recommendations.map((rec: any) => {
      const vehicle = vehicles.find(v => v.id === rec.vehicleId);
      return vehicle ? { vehicle, reasoning: rec.reasoning } : null;
    }).filter(Boolean);
  }, [aiResult, vehicles]);

  const handleGetRecommendations = async () => {
    setAiLoading(true);
    try {
      const token = localStorage.getItem('elitedrive_token');
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          budget: aiBudget ? Number(aiBudget) : undefined,
          travelType: aiTravelType,
          preferences: aiPreferences
        })
      });
      const data = await response.json();
      setAiResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };
  
  // Form State
  const [pickupLocation, setPickupLocation] = useState(() => {
    return localStorage.getItem('elitedrive_pickup_location') || 'Lahore, Pakistan';
  });
  const [dropoffLocation, setDropoffLocation] = useState(() => {
    return localStorage.getItem('elitedrive_dropoff_location') || '';
  });
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [pickupDate, setPickupDate] = useState<Date | null>(() => {
    const saved = localStorage.getItem('elitedrive_pickup_date');
    if (saved) {
      const parsed = new Date(saved);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      if (parsed >= startOfToday) return parsed;
    }
    return new Date();
  });
  const [returnDate, setReturnDate] = useState<Date | null>(() => {
    const saved = localStorage.getItem('elitedrive_return_date');
    if (saved) {
      const parsed = new Date(saved);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      if (parsed >= startOfToday) return parsed;
    }
    const base = new Date();
    return new Date(base.getTime() + 3 * 24 * 60 * 60 * 1000);
  });

  const handlePickupDateChange = (date: Date | null) => {
    setPickupDate(date);
    if (date && returnDate && date >= returnDate) {
      setReturnDate(new Date(date.getTime() + 1 * 24 * 60 * 60 * 1000));
    }
  };
  const [carType, setCarType] = useState('Sedan');
  const [passengers, setPassengers] = useState(4);
  const [transmission, setTransmission] = useState<'Auto' | 'Manual'>('Auto');
  const [needDriver, setNeedDriver] = useState(false);
  const [fuelType, setFuelType] = useState('Petrol');

  useEffect(() => {
    if (pickupDate) {
      localStorage.setItem('elitedrive_pickup_date', pickupDate.toISOString());
    }
  }, [pickupDate]);

  useEffect(() => {
    if (returnDate) {
      localStorage.setItem('elitedrive_return_date', returnDate.toISOString());
    }
  }, [returnDate]);

  const handleSearch = () => {
    // Navigate to fleet with applied filters (conceptually)
    navigate('/fleet');
  };

  const outstandingBalance = user?.outstandingBalance || 0;

  const myReasons = useMemo(() => {
    if (!user) return [];
    const reasons: { title: string; amount: number; date?: string; icon: any; sourceId?: string; sourceType?: string }[] = [];
    
    // 1. Get matched e-challans
    const matchedChallans = eChallans ? eChallans.filter(c => c.matchedUserId === user.id && c.status !== 'resolved') : [];
    matchedChallans.forEach(c => {
      reasons.push({
        title: `Traffic E-Challan Ticket #${c.challanNumber}`,
        amount: c.amount,
        date: c.date || c.createdAt,
        icon: Scale,
        sourceId: c.id,
        sourceType: 'echallan'
      });
    });

    // 2. Get bookings with penalty amounts
    const matchedBookings = allBookings.filter(b => b.userId === user.id && (b.penaltyAmount || 0) > 0);
    matchedBookings.forEach(b => {
      const v = vehicles.find(veh => veh.id === b.vehicleId);
      reasons.push({
        title: `Late Return / Surcharge Penalty (${v?.name || 'Vehicle'} - ID: ${b.id.slice(0, 8).toUpperCase()})`,
        amount: b.penaltyAmount || 0,
        date: b.endDate,
        icon: Car,
        sourceId: b.id,
        sourceType: 'booking_penalty'
      });
    });

    // 3. Get bookings with pending remaining payments (partial payment bookings)
    const partialBookings = allBookings.filter(
      b => b.userId === user.id && 
           b.paymentType === 'partial' && 
           b.remainingPaymentStatus === 'pending' && 
           b.status !== 'cancelled'
    );
    partialBookings.forEach(b => {
      const v = vehicles.find(veh => veh.id === b.vehicleId);
      reasons.push({
        title: `Pending 50% Remaining Payment (${v?.name || 'Vehicle'} - ID: ${b.id.slice(0, 8).toUpperCase()})`,
        amount: b.remainingAmount || (b.totalPrice * 0.5),
        date: b.startDate,
        icon: Wallet,
        sourceId: b.id,
        sourceType: 'remaining_payment'
      });
    });

    // Calculate sum of known penalties
    const sumPenalties = reasons.reduce((acc, r) => acc + r.amount, 0);
    
    if (sumPenalties < outstandingBalance) {
      reasons.push({
        title: 'Account Balance Surcharge / Miscellaneous Adjustment',
        amount: outstandingBalance - sumPenalties,
        icon: Wallet,
        sourceType: 'misc'
      });
    }

    return reasons;
  }, [user, eChallans, allBookings, vehicles, outstandingBalance]);

  const myPayables = useMemo(() => {
    if (!user) return [];
    const list: {
      booking: any;
      vehicle: any;
      type: 'refund' | 'deposit';
      amount: number;
      reason: string;
      status: string;
    }[] = [];

    allBookings.forEach(b => {
      if (b.userId !== user.id) return;
      const vehicle = vehicles.find(v => v.id === b.vehicleId);

      // 1. Cancellation refund
      if (b.status === 'cancelled' && (b.refundAmount || 0) > 0 && b.refundStatus !== 'processed') {
        list.push({
          booking: b,
          vehicle,
          type: 'refund',
          amount: b.refundAmount || 0,
          reason: `Cancellation refund for Booking ID ${b.id.toUpperCase().slice(0, 8)}`,
          status: b.refundStatus || 'pending_manual_bank_transfer'
        });
      }

      // 2. Security Deposit return
      const isEligibleForDepositRefund = b.status === 'completed' || b.status === 'cancelled';
      if (isEligibleForDepositRefund && (b.securityDepositAmount || 0) > 0 && b.securityDepositStatus !== 'refunded') {
        list.push({
          booking: b,
          vehicle,
          type: 'deposit',
          amount: b.securityDepositAmount || 0,
          reason: `Security Deposit return for Booking ID ${b.id.toUpperCase().slice(0, 8)}`,
          status: b.securityDepositStatus || 'pending'
        });
      }
    });

    return list;
  }, [allBookings, user, vehicles]);

  const myRefundsReceived = useMemo(() => {
    if (!user || !allBookings) return [];
    const userBookings = allBookings.filter(b => b.userId === user.id);
    const list: {
      bookingId: string;
      vehicleName: string;
      type: 'refund' | 'deposit';
      amount: number;
      date: string;
    }[] = [];

    userBookings.forEach(b => {
      const v = vehicles.find(car => car.id === b.vehicleId);
      if (b.status === 'cancelled' && b.refundStatus === 'processed' && (b.refundAmount || 0) > 0) {
        list.push({
          bookingId: b.id,
          vehicleName: v?.name || 'Vehicle',
          type: 'refund',
          amount: b.refundAmount || 0,
          date: (b as any).refundProcessedAt || b.createdAt || b.bookingDate,
        });
      }
      if (b.securityDepositStatus === 'refunded' && (b.securityDepositAmount || 0) > 0) {
        list.push({
          bookingId: b.id,
          vehicleName: v?.name || 'Vehicle',
          type: 'deposit',
          amount: b.securityDepositAmount || 0,
          date: (b as any).securityDepositRefundedAt || b.createdAt || b.bookingDate,
        });
      }
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allBookings, vehicles, user]);

  if (currentView === 'balance') {
    return (
      <div className="animate-in fade-in duration-700 space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Wallet className="text-blue-600" size={28} />
            My Outstanding Account Balance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review detailed invoice breakdown of pending penalties, e-challans, and damage surcharges.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Outstanding Balance Banner */}
          <div className="lg:col-span-1 bg-slate-900 text-white rounded-[32px] p-8 border border-slate-950 flex flex-col justify-between shadow-2xl min-h-[250px]">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Total Payable Surcharge</span>
              <h3 className="text-4xl font-black text-amber-400">PKR {outstandingBalance.toLocaleString()}</h3>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-800">
              <p className="text-xs text-slate-350 leading-relaxed font-medium">
                Please settle this balance as soon as possible. Unpaid balances will prevent placing new bookings.
              </p>
              
              <button 
                onClick={() => {
                  setPaymentOption('card');
                  setPayAmount(String(outstandingBalance));
                  const element = document.getElementById('settlement-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-2"
              >
                <CreditCard size={14} />
                Pay Full Balance via Card
              </button>

              <div className="flex items-center gap-2.5 text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                <Clock size={14} />
                <span>Pending Settlement</span>
              </div>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-200 shadow-xl shadow-slate-200/30 space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Detailed Balance Breakdown</h3>
            
            {myReasons.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <Wallet className="text-slate-300 mx-auto mb-3" size={32} />
                <p className="text-xs text-slate-500 font-bold">Your account balance is fully cleared. No penalties are pending.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myReasons.map((reason, index) => {
                  const Icon = reason.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white border border-slate-100 rounded-xl text-slate-500 mt-0.5">
                          <Icon size={16} />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-800 text-xs block">{reason.title}</span>
                          {reason.date && (
                            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                              Logged on: {new Date(reason.date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-extrabold text-slate-900 text-sm whitespace-nowrap ml-4">
                        PKR {reason.amount.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Settle Outstanding Surcharges Section */}
        {outstandingBalance > 0 && (
          <div id="settlement-section" className="bg-slate-900 text-white rounded-[32px] p-8 lg:p-10 border border-slate-950 shadow-2xl space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest block">★ Direct Settlement Desk</span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck className="text-amber-500 animate-pulse" size={24} />
                  Settle Outstanding Penalties
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select your outstanding penalty and settle instantly via card or bank transfer coordinates.
                </p>
              </div>

              {/* Payment Method Toggle */}
              <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700 w-fit">
                <button
                  type="button"
                  onClick={() => setPaymentOption('bank')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${paymentOption === 'bank' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  Bank Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentOption('card')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${paymentOption === 'card' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  Credit / Debit Card
                </button>
              </div>
            </div>

            {paymentOption === 'bank' ? (
              <form onSubmit={handlePayPenaltySubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Side: Select Penalty, Amount, Bank and Reference ID */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">1. Select Penalty Item to Settle</label>
                    <select
                      value={payPenaltyType}
                      onChange={(e) => {
                        setPayPenaltyType(e.target.value);
                        const matched = myReasons.find(r => r.title === e.target.value);
                        if (matched) {
                          setPayAmount(String(matched.amount));
                        }
                      }}
                      className="w-full h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-extrabold text-xs transition-all"
                    >
                      <option value="">-- Choose a Penalty Item --</option>
                      {myReasons.map((r, i) => (
                        <option key={i} value={r.title}>{r.title} (PKR {r.amount.toLocaleString()})</option>
                      ))}
                      <option value="Miscellaneous penalty">Something else / Miscellaneous penalty</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">2. Enter Settle Amount (PKR) *</label>
                    <input
                      type="number"
                      placeholder="Enter PKR amount you are depositing"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono text-xs font-black transition-all"
                    />
                    <p className="text-[9px] text-slate-500 font-semibold">Total outstanding: PKR {outstandingBalance.toLocaleString()}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">3. Select Your Issuing Bank (Sender)</label>
                    <select
                      value={paySenderBank}
                      onChange={(e) => setPaySenderBank(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-extrabold text-xs transition-all"
                    >
                      <option value="">-- Choose Your Bank --</option>
                      <option value="Meezan Bank">Meezan Bank</option>
                      <option value="HBL">Habib Bank Limited (HBL)</option>
                      <option value="UBL">United Bank Limited (UBL)</option>
                      <option value="MCB">MCB Bank Limited</option>
                      <option value="Bank of Punjab">Bank of Punjab (BOP)</option>
                      <option value="Bank Alfalah">Bank Alfalah</option>
                      <option value="Standard Chartered">Standard Chartered</option>
                      <option value="NayaPay">NayaPay</option>
                      <option value="SadaPay">SadaPay</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">4. Transaction ID (TID) / Reference Number *</label>
                    <input
                      type="text"
                      placeholder="Enter exact TID from receipt"
                      value={payTid}
                      onChange={(e) => setPayTid(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono text-xs font-black uppercase transition-all"
                    />
                  </div>
                </div>

                {/* Right Side: Bank coordinates & receipt upload */}
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                        <ShieldCheck size={14} />
                        Elite Drive BOP Accounts Coordinates
                      </h4>
                    </div>

                    <div className="space-y-2.5">
                      {/* Bank Name */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/40">
                        <div>
                          <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Beneficiary Bank</p>
                          <p className="font-extrabold text-slate-200 text-[11px]">Bank of Punjab (BOP)</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleCopyText('Bank of Punjab', 'Bank Name')}
                          className="text-[9px] font-black text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-wider bg-slate-800 px-2 py-1 rounded"
                        >
                          {copiedField === 'Bank Name' ? 'Copied ✓' : 'Copy'}
                        </button>
                      </div>

                      {/* Account Title */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/40">
                        <div>
                          <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Account Title</p>
                          <p className="font-extrabold text-slate-200 text-[11px]">Elite Drive (Private) Limited</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleCopyText('Elite Drive (Private) Limited', 'Account Title')}
                          className="text-[9px] font-black text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-wider bg-slate-800 px-2 py-1 rounded"
                        >
                          {copiedField === 'Account Title' ? 'Copied ✓' : 'Copy'}
                        </button>
                      </div>

                      {/* Account Number */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/40">
                        <div>
                          <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Account Number</p>
                          <p className="font-mono text-[11px] font-black text-slate-200">0201-987654-01-3</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleCopyText('0201-987654-01-3', 'Account Number')}
                          className="text-[9px] font-black text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-wider bg-slate-800 px-2 py-1 rounded"
                        >
                          {copiedField === 'Account Number' ? 'Copied ✓' : 'Copy'}
                        </button>
                      </div>

                      {/* IBAN */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/40">
                        <div>
                          <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">IBAN Number</p>
                          <p className="font-mono text-[10px] font-black text-slate-200">PK42 BOP 0201 0201 9876 5401</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleCopyText('PK42 BOP 0201 0201 9876 5401', 'IBAN')}
                          className="text-[9px] font-black text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-wider bg-slate-800 px-2 py-1 rounded"
                        >
                          {copiedField === 'IBAN' ? 'Copied ✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Screenshot upload */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">5. Upload Transfer Receipt Screenshot (Optional)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 bg-slate-800 hover:border-amber-500 rounded-xl p-3 cursor-pointer transition-colors w-32 h-16 shrink-0 text-center">
                        <Upload size={18} className="text-slate-400 mb-0.5" />
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setPayReceiptName(file.name);
                              const reader = new FileReader();
                              reader.onload = () => setPayReceiptBase64(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs font-semibold">
                        {payReceiptName ? (
                          <p className="text-emerald-400 flex items-center gap-1">
                            <Check size={12} />
                            {payReceiptName}
                          </p>
                        ) : (
                          'No screenshot selected'
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingPay}
                    className="w-full h-12 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 text-xs"
                  >
                    {isSubmittingPay ? 'Verifying Coordinates & Submitting...' : 'Submit Penalty Payment Details'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCardPaymentSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Amount to Pay (PKR)</label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono text-sm font-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))}
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono text-sm font-black"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono text-sm font-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                        className="w-full h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono text-sm font-black"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Card Holder Name</label>
                    <input
                      type="text"
                      placeholder="FULL NAME AS ON CARD"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      className="w-full h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 outline-none font-sans text-xs font-black uppercase"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmittingPay}
                    className="w-full h-14 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 text-sm mt-4"
                  >
                    {isSubmittingPay ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} />
                        Processing Secure Card Payment...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Securely Pay PKR {Number(payAmount).toLocaleString()} Now
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                    <Lock className="text-amber-500" size={32} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">Direct Card Settlement</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                      Settling via card is instant. Once successful, your outstanding balance will be cleared immediately and you can resume booking vehicles.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-4 grayscale opacity-50">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* EliteDrive Payables (Refunds & Deposits Owed to Me) */}
        <div className="bg-white border-2 border-slate-100 rounded-[32px] p-8 lg:p-10 space-y-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Check className="text-emerald-600" size={24} />
              Refunds & Security Deposits Owed to Me by EliteDrive
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Outstanding liabilities and security collateral currently queued for return/disbursement to your bank account.
            </p>
          </div>

          {myPayables.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
              <Check className="text-slate-300 mx-auto mb-3" size={32} />
              <p className="text-xs text-slate-500 font-bold">No pending refunds or deposits are owed to you by EliteDrive. All accounts are settled!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myPayables.map((item, index) => {
                const isRefund = item.type === 'refund';
                return (
                  <div key={index} className="bg-slate-50/50 border-2 border-slate-150 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-300 hover:bg-white transition-all duration-300">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${isRefund ? 'bg-amber-50 text-amber-700 border border-amber-150' : 'bg-blue-50 text-blue-700 border border-blue-150'}`}>
                          {isRefund ? 'Cancellation Refund' : 'Security Deposit'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-450 font-mono">
                          ID: {item.booking.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Vehicle:</span>
                          <span className="font-extrabold text-slate-800">{item.vehicle?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Status:</span>
                          <span className="font-mono text-[10px] uppercase font-extrabold text-slate-500">
                            {item.status === 'pending_manual_bank_transfer' ? 'Refund Pending (Manual bank transfer)' : 'Awaiting Processing'}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-slate-200/60">
                          <span className="text-emerald-700 font-extrabold">Owed by EliteDrive:</span>
                          <span className="font-black text-emerald-600 text-sm">PKR {item.amount.toLocaleString()}</span>
                        </div>
                      </div>

                      <p className="text-[10px] font-medium text-slate-500 bg-emerald-50/20 border border-emerald-100/50 p-2.5 rounded-xl leading-relaxed mt-2">
                        <strong>Policy Note:</strong> Elite Drive has to pay this amount of <strong>PKR {item.amount.toLocaleString()}</strong> to you as {isRefund ? 'your eligible cancellation refund' : 'your refundable security deposit'} for Booking ID <strong>{item.booking.id.toUpperCase()}</strong>.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Settlement & Refund History Ledger */}
        <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 lg:p-10 space-y-8">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Clock className="text-slate-700" size={24} />
              Financial Settlement & Refund Logs
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Historical audit records of liabilities paid by you, administrative waivers granted, and refund payouts received from EliteDrive.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column 1: My Liability & Penalty Payments */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                My Penalty & Liability Payments Settle History
              </h4>
              <p className="text-[11px] text-slate-400">
                History of surcharges, fines, or outstanding balances you cleared or was waived.
              </p>

              {myBalancePayments.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-bold">No payments submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {myBalancePayments.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-extrabold text-xs text-slate-800 block">{p.penaltyTitle}</span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            {new Date(p.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          p.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                          p.status === 'waived' ? 'bg-purple-50 text-purple-700 border border-purple-150' :
                          'bg-amber-50 text-amber-700 border border-amber-150'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-slate-100 font-medium text-slate-500">
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400">Method / Bank</span>
                          <span className="font-bold text-slate-700">{p.senderBank || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400">Ref / TID</span>
                          <span className="font-bold text-slate-700 truncate block max-w-[120px]">{p.transactionRef || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {p.status === 'waived' ? 'Waived Amount:' : 'Amount Paid:'}
                        </span>
                        <span className="font-black text-slate-800 text-xs">PKR {p.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Refunds & Deposits Received */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Refunds & Deposits Disbursed to Me
              </h4>
              <p className="text-[11px] text-slate-400">
                Refunds and returned security deposits that have been officially disbursed to you.
              </p>

              {myRefundsReceived.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-bold">No processed refunds or returned deposits yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {myRefundsReceived.map((r, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-extrabold text-xs text-slate-800 block">
                            {r.type === 'refund' ? 'Cancellation Refund' : 'Security Deposit Returned'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Disbursed: {new Date(r.date).toLocaleString()}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-150">
                          Disbursed
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-slate-100 font-medium text-slate-500">
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400">Vehicle</span>
                          <span className="font-bold text-slate-700">{r.vehicleName}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400">Booking Ref</span>
                          <span className="font-bold text-slate-700 font-mono">{r.bookingId.slice(0, 8).toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] text-slate-400 font-semibold">Disbursed Amount:</span>
                        <span className="font-black text-emerald-600 text-xs">PKR {r.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column: Search Form (65%) */}
        <div className="lg:w-[65%]">
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-10">Where are you going?</h2>
          
          <div className="bg-white rounded-[32px] p-8 lg:p-10 border border-slate-200 shadow-2xl shadow-slate-200/40">
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              {/* Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-sm font-bold text-slate-500 ml-1">Pickup Location</label>
                  <MapPlacesAutocomplete
                    value={pickupLocation}
                    onChange={setPickupLocation}
                    placeholder="City or airport"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 font-semibold"
                    icon={<MapPin className="absolute left-4 text-slate-400 z-10" size={20} />}
                    fieldName="pickup"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-bold text-slate-500 ml-1">Drop-off Location</label>
                  <MapPlacesAutocomplete
                    value={dropoffLocation}
                    onChange={setDropoffLocation}
                    placeholder="Same as pickup"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 font-semibold"
                    icon={<Navigation className="absolute left-4 text-slate-400 z-10" size={20} />}
                    fieldName="dropoff"
                  />
                </div>
              </div>

              {/* Dates and Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CustomCalendar
                  label="Pickup Date & Time"
                  selected={pickupDate}
                  onChange={handlePickupDateChange}
                  minDate={todayStart}
                  showTimeSelect
                />
                <CustomCalendar
                  label="Return Date & Time"
                  selected={returnDate}
                  onChange={(date) => setReturnDate(date)}
                  minDate={pickupDate || todayStart}
                  showTimeSelect
                />
              </div>

              {/* Car Specs Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-sm font-bold text-slate-500 ml-1">Car Type</label>
                  <select 
                    value={carType}
                    onChange={(e) => setCarType(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary text-slate-900 font-bold appearance-none cursor-pointer"
                  >
                    <option>Economy</option>
                    <option>Sedan</option>
                    <option>SUV</option>
                    <option>Luxury</option>
                  </select>
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-bold text-slate-500 ml-1">Passengers</label>
                  <div className="flex items-center bg-slate-50 rounded-2xl px-5 py-2 h-[64px]">
                    <button 
                      type="button"
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-200 text-primary transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="bg-transparent border-none text-center font-black w-full text-slate-900 text-lg">
                      {passengers}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setPassengers(Math.min(9, passengers + 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-200 text-primary transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Toggles & Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                <div className="space-y-5">
                  <label className="text-sm font-bold text-slate-500 ml-1">Transmission</label>
                  <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
                    {(['Auto', 'Manual'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTransmission(type)}
                        className={`px-10 py-3 rounded-xl text-sm font-black transition-all ${
                          transmission === type 
                            ? 'bg-white text-primary shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-5">
                  <label className="text-sm font-bold text-slate-500 ml-1">Need a driver?</label>
                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => setNeedDriver(!needDriver)}
                      className={`relative inline-flex h-10 w-16 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-primary ${
                        needDriver ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition-transform ${
                        needDriver ? 'translate-x-8' : 'translate-x-1'
                      }`} />
                    </button>
                    <span className="text-sm font-semibold text-slate-600">Professional chauffeur service</span>
                  </div>
                </div>
              </div>

              {/* Fuel Type Chips */}
              <div className="space-y-5">
                <label className="text-sm font-bold text-slate-500 ml-1">Fuel Type</label>
                <div className="flex flex-wrap gap-4">
                  {['Petrol', 'Diesel', 'Hybrid'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFuelType(type)}
                      className={`px-8 py-3 rounded-full border-2 font-black text-sm transition-all ${
                        fuelType === type
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 text-slate-500 hover:border-primary/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-blue-700 text-white py-6 rounded-2xl text-xl font-black transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 mt-10 active:scale-[0.98]"
              >
                <Search size={24} strokeWidth={3} />
                Search Available Cars
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Hero Content (35%) */}
        <div className="lg:w-[35%] flex flex-col gap-8">
          <div className="relative group h-[500px] rounded-[40px] overflow-hidden shadow-2xl">
            <img 
              alt="Premium Sedan" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-10">
              <span className="bg-primary text-white text-[11px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full w-fit mb-4">Premium Choice</span>
              <h3 className="text-white text-4xl font-black mb-4 leading-tight tracking-tight">Explore Pakistan with comfort.</h3>
              <p className="text-white/80 text-base font-medium leading-relaxed">Experience the thrill of the open road in our top-rated sedan fleet.</p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Popular Destinations</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-sm font-black text-slate-900">Lahore to Islamabad</span>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-primary transition-all" size={20} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border-t border-slate-100">
                <div className="flex items-center gap-4 pt-2">
                  <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary">
                    <Mountain size={20} />
                  </div>
                  <span className="text-sm font-black text-slate-900">Murree Hill Station</span>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-primary transition-all pt-2" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 text-white border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <Scale size={24} />
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">Disputes Mediation Desk</h4>
            </div>
            <h3 className="text-lg font-black mb-2 uppercase">Lodge Formal Dispute</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              File formal disputes regarding traffic e-challans, damage charges, collisions, or return penalties for rapid administrative adjudication.
            </p>
            <button 
              onClick={() => navigate('/report-incident')}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition-all text-xs uppercase tracking-wider"
            >
              Lodge Dispute / Appeal
            </button>
          </div>

          <div className="flex flex-col gap-5 px-4 pt-2">
            <div className="flex items-center gap-3 text-emerald-600">
              <BadgeCheck size={24} />
              <span className="text-sm font-black">Best prices guaranteed</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <XCircle size={24} />
              <span className="text-sm font-bold">Free cancellation up to 24h before</span>
            </div>
          </div>
        </div>
      </div>



      {/* Featured Fleet Section */}
      <div className="mt-24 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Today's Featured Fleet</h2>
            <p className="text-slate-500 font-medium mt-1">Available at {pickupLocation || 'your location'}</p>
          </div>
          <button 
            onClick={() => navigate('/fleet')}
            className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest hover:gap-3 transition-all"
          >
            Explore Fleet
            <ChevronRight size={18} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles
            .filter((v) => {
              const activeBooking = allBookings.find(b => b.vehicleId === v.id && (b.status === 'active' || b.status === 'pending'));
              const isPastReturn = activeBooking && new Date() >= new Date(activeBooking.endDate);
              const effectiveStatus = (v.status === 'booked' || v.status === 'rented') && isPastReturn ? 'available' : v.status;
              return effectiveStatus === 'available';
            })
            .slice(0, 3)
            .map((vehicle, idx) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="h-56 overflow-hidden">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{vehicle.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{vehicle.type} • {vehicle.transmission}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-primary">PKR {vehicle.pricePerDay.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Per Day</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                  className="w-full py-4 bg-slate-50 text-slate-900 font-black rounded-xl hover:bg-primary hover:text-white transition-all text-sm"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
