import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown,
  BookOpen,
  Key,
  Wallet,
  UserPlus,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

// Import new view components
import Reports from '../components/dashboard/Reports';
import Customers from '../components/dashboard/Customers';
import Performance from '../components/dashboard/Performance';
import SystemConfig from '../components/dashboard/SystemConfig';
import SupportCenter from '../components/dashboard/SupportCenter';
import Bookings from '../components/dashboard/Bookings';
import RoleAssignment from '../components/dashboard/RoleAssignment';

const AdminDashboard: React.FC = () => {
  const { allBookings, vehicles, allUsers } = useStore();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currentView = queryParams.get('view') || 'overview';

  // Dynamic Stats
  const totalRevenue = allBookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((acc, b) => acc + b.totalPrice, 0);
  
  const activeBookingsCount = allBookings.filter(b => b.status === 'active').length;
  const totalCustomers = allUsers.filter(u => u.role === 'customer').length;

  // Chart data (Monthly performance)
  const chartData = [
    { name: 'Jan', revenue: 150000 },
    { name: 'Feb', revenue: 280000 },
    { name: 'Mar', revenue: 220000 },
    { name: 'Apr', revenue: 350000 },
    { name: 'May', revenue: 420000 },
    { name: 'Jun', revenue: 380000 },
    { name: 'Jul', revenue: 450000 },
  ];

  const stats = [
    { label: 'Total Bookings', value: allBookings.length.toLocaleString(), change: '+12%', icon: BookOpen, color: 'blue', trending: 'up' },
    { label: 'Active Rentals', value: activeBookingsCount.toString(), change: '+5%', icon: Key, color: 'amber', trending: 'up' },
    { label: 'Revenue (PKR)', value: totalRevenue.toLocaleString(), change: '+18%', icon: Wallet, color: 'emerald', trending: 'up' },
    { label: 'New Users', value: totalCustomers.toString(), change: '-2%', icon: UserPlus, color: 'purple', trending: 'down' },
  ];

  return (
    <div className="space-y-8">
      {currentView === 'overview' && (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${
                    stat.color === 'blue' ? 'bg-blue-600/10 text-blue-600' :
                    stat.color === 'amber' ? 'bg-amber-500/10 text-amber-600' :
                    stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
                    'bg-purple-500/10 text-purple-600'
                  }`}>
                    <stat.icon size={20} />
                  </div>
                  <span className={`text-xs font-bold flex items-center gap-1 ${
                    stat.trending === 'up' ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {stat.trending === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Revenue Trend</h3>
                <p className="text-sm text-slate-500">Monthly performance analytics</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-900 rounded-md">Last 7 Months</button>
                <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 rounded-md transition-colors">Yearly</button>
              </div>
            </div>
            <div className="h-64 w-full min-h-[16rem]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256} debounce={100}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2563EB" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Popular Cars */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-1">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Popular Cars</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {vehicles.slice(0, 2).map((vehicle, idx) => (
                  <div key={vehicle.id} className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img src={vehicle.image} alt={vehicle.name} className="object-cover h-full w-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{vehicle.name}</p>
                      <p className="text-xs text-slate-500">{idx === 0 ? '24' : '18'} Bookings this month</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">Active</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 text-center">
                <button className="text-xs text-blue-600 font-semibold hover:underline transition-all">View All Fleet</button>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Recent Bookings</h3>
                <button className="text-xs font-semibold text-slate-500 flex items-center gap-1 hover:text-blue-600 transition-colors">
                  View History <ArrowRight size={14} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Customer</th>
                      <th className="px-6 py-3 font-semibold">Vehicle</th>
                      <th className="px-6 py-3 font-semibold">Duration</th>
                      <th className="px-6 py-3 font-semibold">Amount</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {allBookings.slice(0, 3).map((booking, idx) => {
                      const user = allUsers.find(u => u.id === booking.userId);
                      const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                      return (
                        <tr key={booking.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                <img src={user?.avatar || `https://i.pravatar.cc/150?u=${idx}`} alt="User" className="w-full h-full object-cover" />
                              </div>
                              <span className="font-medium text-slate-900">{user?.name || 'Customer'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{vehicle?.name || 'Vehicle'}</td>
                          <td className="px-6 py-4 text-slate-600">3 Days</td>
                          <td className="px-6 py-4 font-medium text-slate-900">PKR {booking.totalPrice.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              booking.status === 'active' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {currentView === 'reports' && <Reports />}
      {currentView === 'customers' && <Customers />}
      {currentView === 'performance' && <Performance />}
      {currentView === 'system-config' && <SystemConfig />}
      {currentView === 'support-center' && <SupportCenter />}
      {currentView === 'bookings' && <Bookings />}
      {currentView === 'role-assignment' && <RoleAssignment />}
    </div>
  );
};

export default AdminDashboard;
