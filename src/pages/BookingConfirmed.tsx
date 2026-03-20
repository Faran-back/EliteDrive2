import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Check, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  Leaf, 
  Phone, 
  MessageSquare, 
  CalendarCheck, 
  Receipt, 
  Download, 
  Headphones, 
  XCircle, 
  Info 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const BookingConfirmed: React.FC = () => {
  const { bookings, vehicles } = useStore();
  
  // Get the latest booking
  const latestBooking = bookings.length > 0 ? bookings[bookings.length - 1] : null;
  const vehicle = latestBooking ? vehicles.find(v => v.id === latestBooking.vehicleId) : null;

  if (!latestBooking || !vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold">No booking found</h2>
        <Link to="/dashboard" className="text-[#2463eb] font-bold hover:underline">Go back to Dashboard</Link>
      </div>
    );
  }

  // Calculate breakdown
  const baseRate = latestBooking.totalPrice * 0.85;
  const surcharge = latestBooking.totalPrice * 0.07;
  const taxes = latestBooking.totalPrice * 0.08;

  // Map URL based on location
  const mapQuery = encodeURIComponent(`${vehicle.location}, Pakistan`);
  
  return (
    <main className="flex-1 flex flex-col items-center justify-start py-8 px-10 md:px-20 font-display">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-full w-full flex flex-col gap-8"
      >
        {/* Success Status Header */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="size-20 rounded-full bg-green-100 flex items-center justify-center border-4 border-green-500/20"
            >
              <Check className="text-green-500 size-10 stroke-[3]" />
            </motion.div>
            <div className="flex flex-col items-center gap-2">
              <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full border border-green-200 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Confirmed
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight text-center">Your trip is booked!</h1>
              <p className="text-slate-500 font-medium">Booking ID: <span className="text-[#2463eb] font-bold">{latestBooking.id.toUpperCase()}</span></p>
            </div>
          </div>
        </div>

        {/* Map & Location */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <MapPin className="text-[#2463eb] size-5" />
              <span className="text-sm font-bold text-slate-900">{vehicle.location} International Airport</span>
            </div>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2463eb] text-xs font-bold hover:underline flex items-center gap-1"
            >
              Open in Maps <ExternalLink size={12} />
            </a>
          </div>
          <div className="w-full h-48 md:h-56 rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBuRNbL7dFrq3a5Il92KaTKxgtt73YRECh14Ca1fBNNLga5nPjfXL3sdIj-znPO3pyAO-Xz1XgrM2smVU-b7hLpPSd352nhXS69hYqh81EfCzHW3M_1lGZDpccSpnO_6lC81ZU1bR23CEP8pcxBbPzeMBOcHBytre98hYrPmaZsnrcrEam25kpzK5vm2IlWo8QVc4wyu0Tn9Jjbz3bCKrYsyFMjX6sJYCAy-xZ1uOOTtCfsuutG8dnhhLdn-OE0-fQnX8gt3n0_nq0")` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white p-2.5 rounded-full shadow-xl border-2 border-[#2463eb]">
                <MapPin className="text-[#2463eb] size-6 fill-[#2463eb]/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Info Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                  <img 
                    alt={vehicle.name} 
                    className="w-full h-full object-cover" 
                    src={vehicle.image} 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 text-[#2463eb] text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 uppercase">
                      <ShieldCheck size={12} className="fill-[#2463eb]/10" /> Verified
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{vehicle.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <Leaf size={12} /> Eco Hybrid
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-[#2463eb]/10 text-slate-700 font-bold py-2.5 rounded-lg border border-slate-200 transition-colors text-xs">
                <Phone size={16} /> Call Driver
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-[#2463eb]/10 text-slate-700 font-bold py-2.5 rounded-lg border border-slate-200 transition-colors text-xs">
                <MessageSquare size={16} /> Message
              </button>
            </div>
          </div>

          {/* Pickup Schedule */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-[#2463eb]/10 flex items-center justify-center flex-shrink-0">
                <CalendarCheck className="text-[#2463eb] size-6" />
              </div>
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pickup Information</p>
                <h3 className="text-lg font-bold text-slate-900">{vehicle.location} Airport</h3>
                <p className="text-sm font-semibold text-[#2463eb]">
                  Today, 10:00 AM
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-[#2463eb]/10 text-[#2463eb] font-bold py-2 px-3 rounded-lg text-[11px] hover:bg-[#2463eb]/20 transition-colors">Modify Trip</button>
                <button className="bg-slate-100 text-slate-900 font-bold py-2 px-3 rounded-lg text-[11px] hover:bg-slate-200 transition-colors">Add to Cal</button>
              </div>
            </div>
          </div>
        </div>

        {/* Fare Breakdown & Receipt */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs">Fare Breakdown</h3>
              <button className="text-[#2463eb] text-[10px] font-bold hover:underline flex items-center gap-1">
                <Receipt size={14} /> View Full Receipt
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Base Rate ({vehicle.type})</span>
                <span className="font-medium text-slate-700">Rs {Math.round(baseRate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Airport Surcharge</span>
                <span className="font-medium text-slate-700">Rs {Math.round(surcharge).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Taxes & Service Fee</span>
                <span className="font-medium text-slate-700">Rs {Math.round(taxes).toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="text-xl font-black text-[#2463eb]">Rs {latestBooking.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 bg-[#2463eb] text-white font-bold py-4 px-6 rounded-xl hover:bg-[#2463eb]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2463eb]/20">
              <Download size={20} />
              Download Receipt
            </button>
            <button className="flex-1 bg-white text-slate-900 font-bold py-4 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <Headphones size={20} />
              Contact Support
            </button>
            <button className="flex-1 bg-white text-red-500 font-bold py-4 px-6 rounded-xl border border-slate-200 hover:bg-red-50 transition-all flex items-center justify-center gap-2">
              <XCircle size={20} />
              Cancel Trip
            </button>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-500 text-[11px] font-semibold flex items-center gap-2">
              <Info size={14} className="text-amber-500" />
              Free cancellation within 15 minutes of booking
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="py-10 px-6 flex flex-col items-center gap-4 mt-8">
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck size={18} />
          <p className="text-[10px] font-bold tracking-widest uppercase opacity-70">Secure Booking Powered by EliteDrive</p>
        </div>
      </footer>
    </main>
  );
};

export default BookingConfirmed;
