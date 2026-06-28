import React, { useState, useEffect, useMemo } from 'react';
import CustomCalendar from '../components/ui/CustomCalendar';
import { MapPlacesAutocomplete } from '../components/ui/MapPlacesAutocomplete';
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
  X,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

const Fleet: React.FC = () => {
  const { vehicles, user, allBookings } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Search/Filter State
  const [pickupLocation, setPickupLocation] = useState(() => {
    return localStorage.getItem('elitedrive_pickup_location') || 'Lahore, Pakistan';
  });
  const [dropoffLocation, setDropoffLocation] = useState(() => {
    return localStorage.getItem('elitedrive_dropoff_location') || '';
  });
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

  // AI Recommendation State
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiBudget, setAiBudget] = useState('');
  const [aiTravelType, setAiTravelType] = useState('in_city');
  const [aiPreferences, setAiPreferences] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handlePickupDateChange = (date: Date | null) => {
    setPickupDate(date);
    if (date && returnDate && date >= returnDate) {
      setReturnDate(new Date(date.getTime() + 1 * 24 * 60 * 60 * 1000));
    }
  };
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return searchParams.get('category') || 'All';
  });
  const [transmission, setTransmission] = useState(() => {
    const trans = searchParams.get('transmission');
    if (trans === 'Automatic') return 'Auto';
    if (trans === 'Manual') return 'Manual';
    return 'Any';
  });
  const [fuelType, setFuelType] = useState('Any');
  const [seating, setSeating] = useState('Any');
  const [priceRange, setPriceRange] = useState([0, 200000]);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    const transmissionParam = searchParams.get('transmission');
    if (transmissionParam) {
      if (transmissionParam === 'Automatic') {
        setTransmission('Auto');
      } else if (transmissionParam === 'Manual') {
        setTransmission('Manual');
      } else {
        setTransmission(transmissionParam);
      }
    }
  }, [searchParams]);

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

  const categories = ['All', 'Sedan', 'SUV', 'Luxury', 'Economy', 'Hatchback', 'Pickup'];
  const transmissions = ['Auto', 'Manual', 'Any'];
  const fuels = ['Petrol', 'Diesel', 'Hybrid', 'Any'];
  const seats = ['4', '5', '7+', 'Any'];

  const filteredVehicles = vehicles.filter(v => {
    const activeBooking = allBookings.find(b => b.vehicleId === v.id && (b.status === 'active' || b.status === 'pending'));
    const isPastReturn = activeBooking && new Date() >= new Date(activeBooking.endDate);
    const effectiveStatus = (v.status === 'booked' || v.status === 'rented') && isPastReturn ? 'available' : v.status;
    const matchesAvailability = effectiveStatus === 'available' || v.status === 'booked' || v.status === 'rented';
    const matchesCategory = selectedCategory === 'All' || 
      v.type.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Economy' && v.pricePerDay < 8000);
    const matchesTransmission = transmission === 'Any' || 
      (transmission === 'Auto' && v.transmission === 'Automatic') ||
      (transmission === 'Manual' && v.transmission === 'Manual');
    const matchesFuel = fuelType === 'Any' || v.fuel === fuelType;
    const matchesSeating = seating === 'Any' || 
      (seating === '4' && v.seats === 4) ||
      (seating === '5' && v.seats === 5) ||
      (seating === '7+' && v.seats >= 7);
    const matchesPrice = v.pricePerDay >= priceRange[0] && v.pricePerDay <= priceRange[1];

    return matchesAvailability && matchesCategory && matchesTransmission && matchesFuel && matchesSeating && matchesPrice;
  });

  const handleGetRecommendations = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const token = localStorage.getItem('elitedrive_token');
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          budget: aiBudget ? Number(aiBudget) : undefined,
          travelType: aiTravelType,
          preferences: aiPreferences,
          pickupLocation,
          dropoffLocation,
          pickupDate: pickupDate?.toISOString(),
          returnDate: returnDate?.toISOString()
        })
      });
      const data = await response.json();
      setAiResult(data);
    } catch (err) {
      console.error("AI Recommendation error: ", err);
    } finally {
      setAiLoading(false);
    }
  };

  const recommendedVehicles = useMemo(() => {
    if (!isAiMode || !aiResult || !aiResult.recommendedVehicleIds) return [];
    return aiResult.recommendedVehicleIds.map((id: string) => {
      const v = vehicles.find(item => item.id === id);
      const rec = aiResult.recommendations?.find((r: any) => r.vehicleId === id);
      return v ? { ...v, reasoning: rec?.reasoning } : null;
    }).filter(Boolean);
  }, [isAiMode, aiResult, vehicles]);

  const displayVehicles = useMemo(() => {
    return isAiMode && aiResult ? recommendedVehicles : filteredVehicles;
  }, [isAiMode, aiResult, recommendedVehicles, filteredVehicles]);

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
            {/* Recommendation Mode Switcher */}
            <div className="flex justify-center mb-10">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setIsAiMode(false)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${!isAiMode ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Manual Filters
                </button>
                <button
                  type="button"
                  onClick={() => setIsAiMode(true)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${isAiMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Sparkles size={14} />
                  AI Recommendation
                </button>
              </div>
            </div>

            {!isAiMode ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  {/* Row 1: Locations */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Pickup Location</label>
                    <MapPlacesAutocomplete
                      value={pickupLocation}
                      onChange={setPickupLocation}
                      placeholder="City or Airport"
                      className="w-full pl-14 pr-6 py-4 bg-slate-100 rounded-[20px] border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-slate-900 font-bold placeholder:text-slate-400"
                      icon={<MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors z-10" size={20} />}
                      fieldName="pickup"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Drop-off Location</label>
                    <MapPlacesAutocomplete
                      value={dropoffLocation}
                      onChange={setDropoffLocation}
                      placeholder="Same as pickup"
                      className="w-full pl-14 pr-6 py-4 bg-slate-100 rounded-[20px] border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-slate-900 font-bold placeholder:text-slate-400"
                      icon={<Navigation className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors z-10" size={20} />}
                      fieldName="dropoff"
                    />
                  </div>

                  {/* Row 2: Dates */}
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
              </>
            ) : (
              <div className="space-y-8">
                {/* AI Input Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Pickup & Drop-off (for distance context) */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Pickup Location</label>
                    <MapPlacesAutocomplete
                      value={pickupLocation}
                      onChange={setPickupLocation}
                      placeholder="City or Airport"
                      className="w-full pl-14 pr-6 py-4 bg-slate-100 rounded-[20px] border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-slate-900 font-bold placeholder:text-slate-400"
                      icon={<MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors z-10" size={20} />}
                      fieldName="pickup"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Drop-off Location</label>
                    <MapPlacesAutocomplete
                      value={dropoffLocation}
                      onChange={setDropoffLocation}
                      placeholder="Same as pickup"
                      className="w-full pl-14 pr-6 py-4 bg-slate-100 rounded-[20px] border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-slate-900 font-bold placeholder:text-slate-400"
                      icon={<Navigation className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors z-10" size={20} />}
                      fieldName="dropoff"
                    />
                  </div>

                  {/* Dates for availability checks */}
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

                  {/* AI Specifics */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Max Daily Budget (PKR)</label>
                    <input
                      type="number"
                      value={aiBudget}
                      onChange={(e) => setAiBudget(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full px-6 py-4 bg-slate-100 rounded-[20px] border-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-900 font-bold placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Travel Type & Terrain</label>
                    <select
                      value={aiTravelType}
                      onChange={(e) => setAiTravelType(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-100 rounded-[20px] border-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-900 font-bold"
                    >
                      <option value="in_city">In-City Commute (Fuel Efficiency focus)</option>
                      <option value="out_city">Out-City Highway (Comfort & Speed focus)</option>
                      <option value="mountainous">Mountainous Terrain (Naran/Kaghan/Hunza 4x4)</option>
                      <option value="family_trip">Family Trip (Maximum Seating & Space)</option>
                      <option value="business">Executive/Business (Luxury & Presentation)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">AI Preference Hints & Requirements</label>
                  <textarea
                    value={aiPreferences}
                    onChange={(e) => setAiPreferences(e.target.value)}
                    placeholder="e.g. 'I need a sleek black sedan with sunroof, or a premium hybrid for high fuel efficiency'"
                    className="w-full h-24 px-6 py-4 bg-slate-100 rounded-[20px] border-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-900 font-bold placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* AI Submit Button */}
                <div className="flex flex-col items-center border-t border-slate-100 pt-8">
                  <button 
                    type="button"
                    onClick={handleGetRecommendations}
                    disabled={aiLoading}
                    className="w-full md:w-auto px-16 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-3xl text-lg font-black shadow-2xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    <Sparkles size={20} className={aiLoading ? 'animate-pulse' : ''} />
                    <span>{aiLoading ? 'Asking Gemini Recommendation Engine...' : 'Generate AI Recommendations'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-24 px-8 max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
              {isAiMode && aiResult ? 'AI Recommended Fleet' : 'Explore Fleet'}
            </h2>
            <div className="h-1.5 w-16 bg-primary rounded-full"></div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm font-bold text-slate-400">Sort by: <span className="text-slate-900">Featured</span></p>
            <ChevronDown size={18} className="text-slate-400" />
          </div>
        </div>

        {isAiMode && aiResult && aiResult.generalAdvice && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-[30px] p-8 flex items-start gap-5 shadow-sm">
            <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-md shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Gemini AI Recommendation Travel Tip & Advice
              </h4>
              <p className="text-slate-600 mt-2 font-medium leading-relaxed">{aiResult.generalAdvice}</p>
            </div>
          </div>
        )}

        {displayVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {displayVehicles.map((vehicle: any, idx) => {
              const activeBooking = allBookings.find(b => b.vehicleId === vehicle.id && (b.status === 'active' || b.status === 'pending'));
              const isPastReturn = activeBooking && new Date() >= new Date(activeBooking.endDate);
              const isCurrentlyBooked = (vehicle.status === 'booked' || vehicle.status === 'rented') && !isPastReturn;

              return (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                >
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute top-6 left-6 z-10 flex gap-2">
                      {isCurrentlyBooked ? (
                        <span className="px-5 py-2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-amber-400 shadow-md">
                          Booked
                        </span>
                      ) : (
                        <span className="px-5 py-2 bg-white/80 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white">
                          Available
                        </span>
                      )}
                      {vehicle.reasoning && (
                        <span className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-500 shadow-md flex items-center gap-1.5">
                          <Sparkles size={10} />
                          AI Pick
                        </span>
                      )}
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
                        {isCurrentlyBooked && activeBooking && (
                          <p className="text-amber-600 font-black text-xs mt-3 bg-amber-50/80 px-4 py-2 border border-amber-100 rounded-2xl inline-block leading-relaxed tracking-wide">
                            {vehicle.name} will be available by {new Date(activeBooking.endDate).toLocaleString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary leading-none">PKR {vehicle.pricePerDay.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Per Day</p>
                      </div>
                    </div>
                    
                    {vehicle.reasoning && (
                      <p className="mb-6 text-xs font-semibold text-indigo-600 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 italic leading-relaxed flex gap-2">
                        <span>✨</span>
                        <span>{vehicle.reasoning}</span>
                      </p>
                    )}

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
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200">
            <Search className="w-16 h-16 text-slate-100 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900">
              {isAiMode ? 'No AI recommendations generated yet' : 'No vehicles matching your criteria'}
            </h3>
            <p className="text-slate-400 mt-2 font-medium">
              {isAiMode ? 'Fill out your budget, travel type, and click "Generate AI Recommendations" above!' : 'Try broadening your filters or checking different dates.'}
            </p>
            {!isAiMode && (
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
            )}
          </div>
        )}
      </section>

      {/* Admin/Manager Quick Action */}
      {(user?.role === 'admin' || user?.role === 'manager') && (
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
