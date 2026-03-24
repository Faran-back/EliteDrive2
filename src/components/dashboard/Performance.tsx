import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  AlertTriangle, 
  BarChart3, 
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Car,
  Fuel
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useStore } from '../../context/StoreContext';

const Performance: React.FC = () => {
  const { vehicles, allBookings } = useStore();

  const performanceData = [
    { name: 'Mon', utilization: 65, revenue: 45000 },
    { name: 'Tue', utilization: 72, revenue: 52000 },
    { name: 'Wed', utilization: 85, revenue: 68000 },
    { name: 'Thu', utilization: 78, revenue: 59000 },
    { name: 'Fri', utilization: 92, revenue: 82000 },
    { name: 'Sat', utilization: 95, revenue: 95000 },
    { name: 'Sun', utilization: 88, revenue: 78000 },
  ];

  const kpis = [
    { label: 'Vehicle Usage', value: '84.2%', change: '+4.5%', trending: 'up', icon: Activity, color: 'blue' },
    { label: 'Avg. Downtime', value: '2.4 hrs', change: '-12.3%', trending: 'up', icon: Clock, color: 'emerald' },
    { label: 'Fuel Efficiency', value: '14.2 km/l', change: '+2.1%', trending: 'up', icon: Fuel, color: 'amber' },
    { label: 'Safety Score', value: '9.8/10', change: '+0.5%', trending: 'up', icon: Zap, color: 'purple' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Performance Metrics</h1>
          <p className="text-slate-500 font-medium">Monitor fleet and driver efficiency</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            Last 7 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            Download Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl ${
                kpi.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                kpi.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                kpi.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                'bg-purple-50 text-purple-600'
              }`}>
                <kpi.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${
                kpi.trending === 'up' ? 'text-emerald-500' : 'text-rose-500'
              }`}>
                {kpi.trending === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.change}
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Utilization Trend */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900">Fleet Utilization</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Daily usage percentage</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase">
              <TrendingUp size={16} />
              +8.2% vs last week
            </div>
          </div>
          <div className="h-72 w-full min-h-[18rem]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288} debounce={100}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="utilization" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorUtil)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts & Benchmarks */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} />
              Performance Alerts
            </h3>
            <div className="space-y-4">
              {[
                { title: 'Low Utilization: Luxury Segment', detail: '3 vehicles idle for > 48hrs', type: 'warning' },
                { title: 'Maintenance Overdue', detail: 'Vehicle ID #8821 requires urgent service', type: 'error' },
                { title: 'High Fuel Consumption', detail: 'SUV #1229 exceeding benchmark by 15%', type: 'warning' },
              ].map((alert, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${
                  alert.type === 'error' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'
                }`}>
                  <p className="text-xs font-black text-slate-900 mb-1">{alert.title}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{alert.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={20} />
              Segment Benchmarks
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Sedan', value: 92, target: 85 },
                { label: 'SUV', value: 78, target: 80 },
                { label: 'Luxury', value: 65, target: 70 },
              ].map((segment, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{segment.label}</span>
                    <span className="text-xs font-black text-blue-600">{segment.value}% / {segment.target}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${segment.value >= segment.target ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${segment.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
