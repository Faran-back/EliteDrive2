import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  ShieldCheck, 
  Bell, 
  CreditCard,
  LogOut,
  Save,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '../schemas/profile';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile: React.FC = () => {
  const { user, updateUser, logout, showToast } = useStore();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: 'Lahore, Pakistan',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await updateUser({ 
        name: data.name, 
        email: data.email, 
        phone: data.phone 
      });
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update profile. Please try again.', 'error');
      console.error('Profile update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-[#1E293B]">Profile Settings</h1>
        <p className="text-[#64748B] font-medium">Manage your personal information and preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Avatar & Stats */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm text-center space-y-8">
            <div className="relative inline-block">
              <div className="p-1.5 bg-white border border-[#E2E8F0] rounded-full shadow-xl shadow-blue-50">
                <img 
                  src={user?.avatar} 
                  alt="Profile" 
                  className="w-36 h-36 rounded-full object-cover"
                />
              </div>
              <button className="absolute bottom-1 right-1 p-3 bg-[#2563EB] text-white rounded-full shadow-lg hover:scale-110 transition-all border-4 border-white">
                <Camera size={20} />
              </button>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-[#1E293B]">{user?.name}</h2>
              <p className="text-[#64748B] font-bold text-sm">Member since 2023</p>
            </div>
            <div className="pt-8 border-t border-gray-50 flex justify-around">
              <div className="space-y-1">
                <p className="text-3xl font-black text-[#1E293B]">12</p>
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Trips</p>
              </div>
              <div className="w-px bg-gray-100" />
              <div className="space-y-1">
                <p className="text-3xl font-black text-[#2563EB]">{user?.rewardPoints.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Points</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2563EB] rounded-[40px] p-8 text-white space-y-4 shadow-2xl shadow-blue-100 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="text-white" size={24} />
                </div>
                <p className="font-black text-lg">Identity Verified</p>
              </div>
              <p className="text-blue-100 text-sm font-medium leading-relaxed">Your account is fully verified for premium vehicle rentals in Pakistan.</p>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full"></div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-black text-[#64748B] ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                  <input 
                    type="text" 
                    {...register('name')}
                    className={`w-full bg-[#F8FAFC] border ${errors.name ? 'border-red-500' : 'border-[#F1F5F9]'} rounded-[24px] py-5 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#2563EB] transition-all font-bold text-[#1E293B]`}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-black text-[#64748B] ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                  <input 
                    type="email" 
                    {...register('email')}
                    className={`w-full bg-[#F8FAFC] border ${errors.email ? 'border-red-500' : 'border-[#F1F5F9]'} rounded-[24px] py-5 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#2563EB] transition-all font-bold text-[#1E293B]`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-black text-[#64748B] ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                  <input 
                    type="text" 
                    {...register('phone')}
                    className={`w-full bg-[#F8FAFC] border ${errors.phone ? 'border-red-500' : 'border-[#F1F5F9]'} rounded-[24px] py-5 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#2563EB] transition-all font-bold text-[#1E293B]`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 ml-1">{errors.phone.message}</p>}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-black text-[#64748B] ml-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                  <input 
                    type="text" 
                    {...register('location')}
                    className={`w-full bg-[#F8FAFC] border ${errors.location ? 'border-red-500' : 'border-[#F1F5F9]'} rounded-[24px] py-5 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#2563EB] transition-all font-bold text-[#1E293B]`}
                  />
                </div>
                {errors.location && <p className="text-xs text-red-500 ml-1">{errors.location.message}</p>}
              </div>
            </div>

            <div className="pt-10 border-t border-gray-50 flex items-center justify-end">
              <button 
                type="submit"
                disabled={isSaving}
                className="bg-[#2563EB] text-white px-10 py-5 rounded-[24px] font-black flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 min-w-[200px] justify-center"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-xl transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 rounded-[24px] flex items-center justify-center group-hover:bg-[#2563EB] transition-all">
                  <Bell className="text-[#2563EB] group-hover:text-white transition-all" size={28} />
                </div>
                <div>
                  <p className="font-black text-lg text-[#1E293B]">Notifications</p>
                  <p className="text-sm text-[#64748B] font-medium">Manage alerts and emails</p>
                </div>
              </div>
              <ChevronRight className="text-[#CBD5E1]" size={24} />
            </button>
            <button className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-xl transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-[24px] flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                  <CreditCard className="text-emerald-600 group-hover:text-white transition-all" size={28} />
                </div>
                <div>
                  <p className="font-black text-lg text-[#1E293B]">Payment Methods</p>
                  <p className="text-sm text-[#64748B] font-medium">Manage cards and wallets</p>
                </div>
              </div>
              <ChevronRight className="text-[#CBD5E1]" size={24} />
            </button>
          </div>

          <div className="pt-8 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="w-full bg-rose-50 text-rose-600 p-6 rounded-[32px] font-black flex items-center justify-center gap-3 hover:bg-rose-100 transition-all border border-rose-100"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
