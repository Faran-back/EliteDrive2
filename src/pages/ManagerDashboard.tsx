import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useStore } from '../context/StoreContext';
import { Vehicle, Booking, User } from '../types';
import { 
  Pencil, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Ban, 
  Search,
  ChevronRight,
  User as UserIcon,
  MapPin,
  Banknote,
  X,
  Car
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';

// Import new view components
import Reports from '../components/dashboard/Reports';
import Customers from '../components/dashboard/Customers';
import Performance from '../components/dashboard/Performance';
import SystemConfig from '../components/dashboard/SystemConfig';
import SupportCenter from '../components/dashboard/SupportCenter';
import Bookings from '../components/dashboard/Bookings';
import FleetInventory from '../components/dashboard/FleetInventory';
import ReturnVerificationWidget from '../components/dashboard/ReturnVerificationWidget';
import EmailLogsSandbox from '../components/dashboard/EmailLogsSandbox';
import FormalDisputes from '../components/dashboard/FormalDisputes';

const ManagerDashboard: React.FC = () => {
  const { vehicles, allBookings, allUsers, cancelBooking, showToast, user } = useStore();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currentView = queryParams.get('view') || 'overview';

  // Calculate dynamic daily revenue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dailyRevenue = allBookings.reduce((acc, booking) => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    if (start < tomorrow && end >= today) {
      const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      return acc + (booking.totalPrice / duration);
    }
    return acc;
  }, 0);

  const demandData = [
    { day: 'Mon', historical: 45, predicted: 35 },
    { day: 'Tue', historical: 55, predicted: 50 },
    { day: 'Wed', historical: 70, predicted: 90 },
    { day: 'Thu', historical: 65, predicted: 60 },
    { day: 'Fri', historical: 60, predicted: 55 },
    { day: 'Sat', historical: 85, predicted: 80 },
    { day: 'Sun', historical: 80, predicted: 75 },
  ];

  const stats = [
    { label: 'Total Vehicles', value: vehicles.length.toLocaleString(), trend: '+4%', trendUp: true },
    { label: 'Active Rentals', value: allBookings.filter(b => b.status === 'active').length.toLocaleString(), trend: `${Math.round((allBookings.filter(b => b.status === 'active').length / (vehicles.length || 1)) * 100)}% Occ.`, trendUp: null },
    { label: 'Daily Revenue', value: `PKR ${Math.round(dailyRevenue / 1000)}k`, trend: '+12%', trendUp: true },
    { label: 'Maintenance', value: `${vehicles.filter(v => v.status === 'maintenance').length} Units`, trend: '0 Alerts', trendUp: false },
  ];

  const inventory = vehicles.slice(0, 3).map(v => ({
    id: v.id,
    name: v.name,
    type: v.type,
    year: new Date().getFullYear(),
    status: v.status === 'available' ? 'AVAILABLE' : v.status === 'rented' ? 'RENTED' : 'MAINTENANCE',
    location: v.location,
    price: v.pricePerDay
  }));

  const maintenanceAlerts = vehicles
    .filter(v => v.status === 'maintenance')
    .map(v => ({
      title: 'Scheduled Maintenance',
      vehicle: `${v.name} • Plate ${(v.id || '').slice(0, 8).toUpperCase()}`,
      type: 'warning',
      icon: 'build'
    }));

  /*
  if (maintenanceAlerts.length === 0) {
    maintenanceAlerts.push({ title: 'System Check Required', vehicle: 'All systems operational', type: 'warning', icon: 'check_circle' });
  }
  */

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
      case 'active': return <Clock size={12} />;
      case 'completed': return <CheckCircle2 size={12} />;
      case 'cancelled': return <XCircle size={12} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {currentView === 'overview' && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                  {stat.trendUp !== null && (
                    <span className={`text-[10px] font-black flex items-center gap-1 px-2 py-1 rounded-full ${stat.trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                      <span className="material-symbols-outlined text-[14px]">{stat.trendUp ? 'trending_up' : 'warning'}</span>
                      {stat.trend}
                    </span>
                  )}
                  {stat.trendUp === null && (
                    <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                      {stat.trend}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Return Verification Alert / Release Desk */}
          <ReturnVerificationWidget />

          {/* Main Layout Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Vehicle Inventory Table */}
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                  <h2 className="font-black text-lg text-slate-900">Vehicle Inventory</h2>
                  <Link 
                    to="/manager-dashboard?view=inventory"
                    className="text-blue-600 text-xs font-black hover:underline tracking-widest uppercase"
                  >
                    See all
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price/Day</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {inventory.map((item) => (
                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <span className="material-symbols-outlined">directions_car</span>
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900">{item.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.type} • {item.year}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black tracking-widest border ${
                              item.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              item.status === 'RENTED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-xs font-bold text-slate-500">{item.location}</td>
                          <td className="px-8 py-5 text-sm font-black text-slate-900">PKR {item.price.toLocaleString()}</td>
                          <td className="px-8 py-5 text-right flex items-center justify-end gap-3">
                            <Link 
                              to={`/edit-vehicle/${item.id}`}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-all group/btn"
                            >
                              <Pencil size={16} className="group-hover/btn:scale-110 transition-all" />
                            </Link>
                            <button className="text-blue-600 font-black text-[10px] hover:underline tracking-widest uppercase">VIEW</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Demand Prediction Chart */}
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                  <div>
                    <h2 className="font-black text-2xl text-slate-900 mb-1">Demand Prediction</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Next 7 days forecast for Pakistan Region</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-slate-200"></div>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Historical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-blue-600"></div>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Predicted</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-72 w-full min-h-[18rem]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288} debounce={100}>
                    <BarChart data={demandData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} 
                      />
                      <Tooltip 
                        cursor={{ fill: '#F8FAFC' }}
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                      />
                      <Bar dataKey="historical" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={32} />
                      <Bar dataKey="predicted" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={32}>
                        {demandData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.day === 'Wed' ? '#2563EB' : '#2563EB4D'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between">
                  <p className="text-[10px] text-slate-400 font-bold italic">Data reflects trends from Lahore, Karachi, and Islamabad terminals.</p>
                  <button className="text-[10px] font-black text-blue-600 flex items-center gap-2 uppercase tracking-widest">
                    Download Forecast 
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              {/* Maintenance Alerts */}
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50">
                  <h2 className="font-black text-lg text-slate-900">Maintenance Alerts</h2>
                </div>
                <div className="p-8 space-y-6">
                  {maintenanceAlerts.map((alert, i) => (
                    <div key={i} className={`flex gap-5 p-6 rounded-[32px] border ${
                      alert.type === 'error' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                    }`}>
                      <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        alert.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        <span className="material-symbols-outlined text-[24px]">{alert.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 mb-1">{alert.title}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">{alert.vehicle}</p>
                        <button className={`text-[10px] font-black uppercase tracking-widest hover:underline ${
                          alert.type === 'error' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {alert.type === 'error' ? 'SCHEDULE NOW' : 'MARK AS DONE'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Fleet Tracking */}
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                  <h2 className="font-black text-lg text-slate-900">Live Fleet Tracking</h2>
                  <button className="text-slate-400 hover:text-blue-600 transition-all">
                    <span className="material-symbols-outlined">fullscreen</span>
                  </button>
                </div>
                <div className="h-72 relative bg-slate-100">
                  {/* Placeholder for Map */}
                  <img 
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800" 
                    className="w-full h-full object-cover opacity-50 grayscale"
                    alt="Map"
                  />
                  <div className="absolute inset-0 bg-blue-600/5"></div>
                  
                  {/* Map Pointers */}
                  <div className="absolute top-1/4 left-1/3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-600 animate-ping rounded-full opacity-25"></div>
                      <div className="relative size-8 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center shadow-xl text-white">
                        <span className="material-symbols-outlined text-[14px]">directions_car</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-1/2 right-1/4">
                    <div className="size-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-xl text-white">
                      <span className="material-symbols-outlined text-[14px]">local_parking</span>
                    </div>
                  </div>
                  <div className="absolute bottom-1/3 left-1/2">
                    <div className="size-8 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center shadow-xl text-white">
                      <span className="material-symbols-outlined text-[14px]">directions_car</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-0.5">Main Terminal: Lahore</p>
                    <p className="text-[10px] text-slate-500 font-bold">Tracking {vehicles.length.toLocaleString()} active units</p>
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-all">
                    Live View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {currentView === 'bookings' && <Bookings />}
      {currentView === 'reports' && <Reports />}
      {currentView === 'customers' && <Customers />}
      {currentView === 'performance' && <Performance />}
      {currentView === 'system-config' && <SystemConfig />}
      {currentView === 'support-center' && <SupportCenter />}
      {currentView === 'inventory' && <FleetInventory />}
      {currentView === 'disputes' && <FormalDisputes />}
      {currentView === 'email-logs' && <EmailLogsSandbox isAdminView={true} />}
    </div>
  );
};

export default ManagerDashboard;
