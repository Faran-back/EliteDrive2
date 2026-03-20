import React from 'react';
import { useStore } from '../context/StoreContext';
import VehicleCard from '../components/VehicleCard';
import { Heart, Car } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites: React.FC = () => {
  const { user, vehicles } = useStore();
  
  const favoriteVehicles = vehicles.filter(v => user?.favorites?.includes(v.id));

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-[#1E293B]">My Favorites</h1>
        <p className="text-[#64748B] text-lg max-w-2xl font-medium">
          Your curated collection of premium vehicles you're interested in.
        </p>
      </header>

      {favoriteVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {favoriteVehicles.map((vehicle, index) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              index={index} 
              showBadge={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-[#E2E8F0]">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-2xl font-black text-[#1E293B]">No favorites yet</h3>
          <p className="text-[#64748B] mt-2 font-medium">
            Start exploring our fleet and heart the vehicles you love.
          </p>
          <Link 
            to="/fleet"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-[#2563EB] text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Car size={18} />
            Browse Fleet
          </Link>
        </div>
      )}
    </div>
  );
};

export default Favorites;
