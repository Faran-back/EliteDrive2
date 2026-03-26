import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Users, Zap, Fuel } from 'lucide-react';
import { motion } from 'motion/react';
import { Vehicle } from '../types';
import { useStore } from '../context/StoreContext';

interface VehicleCardProps {
  vehicle: Vehicle;
  index: number;
  rentalDays?: number;
  showBadge?: boolean;
  searchQuery?: string;
}

const HighlightText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) return <>{text}</>;
  
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-blue-100 text-[#2563EB] rounded-sm px-0.5 font-black">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

const VehicleCard: React.FC<VehicleCardProps> = ({ 
  vehicle, 
  index, 
  rentalDays = 5,
  showBadge = true,
  searchQuery = ''
}) => {
  const { user, toggleFavorite } = useStore();
  const isFavorite = user?.favorites?.includes(vehicle.id);
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  const cardLink = canEdit ? `/edit-vehicle/${vehicle.id}` : `/vehicle/${vehicle.id}?days=${rentalDays}`;

  const getBadgeText = () => {
    if (vehicle.rating >= 4.8) return 'TOP RATED';
    if (vehicle.seats >= 7) return 'FAMILY CHOICE';
    if (vehicle.pricePerDay >= 15000) return 'LUXURY';
    return 'POPULAR';
  };

  const getSubTitle = () => {
    const category = vehicle.pricePerDay >= 15000 ? 'Premium' : vehicle.pricePerDay >= 8000 ? 'Comfort' : 'Economy';
    return `${category} • ${vehicle.type}`;
  };

  const getHighlightText = () => {
    if (vehicle.fuel === 'Electric') return 'ECO-FRIENDLY';
    if (vehicle.transmission === 'Automatic') return 'EASY DRIVE';
    if (vehicle.rating >= 4.9) return 'EXCELLENT SERVICE';
    return 'BEST VALUE';
  };

  const isVerified = user?.emailVerified && user?.phoneVerified;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12, transition: { duration: 0.3, ease: "easeOut" } }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 transition-all group h-full flex flex-col"
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={vehicle.image} 
          alt={vehicle.name}
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
          }}
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-in-out"
        />
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(vehicle.id);
          }}
          className={`absolute top-4 left-4 w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all z-20 ${
            isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-white/90 text-[#64748B] hover:text-red-500'
          }`}
        >
          <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
        </button>

        {showBadge && (
          <div className="absolute top-4 right-4 bg-[#2563EB] text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg z-20">
            {getBadgeText()}
          </div>
        )}

        <Link to={cardLink} className="absolute inset-0 z-10">
          <span className="sr-only">View Details</span>
        </Link>
      </div>
      
      <div className="p-8 space-y-6 flex-grow flex flex-col relative">
        <Link to={cardLink} className="absolute inset-0 z-10">
          <span className="sr-only">View Details</span>
        </Link>
        
        <div className="flex justify-between items-start relative z-0">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#1E293B] flex flex-wrap items-center gap-2">
              <HighlightText text={vehicle.name} highlight={searchQuery} />
              <span className="text-[10px] font-mono font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase">
                ID: {vehicle.id}
              </span>
            </h3>
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={14} fill="currentColor" />
              <span className="text-xs font-bold text-[#1E293B]">{vehicle.rating}</span>
              <span className="text-[10px] font-bold text-[#94A3B8] ml-1">
                • <HighlightText text={vehicle.location} highlight={searchQuery} />
              </span>
            </div>
            <p className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest">
              {getHighlightText()}
            </p>
            <p className="text-xs font-bold text-[#64748B]">
              <HighlightText text={getSubTitle()} highlight={searchQuery} />
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-[#2563EB]">PKR {vehicle.pricePerDay.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase">/ day</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-y border-gray-50">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-[#94A3B8]" />
            <span className="text-xs font-bold text-[#64748B]">{vehicle.seats}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-[#94A3B8]" />
            <span className="text-xs font-bold text-[#64748B]">{vehicle.transmission || 'Auto'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel size={14} className="text-[#94A3B8]" />
            <span className="text-xs font-bold text-[#64748B]">{vehicle.fuel}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto relative z-20">
          <div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Total ({rentalDays} {rentalDays === 1 ? 'day' : 'days'})</p>
            <p className="text-lg font-black text-[#1E293B]">PKR {(vehicle.pricePerDay * rentalDays).toLocaleString()}</p>
          </div>
          <Link 
            to={canEdit ? `/edit-vehicle/${vehicle.id}` : `/vehicle/${vehicle.id}?days=${rentalDays}`}
            className="px-8 py-3 bg-[#2563EB] text-white rounded-xl font-black text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all text-center"
          >
            {canEdit ? 'Edit Details' : 'Rent Now'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;
