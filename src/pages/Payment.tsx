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
  Ticket,
  ArrowLeft,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { calculateBaseFare, getVehicleFareConfig } from '../utils/pricing';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema, PaymentFormData } from '../schemas/payment';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomCalendar from '../components/ui/CustomCalendar';

const Payment: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { vehicles, addBooking, user, showToast, updateVehicle, bookings } = useStore();
  const vehicle = vehicles.find(v => v.id === id);
  
  // States
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'jazzcash' | 'card' | 'transfer'>('jazzcash');
  const [rentalType, setRentalType] = useState<'hourly' | 'daily' | 'weekly'>('daily');
  const [insuranceType, setInsuranceType] = useState<'none' | 'basic' | 'premium'>('basic');
  const [chauffeurSelected, setChauffeurSelected] = useState(false);
  const [selectedHours, setSelectedHours] = useState<number>(4);
  
  // Dates logic
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [startDate, setStartDate] = useState<Date | null>(() => {
    const saved = localStorage.getItem('elitedrive_pickup_date');
    if (saved) {
      const parsed = new Date(saved);
      if (parsed >= todayStart) {
        return parsed;
      }
    }
    const d = new Date();
    d.setHours(10, 0, 0, 0); // Defaults to standard 10:00 AM for pickup
    return d;
  });

  const [endDate, setEndDate] = useState<Date | null>(() => {
    const saved = localStorage.getItem('elitedrive_return_date');
    if (saved) {
      const parsed = new Date(saved);
      if (parsed >= todayStart) {
        return parsed;
      }
    }
    const startObj = new Date();
    const initialEndDate = new Date(startObj);
    initialEndDate.setDate(initialEndDate.getDate() + 1); // Defaults to tomorrow
    initialEndDate.setHours(10, 0, 0, 0); // Defaults to standard 10:00 AM for return
    return initialEndDate;
  });

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (rentalType === 'hourly' && date) {
      const calculatedEnd = new Date(date.getTime() + selectedHours * 60 * 60 * 1000);
      setEndDate(calculatedEnd);
    } else if (rentalType === 'weekly' && date) {
      const nextEnd = new Date(date);
      nextEnd.setDate(nextEnd.getDate() + 7); // Exactly one week later
      setEndDate(nextEnd);
    } else if (date && endDate && date >= endDate) {
      const nextEnd = new Date(date);
      nextEnd.setDate(nextEnd.getDate() + 1);
      setEndDate(nextEnd);
    }
  };

  const minEndDate = useMemo(() => {
    if (!startDate) return todayStart;
    if (rentalType === 'weekly') {
      const minWeekly = new Date(startDate);
      minWeekly.setDate(startDate.getDate() + 7); // At least one week later
      return minWeekly;
    }
    return startDate;
  }, [startDate, rentalType, todayStart]);

  // Adjust dates when rental type changes to Weekly or Hourly to prevent inconsistent short/long durations
  useEffect(() => {
    if (!startDate) return;

    if (rentalType === 'weekly') {
      // Ensure the end date is at least 7 calendar days (startDate + 7 days)
      const startObj = new Date(startDate);
      startObj.setHours(0, 0, 0, 0);
      
      const checkEnd = endDate ? new Date(endDate) : null;
      if (checkEnd) {
        checkEnd.setHours(0, 0, 0, 0);
      }

      if (!checkEnd || !endDate || Math.round((checkEnd.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24)) < 7) {
        const newEndDate = new Date(startDate);
        newEndDate.setDate(newEndDate.getDate() + 7);
        setEndDate(newEndDate);
      }
    } else if (rentalType === 'hourly') {
      // For hourly, always sync to selectedHours offset from startDate
      const calculatedEnd = new Date(startDate.getTime() + selectedHours * 60 * 60 * 1000);
      setEndDate(calculatedEnd);
    }
  }, [rentalType, startDate, selectedHours]);
  
  const [coupon, setCoupon] = useState('WELCOME');
  const [isCouponApplied, setIsCouponApplied] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // If the WELCOME coupon is applied but the user has previous bookings, auto-disable it.
  useEffect(() => {
    if (isCouponApplied && coupon.toUpperCase() === 'WELCOME' && bookings && bookings.length > 0) {
      setIsCouponApplied(false);
    }
  }, [bookings, isCouponApplied, coupon]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    mode: 'onChange',
    defaultValues: {
      destination: 'DHA Phase VI, Lahore',
      paymentDetail: ''
    }
  });

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    
    // Normalize both dates to midnights of their respective days to avoid timezone and time-of-day offsets
    const startObj = new Date(startDate);
    startObj.setHours(0, 0, 0, 0);
    const endObj = new Date(endDate);
    endObj.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(endObj.getTime() - startObj.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // Standard 24h cycle: June 2 to June 3 is 1 day. June 2 to June 9 is exactly 7 days!
    return Math.max(1, diffDays);
  }, [startDate, endDate]);

  // Calculate rental duration
  const rentalDuration = useMemo(() => {
    if (rentalType === 'hourly') {
      return selectedHours;
    }
    if (rentalType === 'weekly') {
      // A weekly rental duration is duration in weeks (7 days = 1 week, 14 days = 2 weeks)
      return Math.max(1, Math.round(calendarDays / 7));
    }
    return calendarDays;
  }, [calendarDays, rentalType, selectedHours]);

  // Price calculations - Adjusted for real-world PKR pricing limits using professional Pakistani Car Rental tariffs
  const prices = useMemo(() => {
    if (!vehicle) return { base: 0, insurance: 0, chauffeurCost: 0, discount: 0, total: 0 };
    
    // Calculates base dynamically with realistic Pakistani car rental minimums & multipliers
    const base = calculateBaseFare(vehicle, rentalDuration, rentalType);
    
    // Dynamic Insurance Selector Math:
    // none: 0
    // basic: 400 * calendarDays
    // premium: 850 * calendarDays
    let insurance = 0;
    if (insuranceType === 'basic') {
      insurance = rentalType === 'hourly' ? 500 : 400 * calendarDays;
    } else if (insuranceType === 'premium') {
      insurance = rentalType === 'hourly' ? 1000 : 850 * calendarDays;
    }
    
    const chauffeurCost = chauffeurSelected 
      ? (rentalType === 'hourly' ? 2500 : 2500 * calendarDays) 
      : 0;
    const discountAmount = isCouponApplied ? Math.min(base * 0.1, 8000) : 0;
    const total = base + insurance + chauffeurCost - discountAmount;
    
    return { base, insurance, chauffeurCost, discount: discountAmount, total };
  }, [vehicle, rentalDuration, rentalType, isCouponApplied, insuranceType, chauffeurSelected, calendarDays]);

  const unitLabel = useMemo(() => {
    if (rentalType === 'hourly') {
      return rentalDuration === 1 ? 'Hour' : 'Hours';
    } else if (rentalType === 'weekly') {
      return rentalDuration === 1 ? 'Week' : 'Weeks';
    } else {
      return rentalDuration === 1 ? 'Day' : 'Days';
    }
  }, [rentalType, rentalDuration]);

  const isVerified = true;

  useEffect(() => {
    setValue('paymentDetail', ''); 
  }, [paymentMethod, setValue]);

  // Sync to localStorage
  useEffect(() => {
    if (startDate) {
      localStorage.setItem('elitedrive_pickup_date', startDate.toISOString());
    }
  }, [startDate]);

  useEffect(() => {
    if (endDate) {
      localStorage.setItem('elitedrive_return_date', endDate.toISOString());
    }
  }, [endDate]);

  if (!vehicle) return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest">Vehicle not found</div>;

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'WELCOME') {
      if (bookings && bookings.length > 0) {
        setIsCouponApplied(false);
        showToast('This promo code is only available for new users.', 'error');
        return;
      }
      setIsCouponApplied(true);
      showToast('Promo code applied successfully!', 'success');
    } else {
      setIsCouponApplied(false);
      showToast('Invalid promo code.', 'error');
    }
  };

  const handleRemoveCoupon = () => {
    setIsCouponApplied(false);
    setCoupon('');
    showToast('Promo code removed.', 'info');
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (!agreedToTerms) {
      showToast('Please agree to terms to proceed.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      // Simulate secure payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newBooking: any = {
        id: 'b' + Date.now(),
        vehicleId: vehicle.id,
        userId: user?.id || 'u1',
        startDate: startDate?.toISOString() || new Date().toISOString(),
        endDate: endDate?.toISOString() || new Date().toISOString(),
        totalPrice: prices.total,
        status: 'pending' as const,
        paymentStatus: 'paid' as const,
        bookingDate: new Date().toISOString().split('T')[0],
        destination: data.destination || '',
        chauffeurSelected: chauffeurSelected,
        rentalType: rentalType,
        rentalDuration: rentalDuration,
        calendarDays: calendarDays,
        basePrice: prices.base,
        insurancePrice: prices.insurance,
        chauffeurPrice: prices.chauffeurCost,
        discountPrice: prices.discount,
        insuranceType: insuranceType
      };

      if (chauffeurSelected) {
        newBooking.driverName = "Muhammad Ali";
        newBooking.driverPhone = "+92 (300) 876-5432";
      }
      
      await addBooking(newBooking);
      await updateVehicle(vehicle.id, { status: 'booked' });
      showToast('Booking and payment confirmed successfully!', 'success');
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

            {/* Stepper Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
                  {step === 'details' ? 'Confirm your trip details' : 'Enter payment details'}
                </h1>
                <p className="text-slate-500 flex items-center gap-2 text-sm">
                  <ShieldCheck className="text-green-500" size={18} />
                  Your booking details are secure, encrypted, and backed by EliteDrive.
                </p>
              </div>

              {/* Progress Tracker */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${step === 'details' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  1. Trip Review
                </span>
                <ChevronRight className="text-slate-300" size={16} />
                <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${step === 'payment' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  2. Payment Details
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: Always show Dynamic Booking Summary Banner */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Selected Vehicle</h3>
                  </div>
                  <div className="p-6">
                    <div 
                      className="aspect-video w-full rounded-xl bg-slate-100 mb-6 bg-cover bg-center overflow-hidden border border-slate-200" 
                      style={{ backgroundImage: `url('${vehicle.image}')` }}
                    />
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-xl font-black text-slate-950">{vehicle.name}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase mt-0.5 tracking-wider">{vehicle.type} Class</p>
                      </div>
                      <Link to="/fleet" className="text-[#2563EB] text-xs font-black hover:underline uppercase tracking-wide">Change Car</Link>
                    </div>

                    {/* Rental Type Toggle - Editable only in standard details step */}
                    <div className="mb-6">
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-black mb-3">Rental Type</p>
                      <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                        <button 
                          disabled={step === 'payment'}
                          onClick={() => {
                            setRentalType('hourly');
                            const today = new Date();
                            const calculatedEnd = new Date(today.getTime() + selectedHours * 60 * 60 * 1000);
                            setStartDate(today);
                            setEndDate(calculatedEnd);
                          }}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${rentalType === 'hourly' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-slate-500 hover:text-slate-700 disabled:opacity-60'}`} 
                          type="button"
                        >
                          Hourly
                        </button>
                        <button 
                          disabled={step === 'payment'}
                          onClick={() => {
                            setRentalType('daily');
                            const today = new Date();
                            const tomorrow = new Date(today);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            setStartDate(today);
                            setEndDate(tomorrow);
                          }}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${rentalType === 'daily' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-slate-500 hover:text-slate-700 disabled:opacity-60'}`} 
                          type="button"
                        >
                          Daily
                        </button>
                        <button 
                          disabled={step === 'payment'}
                          onClick={() => {
                            setRentalType('weekly');
                            const today = new Date();
                            const nextWeek = new Date(today);
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            setStartDate(today);
                            setEndDate(nextWeek);
                          }}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${rentalType === 'weekly' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-slate-500 hover:text-slate-700 disabled:opacity-60'}`} 
                          type="button"
                        >
                          Weekly
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      {/* Dates Selector */}
                      <div className="p-5 bg-slate-50/55 rounded-2xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-slate-200 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-2 mb-3">
                          <CalendarIcon className="text-[#2563EB]" size={14} />
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Rental Dates</p>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-black text-slate-400">
                              {rentalType === 'hourly' ? 'Pickup Date & Time' : 'Pickup'}
                            </span>
                            <CustomCalendar
                              disabled={step === 'payment'}
                              className="bg-transparent!"
                              placeholder="Start Date"
                              selected={startDate}
                              onChange={handleStartDateChange}
                              minDate={todayStart}
                              showTimeSelect={true}
                            />
                          </div>

                          {rentalType === 'hourly' ? (
                            <>
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-black text-slate-400">Duration (Hours)</span>
                                <select
                                  disabled={step === 'payment'}
                                  value={selectedHours}
                                  onChange={(e) => setSelectedHours(parseInt(e.target.value, 10))}
                                  className="w-full pl-6 pr-6 py-4 bg-slate-50 rounded-[24px] border-2 border-slate-100 transition-all text-slate-900 font-bold placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white"
                                >
                                  {[1, 2, 3, 4, 5, 6, 8, 10, 12, 18, 24].map((h) => (
                                    <option key={h} value={h}>{h} {h === 1 ? 'Hour' : 'Hours'}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-black text-slate-400">Calculated Return</span>
                                <div className="w-full pl-6 pr-6 py-4 bg-slate-50 rounded-[20px] border-2 border-slate-100 text-slate-600 font-bold text-xs">
                                  {endDate ? endDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="space-y-1 font-sans">
                              <span className="text-[10px] uppercase font-black text-slate-400 font-sans">Return</span>
                              <CustomCalendar
                                disabled={step === 'payment'}
                                placeholder="End Date"
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                minDate={minEndDate}
                                showTimeSelect={true}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Drop-off input */}
                      <div className="p-5 bg-slate-50/55 rounded-2xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-slate-200 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="text-[#2563EB]" size={14} />
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Pick-up & Destination</p>
                        </div>
                        <input 
                          disabled={step === 'payment'}
                          {...register('destination')}
                          className="w-full bg-white border border-slate-200 text-sm p-3 rounded-lg font-bold focus:ring-1 focus:ring-[#2563EB] outline-none disabled:bg-slate-100/50"
                          placeholder="Drop off location"
                        />
                        {errors.destination && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.destination.message}</p>}
                      </div>
                    </div>

                    {/* Detailed Pricing breakdown & Transparency Card */}
                    <div className="space-y-4 pt-6 border-t border-slate-200 font-sans">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Fare Breakdown</h4>

                      {/* Base Rate */}
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex flex-col gap-1 text-xs">
                        <div className="flex justify-between font-bold text-slate-900 font-sans">
                          <span>{rentalType.charAt(0).toUpperCase() + rentalType.slice(1)} Rental Base Fare</span>
                          <span>PKR {prices.base.toLocaleString()}</span>
                        </div>
                        <div className="text-slate-400 font-medium text-[11px] flex flex-col gap-0.5">
                          {rentalType === 'weekly' && (
                            <>
                              <span>• Base Pack Rate: PKR {getVehicleFareConfig(vehicle).weeklyPackagePrice.toLocaleString()} / week</span>
                              <span>• Duration: {rentalDuration} {unitLabel} ({calendarDays} days total)</span>
                              {rentalDuration >= 4 && (
                                <span className="text-green-600 font-bold">• Included monthly 10% discount!</span>
                              )}
                            </>
                          )}
                          {rentalType === 'daily' && (
                            <>
                              <span>• Daily Rate: PKR {getVehicleFareConfig(vehicle).pricePerDay.toLocaleString()} / day</span>
                              <span>• Duration: {rentalDuration} {unitLabel}</span>
                            </>
                          )}
                          {rentalType === 'hourly' && (
                            <>
                              <span>• Minimum Base (first {getVehicleFareConfig(vehicle).hourlyMinHrs} hrs): PKR {getVehicleFareConfig(vehicle).hourlyBasePrice.toLocaleString()}</span>
                              {rentalDuration > getVehicleFareConfig(vehicle).hourlyMinHrs ? (
                                <>
                                  <span>• Subsequent Rate: PKR {getVehicleFareConfig(vehicle).hourlySubsequentRate.toLocaleString()} / hour</span>
                                  <span>• Subsequent Duration: {rentalDuration - getVehicleFareConfig(vehicle).hourlyMinHrs} subsequent hours</span>
                                </>
                              ) : (
                                <span>• Duration: {rentalDuration} Hours</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Insurance Cover */}
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex flex-col gap-1 text-xs">
                        <div className="flex justify-between font-bold text-slate-900 font-sans">
                          <span>Insurance Protection Coverage</span>
                          <span>{prices.insurance === 0 ? 'Rs. 0' : `PKR ${prices.insurance.toLocaleString()}`}</span>
                        </div>
                        <div className="text-slate-400 font-medium text-[11px] flex flex-col gap-0.5">
                          {insuranceType === 'none' ? (
                            <span>• Supplemental Protection (Declined)</span>
                          ) : insuranceType === 'basic' ? (
                            <span>• LCW Basic Coverage Applied</span>
                          ) : (
                            <span>• Full Zero-Deductible Cover Applied</span>
                          )}
                        </div>
                      </div>

                      {/* Chauffeur Service */}
                      {chauffeurSelected && (
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex flex-col gap-1 text-xs">
                          <div className="flex justify-between font-bold text-slate-900 font-sans">
                            <span>Uniformed Chauffeur Service</span>
                            <span>PKR {prices.chauffeurCost.toLocaleString()}</span>
                          </div>
                          <div className="text-slate-400 font-medium text-[11px]">
                            <span>• Active Duration: {calendarDays} days total</span>
                          </div>
                        </div>
                      )}

                      {/* Promo Coupon discount */}
                      {isCouponApplied && (
                        <div className="flex justify-between items-center text-xs text-green-700 font-bold bg-green-50/50 p-3 rounded-xl border border-green-100 px-3.5">
                          <div className="flex flex-col">
                            <span>Promo Discount Applied (10% off Base)</span>
                            <span className="text-[10px] text-green-600/80 font-medium">Coupon code: {coupon}</span>
                          </div>
                          <span className="font-extrabold font-sans">- PKR {prices.discount.toLocaleString()}</span>
                        </div>
                      )}

                      {/* Total Amount rendering */}
                      <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-4 font-sans font-sans">
                        <span className="text-lg font-black uppercase text-slate-950">Total Amount</span>
                        <span className="text-2xl font-black text-[#2563EB]">PKR {prices.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Steps View (Details Confirmation vs card details input) */}
              <div className="lg:col-span-7">
                {step === 'details' ? (
                  /* Step 1 Profile: Review Booking Parameters */
                  <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-8 shadow-sm">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight mb-2">1. Review Trip Details & Insurance</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Please select your package coverage. Our vehicles are verify-cleared. You can optionally purchase supplementary CDW (Collision Damage Waiver) to ensure 0% financial deductible.
                      </p>
                    </div>

                    {/* Interactive Insurance Toggles */}
                    <div className="space-y-4">
                      <p className="text-xs uppercase font-black tracking-widest text-slate-400">Select Damage Protection Bundle</p>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {/* Premium Pack */}
                        <div 
                          onClick={() => setInsuranceType('premium')}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${insuranceType === 'premium' ? 'border-[#2563EB] bg-blue-50/5' : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'}`}
                        >
                          <div className={`p-2 rounded-xl mt-0.5 ${insuranceType === 'premium' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            <ShieldCheck size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-slate-900 text-sm">Full Zero-Deductible Elite Cover</h4>
                              <span className="text-xs font-black text-blue-600">PKR 850 / day</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              EliteDrive fully covers all minor scratches, major collision repairs, windshields, tires, and mechanical stress damage with absolutely **Rs. 0 customer offset liability**. Recommended for worry-free highway commutes.
                            </p>
                          </div>
                        </div>

                        {/* Basic Pack */}
                        <div 
                          onClick={() => setInsuranceType('basic')}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${insuranceType === 'basic' ? 'border-[#2563EB] bg-blue-50/5' : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'}`}
                        >
                          <div className={`p-2 rounded-xl mt-0.5 ${insuranceType === 'basic' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            <ShieldCheck size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-slate-900 text-sm">Loss Collision Waiver (LCW) Basic</h4>
                              <span className="text-xs font-black text-blue-600">PKR 400 / day</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Covers standard collision impacts where customer liability is capped at a maximum of PKR 30,000. Does not cover tires, minor side-mirrors, or interior spills.
                            </p>
                          </div>
                        </div>

                        {/* Decline Cover */}
                        <div 
                          onClick={() => setInsuranceType('none')}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${insuranceType === 'none' ? 'border-[#2563EB] bg-blue-50/5' : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'}`}
                        >
                          <div className={`p-2 rounded-xl mt-0.5 ${insuranceType === 'none' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            <ShieldAlert size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-slate-900 text-sm">Decline Additional Cover (Third-Party Only)</h4>
                              <span className="text-xs font-black text-slate-400">Rs. 0 / day</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Opt-out of any EliteDrive supplementary protections. Renter assumes 100% replacement and diagnostic liability for any accidental damage or towing.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Chauffeur Toggle */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <p className="text-xs uppercase font-black tracking-widest text-slate-400">Add Professional Chauffeur</p>
                      
                      <div 
                        onClick={() => setChauffeurSelected(!chauffeurSelected)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${chauffeurSelected ? 'border-[#2563EB] bg-blue-50/5' : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'}`}
                      >
                        <div className={`p-2 rounded-xl mt-0.5 ${chauffeurSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          <CheckCircle size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-slate-900 text-sm">Include Elite Chauffeur Service</h4>
                            <span className="text-xs font-black text-blue-600">PKR 2,500 / day</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Upgrade to a professional, English-speaking uniform chauffeur who handles vehicle maintenance, route navigation, and security clearance perfectly. Enjoy a VIP state of commuting.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Promo Code Lock Form */}
                    <div className="p-5 bg-slate-50/55 rounded-2xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-slate-200 hover:shadow-sm transition-all duration-200 space-y-3">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Promotional Codes</p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Ticket className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isCouponApplied ? 'text-green-600' : 'text-slate-400'}`} size={16} />
                          <input 
                            disabled={isCouponApplied}
                            className="w-full text-sm rounded-xl border border-slate-200 bg-white focus:ring-[#2563EB] h-11 pl-10 uppercase font-black" 
                            placeholder="Promo Coupon Code" 
                            type="text" 
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={isCouponApplied ? handleRemoveCoupon : handleApplyCoupon}
                          className={`px-5 py-2.5 text-xs font-black uppercase rounded-xl transition-all ${isCouponApplied ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                          {isCouponApplied ? 'Remove' : 'Apply'}
                        </button>
                      </div>
                      {isCouponApplied && (
                        <p className="text-[11px] text-green-700 font-bold flex items-center gap-1.5 pt-1">
                          <CheckCircle size={12} /> Promo Code **{coupon}** is Applied! You saved PKR {prices.discount.toLocaleString()} base discount.
                        </p>
                      )}
                    </div>

                    <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100">
                      <div className="flex items-start gap-4">
                        <input 
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-1 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] h-5 w-5 cursor-pointer" 
                          id="verify-booking-chk" 
                          type="checkbox" 
                        />
                        <label className="text-xs font-semibold text-slate-700 cursor-pointer leading-relaxed" htmlFor="verify-booking-chk">
                          I certify that I have reviewed the checkout summary dates and locations. By proceeding, I agree to the EliteDrive <Link className="text-[#2563EB] font-bold hover:underline" to="/rules-policies">Standard Rules & Policies</Link> which govern vehicle handling and security.
                        </label>
                      </div>
                    </div>

                    {/* Proceed Button */}
                    <button 
                      onClick={() => {
                        if (!agreedToTerms) {
                          showToast('Please accept the trip compliance agreement.', 'error');
                          return;
                        }
                        setStep('payment');
                      }}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-500/10 transition-all flex items-center justify-center gap-2 group"
                    >
                      <span>Proceed to Secure Payment</span>
                      <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={16} />
                    </button>
                  </div>
                ) : (
                  /* Step 2 Form: Cards detail collection */
                  <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setStep('details')}
                        className="text-xs font-black uppercase text-slate-400 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowLeft size={16} /> Back to Trip Details
                      </button>
                      <span className="text-xs font-black uppercase text-slate-400">Step 2 of 2</span>
                    </div>

                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-extrabold text-slate-950 uppercase tracking-tight mb-1">Secure Payment Integration</h3>
                      <p className="text-xs text-slate-500 font-semibold">
                        Enter your secure bank card or e-wallet account details below to finalize booking.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Payment Method Selector */}
                      <div>
                        <p className="text-xs uppercase font-black tracking-widest text-slate-400 mb-3 block">Payment Method Provider</p>
                        <div className="grid grid-cols-3 gap-3">
                          <button 
                            onClick={() => setPaymentMethod('easypaisa')}
                            type="button"
                            className={`flex flex-col items-center justify-center p-3 border-2 rounded-2xl transition-all ${paymentMethod === 'easypaisa' ? 'border-[#339b41] bg-green-50/10' : 'border-slate-100 hover:border-slate-200 bg-slate-50/20'}`} 
                          >
                            <div className="h-9 w-14 bg-white rounded-lg flex items-center justify-center mb-1.5 border border-slate-100 overflow-hidden shadow-sm">
                              <img alt="Easypaisa" className="h-full w-full object-contain p-1" src="https://lh3.googleusercontent.com/aida/ADBb0uiH-T5bGcdF-tWz3OEHBevPBTjbtPFvzBwmS8Yku-XbZh_1FnUx1o7-VcTxe9T0mVTNc8p58YCT4Kh19qf8AJdl5eHAy5rqMkFY-XCHoZROA6APVYUnnLSQTLL0-q-eftR8CyO6hiHue_sojJvt6uberGECyr5dadqXpybqstVvX8xCw2yGEQp2oIhwwVrLt2Aj6oxogU5SNm9H1viihqle8CGsGctdfbtLCN2ElAoVOhUgiq3jEFpdoEo_igz7FcvXFvGiIPteqA" />
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider ${paymentMethod === 'easypaisa' ? 'text-[#339b41]' : 'text-slate-400'}`}>Easypaisa</span>
                          </button>

                          <button 
                            onClick={() => setPaymentMethod('jazzcash')}
                            type="button"
                            className={`flex flex-col items-center justify-center p-3 border-2 rounded-2xl transition-all ${paymentMethod === 'jazzcash' ? 'border-[#fdb913] bg-[#fff9e6]' : 'border-slate-100 hover:border-slate-200 bg-slate-50/20'}`} 
                          >
                            <div className="h-9 w-14 bg-white rounded-lg flex items-center justify-center mb-1.5 shadow-sm border border-slate-100 overflow-hidden">
                              <img alt="JazzCash" className="h-full w-full object-contain" src="https://lh3.googleusercontent.com/aida/ADBb0ug54q3gb4XNSOQQxlB16bfN8gkj9z5hl8s7ugRVbFR78h73zwqUEXrCTnFvKwiSrgNGSiMLkREN0a1t-j-j3_QDtzs7ueNQWyFCUKugw5ZXcdHEKwltQWTbWUQcUDoY8TDvJnSPAzrfxsrV2AJTdrzuD1dn0QsNQjnEfz_U-cyUIhos8befM8-VrMJJlC-oWCFbGBzuyC3HRZzDzRl91hlvrQJefF0EXmnEWcNwsP5Ko6GQh49prYb1ZRHV-vxSoPj36ZqmEr9s3g" />
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider ${paymentMethod === 'jazzcash' ? 'text-[#ed1c24]' : 'text-slate-400'}`}>JazzCash</span>
                          </button>

                          <button 
                            onClick={() => setPaymentMethod('card')}
                            type="button"
                            className={`flex flex-col items-center justify-center p-3 border-2 rounded-2xl transition-all ${paymentMethod === 'card' ? 'border-[#2563EB] bg-blue-50/10' : 'border-slate-100 hover:border-slate-200 bg-slate-50/20'}`} 
                          >
                            <Building2 className={`mb-1.5 ${paymentMethod === 'card' ? 'text-[#2563EB]' : 'text-slate-400'}`} size={20} />
                            <span className={`text-[9px] font-black uppercase tracking-wider ${paymentMethod === 'card' ? 'text-[#2563EB]' : 'text-slate-400'}`}>Credit Card</span>
                          </button>
                        </div>
                      </div>

                      {/* Divider for Visual Split */}
                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-3 text-slate-450 text-[9px] font-black uppercase tracking-widest">Payment credentials input</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      {/* Form Details */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-500">Account Owner Full Name</label>
                          <input className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none font-bold text-sm transition-all" placeholder="John Doe" type="text" required />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                              {paymentMethod === 'card' ? 'Card Number ID' : 'Mobile Account Pin / Number'}
                            </label>
                            <div className="relative">
                              {paymentMethod === 'card' ? <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} /> : <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />}
                              <input 
                                {...register('paymentDetail')}
                                className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none font-bold text-sm transition-all" 
                                placeholder={paymentMethod === 'card' ? "0000 0000 0000 0000" : "03XX XXXXXXX"} 
                                type="text"
                              />
                            </div>
                            {errors.paymentDetail && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.paymentDetail.message}</p>}
                          </div>

                          {paymentMethod === 'card' ? (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-500">Card Expire</label>
                                <input className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none font-bold text-sm transition-all" placeholder="MM/YY" type="text" required />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-500">CVV</label>
                                <input className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none font-bold text-sm transition-all" placeholder="•••" type="password" required />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Account OTP Code Choice</label>
                              <input className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none font-bold text-sm transition-all" placeholder="6-digit verification code" type="password" required />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pay Button */}
                      <button 
                        type="submit"
                        disabled={isProcessing}
                        className={`w-full py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-white text-xs ${isProcessing ? 'bg-slate-400 cursor-not-allowed grayscale' : 'bg-[#2563EB] hover:bg-blue-700 shadow-blue-500/15'}`} 
                      >
                        {isProcessing ? (
                          <LoadingSpinner size="sm" color="white" />
                        ) : (
                          <Lock size={15} />
                        )}
                        <span>Confirm Reservation for {prices.total.toLocaleString()} PKR</span>
                      </button>
                    </form>

                    {/* Safety Badges */}
                    <div className="flex items-center justify-center gap-6 mt-8 grayscale opacity-50">
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <ShieldCheck className="text-green-600" size={14} /> PCI Secure
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <Activity className="text-blue-600" size={14} /> Secure Socket
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
          
          <footer className="py-10 border-t border-slate-200 px-6 md:px-20 bg-white mt-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">© 2026 EliteDrive Inc. All rights reserved.</div>
              <div className="flex gap-8 text-xs font-bold text-slate-400">
                <Link className="hover:text-[#2563EB] transition-colors uppercase tracking-widest" to="/rules-policies">Privacy Policy</Link>
                <Link className="hover:text-[#2563EB] transition-colors uppercase tracking-widest" to="/rules-policies">Terms of Service</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Payment;
