import React from 'react';
import { 
  Clock, 
  History, 
  Calculator, 
  AlertTriangle, 
  Car, 
  AlertCircle, 
  Gavel, 
  Banknote,
  CheckCircle,
  Siren,
  Bell,
  UserCircle,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { motion } from 'motion/react';

const PenaltyCharges: React.FC = () => {
  return (
    <div className="bg-slate-50">
      <main className="pt-0 px-4 md:px-6 max-w-7xl mx-auto pb-20">
        {/* Hero Title Section */}
        <div className="mb-10 text-center md:text-left">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 mb-3"
          >
            Penalty & Charges
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-lg"
          >
            Understand our policy for late returns, violations, and damages.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Primary Information */}
          <div className="lg:col-span-8 space-y-8">
            {/* Late Return Charges Bento Card */}
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Clock size={120} />
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3 text-slate-900">
                  <span className="p-2 bg-blue-600/10 text-blue-600 rounded-xl">
                    <History size={24} />
                  </span>
                  Late Return Charges
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-blue-600">
                    <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">First 2 Hours</p>
                    <p className="text-2xl font-black text-blue-600">Rs. 500<span className="text-sm font-medium">/hr</span></p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-red-500">
                    <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">After 2 Hours</p>
                    <p className="text-2xl font-black text-red-500">Rs. 1,200<span className="text-sm font-medium">/hr</span></p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-slate-900">
                    <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">Maximum Limit</p>
                    <p className="text-xl font-black text-slate-900">2 Days Fee</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">approx. Rs. 30,000 or actual rental value of the vehicle, whichever is higher, depending on vehicle model</p>
                  </div>
                </div>

                {/* Pro-Tip Box */}
                <div className="mt-6 p-4 bg-blue-600/5 rounded-2xl border border-blue-600/10 flex items-center gap-4">
                  <div className="bg-blue-600/10 p-2 rounded-lg">
                    <Calculator className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">Late Return Example (Pro-Tip)</p>
                    <p className="text-sm text-slate-600">Late for 5 hours? Your estimated penalty: (2 x 500) + (3 x 1,200) = <strong className="text-slate-900 font-bold">Rs. 4,600</strong></p>
                  </div>
                </div>

                <div className="mt-6 flex items-start gap-4 p-4 bg-red-50 rounded-2xl text-red-600 border border-red-100">
                  <AlertTriangle className="shrink-0" size={18} />
                  <p className="text-sm font-medium">Vehicle must be returned by agreed time to avoid late fees. Grace period of 15 minutes applies.</p>
                </div>
              </div>
            </motion.section>

            {/* Traffic Violations & Damage Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Traffic Violations */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
              >
                <h3 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2 text-slate-900">
                  <Car className="text-blue-600" size={20} />
                  Traffic Violations
                </h3>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm font-medium text-slate-500">Speeding Ticket</span>
                    <span className="text-sm font-bold text-red-500">Rs. 5,000 – 15,000</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm font-medium text-slate-500">Toll Fine</span>
                    <span className="text-sm font-bold text-red-500">Full + Rs. 1,000 fee</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm font-medium text-slate-500">Wrong Parking</span>
                    <span className="text-sm font-bold text-red-500">Rs. 2,500 + Towing</span>
                  </li>
                  <li className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-slate-500">Signal Violation</span>
                    <span className="text-sm font-bold text-red-500">Rs. 3,000</span>
                  </li>
                </ul>
              </motion.div>

              {/* Damage & Misuse */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
              >
                <h3 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2 text-slate-900">
                  <AlertCircle className="text-blue-600" size={20} />
                  Damage & Misuse
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="pb-2 font-bold uppercase tracking-wider text-[10px]">Type</th>
                        <th className="pb-2 text-right font-bold uppercase tracking-wider text-[10px]">Penalty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr>
                        <td className="py-3 font-medium text-slate-700">Minor Scratch</td>
                        <td className="py-3 text-right text-red-500 font-bold">Rs. 8,000 - 25k</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-slate-700">Major Damage</td>
                        <td className="py-3 text-right text-red-500 font-bold">Up to Deposit</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-slate-700">Unauthorized Route</td>
                        <td className="py-3 text-right text-red-500 font-bold">Full Deposit</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>

            {/* Violations Resulting in Injuries or Accidents */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-sm border-l-8 border-red-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Siren size={80} />
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3 text-slate-900">
                  <span className="p-2 bg-red-100 text-red-600 rounded-xl">
                    <AlertTriangle size={24} />
                  </span>
                  Violations Resulting in Injuries or Accidents
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left: Injury Penalties & Deductible */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-bold text-red-500 mb-3">Strict Penalties</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <Ban className="text-red-500 shrink-0 mt-0.5" size={18} />
                          <div>
                            <p className="text-sm font-bold text-slate-900">Immediate Platform Suspension</p>
                            <p className="text-xs text-slate-500">Permanent license revocation on EliteDrive.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Gavel className="text-red-500 shrink-0 mt-0.5" size={18} />
                          <div>
                            <p className="text-sm font-bold text-slate-900">Legal Responsibility for Damages</p>
                            <p className="text-xs text-slate-500">Full liability for property and vehicle damage.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Banknote className="text-red-500 shrink-0 mt-0.5" size={18} />
                          <div className="bg-red-50 border border-red-100 p-3 rounded-xl">
                            <p className="text-xs uppercase tracking-wider font-bold text-red-500 mb-1">Insurance Claim Deductible</p>
                            <p className="text-sm font-black text-slate-900">Rs. 50,000 – 150,000</p>
                            <p className="text-[10px] text-slate-500 mt-1 italic">Varies based on severity and injury assessment.</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/* Right: Driver & Third-Party Legal */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3">Legal & Financial Responsibilities</h3>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <p className="text-sm text-slate-700 leading-relaxed mb-4">
                          The driver is <strong className="font-bold">legally and financially liable</strong> for any injuries caused to themselves, passengers, or third parties during the rental period.
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          EliteDrive strictly adheres to local laws. We will fully <strong className="font-bold">cooperate with law enforcement agencies</strong> and insurance providers to ensure all legal obligations are met following an accident.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Missing Documents Warning */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-red-50 rounded-3xl p-8 border border-red-100 flex flex-col md:flex-row items-center gap-6"
            >
              <div className="bg-red-500 text-white p-4 rounded-2xl shadow-lg shadow-red-500/30">
                <AlertCircle size={36} />
              </div>
              <div>
                <h4 className="text-red-900 font-bold text-lg mb-1">Mandatory Document Alert</h4>
                <p className="text-red-700 text-sm leading-relaxed">Your booking will be automatically blocked or cancelled without physical verification of your <strong>Original CNIC, Valid Driving License, and Insurance documents</strong> at the time of pickup.</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Contextual Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Booking Summary Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
            >
              <div className="relative h-48">
                <img 
                  alt="Honda Civic RS" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGD-AnfmupS0NbkVFkmSas78EpmGFqzTkXevqEddZmkCZwt_OzaAzm42OS7UDfs-HhjhbhasVGC1f16bm8bV__ARAgElI0gDZE7aZRG9VdmuOqu1pEWcP2MhcUiv-lkZrlaJJYWiN850jJwDzGgPo5D16ItHn_K7ZimoMrxzslNoS3CWtORWPH7I_AZE4B_sTgEVx8oUutExmOFo7dXgwrhI-DQzgL3EsAymUJ-ZD2XIsroM3wgnX3RKzSor4KXZIv0k0thhalO-E" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                  <span className="bg-blue-600/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">Your Booking</span>
                  <h3 className="text-white font-bold text-xl mt-1">Honda Civic RS</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">Booking ID</span>
                  <span className="text-sm font-bold text-slate-900">#ED-PK-9823419</span>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Rental Period</p>
                  <div className="flex items-center gap-3">
                    <Clock className="text-blue-600" size={14} />
                    <p className="text-sm font-bold text-slate-900">Nov 24 – Nov 27, 2024</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* How to Avoid Penalties */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl"
            >
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                <CheckCircle className="text-green-400" size={20} />
                How to Avoid Penalties
              </h3>
              <ul className="space-y-4">
                {[
                  "Return the vehicle within the agreed timeframe.",
                  "Follow all local traffic rules and speed limits.",
                  "Only authorized drivers should operate the vehicle.",
                  "Keep all required documents ready for inspection."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="text-green-400 shrink-0 mt-0.5" size={16} />
                    <p className="text-sm text-slate-300">{item}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </aside>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl z-[40] border-t border-slate-100 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] pb-safe">
        <div className="max-w-7xl mx-auto px-6 h-auto md:h-24 flex flex-col md:flex-row justify-between items-center gap-4 py-6 md:py-0">
          <div className="hidden md:block max-w-sm">
            <p className="text-xs text-slate-500 font-medium leading-tight">By clicking "I Understand", you acknowledge all terms and penalty structures listed above.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button className="w-full sm:w-auto border border-slate-200 text-slate-700 font-bold px-8 py-3 rounded-2xl hover:bg-slate-50 transition-all text-sm">
              Contact Support
            </button>
            <button className="w-full sm:w-auto bg-blue-600 text-white font-bold px-10 py-3 rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all text-sm">
              I Understand the Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenaltyCharges;
