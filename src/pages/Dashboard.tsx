import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomCalendar from '../components/ui/CustomCalendar';
import { 
  MapPin, 
  Navigation, 
  Search, 
  TrendingUp, 
  Mountain, 
  ChevronRight, 
  BadgeCheck, 
  XCircle,
  Minus,
  Plus,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { vehicles } = useStore();
  
  // Form State
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
    return new Date();
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
  const [carType, setCarType] = useState('Sedan');
  const [passengers, setPassengers] = useState(4);
  const [transmission, setTransmission] = useState<'Auto' | 'Manual'>('Auto');
  const [needDriver, setNeedDriver] = useState(false);
  const [fuelType, setFuelType] = useState('Petrol');

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

  const handleSearch = () => {
    // Navigate to fleet with applied filters (conceptually)
    navigate('/fleet');
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* Progress Indicator */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-primary uppercase tracking-tighter">Step 1 of 3: Search</span>
          <div className="flex gap-1.5">
            <div className="h-1.5 w-8 bg-primary rounded-full"></div>
            <div className="h-1.5 w-8 bg-slate-200 rounded-full"></div>
            <div className="h-1.5 w-8 bg-slate-200 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column: Search Form (65%) */}
        <div className="lg:w-[65%]">
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-10">Where are you going?</h2>
          
          <div className="bg-white rounded-[32px] p-8 lg:p-10 border border-slate-200 shadow-2xl shadow-slate-200/40">
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              {/* Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-sm font-bold text-slate-500 ml-1">Pickup Location</label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-4 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="City or airport"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary text-slate-900 font-semibold"
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-bold text-slate-500 ml-1">Drop-off Location</label>
                  <div className="relative flex items-center">
                    <Navigation className="absolute left-4 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      placeholder="Same as pickup"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary text-slate-900 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Dates and Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CustomCalendar
                  label="Pickup Date & Time"
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

              {/* Car Specs Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-sm font-bold text-slate-500 ml-1">Car Type</label>
                  <select 
                    value={carType}
                    onChange={(e) => setCarType(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary text-slate-900 font-bold appearance-none cursor-pointer"
                  >
                    <option>Economy</option>
                    <option>Sedan</option>
                    <option>SUV</option>
                    <option>Luxury</option>
                  </select>
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-bold text-slate-500 ml-1">Passengers</label>
                  <div className="flex items-center bg-slate-50 rounded-2xl px-5 py-2 h-[64px]">
                    <button 
                      type="button"
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-200 text-primary transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="bg-transparent border-none text-center font-black w-full text-slate-900 text-lg">
                      {passengers}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setPassengers(Math.min(9, passengers + 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-200 text-primary transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Toggles & Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                <div className="space-y-5">
                  <label className="text-sm font-bold text-slate-500 ml-1">Transmission</label>
                  <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
                    {(['Auto', 'Manual'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTransmission(type)}
                        className={`px-10 py-3 rounded-xl text-sm font-black transition-all ${
                          transmission === type 
                            ? 'bg-white text-primary shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-5">
                  <label className="text-sm font-bold text-slate-500 ml-1">Need a driver?</label>
                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => setNeedDriver(!needDriver)}
                      className={`relative inline-flex h-10 w-16 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-primary ${
                        needDriver ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition-transform ${
                        needDriver ? 'translate-x-8' : 'translate-x-1'
                      }`} />
                    </button>
                    <span className="text-sm font-semibold text-slate-600">Professional chauffeur service</span>
                  </div>
                </div>
              </div>

              {/* Fuel Type Chips */}
              <div className="space-y-5">
                <label className="text-sm font-bold text-slate-500 ml-1">Fuel Type</label>
                <div className="flex flex-wrap gap-4">
                  {['Petrol', 'Diesel', 'Hybrid'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFuelType(type)}
                      className={`px-8 py-3 rounded-full border-2 font-black text-sm transition-all ${
                        fuelType === type
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 text-slate-500 hover:border-primary/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-blue-700 text-white py-6 rounded-2xl text-xl font-black transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 mt-10 active:scale-[0.98]"
              >
                <Search size={24} strokeWidth={3} />
                Search Available Cars
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Hero Content (35%) */}
        <div className="lg:w-[35%] flex flex-col gap-8">
          <div className="relative group h-[500px] rounded-[40px] overflow-hidden shadow-2xl">
            <img 
              alt="Premium Sedan" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-10">
              <span className="bg-primary text-white text-[11px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full w-fit mb-4">Premium Choice</span>
              <h3 className="text-white text-4xl font-black mb-4 leading-tight tracking-tight">Explore Pakistan with comfort.</h3>
              <p className="text-white/80 text-base font-medium leading-relaxed">Experience the thrill of the open road in our top-rated sedan fleet.</p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Popular Destinations</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-sm font-black text-slate-900">Lahore to Islamabad</span>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-primary transition-all" size={20} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border-t border-slate-100">
                <div className="flex items-center gap-4 pt-2">
                  <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary">
                    <Mountain size={20} />
                  </div>
                  <span className="text-sm font-black text-slate-900">Murree Hill Station</span>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-primary transition-all pt-2" size={20} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-4 pt-2">
            <div className="flex items-center gap-3 text-emerald-600">
              <BadgeCheck size={24} />
              <span className="text-sm font-black">Best prices guaranteed</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <XCircle size={24} />
              <span className="text-sm font-bold">Free cancellation up to 24h before</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Fleet Section */}
      <div className="mt-24 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Today's Featured Fleet</h2>
            <p className="text-slate-500 font-medium mt-1">Available at {pickupLocation || 'your location'}</p>
          </div>
          <button 
            onClick={() => navigate('/fleet')}
            className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest hover:gap-3 transition-all"
          >
            Explore Fleet
            <ChevronRight size={18} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles
            .filter((v) => v.status === 'available')
            .slice(0, 3)
            .map((vehicle, idx) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="h-56 overflow-hidden">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{vehicle.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{vehicle.type} • {vehicle.transmission}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-primary">PKR {vehicle.pricePerDay.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Per Day</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                  className="w-full py-4 bg-slate-50 text-slate-900 font-black rounded-xl hover:bg-primary hover:text-white transition-all text-sm"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
