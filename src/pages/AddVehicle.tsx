import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Camera, 
  Users, 
  Zap, 
  Fuel, 
  Banknote, 
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
  
  // Gallery state and refs for additional images
  const [gallery, setGallery] = useState<string[]>(['', '', '', '']);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    licensePlate: '',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
    pricePerDay: '' as unknown as number,
    seats: '' as unknown as number,
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
      // Filter out any empty items in gallery and save them
      const cleanGallery = gallery.filter(img => !!img);
      const vehicleData = {
        ...formData,
        images: cleanGallery,
        rating: 5.0,
        features: ['Air Conditioning', 'Bluetooth', 'GPS']
      };
      await addVehicle(vehicleData);
      showToast('Vehicle added successfully!', 'success');
      navigate(-1);
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

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeSlot === null) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file, 2); // 2MB for vehicle images
    if (!validation.isValid) {
      showToast(validation.error || 'Invalid image', 'error');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setGallery(prev => {
        const next = [...prev];
        next[activeSlot] = base64;
        return next;
      });
      showToast(`Gallery Slot ${activeSlot + 1} uploaded successfully!`, 'success');
    } catch (error) {
      console.error('Gallery image upload error:', error);
      showToast('Failed to upload gallery image', 'error');
    } finally {
      setActiveSlot(null);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGallery(prev => {
      const next = [...prev];
      next[index] = '';
      return next;
    });
    showToast(`Gallery Slot ${index + 1} removed!`, 'info');
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
                  className="absolute inset-0 bg-blue-600/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
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
              <div className="flex gap-2 font-black">
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

          {/* Gallery block */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Vehicle Gallery ({gallery.length} Images)
              </label>
              <p className="text-[11px] text-slate-400 font-medium ml-1">Upload condition/gallery images to fully capture the vehicle's state before rental.</p>
            </div>
            
            <input 
              type="file" 
              ref={galleryInputRef}
              onChange={handleGalleryUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-4">
              {gallery.map((_, idx) => (
                <div key={idx} className="space-y-1 animate-in fade-in duration-200">
                  <span className="text-[10px] font-bold text-slate-400 block ml-1">Image {idx + 1}</span>
                  <div className="relative group aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-dashed border-slate-200 hover:border-blue-300 transition-all">
                    {gallery[idx] ? (
                      <>
                        <img 
                          src={gallery[idx]} 
                          alt={`Gallery slot ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSlot(idx);
                              setTimeout(() => galleryInputRef.current?.click(), 100);
                            }}
                            className="p-1 px-1.5 text-[9px] font-black uppercase tracking-widest bg-white text-blue-600 rounded-lg hover:bg-slate-50 shadow-sm"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="p-1 px-1.5 text-[9px] font-black uppercase tracking-widest bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSlot(idx);
                          setTimeout(() => galleryInputRef.current?.click(), 100);
                        }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition-all"
                      >
                        <Plus size={16} className="mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Upload</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={gallery[idx] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setGallery(prev => {
                        const next = [...prev];
                        next[idx] = val;
                        return next;
                      });
                    }}
                    placeholder="Or paste URL..."
                    className="w-full px-3 py-2 bg-slate-50 border-none rounded-lg text-[10px] font-bold focus:ring-1 focus:ring-blue-600/20 transition-all"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setGallery(prev => [...prev, '']);
                showToast('New gallery slot added!', 'info');
              }}
              className="w-full py-3.5 border-2 border-dashed border-slate-200 hover:border-blue-500 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest text-[#64748B] bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              Add More Image Slots
            </button>
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

              {/* License Plate */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">License Plate No.</label>
                <input 
                  type="text" 
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20 transition-all uppercase"
                  placeholder="e.g. LEA-1234"
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
                  { value: 'Economy', label: 'Economy' },
                  { value: 'Pickup', label: 'Pickup' },
                ]}
                icon={<Car size={18} />}
              />

              {/* Price */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Price Per Day (PKR)</label>
                <div className="relative">
                  <Banknote className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value === '' ? '' as any : parseInt(e.target.value) })}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20 transition-all"
                    placeholder="e.g. 5000"
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
                placeholder="e.g. 4 Seater"
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
