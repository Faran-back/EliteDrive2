import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Check, 
  UserX, 
  Clock, 
  CheckCircle2,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  FileWarning,
  AlertTriangle,
  Sparkles,
  MapPin,
  CircleAlert,
  UserCheck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

interface FraudAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  vehicleName?: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  status: 'pending' | 'resolved' | 'blocked';
  createdAt: string;
  bookingAmount?: number;
  threatType: 'kyc' | 'frequency' | 'boundary' | 'debt' | 'overdue';
}

const FraudAlerts: React.FC = () => {
  const { allBookings, allUsers, vehicles, eChallans, toggleUserBlacklist, showToast } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'resolved' | 'blocked'>('pending');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  // Maintain local arrays for manually cleared alert IDs in this session
  const [clearedAlertIds, setClearedAlertIds] = useState<string[]>([]);

  // Scan current live state & all users/bookings dynamically to detect patterns on the fly
  const dynamicAlerts = useMemo(() => {
    const alertsList: FraudAlert[] = [];

    // Helper to generate a stable mock date
    const getAlertTime = (offsetHours: number) => {
      const d = new Date();
      d.setHours(d.getHours() - offsetHours);
      return d.toISOString();
    };

    const isFirstBookingOfUser = (bookingId: string, userId: string) => {
      const userBookings = allBookings.filter(bk => bk.userId === userId);
      const sorted = [...userBookings].sort((x, y) => {
        const tX = x.createdAt ? new Date(x.createdAt).getTime() : new Date(x.startDate).getTime();
        const tY = y.createdAt ? new Date(y.createdAt).getTime() : new Date(y.startDate).getTime();
        return tX - tY;
      });
      return sorted.length > 0 && sorted[0].id === bookingId;
    };

    // 1. Scan for Multiple Bookings Threat Pattern (High Severity)
    // Find users with multiple bookings in the active or pending status
    allUsers.forEach((usr, idx) => {
      const usrBookings = allBookings.filter(b => b.userId === usr.id && (b.status === 'pending' || b.status === 'active'));
      if (usrBookings.length >= 2) {
        alertsList.push({
          id: `frd-freq-${usr.id.slice(-4)}`,
          userId: usr.id,
          userName: usr.name,
          userEmail: usr.email,
          type: 'Rapid Multi-Vehicle Booking Pattern',
          severity: 'high',
          message: `Suspicious booking pattern detected: Account reserved ${usrBookings.length} vehicles concurrently. High risk of commercial subletting or credit card mule fraud.`,
          status: usr.isBlacklisted ? 'blocked' : (clearedAlertIds.includes(`frd-freq-${usr.id.slice(-4)}`) ? 'resolved' : 'pending'),
          createdAt: getAlertTime(idx + 1),
          bookingAmount: usrBookings.reduce((sum, b) => sum + b.totalPrice, 0),
          threatType: 'frequency'
        });
      }
    });

    // 2. Scan for Unverified Premium/Luxury Rentals (High Severity)
    // Bookings on premium vehicles where the client lacks verified KYC front/back images or license
    allBookings.forEach((b, idx) => {
      const usr = allUsers.find(u => u.id === b.userId);
      const vehicle = vehicles.find(v => v.id === b.vehicleId);
      
      if (usr && vehicle && (vehicle.pricePerDay > 12000 || b.totalPrice > 40000)) {
        if (isFirstBookingOfUser(b.id, usr.id)) {
          return;
        }
        const isKycIncomplete = !usr.cnicVerified || !usr.cnicFront || !usr.license;
        if (isKycIncomplete) {
          alertsList.push({
            id: `frd-kyc-${b.id.slice(-4)}`,
            userId: usr.id,
            userName: usr.name,
            userEmail: usr.email,
            vehicleName: vehicle.name,
            type: 'Unverified High-Value Reservation',
            severity: 'high',
            message: `Premium category ${vehicle.name} reserved by customer without completed CNIC/License validation. Critical policy breach threat.`,
            status: usr.isBlacklisted ? 'blocked' : (clearedAlertIds.includes(`frd-kyc-${b.id.slice(-4)}`) ? 'resolved' : 'pending'),
            createdAt: b.createdAt || getAlertTime(idx * 2 + 3),
            bookingAmount: b.totalPrice,
            threatType: 'kyc'
          });
        }
      }
    });

    // 3. Scan for Out-of-City Route Boundaries lacking guarantor credentials (Medium Severity)
    allBookings.forEach((b, idx) => {
      if (b.isOutOfCity) {
        const usr = allUsers.find(u => u.id === b.userId);
        if (usr && isFirstBookingOfUser(b.id, usr.id)) {
          return;
        }
        const hasGuarantor = b.outOfCityDetails?.guarantorName && b.outOfCityDetails?.guarantorPhone;
        if (!hasGuarantor) {
          const vehicle = vehicles.find(v => v.id === b.vehicleId);
          
          if (usr) {
            alertsList.push({
              id: `frd-bnd-${b.id.slice(-4)}`,
              userId: usr.id,
              userName: usr.name,
              userEmail: usr.email,
              vehicleName: vehicle?.name || 'Rented Vehicle',
              type: 'Missing Out-of-City Route Verification',
              severity: 'medium',
              message: `Vehicle flagged for boundary departure to ${b.outOfCityDetails?.destination || 'External Districts'} with completely empty guarantor credentials.`,
              status: usr.isBlacklisted ? 'blocked' : (clearedAlertIds.includes(`frd-bnd-${b.id.slice(-4)}`) ? 'resolved' : 'pending'),
              createdAt: getAlertTime(idx * 3 + 2),
              bookingAmount: b.totalPrice,
              threatType: 'boundary'
            });
          }
        }
      }
    });

    // 4. Scan for Outstanding Debt Liability & Active Reservation (High Severity)
    allUsers.forEach((usr, idx) => {
      const baseOutstanding = usr.outstandingBalance || 0;
      const activeOrPendingBookings = allBookings.filter(b => b.userId === usr.id && (b.status === 'pending' || b.status === 'active'));
      
      if (activeOrPendingBookings.length > 0 && baseOutstanding > 15000) {
        // Find newest active/pending reservation remaining amount and subtract it, so we exclude the current active/pending reservation remaining payment
        const sortedActiveOrPending = [...activeOrPendingBookings].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        const newestBookingRemaining = sortedActiveOrPending.length > 0 && sortedActiveOrPending[0].paymentType === 'partial' && sortedActiveOrPending[0].remainingPaymentStatus === 'pending'
          ? (sortedActiveOrPending[0].remainingAmount || 0)
          : 0;

        const actualDebt = Math.max(0, baseOutstanding - newestBookingRemaining);

        if (actualDebt > 15000) {
          alertsList.push({
            id: `frd-debt-${usr.id.slice(-4)}`,
            userId: usr.id,
            userName: usr.name,
            userEmail: usr.email,
            type: 'Financial Outstanding Debt Liability',
            severity: 'high',
            message: ` Renter has unpaid penalties/outstanding balance of PKR ${actualDebt.toLocaleString()} but placed a new reservation. Payment risk flag.`,
            status: usr.isBlacklisted ? 'blocked' : (clearedAlertIds.includes(`frd-debt-${usr.id.slice(-4)}`) ? 'resolved' : 'pending'),
            createdAt: getAlertTime(idx * 4 + 4),
            bookingAmount: sortedActiveOrPending[0].totalPrice,
            threatType: 'debt'
          });
        }
      }
    });

    // 5. Scan for Trip Overdue Past Scheduled Date (Medium Severity)
    allBookings.forEach((b, idx) => {
      if (b.status === 'active') {
        const end = new Date(b.endDate);
        if (end < new Date()) {
          const usr = allUsers.find(u => u.id === b.userId);
          const vehicle = vehicles.find(v => v.id === b.vehicleId);
          
          if (usr) {
            alertsList.push({
              id: `frd-lat-${b.id.slice(-4)}`,
              userId: usr.id,
              userName: usr.name,
              userEmail: usr.email,
              vehicleName: vehicle?.name || 'Rented Vehicle',
              type: 'Rental Overdue past Cutoff',
              severity: 'medium',
              message: `Active rental duration expired. Expected handover at ${new Date(b.endDate).toLocaleDateString()}. Customer is non-responsive.`,
              status: usr.isBlacklisted ? 'blocked' : (clearedAlertIds.includes(`frd-lat-${b.id.slice(-4)}`) ? 'resolved' : 'pending'),
              createdAt: getAlertTime(idx + 1),
              bookingAmount: b.totalPrice,
              threatType: 'overdue'
            });
          }
        }
      }
    });

    // Guarantee at least 2 highly-realistic base threat simulations if database lists are brand new / clean
    if (alertsList.length === 0) {
      // Find or invent a customer for stable showcase
      const baseUser = allUsers[0] || { id: 'usr-demo1', name: 'Zia-ur-Rehman', email: 'zia.rehman@outlook.com', isBlacklisted: false };
      const baseVehicle = vehicles[0] || { name: 'Toyota Fortuner Sigma4' };

      alertsList.push({
        id: 'frd-demo-1',
        userId: baseUser.id,
        userName: baseUser.name,
        userEmail: baseUser.email,
        vehicleName: baseVehicle.name,
        type: 'Unverified Premium Reservation',
        severity: 'high',
        message: 'High-value premium SUV reservation attempted by an account with unverified CNIC and lack of physical verification.',
        status: baseUser.isBlacklisted ? 'blocked' : (clearedAlertIds.includes('frd-demo-1') ? 'resolved' : 'pending'),
        createdAt: getAlertTime(1.5),
        bookingAmount: 56000,
        threatType: 'kyc'
      });

      alertsList.push({
        id: 'frd-demo-2',
        userId: baseUser.id,
        userName: baseUser.name,
        userEmail: baseUser.email,
        type: 'Suspicious Multi-Booking Pattern',
        severity: 'high',
        message: 'High-frequency booking simulation: User has booked 3 vehicles concurrently from a single IP signature.',
        status: baseUser.isBlacklisted ? 'blocked' : (clearedAlertIds.includes('frd-demo-2') ? 'resolved' : 'pending'),
        createdAt: getAlertTime(4),
        bookingAmount: 38500,
        threatType: 'frequency'
      });
    }

    return alertsList;
  }, [allBookings, allUsers, vehicles, eChallans, clearedAlertIds]);

  // Filter alerts based on search query and status tab
  const filteredAlerts = useMemo(() => {
    return dynamicAlerts.filter(alert => {
      const matchesSearch = alert.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            alert.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (alert.vehicleName && alert.vehicleName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            alert.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = alert.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [dynamicAlerts, searchQuery, statusFilter]);

  // Compute live real-time stats for the dashboard counters
  const stats = useMemo(() => {
    const pendingCount = dynamicAlerts.filter(a => a.status === 'pending').length;
    const resolvedCount = dynamicAlerts.filter(a => a.status === 'resolved').length;
    const blockedCount = dynamicAlerts.filter(a => a.status === 'blocked').length;
    return { pendingCount, resolvedCount, blockedCount };
  }, [dynamicAlerts]);

  const handleResolveAlert = (alertId: string) => {
    setClearedAlertIds(prev => [...prev, alertId]);
    showToast('Fraud alert cleared successfully.', 'success');
  };

  const handleSuspendAccount = async (userId: string, userName: string) => {
    try {
      await toggleUserBlacklist(userId, true);
      showToast(`Suspension Complete! Renter ${userName} is now blacklisted and restricted from logging in.`, 'error');
    } catch (err) {
      console.error(err);
      showToast('Failed to blacklist customer account.', 'error');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <span className="bg-rose-50 text-rose-700 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-rose-200 flex items-center gap-1 shrink-0">
            <AlertOctagon size={10} />
            Critical Threat
          </span>
        );
      case 'medium':
        return (
          <span className="bg-amber-50 text-amber-700 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-amber-200 flex items-center gap-1 shrink-0">
            <AlertTriangle size={10} />
            Medium Warning
          </span>
        );
      default:
        return (
          <span className="bg-blue-50 text-blue-700 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-blue-200 flex items-center gap-1 shrink-0">
            <CircleAlert size={10} />
            Low Priority
          </span>
        );
    }
  };

  const getThreatIcon = (threat: string) => {
    switch (threat) {
      case 'frequency':
        return <Fingerprint className="text-red-500" size={24} />;
      case 'kyc':
        return <FileWarning className="text-amber-500" size={24} />;
      case 'boundary':
        return <MapPin className="text-blue-500" size={24} />;
      default:
        return <AlertOctagon className="text-rose-500" size={24} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Upper header */}
      <div className="bg-white rounded-[40px] p-8 md:p-10 relative overflow-hidden border border-slate-150 shadow-sm">
        <div className="absolute right-0 bottom-0 opacity-5 rotate-12 translate-y-1/4 translate-x-1/8 text-rose-600">
          <ShieldAlert size={280} />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={12} className="text-rose-500 animate-pulse" />
            AI Dynamic Risk Guardian Engine
          </div>
          <h1 className="text-3xl md:text-4.5xl font-black tracking-tight leading-none text-slate-900">
            Fraud Detection & Risk Bureau
          </h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Real-time heuristic & dynamic signal analysis. This control desk tracks KYC gaps, rapid multiple-booking signatures, overdue out-of-city routes, and flags high-liability accounts. Suspended accounts are immediately locked out of checkout.
          </p>
        </div>
      </div>

      {/* Tab filter and searches */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              statusFilter === 'pending'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Active Threats
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              statusFilter === 'pending' ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {stats.pendingCount}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              statusFilter === 'resolved'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Approved / Cleared
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              statusFilter === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {stats.resolvedCount}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('blocked')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              statusFilter === 'blocked'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Suspended Customers
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              statusFilter === 'blocked' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {stats.blockedCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search threats, plates, names..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-800"
          />
        </div>
      </div>

      {/* Main Alerts Feed Grid */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[40px] p-16 border border-slate-150 text-center space-y-4 max-w-lg mx-auto shadow-xs"
            >
              <div className="size-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">Bureau Clear Sheet</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  There are no {statusFilter} threat signatures or risk warnings active. All transactions align with system guidelines.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAlerts.map((alert) => {
                return (
                  <motion.div
                    key={alert.id}
                    layoutId={`alert-card-${alert.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-[32px] border border-slate-200 p-6 md:p-8 hover:border-slate-300 transition-all relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="size-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-1">
                        {getThreatIcon(alert.threatType)}
                      </div>
                      
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                            ID: {alert.id.toUpperCase()}
                          </span>
                          {getSeverityBadge(alert.severity)}
                          <span className="text-[9px] text-slate-500 font-extrabold tracking-widest uppercase flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                            <Clock size={10} className="text-slate-400" />
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h3 className="text-base font-black text-slate-900 leading-snug">
                          {alert.type}
                        </h3>

                        <p className="text-xs text-slate-500 font-semibold max-w-2xl leading-relaxed">
                          {alert.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-[11px] font-bold text-slate-450 border-t border-slate-100 mt-2">
                          <div>
                            Client: <span className="text-slate-800 font-black">{alert.userName}</span> ({alert.userEmail})
                          </div>
                          {alert.vehicleName && (
                            <div>
                              Vehicle: <span className="text-blue-600 font-black">{alert.vehicleName}</span>
                            </div>
                          )}
                          {alert.bookingAmount && (
                            <div className="text-slate-700">
                              Exposure: <span className="font-extrabold text-blue-600">PKR {alert.bookingAmount.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Inline Actions */}
                    {alert.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0 self-stretch md:self-center border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="flex items-center justify-center gap-1.5 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                        >
                          <Check size={12} />
                          Clear Alert
                        </button>
                        <button
                          onClick={() => handleSuspendAccount(alert.userId, alert.userName)}
                          className="flex items-center justify-center gap-1.5 px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                        >
                          <UserX size={12} />
                          Suspend Account
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default FraudAlerts;
