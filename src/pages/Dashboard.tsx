import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Award, 
  ChevronRight, 
  MapPin, 
  Clock,
  ArrowRight,
  ShieldCheck,
  Car,
  Search,
  Heart,
  Star,
  Users,
  Zap,
  Fuel,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import VehicleCard from '../components/VehicleCard';

const Dashboard: React.FC = () => {
  const { user, bookings, vehicles } = useStore();
  const [budget, setBudget] = useState(4000);
  const [passengers, setPassengers] = useState(4);
  
  // Set default dates to today and 5 days from now
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 5);
  
  const [startDate, setStartDate] = useState<Date | null>(today);
  const [endDate, setEndDate] = useState<Date | null>(nextWeek);

  const activeBookingsCount = bookings.filter(b => b.status === 'active').length;
  const totalTripsCount = bookings.length;
  const rewardPoints = user?.rewardPoints || 0;
  const nextRewardThreshold = 1500;
  const rewardProgress = Math.min((rewardPoints / nextRewardThreshold) * 100, 100);

  const calculateDays = (start: Date | null, end: Date | null) => {
    if (!start || !end) return 5;
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  };

  const rentalDays = calculateDays(startDate, endDate);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const handleFindBestCar = () => {
    setIsFilterActive(true);
    const filtered = vehicles.filter(v => v.pricePerDay <= budget && v.seats >= passengers);
    
    if (filtered.length === 0) {
      setRecommendation("Consider increasing budget for better options.");
      return;
    }

    // Sort by rating and price to find the "best"
    const bestMatch = [...filtered].sort((a, b) => b.rating - a.rating || a.pricePerDay - b.pricePerDay)[0];
    
    const reason = bestMatch.seats >= 7 ? "perfect for large groups" : 
                  bestMatch.pricePerDay <= 5000 ? "reliable and economical" : 
                  "premium choice for your comfort";

    setRecommendation(`${bestMatch.name} – fits within PKR ${budget.toLocaleString()}/day, ${reason}`);
  };

  const handleTagClick = (tag: string) => {
    setIsFilterActive(true);
    if (tag === 'Family Trip') {
      setPassengers(7);
      setBudget(15000);
    } else if (tag === 'Business Travel') {
      setPassengers(4);
      setBudget(12000);
    } else if (tag === 'Budget Saver') {
      setPassengers(4);
      setBudget(5000);
    }
    // Trigger recommendation update after state changes
    setTimeout(() => handleFindBestCar(), 0);
  };

  const displayVehicles = isFilterActive 
    ? vehicles.filter(v => v.pricePerDay <= budget && v.seats >= passengers)
    : vehicles;

  const handleReset = () => {
    setRecommendation(null);
    setIsFilterActive(false);
    setBudget(4000);
    setPassengers(4);
  };

  return (
    <div className="space-y-10">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">Active Bookings</p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-4xl font-black text-[#1E293B]">{activeBookingsCount}</h3>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">
                {activeBookingsCount > 0 ? 'On schedule' : 'No active trips'}
              </span>
            </div>
          </div>
          <ChevronRight className="text-[#CBD5E1] group-hover:text-[#1E293B] transition-colors" size={24} />
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">Total Trips</p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-4xl font-black text-[#1E293B]">{totalTripsCount}</h3>
              <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-lg">
                {totalTripsCount >= 10 ? 'Elite Member' : 'Member'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">Reward Points</p>
              <div className="flex items-center gap-2">
                <h3 className="text-4xl font-black text-[#1E293B]">{rewardPoints.toLocaleString()}</h3>
                <div className="w-6 h-6 bg-[#2563EB] rounded-full flex items-center justify-center">
                  <Star className="text-white w-3.5 h-3.5 fill-white" />
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Next Reward: {nextRewardThreshold} pts</p>
              <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full transition-all duration-500" style={{ width: `${rewardProgress}%` }}></div>
              </div>
            </div>
          </div>
          <button className="w-full py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-bold text-[#2563EB] hover:bg-[#F8FAFC] transition-all">
            Redeem 500 points for 10% off
          </button>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Quick Search */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="text-[#2563EB]" size={24} />
              <h2 className="text-2xl font-bold text-[#1E293B]">Quick Search</h2>
            </div>
            <div className="flex gap-2">
              {['Family Trip', 'Business Travel', 'Budget Saver'].map((chip) => (
                <button 
                  key={chip} 
                  onClick={() => handleTagClick(chip)}
                  className="px-4 py-1.5 rounded-full border border-[#E2E8F0] text-[12px] font-bold text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-[13px] font-bold text-[#64748B] ml-1">Pickup Location</p>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                <input 
                  type="text" 
                  defaultValue="Lahore, Pakistan"
                  className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all font-medium text-[#1E293B]"
                />
              </div>
              <p className="text-[11px] font-bold text-emerald-500 ml-1">
                {displayVehicles.length} cars available for your search
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[13px] font-bold text-[#64748B] ml-1">Return Location</p>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                <input 
                  type="text" 
                  defaultValue="Islamabad, Pakistan"
                  className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all font-medium text-[#1E293B]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[13px] font-bold text-[#64748B] ml-1">Rental Period</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] z-10" size={20} />
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Start Date"
                  className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all font-medium text-[#1E293B]"
                />
              </div>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] z-10" size={20} />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || undefined}
                  placeholderText="End Date"
                  className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all font-medium text-[#1E293B]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#EFF6FF] p-4 rounded-2xl flex items-center gap-3">
            <div className="w-6 h-6 bg-[#2563EB] rounded-full flex items-center justify-center shrink-0">
              <MapPin className="text-white w-3.5 h-3.5" />
            </div>
            <p className="text-[13px] font-bold text-[#1E293B]">
              AI Suggestion: <span className="text-[#2563EB]">Extend return by 1 day</span> for cheaper weekly rates.
            </p>
          </div>
        </div>

        {/* AI Recommendation Card */}
        <div className="bg-[#2563EB] p-10 rounded-[40px] text-white space-y-8 relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Zap className="fill-white" size={24} />
                <h2 className="text-2xl font-bold">AI Recommendation</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                Highly Recommended
              </div>
            </div>

            {recommendation ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-xl p-8 rounded-[32px] border border-white/20 space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-xl font-black">Best match for your budget</h3>
                  <p className="text-xs font-bold opacity-70">Optimized for {passengers === 7 ? '7+' : passengers} passengers</p>
                </div>
                
                <div className="bg-white text-[#2563EB] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit">
                  Highly Recommended
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-bold leading-tight">
                    {recommendation.includes('–') ? (
                      <>
                        <span className="text-white">{recommendation.split(' – ')[0]}</span>
                        <span className="opacity-80 font-medium text-sm block mt-1"> – {recommendation.split(' – ')[1]}</span>
                      </>
                    ) : (
                      <span className="text-white">{recommendation}</span>
                    )}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Price line</span>
                  <span className="text-sm font-black">PKR {budget.toLocaleString()} max</span>
                </div>

                <button 
                  onClick={handleReset}
                  className="w-full mt-4 text-xs font-bold opacity-60 hover:opacity-100 transition-opacity"
                >
                  Reset Search
                </button>
              </motion.div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-bold opacity-80">Daily Budget</p>
                    <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                      <span className="text-sm font-black">PKR {budget.toLocaleString()} max</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="2000" 
                    max="20000" 
                    step="500"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value))}
                    className="w-full accent-white h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex items-center gap-2 text-[11px] font-bold opacity-80">
                    <CheckCircle2 size={14} />
                    Best match for your budget
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold opacity-80">Passengers</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[2, 4, 7].map((num) => (
                      <button 
                        key={num}
                        onClick={() => setPassengers(num)}
                        className={`py-3 rounded-xl font-bold text-sm transition-all ${
                          passengers === num 
                            ? 'bg-white text-[#2563EB]' 
                            : 'bg-white/10 border border-white/20 hover:bg-white/20'
                        }`}
                      >
                        {num === 7 ? '7+' : num}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold opacity-80">
                    <CheckCircle2 size={14} />
                    Optimized for {passengers === 7 ? '7+' : passengers} passengers
                  </div>
                </div>

                <button 
                  onClick={handleFindBestCar}
                  className="w-full bg-white text-[#2563EB] py-5 rounded-3xl font-black text-lg hover:bg-blue-50 transition-all shadow-xl"
                >
                  Find Best Car
                </button>
              </>
            )}
          </div>
          
          {/* Decorative background circles */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full"></div>
          <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full"></div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black tracking-tight text-[#1E293B]">
              {isFilterActive ? 'AI Recommendations' : 'Recommended for you'}
            </h2>
            {isFilterActive && (
              <button 
                onClick={handleReset}
                className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-3 py-1 rounded-full hover:bg-blue-100 transition-all"
              >
                Clear Filter
              </button>
            )}
          </div>
          <Link to="/fleet" className="text-sm font-bold text-[#2563EB] hover:underline">View All</Link>
        </div>

        {displayVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayVehicles.map((vehicle, index) => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                index={index} 
                rentalDays={rentalDays} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
              <Car size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1E293B]">No matches found</h3>
              <p className="text-[#64748B] max-w-xs">Try increasing your budget or adjusting the passenger count.</p>
            </div>
            <button 
              onClick={handleReset}
              className="px-6 py-2 bg-[#2563EB] text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
