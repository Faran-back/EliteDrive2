import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  Car, 
  Users, 
  TrendingUp, 
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useStore } from '../../context/StoreContext';

const Reports: React.FC = () => {
  const { allBookings, vehicles, allUsers } = useStore();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const COLORS = ['#2563EB', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'];

  const vehicleTypeData = [
    { name: 'Sedan', value: vehicles.filter(v => v.type === 'Sedan').length },
    { name: 'SUV', value: vehicles.filter(v => v.type === 'SUV').length },
    { name: 'Luxury', value: vehicles.filter(v => v.type === 'Luxury').length },
    { name: 'Hatchback', value: vehicles.filter(v => v.type === 'Hatchback').length },
  ];

  const bookingStatusData = [
    { name: 'Completed', value: allBookings.filter(b => b.status === 'completed').length },
    { name: 'Active', value: allBookings.filter(b => b.status === 'active').length },
    { name: 'Cancelled', value: allBookings.filter(b => b.status === 'cancelled').length },
  ];

  const revenueData = [
    { name: 'Week 1', revenue: 120000 },
    { name: 'Week 2', revenue: 180000 },
    { name: 'Week 3', revenue: 150000 },
    { name: 'Week 4', revenue: 220000 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fleet Reports</h1>
          <p className="text-slate-500 font-medium">Analytical insights and performance data</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={18} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex p-1.5 bg-slate-100 rounded-[24px] w-fit">
        {(['daily', 'weekly', 'monthly'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-8 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${
              reportType === type 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Performance */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900">Revenue Performance</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Weekly revenue breakdown</p>
            </div>
            <TrendingUp className="text-emerald-500" />
          </div>
          <div className="h-72 w-full min-h-[18rem]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288} debounce={100}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="#2563EB" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Distribution */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900">Fleet Distribution</h3>
            <PieChartIcon className="text-blue-600" />
          </div>
          <div className="h-64 w-full min-h-[16rem]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256} debounce={100}>
              <PieChart>
                <Pie
                  data={vehicleTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehicleTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {vehicleTypeData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-xs font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Car size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilization Rate</p>
              <h4 className="text-xl font-black text-slate-900">84.2%</h4>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-[84.2%]"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Retention</p>
              <h4 className="text-xl font-black text-slate-900">68.5%</h4>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[68.5%]"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Booking Value</p>
              <h4 className="text-xl font-black text-slate-900">Rs. 12,450</h4>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase">
            <TrendingUp size={14} />
            +15.4% from last month
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
