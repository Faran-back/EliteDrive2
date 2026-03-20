import React from 'react';
import { 
  Globe, 
  TrendingUp, 
  MapPin, 
  Users, 
  Car, 
  ArrowUpRight,
  ChevronRight,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const ManagerDashboard: React.FC = () => {
  const regions = [
    { city: 'Lahore', bookings: 450, growth: '+15%', revenue: 'Rs. 4.2M', color: '#2563EB' },
    { city: 'Karachi', bookings: 380, growth: '+12%', revenue: 'Rs. 3.8M', color: '#3B82F6' },
    { city: 'Islamabad', bookings: 290, growth: '+18%', revenue: 'Rs. 3.1M', color: '#60A5FA' },
    { city: 'Faisalabad', bookings: 120, growth: '+5%', revenue: 'Rs. 1.2M', color: '#93C5FD' },
  ];

  const pieData = [
    { name: 'Lahore', value: 450 },
    { name: 'Karachi', value: 380 },
    { name: 'Islamabad', value: 290 },
    { name: 'Others', value: 120 },
  ];

  const areaData = [
    { month: 'Jan', bookings: 850 },
    { month: 'Feb', bookings: 920 },
    { month: 'Mar', bookings: 1100 },
    { month: 'Apr', bookings: 1050 },
    { month: 'May', bookings: 1300 },
    { month: 'Jun', bookings: 1450 },
  ];

  const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'];

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-[#1E293B]">Pakistan Regional Hub</h1>
          <p className="text-[#64748B] font-medium">Managing mobility across major urban centers.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4 group-focus-within:text-[#2563EB] transition-colors" />
            <input 
              type="text" 
              placeholder="Search regions..."
              className="bg-white border border-[#E2E8F0] rounded-[20px] py-3 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/5 transition-all w-full md:w-64"
            />
          </div>
          <button className="bg-white border border-[#E2E8F0] p-3 rounded-[20px] text-[#64748B] hover:text-[#2563EB] hover:bg-[#F8FAFC] transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Regional Performance Cards */}
        <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {regions.map((region, i) => (
              <motion.div
                key={region.city}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-all shadow-sm">
                      <MapPin size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-[#1E293B]">{region.city}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-black">
                    <ArrowUpRight size={14} />
                    {region.growth}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Bookings</p>
                    <p className="text-xl font-black text-[#1E293B]">{region.bookings}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Revenue</p>
                    <p className="text-xl font-black text-[#1E293B]">{region.revenue}</p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-sm">
                        <img src={`https://i.pravatar.cc/100?u=${region.city}${i}`} alt="Manager" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-4 border-white bg-blue-50 flex items-center justify-center text-[10px] font-black text-[#2563EB] shadow-sm">
                      +4
                    </div>
                  </div>
                  <button className="text-xs font-black text-[#94A3B8] hover:text-[#2563EB] flex items-center gap-1.5 transition-colors group/btn">
                    Manage Hub 
                    <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Growth Chart */}
          <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#1E293B]">National Growth Trend</h2>
                <p className="text-sm text-[#64748B] font-medium">Monthly booking performance across Pakistan</p>
              </div>
              <div className="flex items-center gap-2 text-[#2563EB] bg-blue-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                <TrendingUp size={16} />
                Live Data
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="month" 
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
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#2563EB" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorBookings)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Market Share & Stats */}
        <div className="space-y-10">
          <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-10">
            <h2 className="text-2xl font-black text-[#1E293B]">Market Share</h2>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-3xl font-black text-[#1E293B]">1,240</p>
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Total Units</p>
              </div>
            </div>
            <div className="space-y-5">
              {pieData.map((entry, i) => (
                <div key={entry.name} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm font-black text-[#64748B] group-hover:text-[#1E293B] transition-colors">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ backgroundColor: COLORS[i], width: `${(entry.value / 1240) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-[#1E293B] w-10 text-right">{Math.round((entry.value / 1240) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#2563EB] rounded-[48px] p-10 text-white space-y-8 relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                <h3 className="text-3xl font-black leading-tight">Expansion Plan 2024</h3>
                <p className="text-blue-100 font-medium leading-relaxed">We're launching in Peshawar and Multan next month. Get ready for the next level of mobility.</p>
              </div>
              <div className="space-y-5">
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Car size={20} />
                  </div>
                  <span className="font-black text-sm uppercase tracking-widest">+50 New Vehicles</span>
                </div>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <span className="font-black text-sm uppercase tracking-widest">15 New Hub Managers</span>
                </div>
              </div>
              <button className="w-full bg-white text-[#2563EB] py-5 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-blue-50 transition-all shadow-xl">
                View Roadmap
                <ArrowRight size={20} />
              </button>
            </div>
            <Globe className="absolute -right-12 -bottom-12 w-64 h-64 text-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
