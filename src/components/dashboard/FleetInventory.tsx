import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  MapPin
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Vehicle } from '../../types';

const FleetInventory: React.FC = () => {
  const { vehicles, deleteVehicle, showToast } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Sedan', 'SUV', 'Luxury', 'Economy', 'Pickup'];

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         v.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || v.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicle(id);
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
      <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
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
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-4 pr-10 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all text-xs font-black uppercase tracking-widest text-slate-600 outline-none appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all border-none">
            <Filter size={18} />
          </button>
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
    </div>
  );
};

export default FleetInventory;
