import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Car, 
  Users, 
  Fuel, 
  Zap, 
  Star,
  Plus,
  MapPin,
  SlidersHorizontal,
  ArrowRight,
  Heart,
  X,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import VehicleCard from '../components/VehicleCard';

const Fleet: React.FC = () => {
  const { vehicles, user } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedTransmission, setSelectedTransmission] = useState('All');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const VEHICLES_PER_PAGE = 6;

  const types = ['All', 'Sedan', 'SUV', 'Hatchback'];
  const transmissions = ['All', 'Automatic', 'Manual'];
  const fuels = ['All', 'Petrol', 'Diesel', 'Electric'];

  const filteredVehicles = vehicles.filter(v => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = v.name.toLowerCase().includes(searchLower) || 
                         v.location.toLowerCase().includes(searchLower) ||
                         v.type.toLowerCase().includes(searchLower);
    const matchesType = selectedType === 'All' || v.type === selectedType;
    const matchesTransmission = selectedTransmission === 'All' || v.transmission === selectedTransmission;
    const matchesFuel = selectedFuel === 'All' || v.fuel === selectedFuel;
    
    return matchesSearch && matchesType && matchesTransmission && matchesFuel;
  });

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedTransmission, selectedFuel]);

  const totalPages = Math.ceil(filteredVehicles.length / VEHICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * VEHICLES_PER_PAGE;
  const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + VEHICLES_PER_PAGE);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedTransmission('All');
    setSelectedFuel('All');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black tracking-tight text-[#1E293B]">Explore Fleet</h1>
            {user?.role === 'admin' && (
              <Link 
                to="/add-vehicle"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                <Plus size={16} />
                Add Vehicle
              </Link>
            )}
          </div>
          <p className="text-[#64748B] text-lg max-w-2xl font-medium">Premium vehicles for every journey, from city commutes to northern adventures.</p>
        </div>
        {(searchQuery || selectedType !== 'All' || selectedTransmission !== 'All' || selectedFuel !== 'All') && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E2E8F0] rounded-2xl text-sm font-black text-[#2563EB] hover:bg-blue-50 hover:border-[#2563EB] transition-all shadow-sm w-fit"
          >
            <X size={16} />
            Reset Filters
          </button>
        )}
      </header>

      {/* Search & Filter Bar */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
            <input 
              type="text"
              placeholder="Search by car name, type, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-[24px] py-5 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#2563EB] transition-all shadow-sm font-medium text-[#1E293B]"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-8 py-4 rounded-[20px] font-black whitespace-nowrap transition-all text-sm ${
                  selectedType === type 
                    ? 'bg-[#2563EB] text-white shadow-xl shadow-blue-100' 
                    : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]'
                }`}
              >
                {type}
              </button>
            ))}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 border rounded-[20px] transition-all ${
                showFilters || selectedTransmission !== 'All' || selectedFuel !== 'All'
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xl shadow-blue-100'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-blue-50 hover:text-[#2563EB]'
              }`}
            >
              <SlidersHorizontal size={22} />
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-widest">Transmission</h3>
              <div className="flex flex-wrap gap-2">
                {transmissions.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTransmission(t)}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      selectedTransmission === t
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-widest">Fuel Type</h3>
              <div className="flex flex-wrap gap-2">
                {fuels.map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFuel(f)}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      selectedFuel === f
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 pt-4 border-t border-[#F1F5F9] flex justify-between items-center">
              <p className="text-xs font-bold text-[#64748B]">
                Showing <span className="text-[#1E293B]">{filteredVehicles.length}</span> vehicles
              </p>
              <button 
                onClick={clearFilters}
                className="text-xs font-black text-[#2563EB] hover:underline"
              >
                Reset all filters
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {paginatedVehicles.map((vehicle, index) => (
          <VehicleCard 
            key={vehicle.id} 
            vehicle={vehicle} 
            index={index} 
            showBadge={false}
            searchQuery={searchQuery}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-10">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-4 rounded-2xl border transition-all ${
              currentPage === 1
                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                : 'bg-white text-[#1E293B] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]'
            }`}
          >
            <ChevronRight className="rotate-180" size={20} />
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-12 h-12 rounded-2xl font-black transition-all ${
                  currentPage === page
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-100'
                    : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-4 rounded-2xl border transition-all ${
              currentPage === totalPages
                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                : 'bg-white text-[#1E293B] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {filteredVehicles.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-[#E2E8F0]">
          <Car className="w-20 h-20 text-[#E2E8F0] mx-auto mb-6" />
          <h3 className="text-2xl font-black text-[#1E293B]">No vehicles found</h3>
          <p className="text-[#64748B] mt-2 font-medium">Try adjusting your search or filters to find your perfect ride.</p>
          <button 
            onClick={() => {setSearchQuery(''); setSelectedType('All');}}
            className="mt-8 text-[#2563EB] font-black text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Fleet;
