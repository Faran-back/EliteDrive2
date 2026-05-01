import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Printer, 
  Verified, 
  Calendar, 
  Clock, 
  Wallet, 
  Gavel, 
  Settings, 
  AlertCircle, 
  Fuel, 
  Lock,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';

const RulesPolicies: React.FC = () => {
  return (
    <div className="bg-slate-50">
      {/* Hero Header */}
      <header className="pt-0 pb-12 px-4 md:px-6 max-w-4xl mx-auto text-center">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-600/10 text-blue-600 text-[10px] md:text-xs font-bold tracking-widest uppercase"
        >
          Policies & Guidelines
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-900 mb-6"
        >
          Rules of the Road
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Our commitment to precision extends to our agreements. Please review our comprehensive policies designed to ensure a seamless and safe driving experience in Karachi.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95">
            <Download size={20} />
            Download PDF
          </button>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-600 px-8 py-3.5 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all active:scale-95">
            <Printer size={20} />
            Print Document
          </button>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 pb-32">
        <div className="space-y-8">
          {/* General Terms */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/5 flex items-center justify-center text-blue-600">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">General Terms</h2>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-4 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2.5 shrink-0"></span>
                <p className="text-slate-600 leading-relaxed">Renter must provide a valid <strong>Original CNIC</strong> and a physical <strong>Driving License</strong> during vehicle handover.</p>
              </li>
              <li className="flex gap-4 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2.5 shrink-0"></span>
                <p className="text-slate-600 leading-relaxed">Standard operations are restricted within <strong>Karachi city limits</strong> unless prior written authorization is obtained.</p>
              </li>
              <li className="flex gap-4 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2.5 shrink-0"></span>
                <p className="text-slate-600 leading-relaxed">The minimum age for self-drive rentals is <strong>18 years</strong> with a valid motor vehicle permit.</p>
              </li>
            </ul>
          </motion.section>

          {/* Grid for policies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Booking & Usage */}
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100"
            >
              <Calendar className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-4 text-slate-900">Booking & Usage</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">All bookings require immediate confirmation. Vehicles must be returned at the agreed time to maintain fleet availability.</p>
              <ul className="text-xs space-y-2 text-slate-500 italic">
                <li>• Extensions require 12-hour notice</li>
                <li>• Strictly no subletting allowed</li>
                <li>• Usage is monitored via GPS</li>
              </ul>
            </motion.section>

            {/* Late Return */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100"
            >
              <Clock className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-4 text-slate-900">Late Return Policy</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">Punctuality is essential. Delays impact subsequent clients and incur the following structural penalties:</p>
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex justify-between text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                  <span>Duration</span>
                  <span>Penalty</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700 border-b border-slate-200 py-2">
                  <span>Per Hour Delay</span>
                  <span>25% Daily Rate</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700 py-2">
                  <span>4+ Hours Delay</span>
                  <span>Full Daily Rate</span>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Payments & Security */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 rounded-full -mr-20 -mt-20"></div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/5 flex items-center justify-center text-blue-600">
                <Wallet size={28} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Payments & Security</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <p className="text-slate-600 leading-relaxed mb-6">We accept diverse payment methods for your convenience. All transactions are secure and documented.</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">Cash</span>
                  <span className="px-4 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">Bank Transfer</span>
                  <span className="px-4 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">EasyPaisa</span>
                  <span className="px-4 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">JazzCash</span>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl">
                <h4 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">Security Deposit</h4>
                <p className="text-slate-500 text-sm leading-relaxed">A mandatory security deposit is required for all rentals. This is fully refundable upon clear vehicle inspection and traffic fine clearance.</p>
              </div>
            </div>
          </motion.section>

          {/* Traffic & Maintenance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100"
            >
              <Gavel className="text-red-500 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-4 text-slate-900">Traffic Violations</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Renters are solely responsible for traffic fines during the rental period. Fines will be deducted from security deposits if not paid immediately.</p>
            </motion.section>
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100"
            >
              <Settings className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-4 text-slate-900">Vehicle Maintenance</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Vehicles are provided in pristine condition. Renters must report any mechanical issues immediately. Negligence-related damage will be charged.</p>
            </motion.section>
          </div>

          {/* Accidents & Emergencies */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-red-50 p-8 md:p-10 rounded-[2rem] border border-red-100"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                <AlertCircle size={28} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-red-600">Accidents & Emergencies</h2>
            </div>
            <div className="space-y-4 text-slate-600">
              <p className="leading-relaxed">In the unfortunate event of an incident, <strong>immediate reporting</strong> to EliteDrive is mandatory.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                <div className="bg-white p-4 rounded-xl border border-red-100 flex flex-col items-center text-center shadow-sm">
                  <span className="text-xs font-bold text-red-500 uppercase mb-1">Police/Rescue</span>
                  <span className="text-xl font-black text-slate-900">1122</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-red-100 flex flex-col items-center text-center shadow-sm">
                  <span className="text-xs font-bold text-red-500 uppercase mb-1">Elite Support</span>
                  <span className="text-xl font-black text-slate-900">+92 21 000000</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-red-100 flex flex-col items-center text-center shadow-sm">
                  <span className="text-xs font-bold text-red-500 uppercase mb-1">Insurance</span>
                  <span className="text-xl font-black text-slate-900">Full Cover*</span>
                </div>
              </div>
              <p className="text-sm italic">Liability for negligence or DUI remains with the renter regardless of insurance status.</p>
            </div>
          </motion.section>

          {/* Fuel Policy */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/5 flex items-center justify-center text-blue-600">
                <Fuel size={28} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Fuel Policy</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <p className="text-slate-600 leading-relaxed">We operate a strict <strong>Full-to-Full Policy</strong>. All vehicles are delivered with a full tank and must be returned in the same state.</p>
              </div>
              <div className="w-full md:w-64 bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-500/20">
                <p className="text-xs uppercase font-bold tracking-widest opacity-80 mb-2">Notice</p>
                <p className="text-sm font-medium">Refueling service charges apply if returned with less than a full tank.</p>
              </div>
            </div>
          </motion.section>

          {/* Legal & Privacy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-100 p-8 rounded-[2rem]"
            >
              <h3 className="text-xl font-bold mb-4 text-slate-900">Privacy & Security</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">EliteDrive maintains strict data confidentiality. Your personal information and location data are encrypted and never shared with third parties.</p>
            </motion.section>
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-100 p-8 rounded-[2rem]"
            >
              <h3 className="text-xl font-bold mb-4 text-slate-900">Legal Compliance</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">All agreements are governed by the Laws of Pakistan, with specific jurisdiction resting in Karachi Courts.</p>
            </motion.section>
          </div>

          {/* Acceptance */}
          <section className="py-12 border-t border-slate-200 text-center">
            <div className="max-w-xl mx-auto">
              <h2 className="text-3xl font-extrabold mb-4 text-slate-900">Acceptance</h2>
              <p className="text-slate-500 mb-10 leading-relaxed">By proceeding with a booking on EliteDrive, you acknowledge that you have read, understood, and agree to be bound by the terms and policies stated above.</p>
              <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all">I AGREE & UNDERSTAND</button>
              <p className="mt-6 text-xs text-slate-400 font-bold">Last updated: May 2024</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default RulesPolicies;
