import React from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Star, 
  Users, 
  Zap, 
  Fuel, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  Calendar,
  MapPin,
  Heart,
  Share2,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import { calculateBaseFare } from '../utils/pricing';

const VehicleDetails: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { vehicles, user, showToast, allBookings, toggleFavorite } = useStore();
  const vehicle = vehicles.find(v => v.id === id);
  const isFavorite = vehicle ? user?.favorites?.includes(vehicle.id) : false;

  const [selectedImage, setSelectedImage] = React.useState('');
  const lastVehicleId = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (vehicle) {
      if (lastVehicleId.current !== vehicle.id || !selectedImage) {
        setSelectedImage(vehicle.image);
        lastVehicleId.current = vehicle.id;
      }
    }
  }, [vehicle, selectedImage]);

  const activeBooking = vehicle ? allBookings.find(b => b.vehicleId === vehicle.id && (b.status === 'active' || b.status === 'pending')) : null;
  const isPastReturn = activeBooking && new Date() >= new Date(activeBooking.endDate);
  const effectiveStatus = vehicle ? (((vehicle.status === 'booked' || vehicle.status === 'rented') && isPastReturn) ? 'available' : vehicle.status) : 'available';
  const hasPendingBooking = activeBooking && activeBooking.status === 'pending';
  const isVerified = user?.emailVerified || 
                      (user?.email && ['ahmed12@gmail.com', 'tj334767@gmail.com'].includes(user.email.toLowerCase()));

  const startDate = (() => {
    const saved = localStorage.getItem('elitedrive_pickup_date');
    if (saved) return new Date(saved);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  })();

  const endDate = (() => {
    const saved = localStorage.getItem('elitedrive_return_date');
    if (saved) return new Date(saved);
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + 3);
    return d;
  })();

  const rentalDays = (() => {
    if (!startDate || !endDate) return 1;
    const startObj = new Date(startDate);
    startObj.setHours(0, 0, 0, 0);
    const endObj = new Date(endDate);
    endObj.setHours(0, 0, 0, 0);
    const dTime = Math.abs(endObj.getTime() - startObj.getTime());
    const dDays = Math.round(dTime / (1000 * 60 * 60 * 24));
    return Math.max(1, dDays);
  })();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!vehicle) return <div>Vehicle not found</div>;

  return (
    <div className="max-w-full mx-auto space-y-8 pb-16 px-10 md:px-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#64748B] font-black text-xs hover:text-[#1E293B] transition-all"
        >
          <ChevronLeft size={18} />
          Back to Fleet
        </button>
        <div className="flex gap-2">
          <button className="w-9 h-9 bg-white border border-[#E2E8F0] rounded-full flex items-center justify-center text-[#64748B] hover:text-[#2563EB] transition-all">
            <Share2 size={16} />
          </button>
          <button 
            onClick={() => vehicle && toggleFavorite(vehicle.id)}
            className={`w-9 h-9 border rounded-full flex items-center justify-center transition-all ${
              isFavorite 
                ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600' 
                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-red-500 hover:border-red-500'
            }`}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image & Gallery */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={selectedImage}
            className="aspect-video rounded-[32px] overflow-hidden shadow-xl shadow-blue-100/50 border border-gray-100"
          >
            <img 
              src={selectedImage || vehicle.image} 
              alt={vehicle.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
              }}
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 max-w-xl">
            {(() => {
              // Gather primary image and actual uploaded gallery images
              const gathered = [
                vehicle.image,
                ...(vehicle.images || [])
              ].filter(img => !!img);

              return gathered.map((img, i) => {
                const isActive = selectedImage === img;
                return (
                  <div 
                    key={i} 
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-[16px] overflow-hidden border cursor-pointer hover:border-blue-600 hover:scale-105 transition-all p-0.5 ${
                      isActive ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-[#E2E8F0]'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Gallery view ${i + 1}`} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
                      }}
                      className="w-full h-full object-cover rounded-[14px]" 
                    />
                  </div>
                );
              });
            })()}
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 space-y-6 shadow-sm">
            <h3 className="text-lg font-black text-[#1E293B]">Key Features</h3>
            <div className="grid grid-cols-2 gap-4">
              {vehicle.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-[#64748B]">
                  <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="text-emerald-500 w-3 h-3" />
                  </div>
                  <span className="font-bold text-xs">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Info & Booking */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#2563EB] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md shadow-blue-100">Premium</span>
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-black text-[#1E293B]">{vehicle.rating} ({vehicle.reviews || 0}+ Reviews)</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight text-[#1E293B]">{vehicle.name}</h1>
              <span className="text-xs font-mono font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 uppercase mt-1">
                ID: {vehicle.id}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#64748B] font-bold text-sm">
              <MapPin size={16} className="text-[#2563EB]" />
              {vehicle.location}, Pakistan
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-[20px] border border-gray-100 text-center shadow-sm">
              <Users className="mx-auto mb-2 text-[#2563EB]" size={20} />
              <p className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">Seats</p>
              <p className="font-black text-[#1E293B] text-sm">{vehicle.seats} People</p>
            </div>
            <div className="bg-white p-4 rounded-[20px] border border-gray-100 text-center shadow-sm">
              <Zap className="mx-auto mb-2 text-[#2563EB]" size={20} />
              <p className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">Gearbox</p>
              <p className="font-black text-[#1E293B] text-sm">{vehicle.transmission}</p>
            </div>
            <div className="bg-white p-4 rounded-[20px] border border-gray-100 text-center shadow-sm">
              <Fuel className="mx-auto mb-2 text-[#2563EB]" size={20} />
              <p className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">Fuel</p>
              <p className="font-black text-[#1E293B] text-sm">{vehicle.fuel}</p>
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-8 rounded-[40px] space-y-6 border border-[#F1F5F9]">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Total Price</p>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h2 className="text-3xl font-black text-[#1E293B]">PKR {calculateBaseFare(vehicle, rentalDays, 'daily').toLocaleString()}</h2>
                  {calculateBaseFare(vehicle, rentalDays, 'daily') < (vehicle.pricePerDay * rentalDays) && (
                    <span className="text-sm font-bold text-slate-400 line-through">PKR {(vehicle.pricePerDay * rentalDays).toLocaleString()}</span>
                  )}
                </div>
                <p className="text-[#64748B] font-bold text-xs">
                  PKR {vehicle.pricePerDay.toLocaleString()} / Day • {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}
                  {calculateBaseFare(vehicle, rentalDays, 'daily') < (vehicle.pricePerDay * rentalDays) && (
                    <span className="text-emerald-600 font-extrabold ml-2 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider inline-block">Discount Included</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                {hasPendingBooking ? (
                  <p className="text-[10px] font-black text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full inline-block mb-1 shadow-sm border border-amber-250 uppercase tracking-wider">Booking in process</p>
                ) : vehicle.status === 'booked' ? (
                  <p className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full inline-block mb-1 shadow-sm border border-amber-100">Currently Booked</p>
                ) : vehicle.status === 'rented' ? (
                  <p className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full inline-block mb-1 shadow-sm border border-blue-100">Rented</p>
                ) : vehicle.status === 'maintenance' ? (
                  <p className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full inline-block mb-1 shadow-sm border border-rose-100">Under Maintenance</p>
                ) : (
                  <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full inline-block mb-1 shadow-sm border border-emerald-100">Available Now</p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4 bg-white p-5 rounded-[20px] border border-[#E2E8F0] shadow-sm">
                <Calendar className="text-[#2563EB]" size={20} />
                <div className="flex-1">
                  <p className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">Rental Period</p>
                  <p className="font-black text-[#1E293B] text-sm">{formatDate(startDate)} - {formatDate(endDate)}, {endDate.getFullYear()} ({rentalDays} {rentalDays === 1 ? 'Day' : 'Days'})</p>
                </div>
              </div>

              {!user ? (
                <div className="bg-blue-50 p-5 rounded-[20px] border border-blue-100 flex items-start gap-3">
                  <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1">
                    <p className="text-xs font-black text-blue-600 uppercase tracking-wider">Sign-in Required</p>
                    <p className="text-[11px] font-bold text-blue-500 leading-relaxed">
                      Please register or log in to secure this vehicle and complete your reservation.
                    </p>
                    <Link to="/auth?tab=login" className="text-[11px] font-black text-blue-600 underline uppercase tracking-wider block pt-1">
                      Sign In Now
                    </Link>
                  </div>
                </div>
              ) : !isVerified ? (
                <div className="bg-rose-50 p-5 rounded-[20px] border border-rose-100 flex items-start gap-3">
                  <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1">
                    <p className="text-xs font-black text-rose-600 uppercase tracking-wider">Verification Required</p>
                    <p className="text-[11px] font-bold text-rose-500 leading-relaxed">
                      You must verify your email and phone number in your profile before you can book a vehicle.
                    </p>
                    <Link to="/profile" className="text-[11px] font-black text-rose-600 underline uppercase tracking-wider block pt-1">
                      Go to Profile
                    </Link>
                  </div>
                </div>
              ) : null}

              <Link 
                to={!user 
                  ? '/auth?tab=login' 
                  : (user && (user.outstandingBalance || 0) > 0)
                    ? '/dashboard?view=balance'
                    : (isVerified && effectiveStatus === 'available' && !hasPendingBooking && !user.isBlacklisted 
                      ? `/payment/${vehicle?.id}?days=${rentalDays}` 
                      : '#')
                }
                onClick={(e) => {
                  if (hasPendingBooking) {
                    e.preventDefault();
                    showToast('This vehicle has a pending booking request under administrative review.', 'error');
                    return;
                  }
                  if (effectiveStatus !== 'available') {
                    e.preventDefault();
                    showToast(`This vehicle is currently booked by another user and is not available.`, 'error');
                    return;
                  }
                  if (!user) {
                    localStorage.setItem('elitedrive_redirect', `/payment/${vehicle?.id}?days=${rentalDays}`);
                    showToast('Welcome to EliteDrive! Please register or log in to secure this vehicle.', 'info');
                    return;
                  }
                  if (user && (user.outstandingBalance || 0) > 0) {
                    // Allow them to go to dashboard to clear outstanding balance
                    return;
                  }
                  if (user && user.isBlacklisted) {
                    e.preventDefault();
                    showToast(`Your account is restricted. Please contact support.`, 'error');
                    return;
                  }
                  if (!isVerified) {
                    e.preventDefault();
                    showToast('Verification Required: Please verify your email and phone in your profile.', 'error');
                  }
                }}
                className={`w-full ${
                  user && (user.outstandingBalance || 0) > 0
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-100 cursor-pointer'
                    : (!user || isVerified) && effectiveStatus === 'available' && !hasPendingBooking
                      ? 'bg-[#2563EB] hover:bg-blue-700 shadow-xl shadow-blue-100' 
                      : 'bg-gray-100 border border-gray-200 cursor-not-allowed text-gray-400'
                } text-white py-4 rounded-[20px] font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]`}
              >
                {hasPendingBooking
                  ? 'Booking Under review'
                  : user && (user.outstandingBalance || 0) > 0
                    ? 'Clear Remaining Balance'
                    : effectiveStatus === 'available' 
                      ? (!user ? 'Sign In to Book' : 'Proceed to Booking')
                      : effectiveStatus === 'booked' 
                        ? 'Currently Booked' 
                        : effectiveStatus === 'rented' 
                          ? 'Rented' 
                          : 'Unavailable'}
                <ShieldCheck size={20} />
              </Link>
            </div>

            <div className="flex items-start gap-3 text-xs text-[#64748B] bg-white/50 p-5 rounded-[20px] border border-white/50">
              <Info size={18} className="mt-0.5 shrink-0 text-[#2563EB]" />
              <p className="font-medium leading-relaxed">Free cancellation up to 24 hours before pickup. Refundable security deposit of 20% of the vehicle's rental amount is required.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
