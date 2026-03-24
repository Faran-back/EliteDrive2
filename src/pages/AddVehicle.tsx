import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Camera, 
  Users, 
  Zap, 
  Fuel, 
  IndianRupee, 
  Plus,
  Car,
  Loader2,
  Upload
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { Vehicle } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomSelect from '../components/ui/CustomSelect';
import { fileToBase64, validateImage } from '../lib/imageUtils';
import { useRef } from 'react';

const AddVehicle: React.FC = () => {
  const navigate = useNavigate();
  const { addVehicle, showToast, user } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
    pricePerDay: 0,
    seats: 4,
    transmission: 'Automatic' as Vehicle['transmission'],
    fuel: 'Petrol' as Vehicle['fuel'],
    description: '',
    type: 'Sedan' as Vehicle['type'],
    location: '',
    status: 'available' as Vehicle['status']
  });

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'manager') {
      showToast('Unauthorized access', 'error');
      navigate('/');
    }
  }, [user, navigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location || formData.pricePerDay <= 0) {
      showToast('Please fill all required fields correctly', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newVehicle: Vehicle = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        rating: 5.0,
        features: ['Air Conditioning', 'Bluetooth', 'GPS']
      };
      await addVehicle(newVehicle);
      showToast('Vehicle added successfully!', 'success');
      navigate('/fleet');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      showToast('Failed to add vehicle', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file, 2); // 2MB for vehicle images
    if (!validation.isValid) {
      showToast(validation.error || 'Invalid image', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setFormData({ ...formData, image: base64 });
      showToast('Image uploaded successfully!', 'success');
    } catch (error) {
      console.error('Image upload error:', error);
      showToast('Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="size-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 shadow-sm border border-slate-100 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Add New Vehicle</h1>
            <p className="text-slate-500 font-medium">Add a new vehicle to the fleet inventory</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-sm text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <LoadingSpinner size="sm" color="white" /> : <Plus size={18} />}
            Add Vehicle
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Image Preview */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Vehicle Image</label>
              <div className="relative group aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border-2 border-slate-50">
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  className={`w-full h-full object-cover transition-opacity duration-300 ${isUploading ? 'opacity-40' : 'opacity-100'}`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
                  }}
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="text-blue-600 animate-spin" size={32} />
                  </div>
                )}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <Upload className="text-white mb-2" size={32} />
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">Upload Photo</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="flex gap-2">
                <input 
                  type="url" 
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Or paste image URL..."
                  className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detailed Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Vehicle Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20 transition-all"
                  placeholder="e.g. Toyota Camry 2024"
                  required
                />
              </div>

              {/* Type */}
              <CustomSelect
                label="Vehicle Type"
                value={formData.type}
                onChange={(val) => setFormData({ ...formData, type: val })}
                options={[
                  { value: 'Sedan', label: 'Sedan' },
                  { value: 'SUV', label: 'SUV' },
                  { value: 'Hatchback', label: 'Hatchback' },
                  { value: 'Luxury', label: 'Luxury' },
                ]}
                icon={<Car size={18} />}
              />

              {/* Price */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Price Per Day (Rs)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: parseInt(e.target.value) })}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Location</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20 transition-all"
                  placeholder="e.g. Lahore, Pakistan"
                  required
                />
              </div>

              {/* Seats */}
              <CustomSelect
                label="Seating Capacity"
                value={formData.seats}
                onChange={(val) => setFormData({ ...formData, seats: val })}
                options={[
                  { value: 2, label: '2 Seater' },
                  { value: 4, label: '4 Seater' },
                  { value: 5, label: '5 Seater' },
                  { value: 7, label: '7 Seater' },
                ]}
                icon={<Users size={18} />}
              />

              {/* Transmission */}
              <CustomSelect
                label="Transmission"
                value={formData.transmission}
                onChange={(val) => setFormData({ ...formData, transmission: val })}
                options={[
                  { value: 'Automatic', label: 'Automatic' },
                  { value: 'Manual', label: 'Manual' },
                ]}
                icon={<Zap size={18} />}
              />

              {/* Fuel */}
              <CustomSelect
                label="Fuel Type"
                value={formData.fuel}
                onChange={(val) => setFormData({ ...formData, fuel: val })}
                options={[
                  { value: 'Petrol', label: 'Petrol' },
                  { value: 'Diesel', label: 'Diesel' },
                  { value: 'Electric', label: 'Electric' },
                  { value: 'Hybrid', label: 'Hybrid' },
                ]}
                icon={<Fuel size={18} />}
              />

              {/* Status */}
              <CustomSelect
                label="Availability Status"
                value={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val })}
                options={[
                  { value: 'available', label: 'Available' },
                  { value: 'rented', label: 'Rented' },
                  { value: 'maintenance', label: 'Maintenance' },
                ]}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Vehicle Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20 transition-all resize-none"
                placeholder="Enter detailed description about the vehicle features, condition, etc."
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVehicle;
