import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  History, 
  CreditCard,
  Trash2,
  Edit2,
  Eye,
  X,
  Calendar,
  Car,
  Clock
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { User, Booking } from '../../types';

const Customers: React.FC = () => {
  const { allUsers, allBookings, vehicles } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'loyalty'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  const customers = allUsers.filter(u => u.role === 'customer');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') {
      const hasActiveBooking = allBookings.some(b => b.userId === customer.id && b.status === 'active');
      return matchesSearch && hasActiveBooking;
    }
    if (filter === 'loyalty') {
      const bookingCount = allBookings.filter(b => b.userId === customer.id).length;
      return matchesSearch && bookingCount >= 3;
    }
    return matchesSearch;
  });

  const getCustomerBookings = (userId: string) => {
    return allBookings.filter(b => b.userId === userId).sort((a, b) => 
      new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Management</h1>
          <p className="text-slate-500 font-medium">Manage and monitor customer records</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search customers by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20 transition-all"
          />
        </div>
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          {(['all', 'active', 'loyalty'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === t 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCustomers.map((customer, i) => {
            const customerBookings = getCustomerBookings(customer.id);
            const totalSpent = customerBookings.reduce((acc, b) => acc + b.totalPrice, 0);
            
            return (
              <motion.div 
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-blue-600/10 transition-all"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="size-16 rounded-3xl bg-slate-50 overflow-hidden border border-slate-100">
                      <img 
                        src={customer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.email}`} 
                        alt={customer.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{customer.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">Customer since 2024</p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Mail size={14} className="text-blue-600" />
                      <span className="text-xs font-bold truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <Phone size={14} className="text-blue-600" />
                      <span className="text-xs font-bold">{customer.phone || 'No phone provided'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bookings</p>
                      <p className="text-lg font-black text-slate-900">{customerBookings.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Spent</p>
                      <p className="text-lg font-black text-blue-600">Rs. {(totalSpent / 1000).toFixed(1)}k</p>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-2">
                    <button 
                      onClick={() => setSelectedCustomer(customer)}
                      className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Customer Details Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-10 overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-6">
                    <div className="size-20 rounded-[32px] bg-slate-50 overflow-hidden border border-slate-100">
                      <img 
                        src={selectedCustomer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCustomer.email}`} 
                        alt={selectedCustomer.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedCustomer.name}</h2>
                      <p className="text-slate-500 font-medium">{selectedCustomer.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Phone size={14} className="text-blue-600" />
                          {selectedCustomer.phone || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <CreditCard size={14} className="text-blue-600" />
                          {selectedCustomer.rewardPoints} Points
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <History size={18} className="text-blue-600" />
                      Booking History
                    </h3>
                    
                    <div className="space-y-4">
                      {getCustomerBookings(selectedCustomer.id).length > 0 ? (
                        getCustomerBookings(selectedCustomer.id).map((booking) => {
                          const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                          return (
                            <div key={booking.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-white overflow-hidden border border-slate-100 shrink-0">
                                  <img src={vehicle?.image} alt={vehicle?.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-900">{vehicle?.name}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                      <Calendar size={10} />
                                      {new Date(booking.startDate).toLocaleDateString()}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                                      booking.status === 'completed' ? 'text-emerald-600' : 
                                      booking.status === 'active' ? 'text-blue-600' : 
                                      booking.status === 'cancelled' ? 'text-rose-600' : 'text-amber-600'
                                    }`}>
                                      {booking.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-slate-900">Rs. {booking.totalPrice.toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Price</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          <p className="text-sm font-bold text-slate-400">No bookings found for this customer.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
