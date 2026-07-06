import React, { useState } from 'react';
import { 
  Wallet, 
  Search, 
  User, 
  FileText, 
  AlertTriangle,
  Scale,
  Calendar,
  Car,
  Clock,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion } from 'motion/react';

const RemainingBalances: React.FC = () => {
  const { allUsers, allBookings, eChallans, vehicles, showToast, refreshData } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [waiverReasons, setWaiverReasons] = useState<Record<string, string>>({});
  const [isWaiving, setIsWaiving] = useState<Record<string, boolean>>({});

  const handleWaiveBalance = async (customerId: string) => {
    const reason = waiverReasons[customerId] || '';
    if (!reason.trim()) {
      showToast('Please enter a valid reason for releasing this customer from penalties.', 'error');
      return;
    }

    setIsWaiving(prev => ({ ...prev, [customerId]: true }));
    try {
      const token = localStorage.getItem('elitedrive_token');
      const res = await fetch(`/api/users/${customerId}/waive-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) {
        throw new Error('Failed to waive balance');
      }
      showToast('Outstanding balance and penalties successfully waived!', 'success');
      setWaiverReasons(prev => ({ ...prev, [customerId]: '' }));
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error releasing penalties', 'error');
    } finally {
      setIsWaiving(prev => ({ ...prev, [customerId]: false }));
    }
  };

  const [balancePayments, setBalancePayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const fetchBalancePayments = async () => {
    setLoadingPayments(true);
    try {
      const token = localStorage.getItem('elitedrive_token');
      const res = await fetch('/api/balance-payments', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBalancePayments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      const token = localStorage.getItem('elitedrive_token');
      const res = await fetch(`/api/balance-payments/${paymentId}/approve`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) {
        throw new Error('Failed to approve payment');
      }
      showToast('Penalty payment approved successfully!', 'success');
      await refreshData();
      await fetchBalancePayments();
    } catch (err: any) {
      showToast(err.message || 'Error approving payment', 'error');
    }
  };

  const [clearingItem, setClearingItem] = useState<Record<string, boolean>>({});

  const handleClearRefund = async (bookingId: string) => {
    const key = `refund-${bookingId}`;
    setClearingItem(prev => ({ ...prev, [key]: true }));
    try {
      const token = localStorage.getItem('elitedrive_token');
      const res = await fetch(`/api/bookings/${bookingId}/clear-refund`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to disburse refund');
      showToast('Cancellation refund marked as disbursed/processed!', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error processing refund', 'error');
    } finally {
      setClearingItem(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleClearDeposit = async (bookingId: string) => {
    const key = `deposit-${bookingId}`;
    setClearingItem(prev => ({ ...prev, [key]: true }));
    try {
      const token = localStorage.getItem('elitedrive_token');
      const res = await fetch(`/api/bookings/${bookingId}/clear-deposit`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to clear security deposit');
      showToast('Security deposit marked as refunded!', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error refunding security deposit', 'error');
    } finally {
      setClearingItem(prev => ({ ...prev, [key]: false }));
    }
  };

  const payablesList = React.useMemo(() => {
    const list: {
      booking: any;
      customer: any;
      vehicle: any;
      type: 'refund' | 'deposit';
      amount: number;
      reason: string;
      status: string;
    }[] = [];

    allBookings.forEach(b => {
      const customer = allUsers.find(u => u.id === b.userId);
      const vehicle = vehicles.find(v => v.id === b.vehicleId);

      // 1. Cancellation refund owed
      if (b.status === 'cancelled' && (b.refundAmount || 0) > 0 && b.refundStatus !== 'processed') {
        list.push({
          booking: b,
          customer,
          vehicle,
          type: 'refund',
          amount: b.refundAmount || 0,
          reason: `Cancellation refund for Booking ID ${b.id.toUpperCase().slice(0, 8)}`,
          status: b.refundStatus || 'pending_manual_bank_transfer'
        });
      }

      // 2. Refundable Security Deposit owed
      const isEligibleForDepositRefund = b.status === 'completed' || b.status === 'cancelled';
      if (isEligibleForDepositRefund && (b.securityDepositAmount || 0) > 0 && b.securityDepositStatus !== 'refunded') {
        list.push({
          booking: b,
          customer,
          vehicle,
          type: 'deposit',
          amount: b.securityDepositAmount || 0,
          reason: `Security Deposit return for Booking ID ${b.id.toUpperCase().slice(0, 8)}`,
          status: b.securityDepositStatus || 'pending'
        });
      }
    });

    return list;
  }, [allBookings, allUsers, vehicles]);

  const disbursedPayables = React.useMemo(() => {
    const list: {
      bookingId: string;
      customer: any;
      vehicle: any;
      type: 'refund' | 'deposit';
      amount: number;
      date: string;
    }[] = [];

    allBookings.forEach(b => {
      const customer = allUsers.find(u => u.id === b.userId);
      const vehicle = vehicles.find(v => v.id === b.vehicleId);

      if (b.status === 'cancelled' && b.refundStatus === 'processed' && (b.refundAmount || 0) > 0) {
        list.push({
          bookingId: b.id,
          customer,
          vehicle,
          type: 'refund',
          amount: b.refundAmount || 0,
          date: (b as any).refundProcessedAt || b.createdAt || b.bookingDate
        });
      }

      if (b.securityDepositStatus === 'refunded' && (b.securityDepositAmount || 0) > 0) {
        list.push({
          bookingId: b.id,
          customer,
          vehicle,
          type: 'deposit',
          amount: b.securityDepositAmount || 0,
          date: (b as any).securityDepositRefundedAt || b.createdAt || b.bookingDate
        });
      }
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allBookings, allUsers, vehicles]);

  React.useEffect(() => {
    fetchBalancePayments();
  }, [allUsers]);

  // Filter customers with an outstanding balance
  const customersWithBalance = allUsers.filter(u => {
    const hasBalance = (u.outstandingBalance || 0) > 0;
    const matchesSearch = searchQuery === '' || 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return hasBalance && matchesSearch;
  });

  const getCustomerReasons = (customerId: string, outstandingBalance: number) => {
    const reasons: { title: string; amount: number; date?: string; icon: any }[] = [];
    
    // 1. Get matched e-challans
    const matchedChallans = eChallans.filter(c => c.matchedUserId === customerId);
    matchedChallans.forEach(c => {
      reasons.push({
        title: `Traffic E-Challan #${c.challanNumber}`,
        amount: c.amount,
        date: c.date || c.createdAt,
        icon: Scale
      });
    });

    // 2. Get bookings with penalty amounts
    const matchedBookings = allBookings.filter(b => b.userId === customerId && (b.penaltyAmount || 0) > 0);
    matchedBookings.forEach(b => {
      const v = vehicles.find(veh => veh.id === b.vehicleId);
      reasons.push({
        title: `Late Return / Damage Penalty (${v?.name || 'Vehicle'} - ID: ${b.id.slice(0, 8).toUpperCase()})`,
        amount: b.penaltyAmount || 0,
        date: b.endDate,
        icon: Car
      });
    });

    // 3. Get bookings with pending remaining payments (partial payment bookings)
    const partialBookings = allBookings.filter(
      b => b.userId === customerId && 
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
        icon: Wallet
      });
    });

    // Calculate sum of known penalties
    const sumPenalties = reasons.reduce((acc, r) => acc + r.amount, 0);
    
    // 3. If there is a discrepancy or no specific reasons found, add a miscellaneous entry
    if (sumPenalties < outstandingBalance) {
      reasons.push({
        title: 'Account Balance Adjustment / Unresolved Security Surcharge',
        amount: outstandingBalance - sumPenalties,
        icon: Wallet
      });
    }

    return reasons;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Wallet className="text-blue-600" size={24} />
            Customer Outstanding Balances
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitor real-time customer receivables, auto-debited traffic violations, and late return surcharges.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search customer name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600/20 text-slate-800"
          />
        </div>
      </div>

      {/* Pending Penalty Payments Section */}
      {balancePayments.some(p => p.status === 'pending') && (
        <div className="bg-amber-50/50 border-2 border-dashed border-amber-200 rounded-3xl p-6 space-y-4 animate-in fade-in duration-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
            <h3 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider">Awaiting Penalty Payment Verification ({balancePayments.filter(p => p.status === 'pending').length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {balancePayments.filter(p => p.status === 'pending').map((pay) => (
              <div key={pay.id} className="bg-white border border-amber-200/60 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-amber-400 transition-colors">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">{pay.userName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{pay.userEmail}</p>
                    </div>
                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wider">
                      Pending Approval
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Target Penalty:</span>
                      <span className="text-slate-800">{pay.penaltyTitle}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Amount Deposited:</span>
                      <span className="text-amber-600 font-extrabold">PKR {pay.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-medium font-mono">
                      <span className="text-slate-400">Sender Bank:</span>
                      <span className="text-slate-600">{pay.senderBank}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-medium font-mono">
                      <span className="text-slate-400">TID Reference:</span>
                      <span className="text-slate-600 uppercase font-bold">{pay.transactionRef}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleApprovePayment(pay.id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 rounded-xl text-[10px] uppercase tracking-wider transition-colors"
                  >
                    Approve Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {customersWithBalance.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <Wallet className="text-emerald-600" size={28} />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase">All Accounts Clear</h3>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            There are currently no customers with active outstanding balances. All accounts are fully settled.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {customersWithBalance.map((customer) => {
            const balance = customer.outstandingBalance || 0;
            const reasons = getCustomerReasons(customer.id, balance);

            return (
              <div 
                key={customer.id} 
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-md transition-all"
              >
                {/* Left side: Customer details & Reasons breakdown */}
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                      {customer.avatar ? (
                        <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        customer.name?.charAt(0).toUpperCase() || 'C'
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{customer.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {customer.id} • {customer.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Penalties & Charge Details</span>
                    <div className="grid grid-cols-1 gap-2">
                      {reasons.map((reason, index) => {
                        const IconComponent = reason.icon;
                        return (
                          <div key={index} className="flex items-start justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                            <div className="flex items-start gap-2.5">
                              <div className="p-1.5 bg-white border border-slate-100 text-slate-500 rounded-md mt-0.5">
                                <IconComponent size={14} />
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block">{reason.title}</span>
                                {reason.date && (
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    Logged on: {new Date(reason.date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-extrabold text-slate-900 whitespace-nowrap ml-4">
                              PKR {reason.amount.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right side: Total remaining balance Card */}
                <div className="w-full md:w-64 bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between border border-slate-950 shadow-inner space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Outstanding Balance</span>
                    <span className="text-2xl font-black text-amber-400 block">PKR {balance.toLocaleString()}</span>
                  </div>

                  {/* Administrative Release Option */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Release/Waive Penalties</label>
                    <input 
                      type="text" 
                      placeholder="Enter waiver reason..."
                      value={waiverReasons[customer.id] || ''}
                      onChange={(e) => setWaiverReasons(prev => ({ ...prev, [customer.id]: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-white outline-none focus:border-amber-400 placeholder:text-slate-500 transition-colors"
                    />
                    <button
                      onClick={() => handleWaiveBalance(customer.id)}
                      disabled={isWaiving[customer.id]}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {isWaiving[customer.id] ? 'Releasing...' : 'Release from Penalties'}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                    <Clock size={10} className="text-amber-400" />
                    <span>Awaiting Payment Settlement</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ELITEDRIVE PAYABLES (REFUNDS & DEPOSITS OWED TO CUSTOMERS) */}
      <div className="pt-8 border-t border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <CheckCircle className="text-emerald-600" size={24} />
            EliteDrive Payables (Refunds & Deposits Owed)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track and process outstanding cancellation refunds and refundable security deposits owed to customers.
          </p>
        </div>

        {payablesList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto mt-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle className="text-emerald-600" size={28} />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase">No Outstanding Payables</h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              EliteDrive is fully cleared. There are no outstanding cancellation refunds or security deposit returns owed to customers at this time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-6">
            {payablesList.map((item, index) => {
              const bookingId = item.booking.id;
              const isRefund = item.type === 'refund';
              const isClearing = clearingItem[`${item.type}-${bookingId}`] || false;

              return (
                <div 
                  key={`${item.type}-${bookingId}-${index}`} 
                  className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all border-l-4 border-l-emerald-500"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                        {item.customer?.avatar ? (
                          <img src={item.customer.avatar} alt={item.customer?.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          item.customer?.name?.charAt(0).toUpperCase() || 'C'
                        )}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block">{item.customer?.name || 'Unknown Customer'}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">ID: {item.customer?.id} • {item.customer?.email}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Liability Item:</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${isRefund ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                          {isRefund ? 'Cancellation Refund' : 'Security Deposit'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Vehicle:</span>
                        <span className="font-extrabold text-slate-800">{item.vehicle?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-100">
                        <span className="text-emerald-700 font-extrabold text-[10px] uppercase">EliteDrive owes user:</span>
                        <span className="font-black text-emerald-600 text-sm">PKR {item.amount.toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="text-[10px] font-medium text-slate-600 bg-emerald-50/30 border border-emerald-100/50 p-2.5 rounded-lg leading-relaxed">
                      <strong>Policy Notice:</strong> Elite Drive has to pay this amount of <strong>PKR {item.amount.toLocaleString()}</strong> to customer <strong>{item.customer?.name}</strong> as {isRefund ? 'their eligible cancellation refund' : 'their refundable security deposit'} for Booking ID <strong>{bookingId.toUpperCase()}</strong>.
                    </p>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => isRefund ? handleClearRefund(bookingId) : handleClearDeposit(bookingId)}
                      disabled={isClearing}
                      className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-5 rounded-xl text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/10"
                    >
                      {isClearing ? 'Processing...' : `Mark as Refunded/Cleared`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AUDIT LOGS: FINANCIAL SETTLEMENTS & PAYOUTS */}
      <div className="pt-10 mt-10 border-t border-slate-200 space-y-8 animate-in fade-in duration-700">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Clock className="text-slate-700" size={24} />
            Historical Financial Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete transaction ledger of all disbursements paid by EliteDrive to customers, and penalties settled or waived.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Column 1: EliteDrive Disbursements History (Payouts) */}
          <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              EliteDrive Disbursements (Refunds & Deposits Returned)
            </h3>
            <p className="text-[11px] text-slate-400">
              Audit trail of payouts and collateral returned to customers by EliteDrive.
            </p>

            {disbursedPayables.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-bold">No processed disbursements recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {disbursedPayables.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-extrabold text-slate-800 block">
                          {item.customer?.name || 'Unknown Customer'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {item.customer?.email}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Disbursed
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[10px] bg-white p-2.5 rounded-lg border border-slate-100/60 font-medium text-slate-500">
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400">Type</span>
                        <span className={`font-black uppercase tracking-wider text-[9px] ${
                          item.type === 'refund' ? 'text-amber-700' : 'text-blue-700'
                        }`}>
                          {item.type === 'refund' ? 'Cancellation Refund' : 'Security Deposit'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400">Vehicle</span>
                        <span className="font-bold text-slate-700 truncate block max-w-[120px]">
                          {item.vehicle?.name || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400">Booking ID</span>
                        <span className="font-bold font-mono text-slate-700">{item.bookingId.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400">Date Processed</span>
                        <span className="font-bold text-slate-700">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 px-1">
                      <span className="text-[10px] text-slate-400 font-bold">Payout Amount:</span>
                      <span className="font-black text-emerald-600">PKR {item.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Penalty Settlements & Administrative Waivers */}
          <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Penalty Settlements & Surcharge Relief logs
            </h3>
            <p className="text-[11px] text-slate-400">
              Audit trail of customer liability payments approved or administrative balance waivers.
            </p>

            {(() => {
              const settledList = balancePayments.filter(p => p.status === 'approved' || p.status === 'waived');
              if (settledList.length === 0) {
                return (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 font-bold">No settled liabilities recorded yet.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {settledList.map((payment) => (
                    <div key={payment.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-extrabold text-slate-800 block">
                            {payment.userName || 'Unknown Customer'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {payment.userEmail}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          payment.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}>
                          {payment.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[10px] bg-white p-2.5 rounded-lg border border-slate-100/60 font-medium text-slate-500">
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400">Surcharge item</span>
                          <span className="font-bold text-slate-700 truncate block max-w-[120px]">
                            {payment.penaltyTitle}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400">Approved By</span>
                          <span className="font-bold text-slate-700 truncate block max-w-[120px]">
                            {payment.resolvedBy || 'Admin'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400">Bank / Channel</span>
                          <span className="font-bold text-slate-700">{payment.senderBank || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400">Reference / TID</span>
                          <span className="font-bold text-slate-700 truncate block max-w-[120px]">{payment.transactionRef || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1 px-1">
                        <span className="text-[10px] text-slate-400 font-bold">
                          {payment.status === 'waived' ? 'Waived Amount:' : 'Settled Amount:'}
                        </span>
                        <span className="font-black text-slate-800">PKR {payment.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemainingBalances;
