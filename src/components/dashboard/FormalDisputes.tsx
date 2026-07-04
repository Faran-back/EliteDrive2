import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Calendar, 
  User, 
  Car, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Scale, 
  Clock,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

const FormalDisputes: React.FC = () => {
  const { disputes, vehicles, allBookings, allUsers, updateDisputeStatus, showToast } = useStore();
  
  // Search / filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'resolved' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Resolution modal state
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const selectedDispute = useMemo(() => {
    return disputes.find(d => d.id === selectedDisputeId);
  }, [disputes, selectedDisputeId]);

  const stats = useMemo(() => {
    const total = disputes.length;
    const pending = disputes.filter(d => d.status === 'pending').length;
    const underReview = disputes.filter(d => d.status === 'under_review').length;
    const resolved = disputes.filter(d => d.status === 'resolved').length;
    const rejected = disputes.filter(d => d.status === 'rejected').length;
    return { total, pending, underReview, resolved, rejected };
  }, [disputes]);

  const handleUpdateStatus = async (id: string, newStatus: 'under_review' | 'resolved' | 'rejected') => {
    setActionLoading(true);
    try {
      await updateDisputeStatus(id, newStatus, resolutionDetails);
      setSelectedDisputeId(null);
      setResolutionDetails('');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to update dispute status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDisputes = useMemo(() => {
    return disputes.filter(d => {
      const userObj = allUsers.find(u => u.id === d.userId);
      const booking = allBookings.find(b => b.id === d.bookingId);
      const vehicle = booking ? vehicles.find(v => v.id === booking.vehicleId) : null;
      
      const textToMatch = [
        d.id,
        d.title,
        d.description,
        d.userName,
        userObj?.email || '',
        d.bookingId || '',
        vehicle?.name || '',
        vehicle?.licensePlate || ''
      ].join(' ').toLowerCase();

      const matchesSearch = textToMatch.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchesType = typeFilter === 'all' || d.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [disputes, allUsers, allBookings, vehicles, searchQuery, statusFilter, typeFilter]);

  const getHumanType = (type: string) => {
    switch (type) {
      case 'damage_charges': return 'Damage Charges Dispute';
      case 'late_return': return 'Late Return Penalty';
      case 'traffic_violation': return 'Traffic Violation / E-Challan';
      case 'payment_issue': return 'Payment Issue';
      case 'document_issue': return 'Document / KYC Issue';
      default: return type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': 
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'under_review': 
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected': 
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default: 
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Disputes</p>
          <p className="text-xl font-extrabold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Pending Action</p>
          <p className="text-xl font-extrabold text-amber-800">{stats.pending}</p>
        </div>
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Under Review</p>
          <p className="text-xl font-extrabold text-blue-800">{stats.underReview}</p>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Resolved</p>
          <p className="text-xl font-extrabold text-emerald-800">{stats.resolved}</p>
        </div>
        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Rejected</p>
          <p className="text-xl font-extrabold text-rose-800">{stats.rejected}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search disputes, customer name, booking..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Categories</option>
            <option value="damage_charges">Damage Charges</option>
            <option value="late_return">Late Return</option>
            <option value="traffic_violation">Traffic Violation</option>
            <option value="payment_issue">Payment Issue</option>
            <option value="document_issue">Document Issue</option>
          </select>
        </div>
      </div>

      {/* Disputes Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filteredDisputes.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">
            No formal customer disputes found matching current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-wider text-slate-500">
                  <th className="px-6 py-4">Dispute / Customer</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Associated Booking</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date Filed</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDisputes.map((dispute) => {
                  const booking = allBookings.find(b => b.id === dispute.bookingId);
                  const vehicle = booking ? vehicles.find(v => v.id === booking.vehicleId) : null;
                  
                  return (
                    <tr key={dispute.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-900 block">{dispute.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">ID: {dispute.id}</span>
                          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-600 font-medium">
                            <User size={12} className="text-slate-400" />
                            <span>{dispute.userName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 font-bold uppercase text-[9px] rounded-lg border border-slate-200">
                          <Scale size={10} />
                          {getHumanType(dispute.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {booking ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 block">{vehicle?.name || 'Vehicle'}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase block">Plate: {vehicle?.licensePlate || booking.vehicleId}</span>
                            <span className="text-[9px] text-blue-600 font-mono font-bold uppercase block">Booking ID: {booking.id}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium italic">No booking attached</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border ${getStatusStyle(dispute.status)}`}>
                          {dispute.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(dispute.createdAt).toLocaleDateString()} {new Date(dispute.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            setSelectedDisputeId(dispute.id);
                            setResolutionDetails(dispute.resolutionDetails || '');
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                        >
                          Review Dispute
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedDispute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded font-black tracking-tight uppercase">Dispute Review Desk</span>
                  <h3 className="text-base font-extrabold text-slate-950 mt-1">{selectedDispute.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedDisputeId(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-[11px]">
                  <div className="space-y-1.5">
                    <span className="block text-slate-400 uppercase font-black text-[9px]">Filer Details</span>
                    <span className="block font-extrabold text-slate-800">{selectedDispute.userName}</span>
                    <span className="block text-slate-500 font-mono">User ID: {selectedDispute.userId}</span>
                  </div>
                  <div className="space-y-1.5">
                    <span className="block text-slate-400 uppercase font-black text-[9px]">Dispute Type</span>
                    <span className="block font-extrabold text-blue-700 uppercase tracking-wider">{getHumanType(selectedDispute.type)}</span>
                    <span className="block text-slate-500 font-mono">Dispute ID: {selectedDispute.id}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Statement / Grievance:</h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed italic whitespace-pre-line font-medium">
                    "{selectedDispute.description}"
                  </div>
                </div>

                {selectedDispute.resolutionDetails && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Current Resolution Transcript:</h4>
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs text-slate-700 leading-relaxed font-medium">
                      {selectedDispute.resolutionDetails}
                    </div>
                  </div>
                )}

                {/* Status Resolution Form */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <label className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider">Decision Notes & Resolution Terms *</label>
                  <textarea 
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:ring-blue-600 p-4 font-medium min-h-[100px] resize-none"
                    placeholder="Enter factual terms of resolution, e.g. Fine reduced by 50% under commercial goodwill waiver policy, or Charge verified correct per province portal traffic logs."
                    value={resolutionDetails}
                    onChange={(e) => setResolutionDetails(e.target.value)}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row gap-3 justify-between items-center">
                <button 
                  type="button"
                  onClick={() => handleUpdateStatus(selectedDispute.id, 'under_review')}
                  disabled={actionLoading || !resolutionDetails.trim()}
                  className="w-full md:w-auto px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <Clock size={14} />
                  Move to Under Review
                </button>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                  <button 
                    type="button"
                    onClick={() => handleUpdateStatus(selectedDispute.id, 'rejected')}
                    disabled={actionLoading || !resolutionDetails.trim()}
                    className="w-full md:w-auto px-4 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={14} />
                    Reject Dispute
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleUpdateStatus(selectedDispute.id, 'resolved')}
                    disabled={actionLoading || !resolutionDetails.trim()}
                    className="w-full md:w-auto px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle size={14} />
                    Resolve Dispute
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

export default FormalDisputes;
