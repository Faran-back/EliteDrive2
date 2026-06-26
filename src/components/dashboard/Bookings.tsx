import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Ban, 
  Search,
  User as UserIcon,
  X,
  Car,
  MapPin,
  Building2,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Phone,
  CreditCard,
  Percent,
  Shield,
  FileText
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Booking } from '../../types';
import ConfirmationModal from '../ConfirmationModal';

const Bookings: React.FC = () => {
  const { vehicles, allBookings, allUsers, cancelBooking, approveBooking, updateBooking, showToast } = useStore();
  
  // Bank transfer admin decision states
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

  const [bookingFilter, setBookingFilter] = useState<'pending' | 'active' | 'completed' | 'cancelled'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const toggleBookingExpand = (id: string) => {
    setExpandedBookingId(prev => {
      const next = prev === id ? null : id;
      setShowRejectionForm(false);
      setRejectionReason('');
      return next;
    });
  };

  const handleCardClick = (e: React.MouseEvent, id: string) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('a') || 
      target.closest('input') || 
      target.closest('textarea') || 
      target.closest('img') && target.hasAttribute('data-zoomable')
    ) {
      return;
    }
    toggleBookingExpand(id);
  };

  const filteredBookings = allBookings.filter(booking => {
    const matchesStatus = booking.status === bookingFilter;
    const customer = allUsers.find(u => u.id === booking.userId);
    const vehicle = vehicles.find(v => v.id === booking.vehicleId);
    const matchesSearch = 
      (customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (vehicle?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.bankVerificationCode?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (booking.transactionRef?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    let matchesDate = true;
    if (booking.createdAt) {
      const bDateStr = booking.createdAt.split('T')[0];
      if (startDateFilter && bDateStr < startDateFilter) matchesDate = false;
      if (endDateFilter && bDateStr > endDateFilter) matchesDate = false;
    } else if (startDateFilter || endDateFilter) {
      const bDateStr = booking.startDate;
      if (startDateFilter && bDateStr < startDateFilter) matchesDate = false;
      if (endDateFilter && bDateStr > endDateFilter) matchesDate = false;
    }

    return matchesStatus && matchesSearch && matchesDate;
  }).sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.startDate).getTime();
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.startDate).getTime();
    return timeB - timeA;
  });

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    try {
      await cancelBooking(bookingToCancel);
      showToast('Booking cancelled successfully', 'success');
      setBookingToCancel(null);
      setIsCancelModalOpen(false);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showToast('Failed to cancel booking', 'error');
    }
  };

  const handleApproveBooking = async (id: string) => {
    const booking = allBookings.find(b => b.id === id);
    if (booking && booking.paymentType === 'partial' && booking.remainingPaymentStatus === 'pending') {
      showToast('Please collect and mark the remaining 50% payment as received in person before activating the booking.', 'error');
      return;
    }
    try {
      await approveBooking(id);
      showToast('Booking approved and activated successfully!', 'success');
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error approving booking:', error);
      showToast('Failed to approve booking', 'error');
    }
  };

  const handleApproveReceipt = async (booking: Booking) => {
    setIsSubmittingApproval(true);
    try {
      const isPartial = booking.paymentType === 'partial';
      const updates: Partial<Booking> = {
        bankReceiptApproved: 'approved',
        paymentStatus: 'paid'
      };
      
      if (!isPartial) {
        updates.status = 'active';
      }

      await updateBooking(booking.id, updates);
      
      if (isPartial) {
        showToast('Upfront payment verified! Booking is now confirmed. Collect the remaining 50% at handover to activate.', 'success');
      } else {
        showToast('Payment receipt verified and booking approved!', 'success');
      }
      setSelectedBooking(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to approve payment receipt.', 'error');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleRejectReceipt = async (booking: Booking) => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for rejecting this receipt.', 'error');
      return;
    }
    setIsSubmittingRejection(true);
    try {
      await updateBooking(booking.id, {
        bankReceiptApproved: 'rejected',
        bankReceiptRejectionReason: rejectionReason,
      });
      showToast('Payment receipt rejected. The customer has been notified.', 'success');
      setShowRejectionForm(false);
      setRejectionReason('');
      setSelectedBooking(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to reject payment receipt.', 'error');
    } finally {
      setIsSubmittingRejection(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'active': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={12} />;
      case 'active': return <CheckCircle2 size={12} />;
      case 'completed': return <CheckCircle2 size={12} />;
      case 'cancelled': return <XCircle size={12} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Booking History</h1>
          <p className="text-slate-500 font-medium">Manage and oversee all customer rentals</p>
        </div>
      </header>

      {/* Unified Search and Settings Panel */}
      <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search customer, vehicle or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all text-sm font-bold text-slate-900 outline-none"
            />
          </div>
          
          <div className="flex p-1 bg-slate-100 rounded-[20px] w-fit items-center shrink-0">
            {(['pending', 'active', 'completed', 'cancelled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setBookingFilter(tab)}
                className={`px-5 py-2 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  bookingFilter === tab 
                    ? 'bg-white text-blue-600 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter Row Added */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5">
            <Calendar size={12} /> Filter Booking Created range:
          </span>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-150 text-xs font-bold text-slate-700 outline-none rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all cursor-pointer"
            />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">to</span>
            <input 
              type="date" 
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-150 text-xs font-bold text-slate-700 outline-none rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all cursor-pointer"
            />
            {(startDateFilter || endDateFilter) && (
              <button
                type="button"
                onClick={() => {
                  setStartDateFilter('');
                  setEndDateFilter('');
                }}
                className="text-[10px] font-black uppercase tracking-widest text-[#EF4444] hover:underline ml-2 bg-red-50 px-2.5 py-1 rounded-lg"
              >
                Clear Range
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => {
            const customer = allUsers.find(u => u.id === booking.userId);
            const vehicle = vehicles.find(v => v.id === booking.vehicleId);
            const receiptToDisplay = booking.receiptImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600';
            
            const isExpanded = expandedBookingId === booking.id;
            
            return (
              <motion.div 
                key={booking.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={(e) => handleCardClick(e, booking.id)}
                className={`bg-white p-6 rounded-[32px] border transition-all duration-300 cursor-pointer ${
                  isExpanded 
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10' 
                    : 'border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                  {/* Vehicle Info */}
                  <div className="flex items-center gap-5 flex-1">
                    <div className="size-20 rounded-3xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
                      <img 
                        src={vehicle?.image} 
                        alt={vehicle?.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                        <span className="text-[10px] font-black text-slate-300">#{booking.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900">{vehicle?.name}</h3>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <UserIcon size={14} />
                          <span className="text-xs font-bold">{customer?.name || 'Unknown Customer'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar size={14} />
                          <span className="text-xs font-bold">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            {' '}({Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))} Days)
                          </span>
                        </div>
                        {booking.destination && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <MapPin size={14} />
                            <span className="text-xs font-bold">To: {booking.destination}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-xl font-black text-slate-900">PKR {booking.totalPrice.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {booking.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setBookingToCancel(booking.id);
                              setIsCancelModalOpen(true);
                            }}
                            className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                          >
                            Cancel Booking
                          </button>
                          <button 
                            onClick={() => handleApproveBooking(booking.id)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 cursor-pointer"
                          >
                            Approve Booking
                          </button>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => setSelectedBooking(booking)}
                            className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer"
                            title="View Details in Pop-up"
                          >
                            <Eye size={20} />
                          </button>
                          
                          {booking.status === 'active' && (
                            <button 
                              onClick={() => {
                                      setBookingToCancel(booking.id);
                                      setIsCancelModalOpen(true);
                                    }}
                              className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                              title="Cancel Booking"
                            >
                              <Ban size={20} />
                            </button>
                          )}
                        </>
                      )}
                      
                      <div className="p-2 text-slate-400 hover:text-slate-600 transition-all shrink-0">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-6 pt-6 border-t border-slate-100"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* 1. Customer & Vehicle Information */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                              <UserIcon size={12} /> Customer Profile
                            </h4>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 space-y-2.5">
                              <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Full Name</p>
                                <p className="text-xs font-black text-slate-800">{customer?.name || 'Unknown'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Email Address</p>
                                <p className="text-xs font-black text-slate-800">{customer?.email || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Phone Number</p>
                                <p className="text-xs font-black text-slate-800">{customer?.phone || 'N/A'}</p>
                              </div>
                              <div className="flex gap-4 pt-1">
                                <div className="flex-1">
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">CNIC Status</p>
                                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mt-1 ${
                                    customer?.cnicVerified 
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                                  }`}>
                                    {customer?.cnicVerified ? 'CNIC Verified' : 'CNIC Unverified'}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">License Number</p>
                                  <p className="text-xs font-bold text-slate-700 mt-1">{customer?.license || 'None provided'}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                              <Car size={12} /> Vehicle Information
                            </h4>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 space-y-2.5">
                              <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Vehicle Model</p>
                                <p className="text-xs font-black text-slate-800">{vehicle?.name}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">Plate No</p>
                                  <p className="text-xs font-bold text-slate-700">{vehicle?.licensePlate || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">Type Class</p>
                                  <p className="text-xs font-bold text-slate-700">{vehicle?.type}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">Transmission</p>
                                  <p className="text-xs font-bold text-slate-700">{vehicle?.transmission}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">Fuel Type</p>
                                  <p className="text-xs font-bold text-slate-700">{vehicle?.fuel}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Trip & Destination Information */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                              <Calendar size={12} /> Trip Details
                            </h4>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 space-y-3">
                              <div className="flex items-start gap-2.5">
                                <Clock className="text-blue-500 shrink-0 mt-0.5" size={14} />
                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">Duration & Type</p>
                                  <p className="text-xs font-black text-slate-800 capitalize">
                                    {booking.rentalType || 'daily'} rental ({Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))} Days)
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2.5">
                                <MapPin className="text-blue-500 shrink-0 mt-0.5" size={14} />
                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">Pickup Location</p>
                                  <p className="text-xs font-bold text-slate-700">{booking.pickupLocation || 'Lahore, Pakistan'}</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2.5">
                                <MapPin className="text-[#EF4444] shrink-0 mt-0.5" size={14} />
                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">Drop-off Location / Destination</p>
                                  <p className="text-xs font-bold text-slate-700">{booking.dropoffLocation || booking.destination || 'DHA Phase VI, Lahore'}</p>
                                </div>
                              </div>

                              {booking.chauffeurSelected && (
                                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/30">
                                  <p className="text-[9px] text-blue-600 font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <ShieldCheck size={12} /> Uniform Chauffeur VIP Package
                                  </p>
                                  <p className="text-xs font-semibold text-slate-700">
                                    Professional uniform driver assigned. Handover will include full security screening clearance.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {booking.isOutOfCity && (
                            <div>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <AlertCircle size={12} /> Out of City Clearance
                              </h4>
                              <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100/40 space-y-2.5">
                                <div>
                                  <p className="text-[9px] text-rose-600 font-black uppercase tracking-wider">Out of City Destination</p>
                                  <p className="text-xs font-black text-slate-800">{booking.outOfCityDetails?.destination || booking.destination}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Guarantor Name</p>
                                    <p className="text-xs font-bold text-slate-700">{booking.outOfCityDetails?.guarantorName || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Guarantor Phone</p>
                                    <p className="text-xs font-bold text-slate-700">{booking.outOfCityDetails?.guarantorPhone || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 3. Pricing & Payment Breakdown */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                              <CreditCard size={12} /> Fare & Payment Breakdown
                            </h4>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 space-y-2.5 text-xs font-semibold text-slate-700">
                              <div className="flex justify-between items-center text-slate-500">
                                <span className="flex items-center gap-1">Base Price</span>
                                <span className="font-bold">PKR {booking.basePrice?.toLocaleString() || (booking.totalPrice - (booking.chauffeurPrice || 0) - (booking.insurancePrice || 0)).toLocaleString()}</span>
                              </div>
                              {booking.insurancePrice && booking.insurancePrice > 0 && (
                                <div className="flex justify-between items-center text-slate-500">
                                  <span className="flex items-center gap-1">CDW Insurance ({booking.insuranceType})</span>
                                  <span className="font-bold">PKR {booking.insurancePrice?.toLocaleString()}</span>
                                </div>
                              )}
                              {booking.chauffeurSelected && booking.chauffeurPrice && (
                                <div className="flex justify-between items-center text-slate-500">
                                  <span>Chauffeur Service</span>
                                  <span className="font-bold">PKR {booking.chauffeurPrice?.toLocaleString()}</span>
                                </div>
                              )}
                              {booking.discountPrice && booking.discountPrice > 0 && (
                                <div className="flex justify-between items-center text-emerald-600 font-bold">
                                  <span className="flex items-center gap-1"><Percent size={12} /> Promo Discount</span>
                                  <span>- PKR {booking.discountPrice?.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center text-slate-500 pt-1.5 border-t border-slate-200">
                                <span className="flex items-center gap-1">Refundable Security Deposit</span>
                                <span className="font-black text-slate-800">PKR {booking.securityDepositAmount?.toLocaleString() || '10,000'}</span>
                              </div>
                              
                              <div className="flex justify-between items-center text-slate-500">
                                <span>Deposit Status</span>
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {booking.securityDepositStatus || 'pending'}
                                </span>
                              </div>

                              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                <span className="text-sm font-black text-slate-900">Total Price</span>
                                <span className="text-base font-black text-blue-600">PKR {booking.totalPrice.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                              <Shield size={12} /> Payment Status
                            </h4>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 space-y-2 text-xs font-semibold">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500">Gateway Method</span>
                                <span className="text-slate-900 font-black uppercase">
                                  {booking.paymentMethod === 'bank_transfer' || booking.paymentMethod === 'transfer' ? 'Bank Escrow' : 'Credit Card'}
                                </span>
                              </div>

                              <div className="flex justify-between items-center">
                                <span className="text-slate-500">Plan Structure</span>
                                <span className="text-slate-900 font-black uppercase">
                                  {booking.paymentType === 'partial' ? '50% Upfront Deposit' : '100% Full Payment'}
                                </span>
                              </div>

                              {booking.paymentType === 'partial' && (
                                <div className="space-y-1.5 pt-1.5 border-t border-slate-200">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-bold">50% Upfront Received</span>
                                    <span className="text-emerald-600 font-black">PKR {booking.upfrontAmountPaid?.toLocaleString() || Math.round(booking.totalPrice * 0.5).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-bold">50% Handover Balance</span>
                                    <span className="text-rose-600 font-black">PKR {booking.remainingAmount?.toLocaleString() || Math.round(booking.totalPrice * 0.5).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-bold">Handover Payment Status</span>
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                      booking.remainingPaymentStatus === 'paid' 
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                                    }`}>
                                      {booking.remainingPaymentStatus === 'paid' ? 'Paid (Collected)' : 'Pending On Delivery'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Interactive Receipt Section */}
                          <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                              <FileText size={12} /> Uploaded Receipt
                            </h4>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50 space-y-3">
                              <div 
                                onClick={() => setSelectedReceiptUrl(receiptToDisplay)}
                                className="relative w-full h-32 bg-white rounded-xl overflow-hidden border border-slate-200 group/receipt cursor-pointer shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-300"
                              >
                                <img 
                                  src={receiptToDisplay} 
                                  alt="Customer Payment Receipt" 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover/receipt:scale-105 transition-all duration-300"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/receipt:opacity-100 transition-all duration-300 flex items-center justify-center">
                                  <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-xs">
                                    <Eye size={12} /> Click to Zoom
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Receipt File</span>
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                                  {booking.receiptImage ? 'Customer Uploaded' : 'Sample Receipt'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Full-Width Receipt Image attachment / verification section */}
                      {(booking.paymentMethod === 'bank_transfer' || booking.paymentMethod === 'transfer') && (
                        <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100/50 space-y-4">
                          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                            <Building2 className="text-blue-600 animate-pulse" size={18} />
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Bank Escrow Transfer Receipt Validation</h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-semibold text-slate-700">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Sending Customer Bank/Wallet</p>
                              <p className="text-slate-900 font-extrabold mt-0.5">{booking.sendingBank || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Transaction Reference ID</p>
                              <p className="text-slate-900 font-extrabold mt-0.5">{booking.transactionRef || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Interactive Escrow Code</p>
                              <p className="text-blue-700 font-extrabold mt-0.5">{booking.bankVerificationCode || 'N/A'}</p>
                            </div>
                          </div>

                          {booking.receiptImage ? (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Uploaded Receipt Screenshot Attachment</p>
                              <div className="relative w-full max-w-sm h-64 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 group/receipt">
                                <img 
                                  src={booking.receiptImage} 
                                  alt="Bank Payment Receipt" 
                                  referrerPolicy="no-referrer"
                                  data-zoomable="true"
                                  className="w-full h-full object-cover group-hover/receipt:opacity-90 transition-all" 
                                />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const w = window.open();
                                    w?.document.write(`<img src="${booking.receiptImage}" style="max-width:100%; max-height:100vh; display:block; margin:auto;"/>`);
                                  }}
                                  className="absolute inset-0 m-auto size-12 bg-black/60 hover:bg-black/85 text-white rounded-full flex items-center justify-center opacity-0 group-hover/receipt:opacity-100 transition-all cursor-pointer shadow-lg"
                                  title="View Receipt Attachment in New Tab"
                                >
                                  <Eye size={20} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-700 font-semibold flex items-center gap-2">
                              <AlertCircle size={16} />
                              The customer has not attached or uploaded a receipt photo yet.
                            </div>
                          )}

                          {/* Escrow receipt validation state management */}
                          <div className="pt-2">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Escrow Approval Decision</p>
                            {booking.bankReceiptApproved === 'approved' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase tracking-wider rounded-xl">
                                <CheckCircle2 size={14} /> Receipt Approved & Confirmed
                              </span>
                            )}
                            {booking.bankReceiptApproved === 'rejected' && (
                              <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl">
                                <span className="inline-flex items-center gap-1.5 text-rose-700 text-xs font-black uppercase tracking-wider mb-2">
                                  <XCircle size={14} /> Receipt Rejected
                                </span>
                                <p className="text-xs text-rose-600 font-semibold">
                                  Reason: <strong className="font-extrabold">{booking.bankReceiptRejectionReason || 'Details mismatch.'}</strong>
                                </p>
                              </div>
                            )}
                            {booking.bankReceiptApproved === 'pending' && (
                              <div className="space-y-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black uppercase tracking-wider rounded-xl">
                                  <Clock size={14} /> Awaiting Verification Check
                                </span>

                                {!showRejectionForm ? (
                                  <div className="flex gap-3 pt-2 max-w-md">
                                    <button
                                      type="button"
                                      onClick={() => setShowRejectionForm(true)}
                                      className="hidden"
                                    >
                                      Reject Receipt
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isSubmittingApproval}
                                      onClick={() => handleApproveReceipt(booking)}
                                      className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg cursor-pointer"
                                    >
                                      {isSubmittingApproval ? 'Verifying...' : 'Approve & Verify'}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 max-w-xl">
                                    <label className="block text-[9px] uppercase font-black text-slate-500">Provide Rejection Reason *</label>
                                    <textarea
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Specify mismatch detail (e.g. Code does not match receipt screenshot)"
                                      className="w-full text-xs font-medium text-slate-800 rounded-xl border border-slate-200 p-3 min-h-[80px]"
                                    />
                                    <div className="flex justify-end gap-2 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowRejectionForm(false);
                                          setRejectionReason('');
                                        }}
                                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        disabled={isSubmittingRejection}
                                        onClick={() => handleRejectReceipt(booking)}
                                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
                                      >
                                        {isSubmittingRejection ? 'Rejecting...' : 'Confirm Rejection'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* In-person cash collection button */}
                      {booking.paymentType === 'partial' && booking.remainingPaymentStatus === 'pending' && (
                        <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <p className="text-xs font-black text-blue-900">Mark remaining Handover balance collected</p>
                            <p className="text-[11px] text-blue-700 font-semibold">Remaining balance: PKR {booking.remainingAmount?.toLocaleString() || Math.round(booking.totalPrice * 0.5).toLocaleString()}</p>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await updateBooking(booking.id, { remainingPaymentStatus: 'paid' });
                                showToast('Remaining 50% payment marked as received in person!', 'success');
                              } catch (err) {
                                console.error(err);
                                showToast('Failed to update remaining payment status.', 'error');
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-200"
                          >
                            <ShieldCheck size={14} /> Mark Remaining Paid
                          </button>
                        </div>
                      )}

                      {/* Inline action control overrides */}
                      {booking.status === 'pending' && ((booking.paymentMethod !== 'bank_transfer' && booking.paymentMethod !== 'transfer') || booking.bankReceiptApproved === 'approved') && (
                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                          <button 
                            onClick={() => {
                              setBookingToCancel(booking.id);
                              setIsCancelModalOpen(true);
                            }}
                            className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                          >
                            Reject Booking
                          </button>
                          <button 
                            onClick={() => handleApproveBooking(booking.id)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg cursor-pointer"
                          >
                            Approve Booking
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-20 text-center">
            <div className="size-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Calendar size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Bookings Found</h3>
            <p className="text-slate-500 font-medium">There are no {bookingFilter} bookings matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-white/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                      <span className="text-xs font-black text-slate-400">Booking ID: #{selectedBooking.id}</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Booking Details</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedBooking(null)}
                    className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    {/* Customer Info */}
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Customer Information</p>
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <UserIcon size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {allUsers.find(u => u.id === selectedBooking.userId)?.name || 'Unknown'}
                          </p>
                          <p className="text-xs font-bold text-slate-500">
                            {allUsers.find(u => u.id === selectedBooking.userId)?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Vehicle Information</p>
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <Car size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {vehicles.find(v => v.id === selectedBooking.vehicleId)?.name}
                          </p>
                          <p className="text-xs font-bold text-slate-500">
                            {vehicles.find(v => v.id === selectedBooking.vehicleId)?.type} • {vehicles.find(v => v.id === selectedBooking.vehicleId)?.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Rental Period */}
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Rental Period & Destination</p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-600">
                          <Calendar size={18} className="text-blue-600" />
                          <span className="text-sm font-bold">
                            {new Date(selectedBooking.startDate).toLocaleDateString()} - {new Date(selectedBooking.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <Clock size={18} className="text-blue-600" />
                          <span className="text-sm font-bold">
                            {Math.ceil((new Date(selectedBooking.endDate).getTime() - new Date(selectedBooking.startDate).getTime()) / (1000 * 60 * 60 * 24))} Days
                          </span>
                        </div>
                        {selectedBooking.destination && (
                          <div className="flex items-center gap-3 text-slate-600">
                            <MapPin size={18} className="text-blue-600" />
                            <span className="text-sm font-bold">Destination: {selectedBooking.destination}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Payment Summary</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500">Status</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedBooking.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {selectedBooking.paymentStatus}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500">Payment Type</span>
                        <span className="text-xs font-extrabold text-slate-900 uppercase">
                          {selectedBooking.paymentType === 'partial' ? '50% Upfront Partial' : 'Full Payment'}
                        </span>
                      </div>
                      
                      {selectedBooking.paymentType === 'partial' && (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500">Upfront Amount Paid (50%)</span>
                            <span className="text-xs font-extrabold text-slate-900">
                              PKR {(selectedBooking.upfrontAmountPaid || Math.round(selectedBooking.totalPrice * 0.5)).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500">Remaining Amount (50%)</span>
                            <span className="text-xs font-extrabold text-slate-900">
                              PKR {(selectedBooking.remainingAmount || Math.round(selectedBooking.totalPrice * 0.5)).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500">Remaining Payment Status</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedBooking.remainingPaymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {selectedBooking.remainingPaymentStatus === 'paid' ? 'Paid (Collected)' : 'Pending Handover Collection'}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                        <span className="text-sm font-black text-slate-900">Total Price</span>
                        <span className="text-xl font-black text-blue-600">PKR {selectedBooking.totalPrice.toLocaleString()}</span>
                      </div>

                      {selectedBooking.paymentType === 'partial' && selectedBooking.remainingPaymentStatus === 'pending' && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await updateBooking(selectedBooking.id, { remainingPaymentStatus: 'paid' });
                                showToast('Remaining 50% payment marked as received in person!', 'success');
                                setSelectedBooking(prev => prev ? { ...prev, remainingPaymentStatus: 'paid' } : null);
                              } catch (err) {
                                console.error(err);
                                showToast('Failed to update remaining payment status.', 'error');
                              }
                            }}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <ShieldCheck size={16} />
                            Mark Remaining 50% Collected
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bank Transfer Receipt Verification Section */}
                {(selectedBooking.paymentMethod === 'bank_transfer' || selectedBooking.paymentMethod === 'transfer') && (
                  <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                      <Building2 className="text-blue-600" size={20} />
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Bank Transfer Escrow Verification</h4>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Sending Bank</p>
                        <p className="text-slate-900 font-extrabold">{selectedBooking.sendingBank || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Transaction Reference</p>
                        <p className="text-slate-900 font-extrabold">{selectedBooking.transactionRef || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Escrow Reference Code</p>
                        <p className="text-blue-700 font-extrabold">{selectedBooking.bankVerificationCode || 'N/A'}</p>
                      </div>
                    </div>

                    {selectedBooking.receiptImage ? (
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Uploaded Bank Receipt Screenshot</p>
                        <div className="relative w-full max-w-sm h-48 bg-slate-200 rounded-2xl overflow-hidden border border-slate-300 group/receipt">
                          <img src={selectedBooking.receiptImage} alt="Bank Receipt" className="w-full h-full object-cover group-hover/receipt:opacity-80 transition-all" />
                          <button 
                            type="button"
                            onClick={() => {
                              const w = window.open();
                              w?.document.write(`<img src="${selectedBooking.receiptImage}" style="max-width:100%; max-height:100vh; display:block; margin:auto;"/>`);
                            }}
                            className="absolute inset-0 m-auto size-12 bg-black/60 hover:bg-black/85 text-white rounded-full flex items-center justify-center opacity-0 group-hover/receipt:opacity-100 transition-all cursor-pointer"
                            title="Zoom Receipt"
                          >
                            <Eye size={20} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-700 font-semibold flex items-center gap-2">
                        <AlertCircle size={16} />
                        No receipt screenshot has been uploaded yet.
                      </div>
                    )}

                    {/* Status Display */}
                    <div className="pt-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Verification Status</p>
                      {selectedBooking.bankReceiptApproved === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase tracking-wider rounded-xl">
                          <CheckCircle2 size={14} />
                          Receipt Approved & Verified
                        </span>
                      )}
                      {selectedBooking.bankReceiptApproved === 'rejected' && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                          <span className="inline-flex items-center gap-1.5 text-rose-700 text-xs font-black uppercase tracking-wider mb-2">
                            <XCircle size={14} />
                            Receipt Rejected
                          </span>
                          <p className="text-xs text-rose-600 font-semibold">
                            Reason: <strong className="font-extrabold">{selectedBooking.bankReceiptRejectionReason || 'Receipt details do not match bank records.'}</strong>
                          </p>
                        </div>
                      )}
                      {selectedBooking.bankReceiptApproved === 'pending' && (
                        <div className="space-y-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black uppercase tracking-wider rounded-xl">
                            <Clock size={14} />
                            Awaiting Admin Verification
                          </span>

                          {!showRejectionForm ? (
                            <div className="flex gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => setShowRejectionForm(true)}
                                className="hidden"
                              >
                                Reject Receipt
                              </button>
                              <button
                                type="button"
                                disabled={isSubmittingApproval}
                                onClick={() => handleApproveReceipt(selectedBooking)}
                                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg"
                              >
                                {isSubmittingApproval ? 'Verifying...' : 'Approve & Verify Payment'}
                              </button>
                            </div>
                          ) : (
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                              <label className="block text-[10px] uppercase font-black text-slate-500">Mandatory Rejection Reason *</label>
                              <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Specify exact reason (e.g. Reference code mismatch, insufficient amount, unreadable screenshot)"
                                className="w-full text-xs font-medium text-slate-800 rounded-xl border border-slate-200 p-3 min-h-[80px]"
                              />
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowRejectionForm(false);
                                    setRejectionReason('');
                                  }}
                                  className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 rounded-xl"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={isSubmittingRejection}
                                  onClick={() => handleRejectReceipt(selectedBooking)}
                                  className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                                >
                                  {isSubmittingRejection ? 'Rejecting...' : 'Confirm Rejection'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedBooking.status === 'pending' && ((selectedBooking.paymentMethod !== 'bank_transfer' && selectedBooking.paymentMethod !== 'transfer') || selectedBooking.bankReceiptApproved === 'approved') && (
                  <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end gap-4">
                    <button 
                      onClick={() => {
                        setBookingToCancel(selectedBooking.id);
                        setIsCancelModalOpen(true);
                      }}
                      className="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-sm hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Ban size={18} />
                      Reject Booking
                    </button>
                    <button 
                      onClick={() => handleApproveBooking(selectedBooking.id)}
                      className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 cursor-pointer"
                    >
                      <CheckCircle2 size={18} />
                      Approve Booking
                    </button>
                  </div>
                )}

                {selectedBooking.status === 'active' && (
                  <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={() => {
                        setBookingToCancel(selectedBooking.id);
                        setIsCancelModalOpen(true);
                      }}
                      className="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-sm hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2"
                    >
                      <Ban size={18} />
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelBooking}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action will notify the customer and update the vehicle status."
        confirmLabel="Cancel Booking"
        type="danger"
      />

      {/* Receipt Zoom Lightbox Modal */}
      <AnimatePresence>
        {selectedReceiptUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReceiptUrl(null)}
            className="fixed inset-0 bg-slate-900/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-md cursor-zoom-out"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-white rounded-[32px] overflow-hidden shadow-2xl border border-white/20 p-2"
            >
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={() => setSelectedReceiptUrl(null)}
                  className="p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer hover:rotate-90 duration-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-[80vh] overflow-y-auto rounded-[24px] bg-slate-50 flex items-center justify-center p-4">
                <img 
                  src={selectedReceiptUrl} 
                  alt="High Resolution Payment Receipt" 
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg border border-slate-200"
                />
              </div>

              <div className="p-5 flex items-center justify-between border-t border-slate-100 bg-white">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-blue-500" /> Interactive Escrow Audit View
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Verify sending bank details, transaction time, and total reference ID against system logs.
                  </p>
                </div>
                <a 
                  href={selectedReceiptUrl} 
                  download="elite-drive-receipt.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                >
                  Download
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bookings;
