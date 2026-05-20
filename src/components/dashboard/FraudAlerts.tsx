import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Check, 
  UserX, 
  Clock, 
  CheckCircle2,
  AlertOctagon,
  ChevronDown,
  ChevronUp
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
}

const INITIAL_FRAUD_ALERTS: FraudAlert[] = [
  {
    id: 'frd-891a',
    userId: 'usr-921x',
    userName: 'Khurram Shahzad',
    userEmail: 'khurram89@yahoo.com',
    vehicleName: 'Toyota Fortuner',
    type: 'Unverified Premium Reservation',
    severity: 'high',
    message: 'High-value premium SUV reservation attempted by an account with no verified phone number.',
    status: 'pending',
    createdAt: '2026-05-20T14:45:00Z',
    bookingAmount: 56000
  },
  {
    id: 'frd-723b',
    userId: 'usr-120k',
    userName: 'Zia-ur-Rehman',
    userEmail: 'zia.rehman@gmail.com',
    vehicleName: 'Honda Civic',
    type: 'Multi-Booking Activity',
    severity: 'high',
    message: 'Multiple high-frequency bookings (3 vehicles reserved within 4 minutes) from a single user.',
    status: 'pending',
    createdAt: '2026-05-20T13:10:00Z',
    bookingAmount: 38500
  },
  {
    id: 'frd-551c',
    userId: 'usr-552y',
    userName: 'Bilal Baig',
    userEmail: 'baig_bilal@outlook.com',
    vehicleName: 'Kia Sportage',
    type: 'Location Anomaly',
    severity: 'medium',
    message: 'Booking request from a suspicious IP address range matching standard proxy networks.',
    status: 'pending',
    createdAt: '2026-05-20T11:22:00Z',
    bookingAmount: 13500
  }
];

const FraudAlerts: React.FC = () => {
  const { allBookings, allUsers, vehicles, showToast } = useStore();
  const [alerts, setAlerts] = useState<FraudAlert[]>(INITIAL_FRAUD_ALERTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'resolved' | 'blocked'>('pending');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  // Compute live anomalies to merge
  const liveSystemAnomalies = useMemo(() => {
    const liveAlerts: FraudAlert[] = [];
    
    allBookings.forEach((b) => {
      const user = allUsers.find(u => u.id === b.userId);
      const vehicle = vehicles.find(v => v.id === b.vehicleId);
      
      if (user && vehicle && vehicle.pricePerDay > 15000) {
        const hasVerificationBypass = ['test@example.com', 'ahmed12@gmail.com'].includes(user.email.toLowerCase());
        const isVerifiedUser = user.emailVerified && user.phoneVerified;
        
        if (!isVerifiedUser && !hasVerificationBypass) {
          liveAlerts.push({
            id: `live-frd-${b.id}`,
            userId: user.id,
            userName: user.name || 'Unverified Customer',
            userEmail: user.email,
            vehicleName: vehicle.name,
            type: 'Unverified Premium Rental',
            severity: 'high',
            message: `Unverified account ${user.name} placed a premium booking for ${vehicle.name} exceeding the luxury threshold limit.`,
            status: 'pending',
            createdAt: b.bookingDate || new Date().toISOString(),
            bookingAmount: b.totalPrice
          });
        }
      }
    });

    return liveAlerts;
  }, [allBookings, allUsers, vehicles]);

  // Combine initial alerts and live anomalies
  const combinedAlerts = useMemo(() => {
    const currentAlertIds = new Set(alerts.map(a => a.id));
    const newLive = liveSystemAnomalies.filter(l => !currentAlertIds.has(l.id));
    return [...alerts, ...newLive];
  }, [alerts, liveSystemAnomalies]);

  // Filter alerts based on search query and status tab
  const filteredAlerts = useMemo(() => {
    return combinedAlerts.filter(alert => {
      const matchesSearch = alert.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            alert.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (alert.vehicleName && alert.vehicleName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            alert.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = alert.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [combinedAlerts, searchQuery, statusFilter]);

  // Alert Stats for tab navigation
  const stats = useMemo(() => {
    const pendingCount = combinedAlerts.filter(a => a.status === 'pending').length;
    const resolvedCount = combinedAlerts.filter(a => a.status === 'resolved').length;
    const blockedCount = combinedAlerts.filter(a => a.status === 'blocked').length;
    return { pendingCount, resolvedCount, blockedCount };
  }, [combinedAlerts]);

  const handleResolveAlert = (alertId: string, flagAsBlock: boolean) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, status: flagAsBlock ? 'blocked' : 'resolved' };
      }
      return a;
    }));
    
    showToast(
      flagAsBlock ? 'User account has been flagged and suspended' : 'Fraud alert marked clear', 
      flagAsBlock ? 'error' : 'success'
    );
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <span className="bg-red-50 text-red-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-red-200">High Risk</span>;
      case 'medium':
        return <span className="bg-amber-50 text-amber-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-amber-200">Medium Risk</span>;
      default:
        return <span className="bg-blue-50 text-blue-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-blue-200">Low Risk</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <ShieldAlert size={36} className="text-red-500" />
          Security Alerts
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Review, analyze, and clear auto-flagged booking alerts or customer profile threats.
        </p>
      </div>

      {/* Simplified Inline Tab Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              statusFilter === 'pending'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Active
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              statusFilter === 'pending' ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {stats.pendingCount}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              statusFilter === 'resolved'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Approved
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              statusFilter === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {stats.resolvedCount}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('blocked')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              statusFilter === 'blocked'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Suspended
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              statusFilter === 'blocked' ? 'bg-slate-750 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {stats.blockedCount}
            </span>
          </button>
        </div>

        {/* Search filter inline */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search alerts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-800"
          />
        </div>
      </div>

      {/* Main Alerts List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-[32px] p-12 border border-slate-100 text-center space-y-4 max-w-lg mx-auto shadow-xs"
            >
              <div className="size-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">All Alerts Cleared</h3>
                <p className="text-slate-500 text-sm font-medium">
                  There are no {statusFilter} threat flags requiring verification at this time.
                </p>
              </div>
            </motion.div>
          ) : (
            filteredAlerts.map((alert) => {
              const isExpanded = expandedAlertId === alert.id;
              return (
                <motion.div
                  key={alert.id}
                  layoutId={`alert-card-${alert.id}`}
                  className="bg-white rounded-3xl border border-slate-100/80 p-6 md:p-8 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">
                          ID: {alert.id}
                        </span>
                        {getSeverityBadge(alert.severity)}
                        <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" />
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {alert.type}
                      </h3>

                      <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
                        {alert.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 pt-2 text-xs font-bold text-slate-450 border-t border-slate-50 mt-4">
                        <div>
                          Customer: <span className="text-slate-800 font-black">{alert.userName}</span> ({alert.userEmail})
                        </div>
                        {alert.vehicleName && (
                          <div>
                            Target Vehicle: <span className="text-blue-600 font-black">{alert.vehicleName}</span>
                          </div>
                        )}
                        {alert.bookingAmount && (
                          <div className="text-slate-800">
                            Booked Amount: <span className="font-extrabold text-blue-600">PKR {alert.bookingAmount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Inline Actions */}
                    {alert.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-2 self-stretch md:self-center shrink-0 w-full md:w-auto pt-4 md:pt-0">
                        <button
                          onClick={() => handleResolveAlert(alert.id, false)}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                        >
                          <Check size={14} />
                          Clear Alert
                        </button>
                        <button
                          onClick={() => handleResolveAlert(alert.id, true)}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-[0.98] cursor-pointer"
                        >
                          <UserX size={14} />
                          Suspend Account
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default FraudAlerts;
