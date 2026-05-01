import React, { useState, useEffect } from 'react';
import CustomCalendar from '../components/ui/CustomCalendar';
import { 
  MapPin, 
  Navigation, 
  Calendar, 
  ChevronDown, 
  Search, 
  Users, 
  Settings, 
  Zap, 
  Mountain,
  RefreshCw,
  Plus,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';

const Fleet: React.FC = () => {
  const { vehicles, user } = useStore();
  const navigate = useNavigate();

  // Search/Filter State
  const [pickupLocation, setPickupLocation] = useState('Lahore, Pakistan');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDate, setPickupDate] = useState<Date | null>(new Date());
  const [returnDate, setReturnDate] = useState<Date | null>(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [transmission, setTransmission] = useState('Any');
  const [fuelType, setFuelType] = useState('Any');
  const [seating, setSeating] = useState('Any');
  const [priceRange, setPriceRange] = useState([8000, 35000]);

  const categories = ['All', 'Sedan', 'SUV', 'Luxury', 'Economy', 'Pickup'];
  const transmissions = ['Auto', 'Manual', 'Any'];
  const fuels = ['Petrol', 'Diesel', 'Hybrid', 'Any'];
  const seats = ['4', '5', '7+', 'Any'];

  const filteredVehicles = vehicles.filter(v => {
    const matchesCategory = selectedCategory === 'All' || v.type === selectedCategory;
    const matchesTransmission = transmission === 'Any' || 
      (transmission === 'Auto' && v.transmission === 'Automatic') ||
      (transmission === 'Manual' && v.transmission === 'Manual');
    const matchesFuel = fuelType === 'Any' || v.fuel === fuelType;
    const matchesSeating = seating === 'Any' || 
      (seating === '4' && v.seats === 4) ||
      (seating === '5' && v.seats === 5) ||
      (seating === '7+' && v.seats >= 7);
    const matchesPrice = v.pricePerDay >= priceRange[0] && v.pricePerDay <= priceRange[1];

    return matchesCategory && matchesTransmission && matchesFuel && matchesSeating && matchesPrice;
  });

  return (
    <div className="-mt-8 -mx-8 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden py-24 px-6">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-30 filter grayscale-[0.2]" 
            src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=2000"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-transparent to-slate-50"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
          {/* Hero Content */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6 uppercase">
              Find Your <span className="text-primary italic">Perfect</span> Car
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Experience precision engineering and seamless luxury across Pakistan. Premium fleet for your premium life.
            </p>
          </div>

          {/* Search Form Card */}
          <div className="w-full bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl p-8 md:p-12 border border-white/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Row 1: Locations */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Pickup Location</label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="City or Airport"
                    className="w-full pl-14 pr-6 py-4 bg-slate-100 rounded-[20px] border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-slate-900 font-bold placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Drop-off Location</label>
                <div className="relative group">
                  <Navigation className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="text"
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    placeholder="Same as pickup"
                    className="w-full pl-14 pr-6 py-4 bg-slate-100 rounded-[20px] border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-slate-900 font-bold placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Row 2: Dates */}
              <CustomCalendar
                label="Pickup Date & Time"
                selected={pickupDate}
                onChange={(date) => setPickupDate(date)}
                showTimeSelect
              />
              <CustomCalendar
                label="Return Date & Time"
                selected={returnDate}
                onChange={(date) => setReturnDate(date)}
                minDate={pickupDate || undefined}
                showTimeSelect
              />
            </div>

            {/* Row 3: Vehicle Category */}
            <div className="mb-10">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 block mb-4">Vehicle Category</label>
              <div className="flex flex-wrap gap-2.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-3 rounded-full text-xs font-black transition-all ${
                      selectedCategory === cat 
                        ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 4: Detailed Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10 border-t border-slate-100 pt-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Transmission</label>
                <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl w-full">
                  {transmissions.map(t => (
                    <button
                      key={t}
                      onClick={() => setTransmission(t)}
                      className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        transmission === t 
                          ? 'bg-white text-primary shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Fuel Type</label>
                <div className="flex flex-wrap gap-2">
                  {fuels.map(f => (
                    <button
                      key={f}
                      onClick={() => setFuelType(f)}
                      className={`px-4 py-2.5 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        fuelType === f
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-100 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Seating</label>
                <div className="flex gap-3">
                  {seats.map(s => (
                    <button
                      key={s}
                      onClick={() => setSeating(s)}
                      className={`size-12 flex items-center justify-center rounded-full text-xs font-black transition-all ${
                        seating === s
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 5: CTA */}
            <div className="flex flex-col items-center">
              <button 
                className="w-full md:w-auto px-16 py-5 bg-primary hover:bg-blue-700 text-white rounded-3xl text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-6"
              >
                <span>Show Available Vehicles</span>
                <div className="h-6 w-px bg-white/20"></div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">{filteredVehicles.length} cars found</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-24 px-8 max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Explore Fleet</h2>
            <div className="h-1.5 w-16 bg-primary rounded-full"></div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm font-bold text-slate-400">Sort by: <span className="text-slate-900">Featured</span></p>
            <ChevronDown size={18} className="text-slate-400" />
          </div>
        </div>

        {filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredVehicles.map((vehicle, idx) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
                onClick={() => navigate(`/vehicle/${vehicle.id}`)}
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute top-6 left-6 z-10">
                    <span className="px-5 py-2 bg-white/80 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white">
                      Available
                    </span>
                  </div>
                  <img 
                    src={vehicle.image} 
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">{vehicle.name}</h3>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{vehicle.type} • {vehicle.transmission}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary leading-none">PKR {vehicle.pricePerDay.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Per Day</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-6 border-t border-slate-50 pt-8 mt-4">
                    <div className="flex items-center gap-2.5">
                      <Users className="text-slate-400" size={18} />
                      <span className="text-xs font-black text-slate-600">{vehicle.seats} Seats</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Settings className="text-slate-400" size={18} />
                      <span className="text-xs font-black text-slate-600">{vehicle.transmission}</span>
                    </div>
                    {vehicle.fuel === 'Hybrid' && (
                      <div className="flex items-center gap-2.5">
                        <Zap className="text-emerald-500" size={18} />
                        <span className="text-xs font-black text-emerald-600">Hybrid</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200">
            <Search className="w-16 h-16 text-slate-100 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900">No vehicles matching your criteria</h3>
            <p className="text-slate-400 mt-2 font-medium">Try broadening your filters or checking different dates.</p>
            <button 
              onClick={() => {
                setSelectedCategory('All');
                setTransmission('Any');
                setFuelType('Any');
                setSeating('Any');
                setPriceRange([0, 100000]);
              }}
              className="mt-8 text-primary font-black text-xs uppercase tracking-[0.2em] hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* Admin Quick Action */}
      {user?.role === 'admin' && (
        <div className="fixed bottom-10 right-10 z-50">
          <Link 
            to="/add-vehicle"
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-full font-black text-sm shadow-2xl hover:scale-105 transition-all group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Add Vehicle
          </Link>
        </div>
      )}
    </div>
  );
};

export default Fleet;
