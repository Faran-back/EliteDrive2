import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight,
  MoreVertical,
  XCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Building2,
  Lock,
  ShieldCheck,
  Upload,
  FileText,
  Check,
  Eye,
  Copy
} from 'lucide-react';
import { fileToBase64, validateImage } from '../lib/imageUtils';
import { useStore } from '../context/StoreContext';
import { downloadReceiptPDF } from '../utils/receiptGenerator';
import { motion } from 'motion/react';
import ConfirmationModal from '../components/ConfirmationModal';
import ModifyBookingModal from '../components/ModifyBookingModal';
import { Booking } from '../types';

const renderStatusTracker = (status: string) => {
  const stages = [
    { key: 'filed', label: 'Filed' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'action_taken', label: 'Action Taken' },
    { key: 'closed', label: 'Closed' }
  ];

  const currentIdx = stages.findIndex(s => s.key === status?.toLowerCase());

  return (
    <div className="w-full py-4 px-2 bg-white/60 rounded-2xl border border-slate-100 my-3">
      <div className="flex items-center justify-between relative max-w-md mx-auto">
        {/* Progress Line Background */}
        <div className="absolute left-4 right-4 top-[14px] -translate-y-1/2 h-0.5 bg-slate-200 rounded" />
        {/* Progress Line Active */}
        <div 
          className="absolute left-4 top-[14px] -translate-y-1/2 h-0.5 bg-gradient-to-r from-rose-500 to-indigo-600 rounded transition-all duration-500" 
          style={{ width: `${currentIdx >= 0 ? (currentIdx / (stages.length - 1)) * 92 : 0}%` }}
        />
        
        {stages.map((stage, idx) => {
          const isCompleted = idx <= currentIdx;
          const isActive = idx === currentIdx;
          
          return (
            <div key={stage.key} className="flex flex-col items-center relative z-10 flex-1">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border-2 transition-all duration-300 ${
                  isActive 
                    ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-50' 
                    : isCompleted 
                      ? 'bg-rose-500 border-rose-500 text-white' 
                      : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-wider mt-1.5 text-center ${
                isActive ? 'text-indigo-600' : isCompleted ? 'text-rose-500' : 'text-slate-400'
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const formatBookingDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return dateStr;
  }
};

const MyBookings: React.FC = () => {
  const { user, bookings, vehicles, cancelBooking, updateBooking, showToast, incidents, disputes, eChallans, disputeEChallan, createDispute } = useStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = React.useState(false);
  const [bookingToCancel, setBookingToCancel] = React.useState<string | null>(null);
  const [bookingToModify, setBookingToModify] = React.useState<Booking | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  // Bank Receipt Re-upload State
  const [reuploadSenderBank, setReuploadSenderBank] = React.useState('');
  const [reuploadRef, setReuploadRef] = React.useState('');
  const [reuploadImage, setReuploadImage] = React.useState('');
  const [isReuploading, setIsReuploading] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const handleReuploadReceipt = async (bookingId: string) => {
    if (!reuploadImage) {
      showToast?.('Please upload a screenshot or copy of your receipt first.', 'error');
      return;
    }
    if (!reuploadSenderBank.trim()) {
      showToast?.('Please specify the sending bank.', 'error');
      return;
    }
    if (!reuploadRef.trim()) {
      showToast?.('Please enter your transaction reference number.', 'error');
      return;
    }

    setIsReuploading(true);
    try {
      await updateBooking(bookingId, {
        bankReceiptApproved: 'pending',
        receiptImage: reuploadImage,
        sendingBank: reuploadSenderBank,
        transactionRef: reuploadRef,
      });
      showToast?.('Payment receipt re-uploaded successfully! Admin will verify shortly.', 'success');
      // Clear state
      setReuploadImage('');
      setReuploadSenderBank('');
      setReuploadRef('');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to re-upload receipt.', 'error');
    } finally {
      setIsReuploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const validation = validateImage(file, 10); // Allow up to 10MB for receipts
      if (!validation.isValid && validation.error) {
        showToast?.(validation.error, 'error');
        return;
      }

      showToast?.('Scanning and auditing receipt details...', 'info');
      const base64 = await fileToBase64(file);

      const token = localStorage.getItem('elitedrive_token');
      const response = await fetch('/api/verify-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ receiptImage: base64 })
      });

      if (!response.ok) {
        throw new Error('Verification request failed.');
      }

      const result = await response.json();

      if (!result.isValidReceipt) {
        setReuploadImage('');
        setReuploadSenderBank('');
        setReuploadRef('');
        showToast?.(result.rejectionReason || 'Uploaded image is not a valid transaction receipt.', 'error');
        return;
      }

      setReuploadImage(base64);
      if (result.sendingBank && !reuploadSenderBank) setReuploadSenderBank(result.sendingBank);
      // Transaction ID / Reference (reuploadRef) is strictly user-provided and editable to prevent incorrect auto-population.

      showToast?.(`Receipt verified successfully! Bank: ${result.sendingBank || 'Detected'}`, 'success');
    } catch (err) {
      console.error('File reading or verification error:', err);
      showToast?.('Failed to verify receipt. Please try uploading a clearer image.', 'error');
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast?.(`${field} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getBookingBadge = (booking: Booking) => {
    if (booking.paymentMethod === 'bank_transfer') {
      if (booking.bankReceiptApproved === 'pending') {
        return {
          label: 'Payment Pending – Awaiting Verification',
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Clock size={12} />
        };
      }
      if (booking.bankReceiptApproved === 'rejected') {
        return {
          label: 'Receipt Rejected – Re-upload Required',
          classes: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <XCircle size={12} />
        };
      }
      if (booking.bankReceiptApproved === 'approved') {
        return {
          label: 'Receipt Verified – Confirmed',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 size={12} />
        };
      }
    }
    
    switch (booking.status) {
      case 'pending': 
        return {
          label: 'Pending Approval',
          classes: 'bg-amber-50 text-amber-600 border-amber-100',
          icon: <Clock size={12} />
        };
      case 'active': 
        return {
          label: 'Active Rental',
          classes: 'bg-blue-50 text-[#2563EB] border-blue-100',
          icon: <CheckCircle2 size={12} />
        };
      case 'completed': 
        return {
          label: 'Completed Journey',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          icon: <CheckCircle2 size={12} />
        };
      case 'cancelled': 
        return {
          label: 'Cancelled',
          classes: 'bg-red-50 text-red-600 border-red-100',
          icon: <XCircle size={12} />
        };
      default: 
        return {
          label: booking.status,
          classes: 'bg-gray-50 text-[#64748B] border-gray-100',
          icon: <AlertCircle size={12} />
        };
    }
  };

  // Dispute Form State
  const [isDisputeFormOpen, setIsDisputeFormOpen] = React.useState(false);
  const [disputeBookingId, setDisputeBookingId] = React.useState('');
  const [disputeTitle, setDisputeTitle] = React.useState('');
  const [disputeDescription, setDisputeDescription] = React.useState('');
  const [disputeType, setDisputeType] = React.useState('overcharge');
  const [submittingDispute, setSubmittingDispute] = React.useState(false);

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeTitle.trim() || !disputeDescription.trim()) {
      showToast?.('Please specify a title and description for your dispute.', 'error');
      return;
    }
    setSubmittingDispute(true);
    try {
      await createDispute({
        bookingId: disputeBookingId,
        title: disputeTitle,
        description: disputeDescription,
        type: disputeType
      });
      setIsDisputeFormOpen(false);
      setDisputeTitle('');
      setDisputeDescription('');
      showToast?.('Dispute lodged successfully. Support team will review this.', 'success');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to submit dispute.', 'error');
    } finally {
      setSubmittingDispute(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDownloadReceiptClick = (e: React.MouseEvent, booking: Booking, vehicle: any) => {
    e.stopPropagation();
    if (!vehicle) return;
    try {
      downloadReceiptPDF(booking, vehicle, user);
      showToast?.('Receipt downloaded successfully!', 'success');
    } catch (err) {
      console.error('Download receipt error:', err);
      showToast?.('Failed to download receipt', 'error');
    }
  };

  const handleCancelClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBookingToCancel(id);
    setIsModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      cancelBooking(bookingToCancel);
      setBookingToCancel(null);
    }
  };

  const handleModifyClick = (e: React.MouseEvent, booking: Booking) => {
    e.stopPropagation();
    setBookingToModify(booking);
    setIsModifyModalOpen(true);
  };

  const handleConfirmModify = async (id: string, updates: Partial<Booking>) => {
    await updateBooking(id, updates);
    setIsModifyModalOpen(false);
    setBookingToModify(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'active': return 'bg-blue-50 text-[#2563EB] border-blue-100';
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-[#64748B] border-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={12} />;
      case 'active': return <CheckCircle2 size={12} />;
      case 'completed': return <CheckCircle2 size={12} />;
      case 'cancelled': return <XCircle size={12} />;
      default: return <AlertCircle size={12} />;
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-[#1E293B]">Booking History</h1>
          <p className="text-[#64748B] font-medium">Manage your past and upcoming premium journeys.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search bookings..."
              className="bg-white border border-[#E2E8F0] rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#2563EB] transition-all font-medium text-[#1E293B]"
            />
          </div>
          <button className="p-3 bg-white border border-[#E2E8F0] rounded-2xl text-[#64748B] hover:bg-blue-50 hover:text-[#2563EB] transition-all">
            <Filter size={20} />
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {bookings.length > 0 ? (
          bookings.map((booking, index) => {
            const vehicle = vehicles.find(v => v.id === booking.vehicleId);
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleExpand(booking.id)}
                className={`bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col gap-8 group cursor-pointer ${expandedId === booking.id ? 'ring-2 ring-blue-500/20 shadow-xl' : ''}`}
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-full md:w-40 h-28 rounded-[24px] overflow-hidden shadow-inner bg-gray-50 shrink-0">
                    <img 
                      src={vehicle?.image} 
                      alt={vehicle?.name} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
                      }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-[#1E293B]">{vehicle?.name}</h3>
                        <div className="flex items-center gap-2 text-[#64748B] text-sm font-bold">
                          <MapPin size={14} className="text-[#2563EB]" />
                          {vehicle?.location}, Pakistan
                        </div>
                      </div>
                      {(() => {
                        const badge = getBookingBadge(booking);
                        return (
                          <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${badge.classes}`}>
                            {badge.icon}
                            {badge.label}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Total Price</p>
                        <p className="font-black text-[#2563EB] text-sm">PKR {booking.totalPrice.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Payment</p>
                        <p className="font-black text-sm">
                          {(() => {
                            const isPaid = booking.paymentStatus === 'paid' || booking.bankReceiptApproved === 'approved';
                            const isApprovedOrActive = booking.status === 'active' || booking.status === 'completed';
                            
                            if (isApprovedOrActive || isPaid) {
                              if (booking.paymentType === 'partial') {
                                if (booking.remainingPaymentStatus === 'paid') {
                                  return <span className="text-emerald-600">PAID</span>;
                                } else {
                                  return <span className="text-blue-600">50% PAID, 50% AT HANDOVER</span>;
                                }
                              } else {
                                  return <span className="text-emerald-600">PAID</span>;
                              }
                            }
                            
                            const currentStatus = (booking.paymentStatus || 'pending').toUpperCase();
                            const statusColor = currentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-500';
                            return <span className={statusColor}>{currentStatus}</span>;
                          })()}
                        </p>
                      </div>
                      {booking.pickupLocation && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">Pick-up</p>
                          <p className="font-black text-[#1E293B] text-xs truncate max-w-[120px]" title={booking.pickupLocation}>{booking.pickupLocation}</p>
                        </div>
                      )}
                      {(booking.dropoffLocation || booking.destination) && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">Drop-off</p>
                          <p className="font-black text-[#1E293B] text-xs truncate max-w-[120px]" title={booking.dropoffLocation || booking.destination}>{booking.dropoffLocation || booking.destination}</p>
                        </div>
                      )}

                      {booking.status === 'cancelled' && (
                        <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-red-50/50 border border-red-100 rounded-2xl space-y-2">
                          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Refund Details</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-700">
                            <div>
                              Refund Amount: <span className="font-black text-emerald-600">PKR {(booking.refundAmount || 0).toLocaleString()}</span>
                            </div>
                            <div>
                              Cancellation Penalty: <span className="font-black text-red-600">PKR {(booking.penaltyAmount || 0).toLocaleString()}</span>
                            </div>
                            <div>
                              Refund Status: <span className="font-black text-slate-900 uppercase">
                                {booking.refundStatus === 'pending_manual_bank_transfer' 
                                  ? 'Awaiting Bank Transfer' 
                                  : booking.refundStatus === 'processed' 
                                  ? 'Transferred' 
                                  : 'None'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-3 w-full md:w-auto">
                    {(booking.status === 'active' || booking.status === 'pending') && (
                      <button 
                        onClick={(e) => handleCancelClick(e, booking.id)}
                        className="flex-1 md:w-full px-6 py-3 text-xs font-black text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                      >
                        {booking.status === 'pending' ? 'Cancel Request' : 'Cancel Booking'}
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(booking.id);
                      }}
                      className="flex-1 md:w-full px-6 py-3 text-xs font-black text-[#2563EB] bg-[#F8FAFC] hover:bg-[#EFF6FF] rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      {expandedId === booking.id ? 'Collapse' : 'Details'}
                      <ChevronRight size={14} className={`transition-transform duration-300 ${expandedId === booking.id ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {expandedId === booking.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden pt-8 border-t border-gray-100"
                  >
                    <div className="grid lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="aspect-video rounded-[32px] overflow-hidden bg-gray-50 border border-gray-100">
                          <img 
                            src={vehicle?.image} 
                            alt={vehicle?.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {vehicle?.images && vehicle.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-2">
                            {vehicle.images.slice(0, 4).map((imgUrl, idx) => (
                              <div key={idx} className="aspect-video rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                                <img 
                                  src={imgUrl} 
                                  alt={`Car detail ${idx + 1}`} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                        <div className="flex gap-4">
                          <Link 
                            to={`/vehicle/${vehicle?.id}`}
                            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm text-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                          >
                            View Vehicle Specs
                          </Link>
                          {booking.status === 'active' && (
                            <button 
                              onClick={(e) => handleModifyClick(e, booking)}
                              className="flex-1 border-2 border-[#2563EB] text-[#2563EB] py-4 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all"
                            >
                              Modify Journey
                            </button>
                          )}
                          <button 
                            onClick={(e) => handleDownloadReceiptClick(e, booking, vehicle)}
                            className="flex-1 border border-[#E2E8F0] text-[#1E293B] py-4 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
                          >
                            Download Receipt
                          </button>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-widest text-[#94A3B8]">Booking Information</h4>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 rounded-2xl border border-gray-100">
                              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Booking Date</p>
                              <p className="font-black text-[#1E293B] text-sm">{booking.bookingDate || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Bank Transfer details and re-upload */}
                        {booking.paymentMethod === 'bank_transfer' && (
                          <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="text-blue-600 w-5 h-5" />
                              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Official Escrow Bank Details</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                              <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Bank Name</p>
                                  <p className="text-[#1E293B]">Bank of Punjab (BOP)</p>
                                </div>
                                <button type="button" onClick={() => handleCopy('Bank of Punjab (BOP)', 'Bank Name')} className="p-1.5 hover:bg-slate-50 rounded-lg text-blue-600">
                                  <Copy size={14} />
                                </button>
                              </div>

                              <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Account Title</p>
                                  <p className="text-[#1E293B]">EliteDrive Rental Solutions</p>
                                </div>
                                <button type="button" onClick={() => handleCopy('EliteDrive Rental Solutions', 'Account Title')} className="p-1.5 hover:bg-slate-50 rounded-lg text-blue-600">
                                  <Copy size={14} />
                                </button>
                              </div>

                              <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Account Number</p>
                                  <p className="text-[#1E293B]">6580214539100012</p>
                                </div>
                                <button type="button" onClick={() => handleCopy('6580214539100012', 'Account Number')} className="p-1.5 hover:bg-slate-50 rounded-lg text-blue-600">
                                  <Copy size={14} />
                                </button>
                              </div>

                              <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Mandatory Reference Memo</p>
                                  <p className="text-blue-700 font-extrabold">{booking.bankVerificationCode || 'ED-TR-165351'}</p>
                                </div>
                                <button type="button" onClick={() => handleCopy(booking.bankVerificationCode || 'ED-TR-165351', 'Reference Memo')} className="p-1.5 hover:bg-slate-50 rounded-lg text-blue-600">
                                  <Copy size={14} />
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <h5 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Submitted Payment Receipt Details</h5>
                              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 mb-3">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-slate-400">Sending Bank:</span> {booking.sendingBank || 'N/A'}
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-slate-400">Reference/Memo ID:</span> {booking.transactionRef || 'N/A'}
                                </div>
                              </div>
                              {booking.receiptImage && (
                                <div className="mt-2">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Receipt Screenshot:</span>
                                  <div className="relative size-32 rounded-xl overflow-hidden border border-slate-200 bg-black group/img">
                                    <img src={booking.receiptImage} alt="Receipt" className="w-full h-full object-cover group-hover/img:opacity-70 transition-all" />
                                    <button 
                                      type="button" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const w = window.open();
                                        w?.document.write(`<img src="${booking.receiptImage}" style="max-width:100%; max-height:100vh; display:block; margin:auto;"/>`);
                                      }}
                                      className="absolute inset-0 m-auto size-10 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all"
                                      title="Zoom Receipt"
                                    >
                                      <Eye size={16} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* If Rejected - show Re-upload options */}
                            {booking.bankReceiptApproved === 'rejected' && (
                              <div className="mt-4 p-5 bg-rose-50 rounded-2xl border border-rose-100 space-y-4">
                                <div className="flex items-start gap-2.5">
                                  <AlertCircle className="text-rose-600 w-5 h-5 shrink-0 mt-0.5" />
                                  <div>
                                    <h5 className="text-sm font-black text-rose-900 uppercase tracking-tight">Receipt Rejected by Verifier</h5>
                                    <p className="text-xs text-rose-700 font-semibold mt-1">
                                      Reason: <strong className="font-extrabold">{booking.bankReceiptRejectionReason || 'Receipt details do not match bank records.'}</strong>
                                    </p>
                                  </div>
                                </div>

                                <div className="pt-2 space-y-3" onClick={(e) => e.stopPropagation()}>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Re-submit Transfer Receipt</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[9px] uppercase font-extrabold text-slate-450 mb-1">Sending Bank *</label>
                                      <input 
                                        type="text" 
                                        placeholder="e.g. HBL, Alfalah, BOP"
                                        value={reuploadSenderBank}
                                        onChange={(e) => setReuploadSenderBank(e.target.value)}
                                        className="w-full text-xs rounded-xl border border-slate-200 h-10 px-3 bg-white font-semibold text-slate-800"
                                      />
                                    </div>
                                    <div>
                                      <div className="flex justify-between items-center mb-1">
                                        <label className="block text-[9px] uppercase font-extrabold text-slate-450">Transaction Ref / Memo ID *</label>
                                        <span className="text-[8px] text-blue-600 font-bold">User-provided & editable</span>
                                      </div>
                                      <input 
                                        type="text" 
                                        placeholder="Enter exact Transaction ID (TID) manually"
                                        value={reuploadRef}
                                        onChange={(e) => setReuploadRef(e.target.value)}
                                        className="w-full text-xs rounded-xl border border-slate-200 h-10 px-3 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none transition-all"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="block text-[9px] uppercase font-extrabold text-slate-450 mb-1">Upload Receipt Screenshot (Max 10MB) *</label>
                                    <div className="flex items-center gap-4">
                                      <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer hover:bg-slate-50 text-slate-700">
                                        <Upload size={14} className="text-[#2563EB]" />
                                        Choose File
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                      </label>
                                      {reuploadImage && (
                                        <div className="flex items-center gap-2">
                                          <div className="size-10 rounded-lg overflow-hidden border border-slate-200">
                                            <img src={reuploadImage} alt="Re-upload Preview" className="w-full h-full object-cover" />
                                          </div>
                                          <span className="text-[10px] text-emerald-600 font-black uppercase">File Verified safe</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={isReuploading}
                                    onClick={() => handleReuploadReceipt(booking.id)}
                                    className="w-full py-3 bg-[#2563EB] text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg"
                                  >
                                    {isReuploading ? 'Transmitting New Receipt...' : 'Transmit Re-upload Verification'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Incidents, Disputes, and E-Challans section */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-black uppercase tracking-widest text-[#94A3B8]">Incidents, Fines & Disputes</h4>
                          
                          {(() => {
                            const matchingChallans = eChallans.filter(ec => ec.matchedBookingId === booking.id);
                            const matchingIncidents = incidents.filter(inc => inc.bookingId === booking.id);
                            const matchingDisputes = disputes.filter(dsp => dsp.bookingId === booking.id);

                            return (
                              <div className="space-y-3">
                                {matchingChallans.length === 0 && matchingIncidents.length === 0 && matchingDisputes.length === 0 && (
                                  <p className="text-xs text-slate-400 italic">No logged safety reports, fines, or active disputes for this booking.</p>
                                )}

                                {/* E-Challans */}
                                {matchingChallans.map(ec => {
                                  const canDispute = ec.status === 'pending';

                                  return (
                                    <div key={ec.id} className="p-5 rounded-[22px] bg-orange-50/40 border border-orange-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm hover:shadow-md transition-all">
                                      <div>
                                        <span className="inline-flex px-2 py-0.5 rounded bg-orange-100 text-orange-850 font-black uppercase tracking-wide text-[9px] mb-1">E-Challan Fine Ticket</span>
                                        <p className="font-bold text-slate-800">Violation Ticket No: {ec.challanNumber}</p>
                                        <p className="text-slate-500 mt-0.5">Amount: <strong className="text-orange-700">PKR {ec.amount.toLocaleString()}</strong> | Logged: {new Date(ec.date).toLocaleDateString()}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 italic">Status: {ec.status?.toUpperCase()}</p>
                                      </div>
                                      {canDispute && (
                                        <button
                                          type="button"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            if (confirm('Lodge official dispute against this traffic violation ticket?')) {
                                              try {
                                                await disputeEChallan(ec.id);
                                                showToast?.('Challan disputed. Verification in progress.', 'success');
                                              } catch (err: any) {
                                                showToast?.(err.message || 'Failed to dispute challan.', 'error');
                                              }
                                            }
                                          }}
                                          className="px-3 py-1.5 bg-white border border-orange-300 text-orange-700 hover:bg-orange-55/70 rounded-lg font-black uppercase text-[10px]"
                                        >
                                          Dispute Challan
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}

                                {/* Incidents */}
                                {matchingIncidents.map(inc => (
                                  <div key={inc.id} className="p-5 rounded-[22px] bg-red-50/40 border border-red-100/60 text-xs text-slate-700 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-center">
                                      <span className="inline-flex px-2 py-0.5 rounded bg-red-100 text-red-800 font-black uppercase tracking-wide text-[9px] mb-1">Accident / Damage Incident</span>
                                      <span className="text-[9px] font-black uppercase text-red-600">{inc.status?.replace('_', ' ')}</span>
                                    </div>
                                    <p className="font-bold text-slate-800 mt-1">Type: {inc.type?.replace('_', ' ').toUpperCase()}</p>
                                    <p className="text-slate-500 mt-0.5 font-bold">Occurred: {new Date(inc.occurredAt).toLocaleString()} | Location: {inc.location}</p>
                                    
                                    {/* Visual Status Tracker */}
                                    {renderStatusTracker(inc.status)}

                                    <p className="text-slate-600 mt-1.5 leading-relaxed font-medium">{inc.statement}</p>
                                    {inc.firNumber && (
                                      <p className="text-[10px] font-mono text-blue-700 bg-blue-50 py-1 px-2 rounded-md mt-2 w-fit">Police FIR Reference: {inc.firNumber}</p>
                                    )}

                                    {/* Administrative Action Log / Verdict */}
                                    {inc.actionType && (
                                      <div className="mt-4 p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                                        <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider block">Administrative Action log</span>
                                        <h4 className="text-xs font-extrabold text-slate-800">
                                          Resolved Category: <span className="text-indigo-700 font-black">{(inc.actionType || '').replace('_', ' ').toUpperCase()}</span>
                                        </h4>
                                        {inc.notes && (
                                          <p className="text-[11px] text-slate-600 font-medium italic mt-0.5">
                                            "{inc.notes}"
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}

                                {/* Disputes */}
                                {matchingDisputes.map(dsp => (
                                  <div key={dsp.id} className="p-5 rounded-[22px] bg-blue-50/40 border border-blue-100/60 text-xs text-slate-800 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="inline-flex px-2 py-0.5 rounded bg-blue-100 text-blue-850 font-black uppercase tracking-wide text-[9px]">LODGED DISPUTE</span>
                                      <span className="text-[9px] font-black uppercase text-blue-600">{dsp.status?.replace('_', ' ').toUpperCase()}</span>
                                    </div>
                                    <p className="font-bold text-slate-900">{dsp.title}</p>
                                    <p className="text-slate-500 text-[10px] uppercase font-bold mt-0.5">Category: {dsp.type}</p>
                                    <p className="text-slate-600 mt-1 leading-relaxed font-semibold">{dsp.description}</p>
                                    {dsp.resolutionDetails && (
                                      <div className="mt-2 p-2 bg-green-50 text-green-800 border border-green-150 rounded-lg">
                                        <p className="font-black text-[9px] uppercase">RESOLUTION ANSWER:</p>
                                        <p className="font-medium text-[11px] mt-0.5">{dsp.resolutionDetails}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}

                                {/* Action to lodge brand new dispute */}
                                <div className="pt-2 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDisputeBookingId(booking.id);
                                      setIsDisputeFormOpen(true);
                                    }}
                                    className="px-4 py-2 text-xs font-black uppercase text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
                                  >
                                    Lodge New Service Dispute
                                  </button>
                                  
                                  {booking.status === 'active' && (
                                    <Link
                                      to={`/report-incident?bookingId=${booking.id}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="px-4 py-2 text-xs font-black uppercase text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                                    >
                                      Report Accident / Incident
                                    </Link>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-[#E2E8F0]">
            <Calendar className="w-20 h-20 text-[#E2E8F0] mx-auto mb-6" />
            <h3 className="text-2xl font-black text-[#1E293B]">No bookings yet</h3>
            <p className="text-[#64748B] mt-2 font-medium">Your rental history will appear here once you start your first journey.</p>
            <Link to="/fleet" className="mt-8 inline-flex items-center gap-2 bg-[#2563EB] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
              Browse Fleet
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Booking?"
        message="Are you sure you want to cancel this booking? This action cannot be undone and your selected vehicle will be released."
        confirmLabel="Yes, Cancel"
        cancelLabel="No, Keep it"
        type="danger"
      />

      <ModifyBookingModal
        isOpen={isModifyModalOpen}
        onClose={() => setIsModifyModalOpen(false)}
        booking={bookingToModify}
        vehicles={vehicles}
        onConfirm={handleConfirmModify}
      />

      {isDisputeFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-950 uppercase tracking-tight">Lodge Booking Dispute</h3>
                <p className="text-xs text-slate-400 mt-1">Submit your claim regarding billing errors or driver negligence.</p>
              </div>
              <button 
                onClick={() => setIsDisputeFormOpen(false)}
                className="text-slate-450 hover:text-slate-900 font-extrabold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-1">Dispute Reason Category</label>
                <select
                  value={disputeType}
                  onChange={(e) => setDisputeType(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 h-11 px-4 font-bold text-slate-800 bg-white"
                >
                  <option value="overcharge">Billing Overcharge / Payment dispute</option>
                  <option value="damage_charge">Condition / Penalty charge dispute</option>
                  <option value="service_issue">Service / Driver Negligence issue</option>
                  <option value="e_challan">Traffic violation citation dispute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-1">Subject / Summary *</label>
                <input 
                  type="text" 
                  value={disputeTitle}
                  onChange={(e) => setDisputeTitle(e.target.value)}
                  placeholder="e.g. Fuel balance calculation error"
                  className="w-full text-xs rounded-xl border border-slate-200 h-11 px-4 font-semibold text-slate-850"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-1">Detailed Narrative / Request *</label>
                <textarea 
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Provide precise details, requested refund amount, timestamps, or driver details here..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-4 font-medium min-h-[120px] resize-none text-slate-800"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDisputeFormOpen(false)}
                  className="flex-1 py-3.5 border-2 border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black uppercase rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all"
                >
                  {submittingDispute ? 'Transmitting Claim...' : 'Transmit Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
