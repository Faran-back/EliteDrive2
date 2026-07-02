import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Pencil, 
  Search, 
  Plus, 
  Filter,
  Car,
  ChevronRight,
  MoreVertical,
  Trash2,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Vehicle } from '../../types';
import ConfirmationModal from '../ConfirmationModal';

const FleetInventory: React.FC = () => {
  const { vehicles, deleteVehicle, showToast } = useStore();
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Sedan', 'SUV', 'Luxury', 'Economy', 'Hatchback', 'Pickup'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         v.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || v.type.toLowerCase() === categoryFilter.toLowerCase();
    
    let matchesDate = true;
    if (v.createdAt) {
      const vDateStr = v.createdAt.split('T')[0];
      if (startDateFilter && vDateStr < startDateFilter) matchesDate = false;
      if (endDateFilter && vDateStr > endDateFilter) matchesDate = false;
    } else if (startDateFilter || endDateFilter) {
      matchesDate = false;
    }

    return matchesSearch && matchesCategory && matchesDate;
  }).sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return b.createdAt.localeCompare(a.createdAt);
    }
    if (a.createdAt) return -1;
    if (b.createdAt) return 1;
    return 0;
  });

  const handleDelete = (id: string) => {
    setVehicleToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (vehicleToDelete) {
      try {
        await deleteVehicle(vehicleToDelete);
        showToast('Vehicle deleted successfully!', 'success');
      } catch (error: any) {
        showToast(error.message || 'Failed to delete vehicle', 'error');
      } finally {
        setVehicleToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Fleet Inventory</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Manage and monitor all vehicles in the network.</p>
        </div>
        <Link 
          to="/add-vehicle"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98]"
        >
          <Plus size={16} />
          Add Vehicle
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all text-sm font-bold text-slate-900 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative" ref={dropdownRef}>
              <button 
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50 rounded-2xl border-none text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all outline-none select-none min-w-[140px] h-full ${
                  isDropdownOpen ? 'ring-2 ring-blue-600/10 bg-white shadow-sm' : ''
                }`}
              >
                <span>{categoryFilter}</span>
                <ChevronDown 
                  size={14} 
                  className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} 
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 z-50 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-900/10 overflow-hidden py-1.5"
                  >
                    <div className="max-h-60 overflow-y-auto">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategoryFilter(cat);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-150 flex items-center justify-between ${
                            cat === categoryFilter
                              ? 'bg-blue-50 text-blue-600 font-black'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                          }`}
                        >
                          {cat}
                          {cat === categoryFilter && (
                            <div className="size-1.5 rounded-full bg-blue-600"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              type="button"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('All');
                setStartDateFilter('');
                setEndDateFilter('');
              }}
              className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-red-500 transition-all border-none"
              title="Reset Filters"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Date Filters Row */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5">
            <Filter size={12} /> Filter Date Created range:
          </span>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-150 text-xs font-bold text-slate-700 outline-none rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all cursor-pointer"
            />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">to</span>
            <input 
              type="date" 
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-150 text-xs font-bold text-slate-700 outline-none rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all cursor-pointer"
            />
            {(startDateFilter || endDateFilter) && (
              <button
                type="button"
                onClick={() => {
                  setStartDateFilter('');
                  setEndDateFilter('');
                }}
                className="text-[10px] font-black uppercase tracking-widest text-[#EF4444] hover:underline ml-2 bg-red-50 px-2.5 py-1 rounded-lg"
              >
                Clear Range
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Fuel</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price/Day</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredVehicles.map((vehicle, idx) => (
                <motion.tr 
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-slate-50/50 transition-all"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="size-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-50 p-1 group-hover:border-blue-600/20 transition-all shrink-0">
                        <img 
                          src={vehicle.image} 
                          alt={vehicle.name} 
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">{vehicle.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{vehicle.type} • {vehicle.transmission}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black tracking-widest border ${
                      vehicle.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      vehicle.status === 'rented' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {(vehicle.status || 'available').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-slate-900 uppercase">{vehicle.fuel}</span>
                      <div className="w-8 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full" 
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs truncate max-w-[150px]">
                      <MapPin className="shrink-0" size={14} />
                      {vehicle.location}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div>
                      <p className="text-sm font-black text-slate-900">PKR {vehicle.pricePerDay.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Instant Booking</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Link 
                        to={`/edit-vehicle/${vehicle.id}`}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-all"
                        title="Edit Details"
                      >
                        <Pencil size={18} />
                      </Link>
                      <Link 
                        to={`/vehicle/${vehicle.id}`}
                        className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-all"
                        title="View Public Page"
                      >
                        <ChevronRight size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(vehicle.id)}
                        className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-all"
                        title="Delete Vehicle"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="group-hover:hidden transition-all text-slate-300">
                      <MoreVertical size={20} className="ml-auto" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={vehicleToDelete !== null}
        onClose={() => setVehicleToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone and will permanently remove this vehicle from the fleet inventory."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        type="danger"
      />
    </div>
  );
};

export default FleetInventory;
