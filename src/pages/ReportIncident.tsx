import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Info,
  ShieldAlert,
  Plus,
  Trash,
  User,
  ArrowLeft,
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import CustomSelect from '../components/ui/CustomSelect';
import CustomCalendar from '../components/ui/CustomCalendar';

const ReportIncident: React.FC = () => {
  const { user, bookings, allBookings, allUsers, createIncident, showToast } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Booking routing parameter, if came from somewhere else
  const queryBookingId = searchParams.get('bookingId') || '';

  // Determine user authorization role
  const isStaff = user?.role === 'admin' || user?.role === 'manager';

  // Toggle mode for staff: file for self (if they rented a car) vs on behalf of database customer
  const [fileOnBehalf, setFileOnBehalf] = useState(isStaff);

  // States
  const [selectedBookingId, setSelectedBookingId] = useState(queryBookingId);
  const [incidentType, setIncidentType] = useState('minor_accident');
  const [incidentDate, setIncidentDate] = useState<Date | null>(new Date());
  const [location, setLocation] = useState('DHA Phase VI, Lahore');
  const [statement, setStatement] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [witnessPhone, setWitnessPhone] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [firNumber, setFirNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pool of bookings available to select from
  const usableBookings = React.useMemo(() => {
    if (fileOnBehalf && isStaff) {
      // Staff can file for any active or completed booking in system
      return allBookings.filter(b => b.status === 'active' || b.status === 'completed');
    } else {
      // Customers can file only for their own active or completed bookings
      return bookings.filter(b => b.userId === user?.id && (b.status === 'active' || b.status === 'completed'));
    }
  }, [fileOnBehalf, isStaff, bookings, allBookings, user]);

  // Set default selected booking
  useEffect(() => {
    if (usableBookings.length > 0 && !selectedBookingId) {
      // Prioritize query params or pick first
      const matched = usableBookings.find(b => b.id === queryBookingId);
      setSelectedBookingId(matched ? matched.id : usableBookings[0].id);
    }
  }, [usableBookings, queryBookingId, selectedBookingId]);

  // Retrieve current active booking detailed details
  const selectedBooking = React.useMemo(() => {
    return allBookings.find(b => b.id === selectedBookingId) || bookings.find(b => b.id === selectedBookingId);
  }, [selectedBookingId, allBookings, bookings]);

  // Retrieve corresponding customer profile if staff is filing on behalf of client
  const matchedCustomer = React.useMemo(() => {
    if (!selectedBooking) return null;
    return allUsers.find(u => u.id === selectedBooking.userId);
  }, [selectedBooking, allUsers]);

  // Incident option values matching server.ts taxonomy
  const incidentOptions = [
    { value: 'minor_accident', label: 'Minor Accident (Dent / Scratch)' },
    { value: 'major_accident', label: 'Major Collision Impact' },
    { value: 'theft', label: 'Theft / Missing Parts' },
    { value: 'breakdown', label: 'Mechanical Failure / Engine Overheat' },
    { value: 'flat_tire', label: 'Flat Tire / Blowout' },
    { value: 'third_party_damage', label: 'Third-Party Liability claim' },
  ];

  // Picture base64 converters
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (photos.length + files.length > 5) {
      showToast('Maximum 5 visual attachments permitted per incident record.', 'error');
      return;
    }

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotos(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBookingId) {
      showToast('Please select a reference booking record to report against.', 'error');
      return;
    }

    if (!location.trim()) {
      showToast('Please specify the incident location coordinates or address.', 'error');
      return;
    }

    if (!statement.trim()) {
      showToast('Please summarize the statement of facts for this incident.', 'error');
      return;
    }

    // Require FIR for theft and severe collisions
    if ((incidentType === 'major_accident' || incidentType === 'theft') && !firNumber.trim()) {
      showToast('A formal Police FIR number is required for severe accidents and theft claims.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        bookingId: selectedBookingId,
        type: incidentType,
        occurredAt: incidentDate ? incidentDate.toISOString() : new Date().toISOString(),
        location: location,
        statement: statement,
        witnessName: witnessName || undefined,
        witnessPhone: witnessPhone || undefined,
        photos: photos,
        firNumber: firNumber || undefined
      };

      // Handle filing on behalf of client
      if (isStaff && fileOnBehalf && selectedBooking) {
        payload.userId = selectedBooking.userId;
      }

      await createIncident(payload);
      showToast('Incident report logged successfully. Safety dispatch has been updated.', 'success');
      
      // Route back appropriately
      if (isStaff) {
        navigate(user?.role === 'admin' ? '/admin-dashboard' : '/manager-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit incident report.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAFBFD] font-display text-slate-900 antialiased min-h-screen py-8">
      <main className="px-4 md:px-8 max-w-7xl mx-auto pb-20">
        
        {/* Back navigation button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-xs font-black uppercase text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </button>

        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 uppercase">
              Incident Reporting Command
            </h1>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">
              Verify legal conditions, secure damage reports, log police reports, and track insurance coverage.
            </p>
          </div>

          {isStaff && (
            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button 
                onClick={() => setFileOnBehalf(false)}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all ${!fileOnBehalf ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                My Personal Booking
              </button>
              <button 
                onClick={() => setFileOnBehalf(true)}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all ${fileOnBehalf ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Filing On Behalf of Customer
              </button>
            </div>
          )}
        </header>

        {usableBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-2xl mx-auto">
            <AlertTriangle className="text-amber-500 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900 uppercase mb-2">No active rental agreements found</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              You can only submit incident reports against active, upcoming approved, or completed trip bookings. If you are experiencing an absolute emergency, please dial emergency lines directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:15" className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase rounded-xl flex items-center justify-center gap-2">
                <Siren size={16} /> Call Police (15)
              </a>
              <a href="tel:1122" className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase rounded-xl flex items-center justify-center gap-2">
                <Siren size={16} /> Rescue 1122
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Form Details */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Reference Selector block */}
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase size={18} className="text-blue-600" />
                    1. Reference Trip Booking
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-1">Select which corporate vehicle booking this incident corresponds to.</p>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider">Select Active Booking</label>
                  <select 
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white focus:ring-blue-600 h-11 px-4 font-bold text-slate-800"
                  >
                    {usableBookings.map(b => (
                      <option key={b.id} value={b.id}>
                        Ref: {b.id} — Vehicle: {b.vehicleId} ({b.rentalType} package, {b.calendarDays} days) - Status: {b.status.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  {/* Render detail info block of matching selected booking */}
                  {selectedBooking && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-black">Vehicle Handover ID</span>
                        <span className="text-xs font-bold text-slate-800">ED-CAR-{selectedBooking.vehicleId}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-black">Insurance Protection Tier</span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-700 capitalize mt-0.5">
                          <ShieldCheck size={14} />
                          {selectedBooking.insuranceType || 'Basic Protection'} Coverage
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-black">Delivery Dates</span>
                        <span className="text-xs font-semibold text-slate-600">
                          {new Date(selectedBooking.startDate).toLocaleDateString()} to {new Date(selectedBooking.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-black">Chauffeur Status</span>
                        <span className="text-xs font-semibold text-slate-600">
                          {selectedBooking.chauffeurSelected ? 'Professional Captain Assigned' : 'Self-Driven Agreement'}
                        </span>
                      </div>

                      {/* Customer context info shown to staff */}
                      {fileOnBehalf && matchedCustomer && (
                        <div className="md:col-span-2 pt-3 mt-1 border-t border-slate-200 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs uppercase">
                            {matchedCustomer.name.charAt(0)}
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 uppercase font-black">Client Account / KYC Details</span>
                            <span className="text-xs font-bold text-slate-800">{matchedCustomer.name} ({matchedCustomer.email})</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Taxonomy detail selection block */}
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={18} className="text-blue-600" />
                    2. Incident Specifics & Police FIR
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-1">Provide incident classification, accident timestamps, location and official FIR logs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomSelect
                    label="Incident Classification Taxonomy"
                    options={incidentOptions}
                    value={incidentType}
                    onChange={(val) => setIncidentType(val)}
                    icon={<Info size={16} />}
                  />
                  
                  <CustomCalendar
                    label="Date & Time of Occurrence"
                    selected={incidentDate}
                    onChange={(date) => setIncidentDate(date)}
                    showTimeSelect
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-2">Detailed Occurrence Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -content-center -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      className="w-full text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:ring-blue-600 h-11 pl-10 pr-4"
                      placeholder="e.g. Near Kalma Chowk Underpass, Ferozepur Road, Lahore"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Conditional Police FIR block for major collision/theft */}
                {(incidentType === 'major_accident' || incidentType === 'theft') && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3 animate-fadeIn">
                    <div className="flex gap-2 text-amber-800">
                      <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black uppercase">Police FIR Registration Requirement</h4>
                        <p className="text-[10px] leading-relaxed mt-0.5 font-medium text-amber-700">
                          According to provincial statutes and insurance underwriters, major collisions/theft claims require an official police report. Please lodge a complaint at the nearest police station.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black text-amber-900 tracking-wider mb-1.5">Official Police FIR Number *</label>
                      <input 
                        type="text" 
                        required
                        className="w-full text-xs rounded-xl border border-amber-300 bg-white focus:ring-amber-600 h-10 px-4 font-mono font-bold text-slate-900"
                        placeholder="e.g. FIR-PK-PB-LH-2026-98"
                        value={firNumber}
                        onChange={(e) => setFirNumber(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* Statement factual narrative & witness block */}
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    3. Statement of Facts & Witness References
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-1">Describe parameters surrounding the accident and any bystander testimonies.</p>
                </div>

                <div>
                  <label className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-2">Narrative of Facts *</label>
                  <textarea 
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:ring-blue-600 p-4 font-medium min-h-[120px] resize-none"
                    placeholder="Provide a crystal clear sequence of events. (e.g. While driving at 40 km/h, another vehicle rear-ended the Civic..."
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-1.5">Witness Full Name (Optional)</label>
                    <input 
                      type="text" 
                      className="w-full text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 h-11 px-4"
                      placeholder="Witness bystander name"
                      value={witnessName}
                      onChange={(e) => setWitnessName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-1.5">Witness Contact Phone (Optional)</label>
                    <input 
                      type="text" 
                      className="w-full text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 h-11 px-4"
                      placeholder="e.g. +92 (300) 987-6543"
                      value={witnessPhone}
                      onChange={(e) => setWitnessPhone(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Graphical damage photos collection block */}
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                      <Camera size={18} className="text-blue-600" />
                      4. Graphical Damage Evidence
                    </h3>
                    <p className="text-slate-400 text-[11px] mt-1">Compile comprehensive high-res pictures reflecting vehicle damage.</p>
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">({photos.length}/5) Photos</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  
                  {/* Photo select button */}
                  {photos.length < 5 && (
                    <label className="col-span-1 border-2 border-dashed border-slate-200 hover:border-blue-600/40 hover:bg-slate-50 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer gap-2 text-slate-400 aspect-square active:scale-95 transition-all text-center">
                      <Plus size={24} />
                      <span className="text-[9px] font-black uppercase tracking-wider leading-none">Upload Picture</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                        onChange={handlePhotoUpload} 
                      />
                    </label>
                  )}

                  {/* Render loaded image thumbnails */}
                  {photos.map((base64, idx) => (
                    <div key={idx} className="relative rounded-xl border border-slate-200 overflow-hidden aspect-square bg-slate-50 group">
                      <img src={base64} alt={`Damage Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                      
                      {/* Delete thumb button */}
                      <button 
                        type="button" 
                        onClick={() => removePhoto(idx)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Dynamic summary context & emergency actions */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Emergency Numbers Card */}
              <section className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold uppercase tracking-wide text-xs flex items-center gap-2">
                    <Siren className="animate-pulse" size={16} />
                    Emergency Helpline
                  </h4>
                  <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded font-black tracking-tight uppercase">24 Hours</span>
                </div>

                <p className="text-[11px] leading-relaxed text-white/80">
                  In the event of physical injuries, traffic deadlock, or hostile environment contingencies, immediately call government authorities first.
                </p>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <a href="tel:15" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all text-white font-bold text-xs">
                    <span>Call Highway Police / Traffic (15)</span>
                    <Phone size={14} />
                  </a>
                  <a href="tel:1122" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all text-white font-bold text-xs">
                    <span>Call Medical Rescue (1122)</span>
                    <Phone size={14} />
                  </a>
                </div>
              </section>

              {/* Insurance Coverage Summary Based on Booking selection */}
              {selectedBooking && (
                <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-blue-600" />
                      Dynamic Policy Coverage
                    </h4>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/60 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Active Protection Deck</span>
                    <h5 className="text-xs font-extrabold text-slate-900 uppercase">
                      {selectedBooking.insuranceType === 'premium' ? 'Premium Zero Deductible Cover' : selectedBooking.insuranceType === 'basic' ? 'Basic Collision Waiver Coverage' : 'Third-Party Liability Only'}
                    </h5>
                    
                    <p className="text-[10px] text-slate-500 leading-relaxed pt-1.5">
                      {selectedBooking.insuranceType === 'premium' ? (
                        'Congratulations. You chose Premium Cover! Renter carries absolutely 100% replacement protection. PKR 0 financial deductible applies; damage costs completely covered.'
                      ) : selectedBooking.insuranceType === 'basic' ? (
                        'Under LCW Basic, accidental damages are covered with customer offset capped at maximum Rs. 30,000 diagnostic fees. EliteDrive covers costs beyond Rs. 30,000.'
                      ) : (
                        'No supplementary coverage selected. You opted for standard Third-Party Only liability. Renter is 100% accountable for restoration invoice costs.'
                      )}
                    </p>
                  </div>
                </section>
              )}

              {/* Action buttons list */}
              <div className="space-y-3">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
                >
                  {isSubmitting ? (
                    'Transmitting Incident Dossier...'
                  ) : (
                    <>
                      <span>Transmit Incident Report</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
                
                <button 
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full py-3.5 border-2 border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Cancel and Return
                </button>
              </div>

            </div>
          </form>
        )}

      </main>
    </div>
  );
};

export default ReportIncident;
