import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CustomCalendar from '../components/ui/CustomCalendar';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Car as CarIcon, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck, 
  Compass, 
  Users, 
  Zap,
  CheckCircle2,
  CalendarCheck,
  Star,
  Sparkles,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { vehicles, user, allBookings } = useStore();
  
  // Search Form State
  const [pickupLocation, setPickupLocation] = useState('Lahore, Pakistan');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [pickupDate, setPickupDate] = useState<Date | null>(() => {
    const saved = localStorage.getItem('elitedrive_pickup_date');
    if (saved) {
      const parsed = new Date(saved);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      if (parsed >= startOfToday) return parsed;
    }
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  });
  const [returnDate, setReturnDate] = useState<Date | null>(() => {
    const saved = localStorage.getItem('elitedrive_return_date');
    if (saved) {
      const parsed = new Date(saved);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      if (parsed >= startOfToday) return parsed;
    }
    const base = new Date();
    return new Date(base.getTime() + 3 * 24 * 60 * 60 * 1000);
  });

  const handlePickupDateChange = (date: Date | null) => {
    setPickupDate(date);
    if (date && returnDate && date >= returnDate) {
      setReturnDate(new Date(date.getTime() + 1 * 24 * 60 * 60 * 1000));
    }
  };
  const [carType, setCarType] = useState('All');
  const [transmission, setTransmission] = useState('Any');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isTransmissionOpen, setIsTransmissionOpen] = useState(false);

  useEffect(() => {
    if (pickupDate) {
      localStorage.setItem('elitedrive_pickup_date', pickupDate.toISOString());
    }
  }, [pickupDate]);

  useEffect(() => {
    if (returnDate) {
      localStorage.setItem('elitedrive_return_date', returnDate.toISOString());
    }
  }, [returnDate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let query = `/fleet?category=${carType}`;
    if (transmission !== 'Any') {
      query += `&transmission=${transmission}`;
    }
    navigate(query);
  };

  // Get a few featured available vehicles
  const featuredCars = vehicles
    .filter(v => {
      const activeBooking = allBookings.find(b => b.vehicleId === v.id && (b.status === 'active' || b.status === 'pending'));
      const isPastReturn = activeBooking && new Date() >= new Date(activeBooking.endDate);
      const effectiveStatus = (v.status === 'booked' || v.status === 'rented') && isPastReturn ? 'available' : v.status;
      return effectiveStatus === 'available';
    })
    .slice(0, 3);

  return (
    <div className="bg-slate-50 font-display -mt-6 -mx-6 md:-mt-8 md:-mx-10 lg:-mx-12 min-h-screen">
      
      {/* Hero Header Section */}
      <section className="relative bg-gradient-to-br from-[#0B1528] via-[#101F42] to-[#1A316C] py-24 px-6 md:px-12 text-white overflow-hidden">
        
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6 text-center xl:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight uppercase font-display">
              Car rentals for <br />
              <span className="text-blue-400 italic">any kind</span> of trip in Pakistan
            </h1>
            
            <p className="text-slate-300 text-base md:text-lg max-w-2xl font-medium leading-relaxed mx-auto xl:mx-0">
              EliteDrive brings you precision-engineered sedans, luxurious SUVs, and smart hatchbacks. View real-time availability and find your perfect ride.
            </p>

            {!user && (
              <div className="flex flex-wrap gap-4 items-center justify-center xl:justify-start pt-2">
                <Link 
                  to="/auth?tab=signup" 
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create Account
                </Link>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest hidden sm:block">Or</div>
                <Link 
                  to="/auth?tab=login" 
                  className="px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-2xl text-sm font-black uppercase tracking-wider transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Quick Stats Block/Visual (only visible on large monitors to balance layout) */}
          <div className="hidden xl:block xl:col-span-5 relative">
            <div className="relative z-10 p-2 transform rotate-2">
              <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-8 border border-white/10 shadow-3xl text-white space-y-6">
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                  <div className="size-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-300">
                    <CarIcon size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-lg">Verified Fleet</h4>
                    <p className="text-xs text-slate-300">100% Quality Inspected</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Cities Covered</p>
                    <p className="text-2xl font-black text-blue-300">Lahore, KHI, ISB</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Daily Chauffeur</p>
                    <p className="text-2xl font-black text-blue-300">Available</p>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Booking Form Overlay / Input Section */}
      <section className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <form 
          onSubmit={handleSearch}
          className="bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl border border-slate-100 p-8 md:p-10 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            
            {/* Pick-up location */}
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 block px-1">Pickup Location</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60" size={18} />
                <input 
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Where are you picking up from?"
                  className="w-full pl-12 pr-4 py-4 bg-slate-100 text-slate-900 font-bold rounded-2xl border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm placeholder:text-slate-400 placeholder:font-medium"
                  required
                />
              </div>
            </div>

            {/* Drop-off location */}
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 block px-1">Drop-off Destination</label>
              <div className="relative group">
                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60" size={18} />
                <input 
                  type="text"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder="Same as pickup location"
                  className="w-full pl-12 pr-4 py-4 bg-slate-100 text-slate-900 font-bold rounded-2xl border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>
            </div>

          </div>

          {/* Dates & Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-5">
            <CustomCalendar
              label="Collection Date & Time"
              selected={pickupDate}
              onChange={handlePickupDateChange}
              minDate={todayStart}
              showTimeSelect
            />
            <CustomCalendar
              label="Return Date & Time"
              selected={returnDate}
              onChange={(date) => setReturnDate(date)}
              minDate={pickupDate || todayStart}
              showTimeSelect
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-5">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 block px-1">Vehicle Category</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCategoryOpen(!isCategoryOpen);
                    setIsTransmissionOpen(false);
                  }}
                  className="w-full px-5 py-4 bg-slate-100 text-slate-900 font-bold rounded-2xl flex items-center justify-between cursor-pointer outline-none text-sm group transition-all text-left focus:ring-2 focus:ring-primary/20 focus:bg-white"
                >
                  <span>{
                    carType === 'All' ? 'All Categories' : carType
                  }</span>
                  <ChevronDown className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180 text-primary' : ''}`} size={18} />
                </button>

                {isCategoryOpen && (
                  <>
                    <div className="fixed inset-0 z-35" onClick={() => setIsCategoryOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-45 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      {[
                        { value: 'All', label: 'All Categories' },
                        { value: 'Hatchback', label: 'Hatchback' },
                        { value: 'Sedan', label: 'Sedan' },
                        { value: 'SUV', label: 'SUV' },
                        { value: 'Luxury', label: 'Luxury' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setCarType(opt.value);
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors block ${
                            carType === opt.value
                              ? 'bg-blue-50 text-blue-600 font-black'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Transmission */}
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 block px-1">Gearbox</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTransmissionOpen(!isTransmissionOpen);
                    setIsCategoryOpen(false);
                  }}
                  className="w-full px-5 py-4 bg-slate-100 text-slate-900 font-bold rounded-2xl flex items-center justify-between cursor-pointer outline-none text-sm group transition-all text-left focus:ring-2 focus:ring-primary/20 focus:bg-white"
                >
                  <span>{
                    transmission === 'Any' ? 'Any Transmission' :
                    transmission === 'Automatic' ? 'Automatic Only' :
                    transmission === 'Manual' ? 'Manual Only' : transmission
                  }</span>
                  <ChevronDown className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isTransmissionOpen ? 'rotate-180 text-primary' : ''}`} size={18} />
                </button>

                {isTransmissionOpen && (
                  <>
                    <div className="fixed inset-0 z-35" onClick={() => setIsTransmissionOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-45 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      {[
                        { value: 'Any', label: 'Any Transmission' },
                        { value: 'Automatic', label: 'Automatic Only' },
                        { value: 'Manual', label: 'Manual Only' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setTransmission(opt.value);
                            setIsTransmissionOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors block ${
                            transmission === opt.value
                              ? 'bg-blue-50 text-blue-600 font-black'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="pt-4 flex justify-center border-t border-slate-100">
            <button 
              type="submit"
              className="w-full md:w-auto px-16 py-4.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black uppercase tracking-wider shadow-2xl shadow-blue-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-4"
            >
              <Search size={18} />
              <span>Search Available Cars</span>
            </button>
          </div>
        </form>
      </section>

      {/* Sign In & Save Promo Card */}
      {!user && (
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-gradient-to-r from-blue-50 via-[#EBF5FF] to-indigo-50 border border-blue-100 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 text-center sm:text-left">
              <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                Promotion
              </span>
              <h3 className="text-xl font-black text-slate-950">Sign In, Save Money</h3>
              <p className="text-slate-500 font-medium text-sm">
                Get an instant 10% discount on standard rentals using promo code **WELCOME** upon registering.
              </p>
            </div>
            <Link 
              to="/auth?tab=signup" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg transition-all"
            >
              Register Now
            </Link>
          </div>
        </section>
      )}

      {/* Featured Vehicles Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={24} /> Popular Rentals
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Top selected vehicles available for instant reservation right now.
            </p>
          </div>
          <Link 
            to="/fleet" 
            className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            Explore Full Fleet <ArrowRight size={14} />
          </Link>
        </div>

        {/* Vehicles Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCars.length > 0 ? (
            featuredCars.map((vehicle) => (
              <div 
                key={vehicle.id} 
                onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                className="group bg-white rounded-3xl border border-slate-200/65 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden bg-slate-50">
                  <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black text-emerald-600 uppercase tracking-wider shadow-sm border border-slate-100">
                    Available
                  </span>
                  <img 
                    src={vehicle.image} 
                    alt={vehicle.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{vehicle.type}</span>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5">{vehicle.name}</h4>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-3 border-t border-slate-50">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-slate-400" /> {vehicle.seats} Seats
                    </span>
                    <span className="text-slate-900 font-extrabold text-base">
                      PKR {vehicle.pricePerDay.toLocaleString()} <span className="text-[10px] font-bold text-slate-400 uppercase tracking-normal">/ day</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10 bg-white border border-dashed rounded-3xl text-slate-400 font-medium">
              Loading top rental suggestions...
            </div>
          )}
        </div>
      </section>

      {/* Promotional / Why EliteDrive Segment */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-slate-900 text-white rounded-[40px] p-8 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
          
          <div className="relative z-10 space-y-8 max-w-3xl">
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">The EliteDrive Guarantee</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-2">
                <div className="size-10 bg-blue-500/20 border border-blue-400/20 rounded-xl flex items-center justify-center text-blue-400">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="font-bold text-base">Full Collision Coverage</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Select basic or zero-deductible CDW cover easily during details checkout, keeping you and your family safe.
                </p>
              </div>

              <div className="space-y-2">
                <div className="size-10 bg-blue-500/20 border border-blue-400/20 rounded-xl flex items-center justify-center text-blue-400">
                  <CheckCircle2 size={20} />
                </div>
                <h4 className="font-bold text-base">Instant Confirmation</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Once booking details are clear, lock down your preferred model instantly. Never stand in line again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Small bottom separator */}
      <div className="h-10"></div>
    </div>
  );
};

export default Landing;
