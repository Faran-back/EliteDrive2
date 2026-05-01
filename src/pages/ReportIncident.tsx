import React, { useState } from 'react';
import { 
  Car, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  FileText, 
  UserPlus, 
  Camera, 
  Siren, 
  Phone, 
  Send,
  Save,
  Wrench,
  Headphones,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import CustomSelect from '../components/ui/CustomSelect';
import CustomCalendar from '../components/ui/CustomCalendar';

const ReportIncident: React.FC = () => {
  const [incidentType, setIncidentType] = useState('Accident');
  const [incidentDate, setIncidentDate] = useState<Date | null>(new Date());

  const incidentOptions = [
    { value: 'Accident', label: 'Accident' },
    { value: 'Vehicle Damage', label: 'Vehicle Damage' },
    { value: 'Breakdown', label: 'Breakdown' },
    { value: 'Theft', label: 'Theft' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="bg-slate-50">
      <main className="pt-0 px-4 md:px-6 max-w-7xl mx-auto pb-20">
        {/* Header Section */}
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3"
          >
            Report Incident
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-lg max-w-2xl font-medium"
          >
            Quickly report accidents, damage, or emergencies. Our response team is available 24/7 to assist you.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Car Info Card */}
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-sm p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden border border-slate-100"
            >
              <div className="flex-1 space-y-4 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-bold tracking-wider uppercase">
                  <Car size={14} /> ACTIVE BOOKING
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">Honda Civic RS</h2>
                  <p className="text-slate-500 font-bold mt-1">Booking ID: #ED-PK-9823419</p>
                </div>
              </div>
              <div className="md:w-1/2 flex items-center justify-center relative">
                <img 
                  alt="Honda Civic RS" 
                  className="w-full object-contain transform md:translate-x-8" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkJsLrOX2jPZ3L_PV6Uj6AylFJZyHqVEBd6TgQjurKpFJCKFQ8dnj8ub5w0V5L-lQRCJNsaB2uaqHAzxCV2tJxrzmzzcsfRRpRfBtrB0Dciwe5tWcYf8AXxan_t8RtSHHbl-uoJvSsBYrA3c7kTI7AQp-JSK6q-UpxkRzDXMeS_DO9qPdY2tKqDgddku5cgpuHmAddehYcVLJkkcTmtQabvu8CmjJE64gZ5EhZuIDR9KpHVyOLExoGpJGAw4iZEa_S4FyTv3dY_Dw" 
                />
              </div>
            </motion.section>

            {/* Insurance Claim Workflow */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-sm p-8 border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Simple Insurance Claim Workflow</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 relative">
                {[
                  "Report submitted → Claim initiated instantly",
                  "EliteDrive team reviews + schedules assessment (within 4 hrs)",
                  "Insurance provider notified",
                  "Repair approval → Deductible of Rs. 15k - 50k may apply",
                  "Vehicle repair/replacement arranged"
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <p className="text-[11px] font-bold text-slate-600 leading-snug">{step}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Incident Details Form */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-sm p-8 space-y-6 border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Incident Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <CustomSelect
                  label="Incident Type"
                  options={incidentOptions}
                  value={incidentType}
                  onChange={(val) => setIncidentType(val)}
                  icon={<Info size={18} />}
                />
                <CustomCalendar
                  label="Date & Time"
                  selected={incidentDate}
                  onChange={(date) => setIncidentDate(date)}
                  showTimeSelect
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incident Location</label>
                <div className="relative flex items-center">
                  <input 
                    className="w-full bg-slate-50 border-none rounded-xl p-4 pl-12 text-slate-900 font-bold focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none" 
                    placeholder="Near DHA Phase VI, Lahore" 
                    type="text" 
                    defaultValue="Near DHA Phase VI, Lahore"
                  />
                  <MapPin className="absolute left-4 text-blue-600" size={18} />
                </div>
                <div className="h-64 rounded-2xl overflow-hidden mt-4 relative border border-slate-100">
                  <img className="w-full h-full object-cover grayscale opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiGJHOoTjqQacDSFEEyxoXLc93mv7szgvvr7nnQM7jo-n-6T79Rb-adUkP1NQ8joPNhPu2DKYj7FjsZtM1uyAfpmpo0Zif9aYtXjRdC6tblWTisw8w-LC5BHEonfBRbhHoQnKc-__wjUVrUm0tKiExPzwqXwJ_FZf4F863bdn3NYo_lG5jQG2EFdL7S0Xt9PYqFiU6pCF4fLq0yvLrZhxoe6slFIlsUPK77aBAciQfCc2pGOOeJwzlGlI8EzLg22wqFFR6dsxqaok" alt="Map" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white animate-bounce-slow">
                      <MapPin size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Statement & Witness */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-sm p-8 space-y-8 border border-slate-100"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-600" size={24} />
                  <h3 className="text-xl font-bold text-slate-900">Statement</h3>
                </div>
                <textarea 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none resize-none" 
                  placeholder="Describe what happened (optional but helpful)" 
                  rows={5}
                ></textarea>
              </div>
              <div className="space-y-6 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <UserPlus className="text-blue-600" size={24} />
                  <h3 className="text-xl font-bold text-slate-900">Witness Information <span className="text-sm font-normal text-slate-400 font-bold">(Optional)</span></h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Witness Name</label>
                    <input className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none" placeholder="Full Name" type="text" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <input className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none" placeholder="+92 XXX XXXXXXX" type="tel" />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Photos */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-sm p-8 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Camera className="text-blue-600" size={24} />
                  <h3 className="text-xl font-bold text-slate-900">Visual Documentation</h3>
                </div>
                <span className="text-xs font-bold text-slate-400">Max 5 photos</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="col-span-1 md:col-span-2 aspect-[2/1] md:aspect-auto rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-600/40 hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-3 text-slate-400 p-4 active:scale-95">
                  <Camera size={32} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-center">Upload Photos of Damage</span>
                </button>
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 group relative border border-slate-100">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV0n7N4e5YnzsNo34Kyt8d8Hxjkjup_gTxYyjM7wiuIztW42cLz6nBHKTw1iY0gOlGKxVrGvcbmKouI1kH92aqRnzzb3fO-Y6RLYqyZi5CdTBPxshyP8lArK923rdcjazGGPhhVytxUcHCCjZvrJPNz0T-rB1dk1IAw6vgoETyTYFgo004C_ryV9Gk-d_wTUf8RLk7oCjXVTxV9FgX2SDwcXZWWE9bSTka-VRWGGVM0gHlQx6rQnn2PO5xB8ScDfexArNR8S3qtic" alt="Damage example" />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 group relative border border-slate-100">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZO9cLxpZNIoBPxs4NMmEi0AidXHm60lAM8ANpG8U1Elx6lsrDM4VNyQgkdM43V05sOGXAD7-UxpgK20l2sYCXeA4jEA5DVQ_L44lNr8xWFJKOTy93In4W-46wVDg7fO5c_OKwc27k-3_-8tfi-7StEA1URcugYt-Ree79nl77Gjw0QPDFRQRnmTn6eAteTFV4qODuEdZRhYL_75wX5XvMiMwfwCblFXmCraf3M1CTYKSF79vaxN3v7a-xhrmfmIoAjnSjW1vJnRg" alt="Damage example" />
                </div>
              </div>
            </motion.section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Emergency Contacts */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-sm p-6 space-y-6 border-2 border-red-500/10"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                  <Siren className="animate-pulse" size={24} />
                  Immediate Assistance
                </h3>
                <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black tracking-tighter">24/7 LIVE</span>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                  <div className="flex items-center gap-3">
                    <Siren size={18} />
                    <span>Call Police (15)</span>
                  </div>
                  <Phone size={18} />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                  <div className="flex items-center gap-3">
                    <Siren size={18} />
                    <span>Call Rescue 1122</span>
                  </div>
                  <Phone size={18} />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-all active:scale-95">
                  <div className="flex items-center gap-3">
                    <Wrench size={18} />
                    <span>Call Towing Service</span>
                  </div>
                  <Phone size={18} />
                </button>
                <button className="w-full flex flex-col p-4 rounded-2xl border-2 border-blue-600/10 bg-blue-600/5 hover:bg-blue-600/10 transition-all text-blue-600 font-bold active:scale-95">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Headphones size={18} />
                      <span>EliteDrive Support</span>
                    </div>
                    <Phone size={18} />
                  </div>
                  <span className="text-sm font-black mt-1 ml-7 italic tracking-wider">0300-1234567</span>
                </button>
              </div>
            </motion.section>

            {/* What happens next? */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-sm p-6 space-y-6 border border-slate-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="text-blue-600" size={20} />
                  <h3 className="text-lg font-bold text-slate-900">Process Timeline</h3>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { title: "Digital Claim Initiation", time: "Instant", active: true },
                  { title: "Damage Assessment", time: "Within 4 hours", active: false },
                  { title: "Repair Approval", time: "Insurance Sync", active: false },
                  { title: "Vehicle Recovery", time: "Final Support", active: false }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4 relative group">
                    {idx < 3 && <div className="absolute left-3 top-6 bottom-[-1.5rem] w-0.5 bg-slate-100"></div>}
                    <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${step.active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                      <span className="text-[10px] font-black">{idx + 1}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${step.active ? 'text-slate-900' : 'text-slate-400'}`}>{step.title}</span>
                      <span className={`text-[10px] uppercase tracking-wider font-bold ${step.active ? 'text-blue-600' : 'text-slate-300'}`}>{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Financial Summary */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-sm p-6 space-y-6 border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-blue-600" size={20} />
                <h3 className="text-lg font-bold text-slate-900">Coverage Intro</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-600/5 border border-blue-600/10 rounded-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs font-bold text-slate-700 leading-snug">Insurance covers up to 90% of repair costs for eligible incidents.</p>
                  </div>
                  <div className="flex items-start gap-3 border-t border-blue-600/10 pt-3">
                    <FileText className="text-blue-600 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs font-bold text-slate-700 leading-snug">A deductible of Rs. 15,000 to Rs. 50,000 may apply.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Actions Section */}
            <div className="space-y-4 sticky top-24">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all border-t border-white/10"
              >
                Report Accident & Submit
                <Send size={20} />
              </motion.button>
              <button className="w-full py-5 border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95">
                <Save size={20} />
                Save as Draft
              </button>
              <p className="text-center text-[10px] text-slate-400 font-bold px-4 uppercase tracking-wider">
                By submitting, you certify that all information provided is accurate.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportIncident;
