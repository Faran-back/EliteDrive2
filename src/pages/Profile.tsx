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
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  IdCard,
  FileBadge,
  Upload
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import EmailLogsSandbox from '../components/dashboard/EmailLogsSandbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '../schemas/profile';
import LoadingSpinner from '../components/LoadingSpinner';
import { fileToBase64, validateImage } from '../lib/imageUtils';
import { useRef, useEffect } from 'react';

const Profile: React.FC = () => {
  const { 
    user, 
    updateUser, 
    logout, 
    showToast, 
    sendVerificationEmail, 
    setupRecaptcha, 
    sendPhoneVerificationCode, 
    verifyPhoneCode,
    refreshData,
    bookings
  } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currentView = queryParams.get('view');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBypassed = user?.email && ['ahmed12@gmail.com', 'tj334767@gmail.com'].includes(user.email.toLowerCase());
  const isVerified = (user?.emailVerified && user?.phoneVerified) || isBypassed;
  const isEmailVerified = user?.emailVerified || isBypassed;
  const isPhoneVerified = user?.phoneVerified || isBypassed;

  const totalTrips = bookings.filter(b => b.userId === user?.id).length;

  useEffect(() => {
    setupRecaptcha('recaptcha-container');
  }, []);

  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    const ev = qp.get('email_verified');
    if (!ev) return;

    (async () => {
      if (ev === '1') {
        showToast('Email verified successfully!', 'success');
        try {
          await refreshData();
        } catch (err) {
          console.error('Failed to refresh data after email verification:', err);
        }
        navigate(location.pathname, { replace: true });
      } else {
        showToast('Email verification failed or expired.', 'error');
        navigate(location.pathname, { replace: true });
      }
    })();
  }, [location.search, refreshData, navigate, showToast, location.pathname]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || 'Lahore, Pakistan',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || 'Lahore, Pakistan',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await updateUser({ 
        name: data.name, 
        email: data.email, 
        phone: data.phone,
        location: data.location
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file, 10); // Limit to 10MB for base64 storage
    if (!validation.isValid) {
      showToast(validation.error || 'Invalid image', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      await updateUser({ avatar: base64 });
      showToast('Profile picture updated!', 'success');
    } catch (error) {
      console.error('Image upload error:', error);
      showToast('Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const [isUploadingDoc, setIsUploadingDoc] = useState<{ [key: string]: boolean }>({
    cnicFront: false,
    cnicBack: false,
    license: false,
  });

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cnicFront' | 'cnicBack' | 'license') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB', 'error');
      return;
    }

    setIsUploadingDoc(prev => ({ ...prev, [field]: true }));
    try {
      const base64 = await fileToBase64(file);
      await updateUser({ [field]: base64, cnicVerified: false });
      showToast(`${field === 'license' ? 'Driving License' : field === 'cnicFront' ? 'CNIC Front' : 'CNIC Back'} uploaded successfully!`, 'success');
    } catch (error) {
      console.error('Doc upload error:', error);
      showToast('Failed to upload document. Please try again.', 'error');
    } finally {
      setIsUploadingDoc(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSendEmailVerification = async () => {
    setIsVerifyingEmail(true);
    try {
      await sendVerificationEmail();
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSendPhoneCode = async () => {
    if (!user?.phone) {
      showToast('Please save a phone number first', 'error');
      return;
    }
    setIsSendingCode(true);
    try {
      const result = await sendPhoneVerificationCode(user.phone);
      setConfirmationResult(result);
      setShowOtpInput(true);
    } catch (error) {
      console.error('Phone code error:', error);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult || !otpCode) return;
    setIsVerifyingCode(true);
    try {
      await verifyPhoneCode(confirmationResult, otpCode);
      setShowOtpInput(false);
      setOtpCode('');
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  if (currentView === 'email-logs') {
    return (
      <div className="space-y-10 pb-20">
        <header className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-[#1E293B]">Email Logs Sandbox</h1>
          <p className="text-[#64748B] font-medium">Review simulated transactional emails sent by the system to you.</p>
        </header>
        <EmailLogsSandbox isAdminView={false} />
      </div>
    );
  }

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
                <div className="relative w-36 h-36 rounded-full overflow-hidden bg-slate-100">
                  <img 
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                    alt="Profile" 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isUploading ? 'opacity-40' : 'opacity-100'}`}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="text-blue-600 animate-spin" size={32} />
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-1 right-1 p-3 bg-[#2563EB] text-white rounded-full shadow-lg hover:scale-110 transition-all border-4 border-white disabled:opacity-50 disabled:scale-100"
              >
                <Camera size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-[#1E293B]">{user?.name}</h2>
              <p className="text-[#64748B] font-bold text-sm">
                Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
              </p>
            </div>
            <div className="pt-8 border-t border-gray-50 flex justify-around">
              <div className="space-y-1">
                <p className="text-3xl font-black text-[#1E293B]">{totalTrips}</p>
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Trips</p>
              </div>
              <div className="w-px bg-gray-100" />
              <div className="space-y-1">
                <p className="text-3xl font-black text-[#2563EB]">{(user?.rewardPoints ?? 0).toLocaleString()}</p>
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Points</p>
              </div>
            </div>
          </div>

          <div className={`${isVerified ? 'bg-[#2563EB]' : 'bg-rose-500'} rounded-[40px] p-8 text-white space-y-4 shadow-2xl shadow-blue-100 relative overflow-hidden`}>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  {isVerified ? (
                    <ShieldCheck className="text-white" size={24} />
                  ) : (
                    <AlertCircle className="text-white" size={24} />
                  )}
                </div>
                <p className="font-black text-lg">
                  {isVerified ? 'Identity Verified' : 'Identity Not Verified'}
                </p>
              </div>
              <p className="text-blue-100 text-sm font-medium leading-relaxed">
                {isVerified 
                  ? 'Your account is fully verified for premium vehicle rentals in Pakistan.' 
                  : 'Please verify your email and phone number to unlock vehicle bookings.'}
              </p>
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
                    placeholder="e.g. John Doe"
                    className={`w-full bg-[#F8FAFC] border ${errors.name ? 'border-red-500' : 'border-[#F1F5F9]'} rounded-[24px] py-5 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#2563EB] transition-all font-bold text-[#1E293B]`}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-black text-[#64748B]">Email Address</label>
                  {isEmailVerified ? (
                    <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                      <CheckCircle size={12} /> Verified
                    </span>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleSendEmailVerification}
                      disabled={isVerifyingEmail}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-wider hover:underline disabled:opacity-50"
                    >
                      {isVerifyingEmail ? 'Sending...' : 'Verify Now'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                  <input 
                    type="email" 
                    {...register('email')}
                    placeholder="e.g. john@example.com"
                    className={`w-full bg-[#F8FAFC] border ${errors.email ? 'border-red-500' : 'border-[#F1F5F9]'} rounded-[24px] py-5 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#2563EB] transition-all font-bold text-[#1E293B]`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-black text-[#64748B]">Phone Number</label>
                  {isPhoneVerified ? (
                    <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                      <CheckCircle size={12} /> Verified
                    </span>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleSendPhoneCode}
                      disabled={isSendingCode || !user?.phone}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-wider hover:underline disabled:opacity-50"
                    >
                      {isSendingCode ? 'Sending...' : 'Verify Now'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                  <input 
                    type="text" 
                    {...register('phone')}
                    placeholder="+923001234567"
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
                    placeholder="e.g. Lahore, Pakistan"
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

          {/* Identity Verification Documents Card */}
          <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <IdCard className="text-[#2563EB]" size={22} />
                  </div>
                  <h3 className="text-xl font-black text-[#1E293B]">Identity Verification</h3>
                </div>
                <p className="text-sm text-[#64748B] font-medium leading-relaxed">
                  Upload driving license and CNIC front & back scans to unlock vehicle rentals.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center">
                {user?.cnicVerified ? (
                  <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 font-extrabold text-xs uppercase tracking-wider rounded-2xl border border-emerald-100">
                    <CheckCircle size={14} /> Fully Verified
                  </span>
                ) : (user?.cnicFront || user?.cnicBack || user?.license) ? (
                  <span className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 font-extrabold text-xs uppercase tracking-wider rounded-2xl border border-amber-100">
                    <AlertCircle size={14} /> Pending Review
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-4 py-2 bg-[#F1F5F9] text-slate-500 font-extrabold text-xs uppercase tracking-wider rounded-2xl border border-slate-200">
                    <IdCard size={14} /> Documents Required
                  </span>
                )}
              </div>
            </div>

            {/* Verification Helper Banner */}
            {!user?.cnicVerified && (
              <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start gap-4">
                <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-blue-900 leading-normal">
                    Why verify your identity documents?
                  </p>
                  <p className="text-xs text-blue-700/85 font-medium leading-relaxed">
                    Elite Drive is a secure, premium luxury vehicle rental service in Pakistan. To prevent fraud, ensure vehicle safety, and comply with state regularities, we require verified driving licenses and CNICs. Your data remains encrypted and safe with us.
                  </p>
                </div>
              </div>
            )}

            {/* Document Upload Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'CNIC Card (Front)', field: 'cnicFront' as const },
                { label: 'CNIC Card (Back)', field: 'cnicBack' as const },
                { label: 'Driving License', field: 'license' as const }
              ].map((docItem) => {
                const docVal = user?.[docItem.field];
                const isUploading = isUploadingDoc[docItem.field];

                return (
                  <div key={docItem.field} className="space-y-3">
                    <p className="text-xs font-black text-[#64748B] ml-1 uppercase tracking-wider">{docItem.label}</p>
                    
                    <div className="relative group aspect-[1.58/1] rounded-[24px] overflow-hidden border-2 border-dashed border-slate-200 hover:border-[#2563EB] bg-slate-50 transition-all flex items-center justify-center">
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="animate-spin text-[#2563EB]" size={28} />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Uploading...</span>
                        </div>
                      ) : docVal ? (
                        <>
                          <img src={docVal} alt={docItem.label} className="w-full h-full object-cover" />
                          
                          {/* Hover Overlay for Changing Image */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                            <Upload className="text-white" size={24} />
                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Replace Document</span>
                            <label className="absolute inset-0 cursor-pointer">
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleDocUpload(e, docItem.field)} 
                                className="hidden" 
                              />
                            </label>
                          </div>

                          {/* Verification status tag pinned */}
                          <div className="absolute right-3 top-3">
                            {user?.cnicVerified ? (
                              <span className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[8px] font-extrabold tracking-wider uppercase shadow-xs">
                                <CheckCircle size={10} /> Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 bg-amber-500/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[8px] font-extrabold tracking-wider uppercase shadow-xs">
                                <AlertCircle size={10} /> Pending
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center p-6 gap-3 group-hover:bg-blue-50/10">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                            <Upload className="text-[#94A3B8] group-hover:text-[#2563EB] transition-colors" size={20} />
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">Upload Scan</p>
                            <p className="text-[9px] text-[#94A3B8] font-bold mt-0.5">PNG, JPG up to 5MB</p>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleDocUpload(e, docItem.field)} 
                            className="hidden" 
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
      
      <div id="recaptcha-container"></div>

      <AnimatePresence>
        {showOtpInput && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOtpInput(false)}
              className="absolute inset-0 bg-white/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Phone className="text-blue-600" size={28} />
                </div>
                <button 
                  onClick={() => setShowOtpInput(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#1E293B]">Verify Phone</h3>
                <p className="text-[#64748B] font-medium">Enter the 6-digit code sent to {user?.phone}</p>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-[24px] py-6 text-center text-4xl font-black tracking-[0.5em] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#2563EB] transition-all text-[#1E293B]"
                />
                
                <button 
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingCode || otpCode.length !== 6}
                  className="w-full bg-[#2563EB] text-white py-6 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                >
                  {isVerifyingCode ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-[#94A3B8] font-bold">
                Didn't receive the code? <button className="text-blue-600 hover:underline">Resend</button>
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
