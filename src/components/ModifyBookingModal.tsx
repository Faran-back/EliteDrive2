import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Car, AlertCircle, Check } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { modifyBookingSchema, ModifyBookingFormData } from '../schemas/booking';
import { Booking, Vehicle } from '../types';
import { useStore } from '../context/StoreContext';
import { calculateBaseFare } from '../utils/pricing';
import CustomSelect from './ui/CustomSelect';

interface ModifyBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  vehicles: Vehicle[];
  onConfirm: (id: string, updates: Partial<Booking>) => Promise<void>;
}

const ModifyBookingModal: React.FC<ModifyBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  vehicles,
  onConfirm
}) => {
  const { showToast } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ModifyBookingFormData>({
    resolver: zodResolver(modifyBookingSchema),
  });

  const watchedVehicleId = watch('vehicleId');
  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('endDate');

  useEffect(() => {
    if (booking) {
      setValue('vehicleId', booking.vehicleId);
      setValue('startDate', booking.startDate);
      setValue('endDate', booking.endDate);
      const vehicle = vehicles.find(v => v.id === booking.vehicleId);
      setSelectedVehicle(vehicle || null);
      setCalculatedPrice(booking.totalPrice);
    }
  }, [booking, setValue, vehicles]);

  useEffect(() => {
    const vehicle = vehicles.find(v => v.id === watchedVehicleId);
    setSelectedVehicle(vehicle || null);

    if (vehicle && watchedStartDate && watchedEndDate) {
      const startObj = new Date(watchedStartDate);
      startObj.setHours(0, 0, 0, 0);
      const endObj = new Date(watchedEndDate);
      endObj.setHours(0, 0, 0, 0);
      const dTime = Math.abs(endObj.getTime() - startObj.getTime());
      const dDays = Math.round(dTime / (1000 * 60 * 60 * 24));
      const calendarDays = Math.max(1, dDays + 1);
      setCalculatedPrice(calculateBaseFare(vehicle, calendarDays, 'daily'));
    }
  }, [watchedVehicleId, watchedStartDate, watchedEndDate, vehicles]);

  const onSubmit = async (data: ModifyBookingFormData) => {
    if (!booking) return;
    setIsSubmitting(true);
    try {
      await onConfirm(booking.id, {
        vehicleId: data.vehicleId,
        startDate: data.startDate,
        endDate: data.endDate,
        totalPrice: calculatedPrice
      });
      showToast('Booking modified successfully!', 'success');
      onClose();
    } catch (error) {
      showToast('Failed to modify booking. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-white/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Modify Booking</h3>
                <p className="text-slate-500 font-medium text-sm">Update your journey details below.</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Controller
                      name="vehicleId"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          label="Select Vehicle"
                          value={field.value}
                          onChange={field.onChange}
                          options={vehicles.map(v => ({
                            value: v.id,
                            label: `${v.name} - PKR ${v.pricePerDay.toLocaleString()}/day`
                          }))}
                          icon={<Car size={18} />}
                        />
                      )}
                    />
                    {errors.vehicleId && <p className="text-xs text-red-500 font-bold">{errors.vehicleId.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Calendar size={14} />
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      {...register('startDate')}
                      className={`w-full px-5 py-4 rounded-2xl border ${errors.startDate ? 'border-red-500' : 'border-slate-100'} bg-slate-50 text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none`}
                    />
                    {errors.startDate && <p className="text-xs text-red-500 font-bold">{errors.startDate.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Calendar size={14} />
                      Return Date
                    </label>
                    <input
                      type="date"
                      {...register('endDate')}
                      className={`w-full px-5 py-4 rounded-2xl border ${errors.endDate ? 'border-red-500' : 'border-slate-100'} bg-slate-50 text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none`}
                    />
                    {errors.endDate && <p className="text-xs text-red-500 font-bold">{errors.endDate.message}</p>}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-[24px] p-6 border border-slate-100 space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">New Summary</h4>
                    
                    {selectedVehicle && (
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-14 rounded-xl overflow-hidden bg-white border border-slate-100">
                          <img src={selectedVehicle.image} alt={selectedVehicle.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{selectedVehicle.name}</p>
                          <p className="text-xs text-slate-500 font-bold">{selectedVehicle.type}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold">Daily Rate</span>
                        <span className="text-slate-900 font-black">PKR {selectedVehicle?.pricePerDay.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="text-slate-900 font-black">New Total</span>
                        <span className="text-blue-600 font-black">PKR {calculatedPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl flex gap-3">
                      <AlertCircle className="text-blue-500 shrink-0" size={18} />
                      <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                        Modifying your booking may result in a price difference. The new total will be updated upon confirmation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-8 py-4 rounded-2xl font-black text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-4 rounded-2xl font-black text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={18} />
                      Confirm Modification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ModifyBookingModal;
