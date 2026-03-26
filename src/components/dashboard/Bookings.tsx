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
  MapPin
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Booking } from '../../types';
import ConfirmationModal from '../ConfirmationModal';

const Bookings: React.FC = () => {
  const { vehicles, allBookings, allUsers, cancelBooking, approveBooking, showToast } = useStore();
  const [bookingFilter, setBookingFilter] = useState<'pending' | 'active' | 'completed' | 'cancelled'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const filteredBookings = allBookings.filter(booking => {
    const matchesStatus = booking.status === bookingFilter;
    const customer = allUsers.find(u => u.id === booking.userId);
    const vehicle = vehicles.find(v => v.id === booking.vehicleId);
    const matchesSearch = 
      (customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (vehicle?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
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
    try {
      await approveBooking(id);
      showToast('Booking approved successfully', 'success');
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error approving booking:', error);
      showToast('Failed to approve booking', 'error');
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

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search customer, vehicle or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20 transition-all"
            />
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="flex p-1.5 bg-slate-100 rounded-[24px] w-fit overflow-x-auto">
        {(['pending', 'active', 'completed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setBookingFilter(tab)}
            className={`px-8 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              bookingFilter === tab 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => {
            const customer = allUsers.find(u => u.id === booking.userId);
            const vehicle = vehicles.find(v => v.id === booking.vehicleId);
            
            return (
              <motion.div 
                key={booking.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                  {/* Vehicle Info */}
                  <div className="flex items-center gap-5 flex-1">
                    <div className="size-20 rounded-3xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
                      <img 
                        src={vehicle?.image} 
                        alt={vehicle?.name} 
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
                              className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                            >
                              Cancel Booking
                            </button>
                            <button 
                              onClick={() => handleApproveBooking(booking.id)}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                            >
                              Approve Booking
                            </button>
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => setSelectedBooking(booking)}
                              className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                              title="View Details"
                            >
                              <Eye size={20} />
                            </button>
                            
                            {booking.status === 'active' && (
                              <button 
                                onClick={() => {
                                  setBookingToCancel(booking.id);
                                  setIsCancelModalOpen(true);
                                }}
                                className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"
                                title="Cancel Booking"
                              >
                                <Ban size={20} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                  </div>
                </div>
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
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
                      <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                        <span className="text-sm font-black text-slate-900">Total Paid</span>
                        <span className="text-xl font-black text-blue-600">PKR {selectedBooking.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBooking.status === 'pending' && (
                  <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end gap-4">
                    <button 
                      onClick={() => {
                        setBookingToCancel(selectedBooking.id);
                        setIsCancelModalOpen(true);
                      }}
                      className="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-sm hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2"
                    >
                      <Ban size={18} />
                      Reject Booking
                    </button>
                    <button 
                      onClick={() => handleApproveBooking(selectedBooking.id)}
                      className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
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
    </div>
  );
};

export default Bookings;
