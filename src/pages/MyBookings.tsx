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
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import ConfirmationModal from '../components/ConfirmationModal';
import ModifyBookingModal from '../components/ModifyBookingModal';
import { Booking } from '../types';

const MyBookings: React.FC = () => {
  const { bookings, vehicles, cancelBooking, updateBooking } = useStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = React.useState(false);
  const [bookingToCancel, setBookingToCancel] = React.useState<string | null>(null);
  const [bookingToModify, setBookingToModify] = React.useState<Booking | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
                      <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-gray-50">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Pickup</p>
                        <p className="font-black text-[#1E293B] text-sm">{booking.startDate}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Return</p>
                        <p className="font-black text-[#1E293B] text-sm">{booking.endDate}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Total Price</p>
                        <p className="font-black text-[#2563EB] text-sm">PKR {booking.totalPrice.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Payment</p>
                        <p className="font-black text-emerald-500 text-sm">{booking.paymentStatus.toUpperCase()}</p>
                      </div>
                      {booking.destination && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Destination</p>
                          <p className="font-black text-[#1E293B] text-sm">{booking.destination}</p>
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
                        <div className="aspect-video rounded-[32px] overflow-hidden bg-gray-50 border border-gray-100">
                          <img 
                            src={vehicle?.image} 
                            alt={vehicle?.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex gap-4">
                          <Link 
                            to={`/vehicle/${vehicle?.id}`}
                            className="flex-1 bg-[#1E293B] text-white py-4 rounded-2xl font-black text-sm text-center hover:bg-black transition-all"
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
                          <button className="flex-1 border border-[#E2E8F0] text-[#1E293B] py-4 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all">
                            Download Receipt
                          </button>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-widest text-[#94A3B8]">Journey Schedule</h4>
                          <div className="grid gap-4">
                            <div className="bg-[#F8FAFC] p-6 rounded-2xl flex items-center gap-4 border border-gray-50">
                              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#2563EB]">
                                <Calendar size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Pickup Date & Time</p>
                                <p className="font-black text-[#1E293B]">{booking.startDate} at 10:00 AM</p>
                              </div>
                            </div>
                            <div className="bg-[#F8FAFC] p-6 rounded-2xl flex items-center gap-4 border border-gray-50">
                              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                                <Clock size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Return Date & Time</p>
                                <p className="font-black text-[#1E293B]">{booking.endDate} at 06:00 PM</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-widest text-[#94A3B8]">Booking Information</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl border border-gray-100">
                              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Booking ID</p>
                              <p className="font-black text-[#1E293B] text-sm uppercase">#{booking.id.slice(0, 8)}</p>
                            </div>
                            <div className="p-4 rounded-2xl border border-gray-100">
                              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Booking Date</p>
                              <p className="font-black text-[#1E293B] text-sm">{booking.bookingDate || 'N/A'}</p>
                            </div>
                          </div>
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
    </div>
  );
};

export default MyBookings;
