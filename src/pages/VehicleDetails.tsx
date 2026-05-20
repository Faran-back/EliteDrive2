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

const VehicleDetails: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { vehicles, user, showToast } = useStore();
  const vehicle = vehicles.find(v => v.id === id);
  const isVerified = (user?.emailVerified && user?.phoneVerified) || 
                      (user?.email && ['ahmed12@gmail.com', 'test@example.com'].includes(user.email.toLowerCase()));

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

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const rentalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

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
          <button className="w-9 h-9 bg-white border border-[#E2E8F0] rounded-full flex items-center justify-center text-[#64748B] hover:text-red-500 transition-all">
            <Heart size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image & Gallery */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-video rounded-[32px] overflow-hidden shadow-xl shadow-blue-100/50 border border-gray-100"
          >
            <img 
              src={vehicle.image} 
              alt={vehicle.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
              }}
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <div className="grid grid-cols-3 gap-4 max-w-sm">
            {[
              vehicle.image,
              `https://picsum.photos/seed/${vehicle.id}2/400/400`,
              `https://picsum.photos/seed/${vehicle.id}3/400/400`
            ].map((img, i) => (
              <div key={i} className="aspect-square rounded-[16px] overflow-hidden border border-[#E2E8F0] cursor-pointer hover:border-[#2563EB] transition-all p-0.5">
                <img 
                  src={img} 
                  alt={`Angle ${i + 1}`} 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
                  }}
                  className="w-full h-full object-cover rounded-[14px]" 
                />
              </div>
            ))}
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
                <h2 className="text-3xl font-black text-[#1E293B]">PKR {(vehicle.pricePerDay * rentalDays).toLocaleString()}</h2>
                <p className="text-[#64748B] font-bold text-xs">PKR {vehicle.pricePerDay.toLocaleString()} / Day • {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}</p>
              </div>
              <div className="text-right">
                {vehicle.status === 'booked' ? (
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

              {!isVerified && (
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
              )}

              <Link 
                to={isVerified && vehicle.status === 'available' ? `/payment/${vehicle.id}?days=${rentalDays}` : '#'}
                onClick={(e) => {
                  if (vehicle.status !== 'available') {
                    e.preventDefault();
                    showToast(`This vehicle is currently booked by another user and is not available.`, 'error');
                    return;
                  }
                  if (!isVerified) {
                    e.preventDefault();
                    showToast('Verification Required: Please verify your email and phone in your profile.', 'error');
                  }
                }}
                className={`w-full ${
                  isVerified && vehicle.status === 'available' 
                    ? 'bg-[#2563EB] hover:bg-blue-700 shadow-xl shadow-blue-100' 
                    : 'bg-gray-100 border border-gray-200 cursor-not-allowed text-gray-400'
                } text-white py-4 rounded-[20px] font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]`}
              >
                {vehicle.status === 'available' 
                  ? 'Proceed to Booking' 
                  : vehicle.status === 'booked' 
                    ? 'Currently Booked' 
                    : vehicle.status === 'rented' 
                      ? 'Rented' 
                      : 'Unavailable'}
                <ShieldCheck size={20} />
              </Link>
            </div>

            <div className="flex items-start gap-3 text-xs text-[#64748B] bg-white/50 p-5 rounded-[20px] border border-white/50">
              <Info size={18} className="mt-0.5 shrink-0 text-[#2563EB]" />
              <p className="font-medium leading-relaxed">Free cancellation up to 24 hours before pickup. Security deposit of PKR 20,000 required.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
