import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft,
  ArrowRight,
  Smartphone,
  CreditCard,
  Banknote,
  Building2,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Lock,
  Verified
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema, PaymentFormData } from '../schemas/payment';
import LoadingSpinner from '../components/LoadingSpinner';

const Payment: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { vehicles, addBooking, user, showToast } = useStore();
  const vehicle = vehicles.find(v => v.id === id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'jazzcash' | 'card' | 'transfer'>('easypaisa');
  const rentalDays = parseInt(searchParams.get('days') || '3');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    reset({ paymentDetail: '', destination: '' });
  }, [paymentMethod, reset]);

  if (!vehicle) return <div>Vehicle not found</div>;

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 1); // Start tomorrow
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + rentalDays);

      const newBooking = {
        id: 'b' + Date.now(),
        vehicleId: vehicle.id,
        userId: user?.id || 'u1',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalPrice: vehicle.pricePerDay * rentalDays,
        status: 'pending' as const,
        paymentStatus: 'paid' as const,
        bookingDate: today.toISOString().split('T')[0],
        destination: data.destination
      };
      
      await addBooking(newBooking);
      showToast('Booking confirmed successfully!', 'success');
      navigate('/booking-confirmed');
    } catch (error) {
      showToast('Payment failed. Please check your details and try again.', 'error');
      console.error('Booking error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-full mx-auto space-y-8 pb-20 px-10 md:px-20">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="group/back flex items-center gap-2 text-slate-500 hover:text-[#2463eb] transition-colors w-fit"
        >
          <ArrowLeft size={18} className="transition-transform group-hover/back:-translate-x-1" />
          <span className="text-sm font-medium">Go Back</span>
        </button>
        <div className="space-y-1">
          <h1 className="text-slate-900 tracking-tight text-3xl font-extrabold leading-tight">Secure Payment</h1>
          <p className="text-slate-500 text-sm font-normal">Complete your booking to secure your ride in {vehicle.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Booking Summary */}
        <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
          <h3 className="text-slate-900 text-lg font-bold">Booking Summary</h3>
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col gap-4">
              <div 
                className="w-full h-40 bg-center bg-no-repeat bg-cover rounded-lg shadow-inner"
                style={{ backgroundImage: `url("${vehicle.image}")` }}
              >
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#2463eb] text-[10px] font-bold uppercase tracking-wider">Vehicle</p>
                    <p className="text-slate-900 text-xl font-bold">{vehicle.name}</p>
                  </div>
                  <div className="bg-[#2463eb]/10 text-[#2463eb] px-3 py-1 rounded-full text-xs font-bold">
                    {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <MapPin size={14} className="text-[#2463eb]" />
                  <span>{vehicle.location}, Pakistan</span>
                </div>
              </div>
              <hr className="border-slate-100 my-2"/>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Daily Rate</span>
                  <span className="text-slate-900">Rs {vehicle.pricePerDay.toLocaleString()} / day</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-slate-100 pt-3 text-lg">
                  <span className="text-slate-900">Total Amount</span>
                  <span className="text-[#2463eb]">Rs {(vehicle.pricePerDay * rentalDays).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Methods */}
        <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
          <h3 className="text-slate-900 text-lg font-bold">Select Payment Method</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <button 
              onClick={() => setPaymentMethod('easypaisa')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'easypaisa' 
                  ? 'border-[#2463eb] bg-[#2463eb]/5 text-[#2463eb]' 
                  : 'border-slate-200 hover:border-[#2463eb]/50 text-slate-600'
              }`}
            >
              <Smartphone size={28} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Easypaisa</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('jazzcash')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'jazzcash' 
                  ? 'border-[#2463eb] bg-[#2463eb]/5 text-[#2463eb]' 
                  : 'border-slate-200 hover:border-[#2463eb]/50 text-slate-600'
              }`}
            >
              <Banknote size={28} />
              <span className="text-[10px] font-bold uppercase tracking-tight">JazzCash</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('card')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'card' 
                  ? 'border-[#2463eb] bg-[#2463eb]/5 text-[#2463eb]' 
                  : 'border-slate-200 hover:border-[#2463eb]/50 text-slate-600'
              }`}
            >
              <CreditCard size={28} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Bank Card</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('transfer')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'transfer' 
                  ? 'border-[#2463eb] bg-[#2463eb]/5 text-[#2463eb]' 
                  : 'border-slate-200 hover:border-[#2463eb]/50 text-slate-600'
              }`}
            >
              <Building2 size={28} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Transfer</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Destination of the Trip
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <MapPin size={18} />
                  </span>
                  <input 
                    {...register('destination')}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.destination ? 'border-red-500' : 'border-slate-200'} bg-slate-50 focus:ring-2 focus:ring-[#2463eb] focus:border-transparent transition-all font-medium`} 
                    placeholder="Where are you going?" 
                    type="text"
                  />
                </div>
                {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {paymentMethod === 'card' ? 'Card Number' : `${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} Mobile Number`}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    {paymentMethod === 'card' ? <CreditCard size={18} /> : <Smartphone size={18} />}
                  </span>
                  <input 
                    {...register('paymentDetail')}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.paymentDetail ? 'border-red-500' : 'border-slate-200'} bg-slate-50 focus:ring-2 focus:ring-[#2463eb] focus:border-transparent transition-all font-medium`} 
                    placeholder={paymentMethod === 'card' ? "xxxx xxxx xxxx xxxx" : "03XX XXXXXXX"} 
                    type="text"
                  />
                </div>
                {errors.paymentDetail && <p className="text-xs text-red-500 mt-1">{errors.paymentDetail.message}</p>}
                <p className="text-[11px] text-slate-500 mt-2 italic">
                  {paymentMethod === 'card' 
                    ? "Your card details are protected by 256-bit encryption." 
                    : "You will receive a push notification on your mobile to approve the payment."}
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#2463eb]/5 rounded-lg border border-[#2463eb]/20">
                <ShieldCheck className="text-[#2463eb] shrink-0" size={20} />
                <p className="text-xs text-slate-600">Your transaction is encrypted and secured by industrial-grade protection.</p>
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#2463eb] hover:bg-[#2463eb]/90 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-[#2463eb]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Payment</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 flex justify-center gap-6 opacity-60 grayscale">
            <div className="flex items-center gap-1 font-bold text-slate-400">
              <Lock size={14} />
              <span className="text-[10px] uppercase tracking-wider">SSL SECURE</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-slate-400">
              <Verified size={14} />
              <span className="text-[10px] uppercase tracking-wider">PCI COMPLIANT</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center">
        <p className="text-slate-400 text-[10px] max-w-md mx-auto">
          By clicking "Confirm Payment", you agree to EliteDrive's Terms of Service and Privacy Policy. Cancellation fees may apply.
        </p>
      </footer>
    </div>
  );
};

export default Payment;
