import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Car, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  Download,
  Filter,
  ChevronRight,
  Activity,
  MapPin
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
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

const AdminDashboard: React.FC = () => {
  const { bookings, vehicles } = useStore();

  const data = [
    { name: 'Mon', revenue: 45000 },
    { name: 'Tue', revenue: 52000 },
    { name: 'Wed', revenue: 48000 },
    { name: 'Thu', revenue: 61000 },
    { name: 'Fri', revenue: 55000 },
    { name: 'Sat', revenue: 67000 },
    { name: 'Sun', revenue: 72000 },
  ];

  const stats = [
    { label: 'Total Revenue', value: 'Rs. 1.2M', change: '+14%', icon: DollarSign, color: 'blue' },
    { label: 'Active Bookings', value: '42', change: '+8%', icon: Car, color: 'emerald' },
    { label: 'New Customers', value: '128', change: '+22%', icon: Users, color: 'purple' },
    { label: 'Fleet Utilization', value: '85%', change: '-2%', icon: Activity, color: 'amber' },
  ];

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-[#1E293B]">Admin Overview</h1>
          <p className="text-[#64748B] font-medium">Real-time performance metrics for EliteDrive Pakistan.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white border border-[#E2E8F0] px-6 py-3 rounded-[20px] font-black text-sm flex items-center gap-2.5 hover:bg-[#F8FAFC] transition-all text-[#64748B] shadow-sm">
            <Download size={18} />
            Export Report
          </button>
          <button className="bg-[#2563EB] text-white px-6 py-3 rounded-[20px] font-black text-sm flex items-center gap-2.5 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                stat.color === 'blue' ? 'bg-blue-50 text-[#2563EB]' :
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                'bg-amber-50 text-amber-600'
              } group-hover:scale-110`}>
                <stat.icon size={28} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg ${
                stat.change.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
              }`}>
                {stat.change.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <p className="text-[#64748B] text-sm font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black mt-2 text-[#1E293B]">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#1E293B]">Revenue Trend</h2>
              <p className="text-sm text-[#64748B] font-medium">Weekly performance overview</p>
            </div>
            <select className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl text-xs font-black uppercase tracking-widest px-4 py-2 focus:ring-2 focus:ring-blue-500/10 outline-none cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '16px'
                  }}
                  cursor={{ fill: '#F8FAFC' }}
                />
                <Bar dataKey="revenue" radius={[12, 12, 0, 0]} barSize={45}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#2563EB' : '#E2E8F0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#1E293B]">Recent Activity</h2>
            <Activity className="text-[#2563EB]" size={24} />
          </div>
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-5 group cursor-pointer">
                <div className="relative">
                  <img 
                    src={`https://i.pravatar.cc/150?u=${i}`} 
                    alt="User" 
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-[#1E293B] group-hover:text-[#2563EB] transition-colors">New Booking</p>
                  <p className="text-xs text-[#64748B] font-bold">Toyota Corolla • 2 mins ago</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#2563EB]">Rs. 8.5k</p>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Paid</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 text-sm font-black text-[#64748B] hover:text-[#2563EB] transition-all border-t border-gray-50 flex items-center justify-center gap-2">
            View All Activity
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Fleet Status Table */}
      <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#1E293B]">Fleet Status</h2>
            <p className="text-sm text-[#64748B] font-medium">Real-time vehicle availability and performance</p>
          </div>
          <button className="w-12 h-12 hover:bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#64748B] transition-all border border-gray-100">
            <MoreHorizontal size={24} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#94A3B8] text-[11px] font-black uppercase tracking-widest">
                <th className="px-10 py-5">Vehicle</th>
                <th className="px-10 py-5">Status</th>
                <th className="px-10 py-5">Current Location</th>
                <th className="px-10 py-5">Revenue (MTD)</th>
                <th className="px-10 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vehicles.map(vehicle => (
                <tr key={vehicle.id} className="hover:bg-[#F8FAFC]/50 transition-all group">
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-12 rounded-xl overflow-hidden shadow-md border-2 border-white">
                        <img src={vehicle.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-[#1E293B] group-hover:text-[#2563EB] transition-colors">{vehicle.name}</p>
                        <p className="text-xs text-[#64748B] font-bold uppercase tracking-widest">{vehicle.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">Available</span>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#64748B]">
                      <MapPin size={14} className="text-[#2563EB]" />
                      {vehicle.location}, Pakistan
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <p className="text-sm font-black text-[#1E293B]">Rs. 145,000</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">+12% vs last month</p>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <button className="w-10 h-10 hover:bg-white hover:shadow-md rounded-xl text-[#CBD5E1] hover:text-[#1E293B] transition-all flex items-center justify-center mx-auto sm:ml-auto sm:mr-0">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
