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
  Clock,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { User, Booking } from '../../types';

const getDeterministicCNIC = (name: string = 'User', id: string = 'id') => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const part1 = 35201 + (hash % 1000);
  const part2 = 1000000 + (hash * 17) % 8999999;
  const part3 = hash % 9;
  return `${part1}-${part2}-${part3}`;
};

const getDeterministicDOB = (name: string = 'User') => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const day = 1 + (hash % 28);
  const month = 1 + (hash % 12);
  const year = 1980 + (hash % 20);
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
};

const Customers: React.FC = () => {
  const { allUsers, allBookings, vehicles, verifyUserCNIC, toggleUserBlacklist } = useStore();
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
                     <div className="flex flex-col items-end gap-1.5">
                       {customer.isBlacklisted && (
                         <span className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-red-700 shadow-sm">
                           BLACKLISTED
                         </span>
                       )}
                       {customer.cnicVerified ? (
                         <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 shadow-xs">
                           <ShieldCheck size={12} className="text-emerald-700" />
                           Verified CNIC
                         </span>
                       ) : (
                         <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200/50">
                           <ShieldAlert size={12} className="text-amber-600" />
                           Unverified
                         </span>
                       )}
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
                      <p className="text-lg font-black text-blue-600">PKR {(totalSpent / 1000).toFixed(1)}k</p>
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
        {selectedCustomer && (() => {
          const currentCustomer = allUsers.find(u => u.id === selectedCustomer.id) || selectedCustomer;
          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCustomer(null)}
                className="absolute inset-0 bg-white/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-3xl bg-white rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="p-10 overflow-y-auto space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-6">
                      <div className="size-20 rounded-[32px] bg-slate-50 overflow-hidden border border-slate-100">
                        <img 
                          src={currentCustomer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentCustomer.email}`} 
                          alt={currentCustomer.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentCustomer.name}</h2>
                        <p className="text-slate-500 font-medium">{currentCustomer.email}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Phone size={14} className="text-blue-600" />
                            {currentCustomer.phone || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <CreditCard size={14} className="text-blue-600" />
                            {currentCustomer.rewardPoints || 0} Points
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

                  {/* Documents & Verification Section */}
                  <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100/80 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
                      <div className="space-y-1">
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                          <ShieldCheck size={18} className="text-blue-600" />
                          Identity & Documents Verification
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Verify customer national identity records to enable premium features and booking check-ins.
                        </p>
                      </div>
                      <div>
                        {currentCustomer.cnicVerified ? (
                          <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm shadow-emerald-500/10">
                            <ShieldCheck size={14} />
                            CNIC Verified
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm shadow-amber-500/10 scale-95 duration-700 animate-pulse">
                            <ShieldAlert size={14} />
                            Pending Verification
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Document Previews Container Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* CNIC Front Preview */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNIC Front Side</p>
                          {currentCustomer.cnicFront && (
                            <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">Uploaded</span>
                          )}
                        </div>
                        <div className="aspect-[1.58/1] w-full rounded-2xl overflow-hidden border border-slate-200 bg-white relative group shadow-sm flex items-center justify-center">
                          {currentCustomer.cnicFront ? (
                            <img src={currentCustomer.cnicFront} alt="CNIC Front" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-linear-to-br from-slate-50 via-blue-50/10 to-emerald-50/5 p-4 flex flex-col justify-between select-none relative overflow-hidden font-mono">
                              <div className="absolute top-2 right-2 w-12 h-12 bg-emerald-500/5 rounded-full blur-xl" />
                              <div className="absolute bottom-4 left-4 w-16 h-16 bg-blue-500/5 rounded-full blur-xl" />
                              
                              <div className="flex items-start justify-between relative z-10">
                                <div className="space-y-0.5">
                                  <div className="text-[9px] font-black text-emerald-800 uppercase tracking-tight">Government of Pakistan</div>
                                  <div className="text-[6px] text-slate-400 font-bold uppercase tracking-wider">National Identity Card</div>
                                </div>
                                <span className="text-[6px] text-emerald-700/80 bg-emerald-50 border border-emerald-500/25 px-1.5 py-0.5 rounded-sm font-black uppercase">Sample Doc</span>
                              </div>
                              
                              <div className="flex items-center gap-4 relative z-10 my-1">
                                <div className="size-11 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/80 shrink-0">
                                  <img 
                                    src={currentCustomer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentCustomer.email}`} 
                                    alt="CNIC Avatar" 
                                    className="w-full h-full object-cover grayscale"
                                  />
                                </div>
                                <div className="space-y-1 font-sans">
                                  <div className="text-[11px] font-black text-slate-900 leading-none">{currentCustomer.name}</div>
                                  <div className="text-[7px] text-slate-400 font-bold">Holder Identity Profile</div>
                                  <div className="text-[7px] font-mono font-bold text-slate-650">ID: {getDeterministicCNIC(currentCustomer.name, currentCustomer.id)}</div>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-end border-t border-slate-100 pt-1 text-[6px] text-slate-400 font-sans relative z-10">
                                <div>
                                  <span className="font-bold">DOB:</span> <span className="font-mono text-slate-600">{getDeterministicDOB(currentCustomer.name)}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold">COUNTRY:</span> <span className="font-bold text-slate-650 uppercase">Pakistan</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CNIC Back Side Preview */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNIC Back Side</p>
                          {currentCustomer.cnicBack && (
                            <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">Uploaded</span>
                          )}
                        </div>
                        <div className="aspect-[1.58/1] w-full rounded-2xl overflow-hidden border border-slate-200 bg-white relative group shadow-sm flex items-center justify-center">
                          {currentCustomer.cnicBack ? (
                            <img src={currentCustomer.cnicBack} alt="CNIC Back" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-linear-to-br from-slate-50 via-slate-100/30 to-slate-200/20 p-4 flex flex-col justify-between select-none relative overflow-hidden font-mono">
                              <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-500/5 to-transparent pointer-events-none" />
                              <div className="w-full h-3 bg-slate-300 rounded mb-1" />
                              
                              <div className="space-y-1 my-1 text-[6px] text-slate-500 font-sans relative z-10">
                                <div className="bg-slate-100/80 p-2 rounded border border-slate-200/60 space-y-0.5">
                                  <div><span className="font-bold">REGISTRY DISTRICT:</span> Lahore, Cantt</div>
                                  <div><span className="font-bold">ISSUED DATE:</span> 14.11.2023</div>
                                  <div><span className="font-bold">EXPIRY DATE:</span> 14.11.2033</div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-slate-200 pt-2 relative z-10 font-mono text-[7px] text-slate-400">
                                <div className="flex items-center gap-1.5 font-sans">
                                  <div className="size-5 bg-slate-200 border border-slate-300 rounded flex items-center justify-center font-bold text-[5px]">FPS</div>
                                  <span className="font-bold tracking-widest font-mono text-[6px]">INDEX-CARD-P189</span>
                                </div>
                                <div className="text-right font-bold text-slate-400 tracking-wider text-[6px]">PAK-REG-202</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Driving License Image if present */}
                    {currentCustomer.license && (
                      <div className="space-y-2 border-t border-slate-200/50 pt-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Driving License Scan</p>
                          <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">Uploaded</span>
                        </div>
                        <div className="max-w-md aspect-[1.58/1] w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <img src={currentCustomer.license} alt="Driving License" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}

                     {/* Outstanding Balance Info */}
                     <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 flex items-center justify-between text-xs">
                       <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Outstanding Balance</p>
                         <p className="font-semibold text-slate-500 mt-1">Pending fines, damage penalties, or e-challan claims.</p>
                       </div>
                       <p className={`text-lg font-black ${currentCustomer.outstandingBalance && currentCustomer.outstandingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                         PKR {(currentCustomer.outstandingBalance || 0).toLocaleString()}
                       </p>
                     </div>

                     {/* CNIC verification & Blacklist Actions */}
                     <div className="pt-2 flex flex-wrap items-center gap-3">
                       {!currentCustomer.cnicVerified ? (
                         <button
                           onClick={async () => {
                             await verifyUserCNIC(currentCustomer.id, true);
                           }}
                           className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-700/20 active:scale-[0.98]"
                         >
                           <ShieldCheck size={16} />
                           Verify CNIC
                         </button>
                       ) : (
                         <button
                           onClick={async () => {
                             await verifyUserCNIC(currentCustomer.id, false);
                           }}
                           className="px-6 py-3.5 bg-red-105 hover:bg-red-200 text-red-605 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-[0.98]"
                         >
                           <X size={16} />
                           Revoke Verification Status
                         </button>
                       )}

                       {currentCustomer.isBlacklisted ? (
                         <button
                           onClick={async () => {
                             await toggleUserBlacklist(currentCustomer.id, false);
                           }}
                           className="px-6 py-3.5 bg-slate-900 text-white hover:bg-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                         >
                           Unblacklist Account
                         </button>
                       ) : (
                         <button
                           onClick={async () => {
                             if (confirm('Are you ABSOLUTELY certain you want to lock and BLACKLIST this client account? Booking functions will be instantly restricted.')) {
                               await toggleUserBlacklist(currentCustomer.id, true);
                             }
                           }}
                           className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
                         >
                           Blacklist Customer
                         </button>
                       )}
                     </div>

                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <History size={18} className="text-blue-600" />
                      Booking History
                    </h3>
                    
                    <div className="space-y-4">
                      {getCustomerBookings(currentCustomer.id).length > 0 ? (
                        getCustomerBookings(currentCustomer.id).map((booking) => {
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
                                <p className="text-sm font-black text-slate-900">PKR {booking.totalPrice.toLocaleString()}</p>
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
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
