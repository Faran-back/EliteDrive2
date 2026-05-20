import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck,
  ChevronRight,
  Info,
  Calendar as CalendarIcon,
  MapPin,
  Lock,
  Smartphone,
  CreditCard,
  Building2,
  ShieldAlert,
  Activity,
  Ticket
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema, PaymentFormData } from '../schemas/payment';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomCalendar from '../components/ui/CustomCalendar';

const Payment: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { vehicles, addBooking, user, showToast, updateVehicle } = useStore();
  const vehicle = vehicles.find(v => v.id === id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'jazzcash' | 'card' | 'transfer'>('jazzcash');
  const [rentalType, setRentalType] = useState<'hourly' | 'daily' | 'weekly'>('daily');
  
  // Dates logic
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const saved = localStorage.getItem('elitedrive_pickup_date');
    if (saved) return new Date(saved);
    const initialStartDate = new Date();
    initialStartDate.setDate(initialStartDate.getDate() + 1);
    return initialStartDate;
  });

  const [endDate, setEndDate] = useState<Date | null>(() => {
    const saved = localStorage.getItem('elitedrive_return_date');
    if (saved) return new Date(saved);
    const savedStart = localStorage.getItem('elitedrive_pickup_date');
    const startObj = savedStart ? new Date(savedStart) : new Date();
    const initialEndDate = new Date(startObj);
    initialEndDate.setDate(initialEndDate.getDate() + 3);
    return initialEndDate;
  });
  
  const [coupon, setCoupon] = useState('WELCOME');
  const [isCouponApplied, setIsCouponApplied] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    mode: 'onChange',
  });

  // Calculate rental duration
  const rentalDuration = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    
    if (rentalType === 'hourly') {
      return Math.ceil(diffTime / (1000 * 60 * 60));
    } else if (rentalType === 'weekly') {
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    }
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [startDate, endDate, rentalType]);

  // Price calculations
  const prices = useMemo(() => {
    if (!vehicle) return { base: 0, insurance: 0, discount: 0, total: 0 };
    
    let rate = vehicle.pricePerDay;
    if (rentalType === 'hourly') rate = vehicle.pricePerDay / 10; // Simple conversion
    if (rentalType === 'weekly') rate = vehicle.pricePerDay * 6; // Weekly discount rate
    
    const base = rate * Math.max(1, rentalDuration);
    const insurance = 2500;
    const discountAmount = isCouponApplied ? Math.min(base * 0.1, 5000) : 0;
    const total = base + insurance - discountAmount;
    
    return { base, insurance, discount: discountAmount, total };
  }, [vehicle, rentalDuration, rentalType, isCouponApplied]);

  // const isVerified = user?.emailVerified && user?.phoneVerified;
  const isVerified = true;

  useEffect(() => {
    // Only reset if form is not dirty or specifically when switching payment methods
    setValue('paymentDetail', ''); 
    setValue('destination', 'DHA Phase VI, Lahore');
  }, [paymentMethod, setValue]);

  if (!vehicle) return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest">Vehicle not found</div>;

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'WELCOME') {
      setIsCouponApplied(true);
      showToast('Promo code applied successfully!', 'success');
    } else {
      setIsCouponApplied(false);
      showToast('Invalid promo code.', 'error');
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (!agreedToTerms) {
      showToast('Please agree to terms to proceed.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newBooking = {
        id: 'b' + Date.now(),
        vehicleId: vehicle.id,
        userId: user?.id || 'u1',
        startDate: startDate?.toISOString().split('T')[0] || new Date().toISOString(),
        endDate: endDate?.toISOString().split('T')[0] || new Date().toISOString(),
        totalPrice: prices.total,
        status: 'pending' as const,
        paymentStatus: 'paid' as const,
        bookingDate: new Date().toISOString().split('T')[0],
        destination: data.destination
      };
      
      await addBooking(newBooking);
      await updateVehicle(vehicle.id, { status: 'booked' });
      showToast('Booking confirmed successfully!', 'success');
      navigate('/booking-confirmed');
    } catch (error) {
      showToast('Payment failed. Please try again.', 'error');
      console.error('Booking error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] font-display text-slate-900 antialiased min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-500">
              <Link className="hover:text-[#2563EB] transition-colors" to="/fleet">Search</Link>
              <ChevronRight size={14} />
              <Link className="hover:text-[#2563EB] transition-colors" to={`/vehicle/${vehicle.id}`}>Vehicle Details</Link>
              <ChevronRight size={14} />
              <span className="text-slate-900">Secure Checkout</span>
            </div>

            <div className="mb-10">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2 font-display">Complete your booking</h1>
              <p className="text-slate-500 flex items-center gap-2">
                <ShieldCheck className="text-green-500" size={18} />
                Your payment information is encrypted and secure.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Booking Summary */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold uppercase tracking-tight">Booking Summary</h3>
                  </div>
                  <div className="p-6">
                    <div 
                      className="aspect-video w-full rounded-xl bg-slate-100 mb-6 bg-cover bg-center overflow-hidden" 
                      style={{ backgroundImage: `url('${vehicle.image}')` }}
                    />
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900">{vehicle.name}</h4>
                        <p className="text-slate-500">Comfortable family sedan</p>
                      </div>
                      <Link to="/fleet" className="text-[#2563EB] text-sm font-semibold hover:underline">Change Car</Link>
                    </div>

                    {/* Rental Type Toggle */}
                    <div className="mb-6">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3">Rental Type</p>
                      <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                        <button 
                          onClick={() => setRentalType('hourly')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${rentalType === 'hourly' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-slate-500 hover:text-slate-700'}`} 
                          type="button"
                        >
                          Hourly
                        </button>
                        <button 
                          onClick={() => setRentalType('daily')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${rentalType === 'daily' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-slate-500 hover:text-slate-700'}`} 
                          type="button"
                        >
                          Daily
                        </button>
                        <button 
                          onClick={() => setRentalType('weekly')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${rentalType === 'weekly' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-slate-500 hover:text-slate-700'}`} 
                          type="button"
                        >
                          Weekly
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      {/* Editable Duration */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="text-[#2563EB]" size={14} />
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Duration</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <CustomCalendar
                            className="bg-transparent!"
                            placeholder="Start Date"
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            minDate={new Date()}
                          />
                          <CustomCalendar
                            placeholder="End Date"
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            minDate={startDate || new Date()}
                          />
                        </div>
                      </div>
                      {/* Editable Pick-up */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="text-[#2563EB]" size={14} />
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Pick-up & Destination</p>
                        </div>
                        <input 
                          {...register('destination')}
                          className="w-full bg-white border-none text-sm p-3 rounded-lg font-bold focus:ring-1 focus:ring-[#2563EB] outline-none"
                          placeholder="Drop off location"
                        />
                        {errors.destination && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.destination.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{rentalType.charAt(0).toUpperCase() + rentalType.slice(1)} Rental ({rentalDuration} units)</span>
                        <span className="font-medium">Rs. {prices.base.toLocaleString()}</span>
                      </div>
                      <div className="mt-1 mb-2 px-3 py-1.5 bg-[#EFF6FF] rounded-lg flex items-center gap-1.5 w-fit">
                        <Info className="text-[#2563EB]" size={12} />
                        <span className="text-[10px] font-medium text-[#2563EB]/80 uppercase tracking-tight">Dynamic price based on current demand</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Insurance (Standard)</span>
                        <span className="font-medium">Rs. {prices.insurance.toLocaleString()}</span>
                      </div>
                      
                      {/* Coupon Code Section */}
                      <div className="pt-2">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Ticket className={`absolute left-3 top-1/2 -translate-y-1/2 ${isCouponApplied ? 'text-green-500' : 'text-slate-400'}`} size={16} />
                            <input 
                              className="w-full text-sm rounded-xl border-slate-200 bg-white focus:ring-[#2563EB] h-11 pl-10" 
                              placeholder="Coupon Code" 
                              type="text" 
                              value={coupon}
                              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                            />
                          </div>
                          <button 
                            onClick={handleApplyCoupon}
                            className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                        {isCouponApplied && (
                          <p className="text-xs text-green-600 mt-2 font-medium">Promo code {coupon} applied! You saved Rs. {prices.discount.toLocaleString()}.</p>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-4">
                        <span className="text-lg font-bold">Total Price</span>
                        <span className="text-2xl font-black text-[#2563EB]">Rs. {prices.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Payment Form */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Payment Method Selector */}
                    <div>
                      <h3 className="text-lg font-bold mb-5 uppercase tracking-tight">Payment Method</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <button 
                          onClick={() => setPaymentMethod('easypaisa')}
                          type="button"
                          className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all ${paymentMethod === 'easypaisa' ? 'border-[#339b41] bg-green-50/10' : 'border-slate-100 hover:border-[#339b41]/50'}`} 
                        >
                          <div className="h-10 w-16 bg-white rounded-lg flex items-center justify-center mb-2 shadow-sm border border-slate-100 overflow-hidden">
                            <img alt="Easypaisa" className="h-full w-full object-contain p-1" src="https://lh3.googleusercontent.com/aida/ADBb0uiH-T5bGcdF-tWz3OEHBevPBTjbtPFvzBwmS8Yku-XbZh_1FnUx1o7-VcTxe9T0mVTNc8p58YCT4Kh19qf8AJdl5eHAy5rqMkFY-XCHoZROA6APVYUnnLSQTLL0-q-eftR8CyO6hiHue_sojJvt6uberGECyr5dadqXpybqstVvX8xCw2yGEQp2oIhwwVrLt2Aj6oxogU5SNm9H1viihqle8CGsGctdfbtLCN2ElAoVOhUgiq3jEFpdoEo_igz7FcvXFvGiIPteqA" />
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'easypaisa' ? 'text-[#339b41]' : 'text-slate-400'}`}>Easypaisa</span>
                        </button>
                        <button 
                          onClick={() => setPaymentMethod('jazzcash')}
                          type="button"
                          className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all ${paymentMethod === 'jazzcash' ? 'border-[#fdb913] bg-[#fff9e6]' : 'border-slate-100 hover:border-[#fdb913]/50'}`} 
                        >
                          <div className="h-10 w-16 bg-white rounded-lg flex items-center justify-center mb-2 border border-slate-100 overflow-hidden">
                            <img alt="JazzCash" className="h-full w-full object-contain" src="https://lh3.googleusercontent.com/aida/ADBb0ug54q3gb4XNSOQQxlB16bfN8gkj9z5hl8s7ugRVbFR78h73zwqUEXrCTnFvKwiSrgNGSiMLkREN0a1t-j-j3_QDtzs7ueNQWyFCUKugw5ZXcdHEKwltQWTbWUQcUDoY8TDvJnSPAzrfxsrV2AJTdrzuD1dn0QsNQjnEfz_U-cyUIhos8befM8-VrMJJlC-oWCFbGBzuyC3HRZzDzRl91hlvrQJefF0EXmnEWcNwsP5Ko6GQh49prYb1ZRHV-vxSoPj36ZqmEr9s3g" />
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'jazzcash' ? 'text-[#ed1c24]' : 'text-slate-400'}`}>JazzCash</span>
                        </button>
                        <button 
                          onClick={() => setPaymentMethod('card')}
                          type="button"
                          className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all ${paymentMethod === 'card' ? 'border-[#2563EB] bg-blue-50/10' : 'border-slate-100 hover:border-[#2563EB]/50'}`} 
                        >
                          <Building2 className={`mb-2 ${paymentMethod === 'card' ? 'text-[#2563EB]' : 'text-slate-400'}`} size={24} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'card' ? 'text-[#2563EB]' : 'text-slate-400'}`}>Bank</span>
                        </button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-slate-200"></div>
                      <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">or pay with card</span>
                      <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    {/* Form Details */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Cardholder Name</label>
                        <input className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all font-bold placeholder:text-slate-300 placeholder:font-normal" placeholder="John Doe" type="text" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Card Number / Mobile Account</label>
                          <div className="relative">
                            {paymentMethod === 'card' ? <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /> : <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />}
                            <input 
                              {...register('paymentDetail')}
                              className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all font-bold placeholder:text-slate-300 placeholder:font-normal" 
                              placeholder={paymentMethod === 'card' ? "0000 0000 0000 0000" : "03XX XXXXXXX"} 
                              type="text"
                            />
                          </div>
                          {errors.paymentDetail && <p className="text-xs text-red-500 mt-1">{errors.paymentDetail.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Expiry</label>
                            <input className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all font-bold placeholder:text-slate-300 placeholder:font-normal" placeholder="MM/YY" type="text" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">CVV</label>
                            <input className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all font-bold placeholder:text-slate-300 placeholder:font-normal" placeholder="•••" type="password" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-start gap-4">
                        <input 
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-1 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] h-5 w-5 cursor-pointer" 
                          id="verify-booking" 
                          type="checkbox" 
                        />
                        <label className="text-sm font-medium text-slate-700 cursor-pointer leading-relaxed" htmlFor="verify-booking">
                          By clicking the button, you agree to our <Link className="text-[#2563EB] hover:underline" to="#">Terms of Service</Link> and <Link className="text-[#2563EB] hover:underline" to="#">Privacy Policy</Link>. Your booking will be confirmed instantly.
                        </label>
                      </div>
                    </div>

                    {/* Pay Button */}
                    <button 
                      type="submit"
                      disabled={isProcessing || !agreedToTerms}
                      className={`w-full py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-white ${isProcessing || !agreedToTerms ? 'bg-slate-400 cursor-not-allowed grayscale' : 'bg-[#2563EB] hover:bg-[#2563EB]/90 shadow-[#2563EB]/25 translate-y-0 active:translate-y-0.5'}`} 
                    >
                      {isProcessing ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        <Lock size={18} />
                      )}
                      Pay Rs. {prices.total.toLocaleString()} and Reserve
                    </button>
                  </form>
                </div>

                {/* Security Badges */}
                <div className="flex items-center justify-center gap-8 mt-10 grayscale opacity-50">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <ShieldCheck className="text-green-600" size={14} />
                    PCI Compliant
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <Activity className="text-blue-600" size={14} />
                    SSL Secure
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <ShieldAlert className="text-orange-600" size={14} />
                    Norton Secured
                  </div>
                </div>
              </div>
            </div>
          </main>
          
          <footer className="py-10 border-t border-slate-200 px-6 md:px-20 bg-white mt-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">© 2023 EliteDrive Inc. All rights reserved.</div>
              <div className="flex gap-8 text-xs font-bold text-slate-400">
                <Link className="hover:text-[#2563EB] transition-colors uppercase tracking-widest" to="#">Privacy Policy</Link>
                <Link className="hover:text-[#2563EB] transition-colors uppercase tracking-widest" to="#">Terms of Service</Link>
                <Link className="hover:text-[#2563EB] transition-colors uppercase tracking-widest" to="#">Cookie Settings</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Payment;
