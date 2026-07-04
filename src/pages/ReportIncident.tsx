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
  Scale,
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

const renderStatusTracker = (status: string) => {
  const stages = [
    { key: 'filed', label: 'Filed' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'action_taken', label: 'Action Taken' },
    { key: 'closed', label: 'Closed' }
  ];

  const currentIdx = stages.findIndex(s => s.key === status?.toLowerCase());

  return (
    <div className="w-full py-4 px-2 bg-slate-50/50 rounded-2xl border border-slate-100 my-4">
      <div className="flex items-center justify-between relative max-w-xl mx-auto">
        {/* Progress Line Background */}
        <div className="absolute left-4 right-4 top-[14px] -translate-y-1/2 h-0.5 bg-slate-200 rounded" />
        {/* Progress Line Active */}
        <div 
          className="absolute left-4 top-[14px] -translate-y-1/2 h-0.5 bg-gradient-to-r from-rose-500 to-indigo-600 rounded transition-all duration-500" 
          style={{ width: `${currentIdx >= 0 ? (currentIdx / (stages.length - 1)) * 94 : 0}%` }}
        />
        
        {stages.map((stage, idx) => {
          const isCompleted = idx <= currentIdx;
          const isActive = idx === currentIdx;
          
          return (
            <div key={stage.key} className="flex flex-col items-center relative z-10 flex-1">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                  isActive 
                    ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100' 
                    : isCompleted 
                      ? 'bg-rose-500 border-rose-500 text-white' 
                      : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider mt-1.5 text-center ${
                isActive ? 'text-indigo-600' : isCompleted ? 'text-rose-500' : 'text-slate-400'
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ReportIncident: React.FC = () => {
  const { user, bookings, allBookings, allUsers, vehicles, createIncident, incidents, updateIncidentStatus, showToast, disputes, createDispute } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Booking routing parameter, if came from somewhere else
  const queryBookingId = searchParams.get('bookingId') || '';

  // Determine user authorization role
  const isStaff = user?.role === 'admin' || user?.role === 'manager';

  // Toggle mode for user:
  // For staff: 'view' (View Customer Incidents) vs 'file' (File Incident On Behalf)
  // For customer: 'file' (File New Incident) vs 'my_incidents' (My Reported Incidents) vs 'disputes' (Formal Disputes)
  const [activeTab, setActiveTab] = useState<'view' | 'file' | 'my_incidents' | 'disputes'>(isStaff ? 'view' : 'file');
  const fileOnBehalf = isStaff && activeTab === 'file';

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
  
  // Disputes states
  const [disputeBookingId, setDisputeBookingId] = useState('');
  const [disputeType, setDisputeType] = useState('damage_charges');
  const [disputeTitle, setDisputeTitle] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [isFilingDispute, setIsFilingDispute] = useState(false);

  const [gapAlert, setGapAlert] = useState<string | null>(null);

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeTitle.trim() || !disputeDescription.trim()) {
      showToast('Please fill out all required dispute fields.', 'error');
      return;
    }
    setIsFilingDispute(true);
    try {
      await createDispute({
        title: disputeTitle,
        description: disputeDescription,
        bookingId: disputeBookingId || undefined,
        type: disputeType
      });
      setDisputeTitle('');
      setDisputeDescription('');
      setDisputeBookingId('');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to file dispute.', 'error');
    } finally {
      setIsFilingDispute(false);
    }
  };

  useEffect(() => {
    if (incidentDate) {
      const diffMs = Date.now() - incidentDate.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);
      if (diffHrs > 6) {
        setGapAlert(`Late Report Flag Triggered: ${Math.floor(diffHrs)} hours have elapsed since the incident occurred. Reports filed past the 6-hour policy window automatically trigger severe administrative flags and manual security audits.`);
      } else {
        setGapAlert(null);
      }
    }
  }, [incidentDate]);

  // Pool of bookings available to select from
  const usableBookings = React.useMemo(() => {
    if (fileOnBehalf && isStaff) {
      // Staff can file for any active or completed booking in system
      return allBookings.filter(b => b.status === 'active' || b.status === 'completed');
    } else {
      // Customers can file only for their own active bookings
      return bookings.filter(b => b.userId === user?.id && b.status === 'active');
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

  // Retrieve current active vehicle detailed details
  const selectedVehicle = React.useMemo(() => {
    if (!selectedBooking) return null;
    return (vehicles || []).find(v => v.id === selectedBooking.vehicleId);
  }, [selectedBooking, vehicles]);

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

          {isStaff ? (
            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button 
                type="button"
                onClick={() => setActiveTab('view')}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all ${activeTab === 'view' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                View Customer Incidents
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('file')}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all ${activeTab === 'file' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                File Incident on Behalf
              </button>
            </div>
          ) : (
            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 gap-1 overflow-x-auto">
              <button 
                type="button"
                onClick={() => setActiveTab('file')}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all shrink-0 ${activeTab === 'file' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                File New Incident
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('my_incidents')}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all shrink-0 ${activeTab === 'my_incidents' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                My Reported Incidents ({incidents.filter(inc => inc.userId === user?.id).length})
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('disputes')}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all shrink-0 ${activeTab === 'disputes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Disputes ({disputes ? disputes.filter(d => d.userId === user?.id).length : 0})
              </button>
            </div>
          )}
        </header>

        {activeTab === 'view' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 uppercase">Registered Customer Damage Incidents</h2>
                <p className="text-xs text-slate-500 mt-1">Direct real-time query of incidents filed by EliteDrive customers.</p>
              </div>
              <span className="bg-red-50 text-red-700 px-3 py-1 text-xs font-black rounded-xl border border-red-100">
                Total Files: {incidents.length}
              </span>
            </div>

            {incidents.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-2xl mx-auto">
                <ShieldAlert className="text-slate-300 mx-auto mb-4 animate-bounce" size={48} />
                <h3 className="text-lg font-bold text-slate-700 uppercase mb-2">No Incidents Logged</h3>
                <p className="text-slate-400 text-xs">
                  The active database has zero registered incident folders at this moment. Excellent safety records!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {incidents.map((inc) => {
                  const matchedUser = allUsers.find(u => u.id === inc.userId);
                  const matchedBooking = allBookings.find(b => b.id === inc.bookingId);
                  const matchedVehicle = vehicles.find(v => v.id === inc.vehicleId);
                  const isLate = inc.isLateReport;

                  return (
                    <div key={inc.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 hover:shadow-md transition-all">
                      {/* Top Header Row with status, and late flag */}
                      <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-wider rounded border border-red-100">
                              {inc.type?.replace('_', ' ') || 'Incident Report'}
                            </span>
                            {isLate && (
                              <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider rounded animate-pulse">
                                LATE REPORT FLAG (&gt;6 hrs window)
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-extrabold text-slate-900 mt-2">
                            Folder Reference: <span className="font-mono font-bold text-slate-600">{inc.id}</span>
                          </h3>
                        </div>

                        {/* Status update select selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-slate-400">Status:</span>
                          <CustomSelect
                            options={[
                              { value: 'filed', label: 'Filed' },
                              { value: 'under_review', label: 'Under Review' },
                              { value: 'action_taken', label: 'Action Taken' },
                              { value: 'closed', label: 'Closed' }
                            ]}
                            value={inc.status}
                            onChange={async (val) => {
                              try {
                                await updateIncidentStatus(inc.id, val);
                                showToast(`Incident state set to ${val.toUpperCase()}`, 'success');
                              } catch (err: any) {
                                showToast('Error updating incident state', 'error');
                              }
                            }}
                            buttonClassName={`w-36 text-xs h-9 px-3 flex items-center justify-between rounded-xl border font-bold transition-all shadow-sm ${
                              inc.status === 'closed' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100' :
                              inc.status === 'action_taken' ? 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100' :
                              inc.status === 'under_review' ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100' :
                              'bg-red-50 border-red-200 text-red-800 hover:bg-red-100'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Visual Status Tracker Section */}
                      {renderStatusTracker(inc.status)}

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                        {/* Left Side: Customer & Vehicle detail */}
                        <div className="lg:col-span-5 space-y-4 border-r border-slate-100 pr-0 lg:pr-6">
                          {/* Customer Profile */}
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Customer Profile</span>
                            <p className="text-sm font-extrabold text-slate-800">{matchedUser?.name || inc.userName}</p>
                            <p className="text-xs text-slate-500 font-medium">{matchedUser?.email || 'N/A'}</p>
                            <p className="text-xs text-slate-500 font-medium">{matchedUser?.phone || 'N/A'}</p>
                            <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                              KYC: {matchedUser?.cnicVerified ? 'CNIC VERIFIED ✅' : 'CNIC UNVERIFIED ⚠️'}
                            </div>
                          </div>

                          {/* Active Vehicle details */}
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 flex gap-4">
                            {matchedVehicle?.image && (
                              <img src={matchedVehicle.image} alt={matchedVehicle.name} className="w-16 h-12 object-cover rounded-xl border border-slate-200" />
                            )}
                            <div>
                              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Rented Vehicle</span>
                              <p className="text-sm font-extrabold text-slate-800">{matchedVehicle?.name || inc.vehicleName}</p>
                              {matchedVehicle?.licensePlate && (
                                <span className="inline-block mt-1 px-2 py-0.5 font-mono text-[10px] font-black bg-slate-200 text-slate-800 rounded uppercase">
                                  {matchedVehicle.licensePlate}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Active Booking Trip timeframe & billing */}
                          {matchedBooking && (
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-2">
                              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Booking & Trip Context</span>
                              <div className="text-xs font-semibold text-slate-700">
                                <span className="block">Ref ID: <strong className="font-mono text-slate-900">{matchedBooking.id}</strong></span>
                                <span className="block">Timeframe: <strong className="text-slate-900">{new Date(matchedBooking.startDate).toLocaleDateString()} to {new Date(matchedBooking.endDate).toLocaleDateString()}</strong></span>
                                <span className="block">Route Scope: <strong className="text-slate-900">{matchedBooking.isOutOfCity ? `Out-of-City (${matchedBooking.destination})` : 'In-City Only'}</strong></span>
                                <span className="block">Chauffeur Service: <strong className="text-slate-900">{matchedBooking.chauffeurSelected ? 'Yes (Driver Assigned)' : 'No (Self-Driven)'}</strong></span>
                                <span className="block">Security Deposit: <strong className="text-blue-600">PKR {(matchedBooking.securityDepositAmount || 5000).toLocaleString()} ({matchedBooking.securityDepositStatus || 'Collected'})</strong></span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Side: Incident report files */}
                        <div className="lg:col-span-7 space-y-4">
                          {/* Narratives */}
                          <div>
                            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Statement of Facts</span>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 text-xs text-slate-800 leading-relaxed font-semibold italic">
                              "{inc.statement}"
                            </div>
                          </div>

                          {/* Incident location, date, gaps */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Location of Incident</span>
                              <p className="text-xs font-bold text-slate-800 mt-1">{inc.location}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Date & Time of Incident</span>
                              <p className="text-xs font-bold text-slate-800 mt-1">{new Date(inc.occurredAt).toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Witness & Registration info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Witness Details</span>
                              {inc.witnessName ? (
                                <p className="text-xs font-bold text-slate-800 mt-1">{inc.witnessName} ({inc.witnessPhone || 'No Phone'})</p>
                              ) : (
                                <p className="text-xs font-medium text-slate-400 mt-1">None specified</p>
                              )}
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Police FIR Registration Entry No</span>
                              {inc.firNumber ? (
                                <p className="text-xs font-extrabold text-blue-700 mt-1 font-mono uppercase">{inc.firNumber}</p>
                              ) : (
                                <p className="text-xs font-medium text-slate-400 mt-1">No police report attached</p>
                              )}
                            </div>
                          </div>

                          {/* Damage Photos AttachmentProofs */}
                          {inc.photos && inc.photos.length > 0 && (
                            <div>
                              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Damage Scan Attachments ({inc.photos.length})</span>
                              <div className="flex gap-3 overflow-x-auto py-1">
                                {inc.photos.map((ph: string, pi: number) => (
                                  <a key={pi} href={ph} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                    <img src={ph} alt={`Damage item ${pi}`} className="w-24 h-18 object-cover rounded-xl border border-slate-200 shadow-sm hover:scale-105 transition-all" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'my_incidents' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 uppercase">My Reported Damage Incidents</h2>
                <p className="text-xs text-slate-500 mt-1">Real-time status updates on filed safety reports and vehicle damage cases.</p>
              </div>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 text-xs font-black rounded-xl border border-blue-100">
                Total Claims Filed: {incidents.filter(inc => inc.userId === user?.id).length}
              </span>
            </div>

            {incidents.filter(inc => inc.userId === user?.id).length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-2xl mx-auto">
                <ShieldCheck className="text-slate-300 mx-auto mb-4 animate-bounce" size={48} />
                <h3 className="text-lg font-bold text-slate-700 uppercase mb-2">No Incidents Logged</h3>
                <p className="text-slate-400 text-xs">
                  You have not submitted any incident folders under your profile. Safe driving record!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {incidents.filter(inc => inc.userId === user?.id).map((inc) => {
                  const matchedBooking = bookings.find(b => b.id === inc.bookingId) || allBookings.find(b => b.id === inc.bookingId);
                  const matchedVehicle = vehicles.find(v => v.id === inc.vehicleId);

                  return (
                    <div key={inc.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 hover:shadow-md transition-all">
                      <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-wider rounded border border-red-100">
                              {inc.type?.replace('_', ' ') || 'Incident Report'}
                            </span>
                            {inc.isLateReport && (
                              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider rounded border border-rose-200">
                                Late Submission
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-extrabold text-slate-900 mt-2">
                            Folder Reference: <span className="font-mono font-bold text-slate-600">{inc.id}</span>
                          </h3>
                        </div>

                        {/* Status Label */}
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-3 py-1.5 rounded-full font-black uppercase tracking-wider ${
                            inc.status === 'closed' ? 'bg-emerald-100 text-emerald-800' :
                            inc.status === 'action_taken' ? 'bg-indigo-100 text-indigo-800' :
                            inc.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            Status: {inc.status?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Visual Status Tracker Section */}
                      {renderStatusTracker(inc.status)}

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                        {/* Left Side: Vehicle detail */}
                        <div className="lg:col-span-5 space-y-4 border-r border-slate-100 pr-0 lg:pr-6">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Involved Asset details</span>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center p-1">
                                {matchedVehicle?.image ? (
                                  <img src={matchedVehicle.image} alt={inc.vehicleName} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                ) : (
                                  <Car size={24} className="text-slate-400" />
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-extrabold text-slate-800">{inc.vehicleName || 'Corporate Vehicle'}</h4>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {inc.vehicleId}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Timeline</span>
                            <div className="space-y-1 text-xs">
                              <span className="block text-slate-500">Occurred: <strong className="text-slate-900">{new Date(inc.occurredAt).toLocaleString()}</strong></span>
                              <span className="block text-slate-500">Submitted: <strong className="text-slate-900">{new Date(inc.submittedAt).toLocaleString()}</strong></span>
                              {matchedBooking && (
                                <span className="block">Route Scope: <strong className="text-slate-900">{matchedBooking.isOutOfCity ? `Out-of-City (${matchedBooking.destination})` : 'In-City Only'}</strong></span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Incident statements & file proofs */}
                        <div className="lg:col-span-7 space-y-4">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Renter Statement of Facts</span>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">{inc.statement}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Witness Contacts</span>
                              {inc.witnessName ? (
                                <p className="text-xs font-bold text-slate-800 mt-1">{inc.witnessName} <span className="text-[10px] text-slate-400">({inc.witnessPhone})</span></p>
                              ) : (
                                <p className="text-xs font-medium text-slate-400 mt-1">None specified</p>
                              )}
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Police FIR Registration Entry No</span>
                            {inc.firNumber ? (
                              <p className="text-xs font-extrabold text-blue-700 mt-1 font-mono uppercase">{inc.firNumber}</p>
                            ) : (
                              <p className="text-xs font-medium text-slate-400 mt-1">No police report attached</p>
                            )}
                          </div>
                        </div>

                        {/* Damage Photos */}
                        {inc.photos && inc.photos.length > 0 && (
                            <div>
                              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Damage Scan Attachments ({inc.photos.length})</span>
                              <div className="flex gap-3 overflow-x-auto py-1">
                                {inc.photos.map((ph: string, pi: number) => (
                                  <a key={pi} href={ph} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                    <img src={ph} alt={`Damage item ${pi}`} className="w-24 h-18 object-cover rounded-xl border border-slate-200 shadow-sm hover:scale-105 transition-all" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Administrative Action Log / Verdict */}
                      {inc.actionType && (
                        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
                          <div>
                            <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider block mb-1">Administrative Action log</span>
                            <h4 className="text-sm font-extrabold text-slate-800">
                              Resolved Category: <span className="text-indigo-700 font-black">{(inc.actionType || '').replace('_', ' ').toUpperCase()}</span>
                            </h4>
                            {inc.notes && (
                              <p className="text-xs text-slate-600 mt-1 font-medium italic">
                                "{inc.notes}"
                              </p>
                            )}
                          </div>
                          <span className="px-3 py-1 bg-white text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase rounded-lg shadow-2xs self-start md:self-auto">
                            Updated by Admin
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'disputes' ? (
          <div className="space-y-8">
            {/* Disputes Header */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 uppercase">My Formal Disputes Desk</h2>
                <p className="text-xs text-slate-500 mt-1">Lodge formal disputes regarding damage charges, late return fees, traffic violations (e-challans), and payment/document audits.</p>
              </div>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 text-xs font-black rounded-xl border border-blue-100">
                Active Disputes: {disputes ? disputes.filter(d => d.userId === user?.id).length : 0}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Side: Dispute Form */}
              <div className="lg:col-span-5">
                <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                      <Scale size={18} className="text-blue-600" />
                      Lodge New Formal Dispute
                    </h3>
                    <p className="text-slate-400 text-[11px] mt-1">Our mediation desk reviews and replies to all disputes within 24 working hours.</p>
                  </div>

                  <form onSubmit={handleDisputeSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-2">Select Booking to Dispute</label>
                      <CustomSelect
                        options={allBookings.filter(b => b.userId === user?.id && b.status === 'active').map((b) => {
                          const v = vehicles.find(veh => veh.id === b.vehicleId);
                          return {
                            value: b.id,
                            label: `${v?.name || 'Vehicle'} (ID: ${b.id.slice(0, 8)}) — ${b.startDate} to ${b.endDate}`
                          };
                        })}
                        value={disputeBookingId}
                        onChange={(val) => setDisputeBookingId(val)}
                        placeholder="-- Choose Your Current Active Booking --"
                        buttonClassName="w-full flex items-center justify-between px-3.5 h-11 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 focus:ring-2 focus:ring-blue-600/20"
                      />
                      {allBookings.filter(b => b.userId === user?.id && b.status === 'active').length === 0 && (
                        <p className="text-[10px] text-rose-600 font-bold mt-1">
                          ⚠️ You can only file a dispute if you have an active current booking.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-2">Dispute Category</label>
                      <CustomSelect
                        options={[
                          { value: 'damage_charges', label: 'Damage Charges Dispute' },
                          { value: 'late_return', label: 'Late Return Penalty' },
                          { value: 'traffic_violation', label: 'Traffic Violation / E-Challan' },
                          { value: 'payment_issue', label: 'Payment Issue' },
                          { value: 'document_issue', label: 'Document / KYC Issue' }
                        ]}
                        value={disputeType}
                        onChange={(val) => setDisputeType(val)}
                        placeholder="Select Dispute Category"
                        buttonClassName="w-full flex items-center justify-between px-3.5 h-11 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-2">Dispute Title / Subject *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Disputing E-Challan ticket on Lahore Motorway"
                        value={disputeTitle}
                        onChange={(e) => setDisputeTitle(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:ring-blue-600 h-11 px-4"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-2">Detailed Grievance Statement *</label>
                      <textarea
                        required
                        placeholder="Explain precisely why you are disputing this charge or penalty. Provide relevant context, timestamps, or state facts clearly so we can adjudicate."
                        value={disputeDescription}
                        onChange={(e) => setDisputeDescription(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:ring-blue-600 p-4 min-h-[140px] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isFilingDispute}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
                    >
                      {isFilingDispute ? 'Submitting Dispute...' : 'Submit Dispute Request'}
                    </button>
                  </form>
                </section>
              </div>

              {/* Right Side: Existing Disputes List */}
              <div className="lg:col-span-7 space-y-4">
                {(!disputes || disputes.filter(d => d.userId === user?.id).length === 0) ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                    <ShieldCheck className="text-slate-300 mx-auto mb-4 animate-bounce" size={48} />
                    <h3 className="text-sm font-bold text-slate-700 uppercase mb-1">No Active Disputes</h3>
                    <p className="text-slate-400 text-xs">
                      You do not have any logged formal dispute records. Outstanding clean balance sheet!
                    </p>
                  </div>
                ) : (
                  disputes.filter(d => d.userId === user?.id).map((dispute) => {
                    const booking = allBookings.find(b => b.id === dispute.bookingId);
                    const vehicle = booking ? vehicles.find(v => v.id === booking.vehicleId) : null;
                    
                    const getStatusStyle = (status: string) => {
                      switch (status) {
                        case 'pending': 
                          return 'bg-amber-50 text-amber-700 border-amber-200';
                        case 'under_review': 
                          return 'bg-blue-50 text-blue-700 border-blue-200';
                        case 'resolved': 
                          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        case 'rejected': 
                          return 'bg-rose-50 text-rose-700 border-rose-200';
                        default: 
                          return 'bg-slate-50 text-slate-700 border-slate-200';
                      }
                    };

                    const getHumanType = (type: string) => {
                      switch (type) {
                        case 'damage_charges': return 'Damage Charges Dispute';
                        case 'late_return': return 'Late Return Penalty';
                        case 'traffic_violation': return 'Traffic Violation / E-Challan';
                        case 'payment_issue': return 'Payment Issue';
                        case 'document_issue': return 'Document / KYC Issue';
                        default: return type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
                      }
                    };

                    return (
                      <div key={dispute.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-bold uppercase text-[8px] rounded-md">
                              {getHumanType(dispute.type)}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 pt-1">{dispute.title}</h4>
                            <span className="text-[10px] font-mono text-slate-400 block">Dispute Ref: {dispute.id}</span>
                          </div>
                          
                          <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${getStatusStyle(dispute.status)}`}>
                            {dispute.status.replace('_', ' ')}
                          </span>
                        </div>

                        {booking && (
                          <div className="text-[10px] bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center justify-between">
                            <div>
                              <span className="text-slate-400 font-black uppercase block text-[8px]">Associated Vehicle & Booking</span>
                              <span className="font-extrabold text-slate-700">{vehicle?.name || 'Vehicle'} ({booking.id.slice(0, 8).toUpperCase()})</span>
                            </div>
                            <span className="font-mono text-slate-400 font-semibold">{booking.startDate} to {booking.endDate}</span>
                          </div>
                        )}

                        <div className="text-xs text-slate-600 font-medium leading-relaxed italic border-l-2 border-slate-200 pl-3">
                          "{dispute.description}"
                        </div>

                        {dispute.resolutionDetails && (
                          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                            <span className="block text-[9px] font-black text-emerald-800 uppercase tracking-widest">Adjudication / Resolution Terms:</span>
                            <p className="text-xs text-slate-700 font-medium leading-relaxed">{dispute.resolutionDetails}</p>
                          </div>
                        )}

                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider pt-2 border-t border-slate-100 flex justify-between">
                          <span>Filed: {new Date(dispute.createdAt).toLocaleDateString()}</span>
                          {dispute.status === 'pending' && <span className="text-amber-600 flex items-center gap-1"><Clock size={10} /> Pending Admin Adjudication</span>}
                          {dispute.status === 'under_review' && <span className="text-blue-600 flex items-center gap-1"><Clock size={10} /> Case Under Active Auditing</span>}
                          {dispute.status === 'resolved' && <span className="text-emerald-600 flex items-center gap-1">✓ Adjudication Decided & Settled</span>}
                          {dispute.status === 'rejected' && <span className="text-rose-600 flex items-center gap-1">✗ Settle Request Declined</span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : usableBookings.length === 0 ? (
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
                    {usableBookings.map(b => {
                      const v = (vehicles || []).find(veh => veh.id === b.vehicleId);
                      const displayLabel = !isStaff 
                        ? `${v?.name || 'Unknown Vehicle'} (${new Date(b.startDate).toLocaleDateString()} to ${new Date(b.endDate).toLocaleDateString()})`
                        : `Ref: ${b.id} — Vehicle: ${v?.name || b.vehicleId} (${b.rentalType} package, ${b.calendarDays} days) - Status: ${b.status.toUpperCase()}`;
                      return (
                        <option key={b.id} value={b.id}>
                          {displayLabel}
                        </option>
                      );
                    })}
                  </select>

                  {/* Render detail info block of matching selected booking */}
                  {selectedBooking && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center gap-3">
                        {selectedVehicle?.image && (
                          <img src={selectedVehicle.image} alt={selectedVehicle.name} className="w-12 h-8 object-cover rounded" />
                        )}
                        <div>
                          <span className="block text-[9px] uppercase font-black text-blue-600">Selected Vehicle Model</span>
                          <span className="text-xs font-black text-slate-800">{selectedVehicle?.name || 'Unknown Vehicle'}</span>
                          {selectedVehicle?.licensePlate && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[9px] font-mono font-bold uppercase">{selectedVehicle.licensePlate}</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-black">Booking Reference ID</span>
                        <span className="text-xs font-mono font-bold text-slate-800">{selectedBooking.id}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-black">Trip Booking Status</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wide">
                          ● {selectedBooking.status}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-black">Insurance Protection Tier</span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-700 capitalize mt-0.5">
                          <ShieldCheck size={14} />
                          {selectedBooking.insuranceType || 'Basic Protection'} Coverage
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-black">Rental Trip Cost</span>
                        <span className="text-xs font-black text-slate-800">PKR {selectedBooking.totalPrice.toLocaleString()}</span>
                      </div>

                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-black">Refundable Security Deposit</span>
                        <span className="text-xs font-black text-blue-600">
                          PKR {(selectedBooking.securityDepositAmount || 5000).toLocaleString()} — <span className="uppercase text-[9px] font-bold text-slate-500">Status: {selectedBooking.securityDepositStatus || 'Collected'}</span>
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-black">Destination Scope</span>
                        <span className="text-xs font-bold text-slate-700">
                          {selectedBooking.isOutOfCity ? (
                            <span className="text-amber-600 font-extrabold">OUT-OF-CITY: {selectedBooking.destination || 'Authorized'}</span>
                          ) : (
                            <span className="text-slate-600">IN-CITY TRIP</span>
                          )}
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

                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-black">Trip Route Nodes</span>
                        <span className="text-xs font-medium text-slate-600">
                          Pickup: <strong className="text-slate-800">{selectedBooking.pickupLocation || 'EliteDrive HQ'}</strong> <br />
                          Dropoff: <strong className="text-slate-800">{selectedBooking.dropoffLocation || 'EliteDrive HQ'}</strong>
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-black">Billing & Breakdown Details</span>
                        <span className="text-xs font-medium text-slate-600">
                          Payment Method: <strong className="text-slate-800 capitalize">{selectedBooking.paymentMethod || 'Credit Card'}</strong> <br />
                          Amount Upfront Paid: <strong className="text-slate-800">PKR {(selectedBooking.upfrontAmountPaid || selectedBooking.totalPrice).toLocaleString()}</strong> <br />
                          Remaining Collected In-Person: <strong className="text-blue-600">PKR {(selectedBooking.remainingAmount || 0).toLocaleString()}</strong>
                        </span>
                      </div>

                      {/* Customer context info shown to staff */}
                      {fileOnBehalf && matchedCustomer && (
                        <div className="md:col-span-2 pt-3 mt-1 border-t border-slate-200 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs uppercase">
                              {matchedCustomer.name.charAt(0)}
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-400 uppercase font-black">Client Account / KYC Details</span>
                              <span className="text-xs font-bold text-slate-800">{matchedCustomer.name} ({matchedCustomer.email})</span>
                            </div>
                          </div>
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 font-semibold">
                            <Siren size={14} className="shrink-0 mt-0.5 text-amber-600 animate-pulse" />
                            <div>
                              <span className="block uppercase font-black text-[9px] text-amber-900 mb-0.5">On-Behalf Telephone Filing Mode</span>
                              Renter's device is inaccessible/lost. You are authorized to log this accident report via phone-in customer verification.
                            </div>
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

                {gapAlert && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex gap-3 text-xs font-semibold animate-pulse">
                    <ShieldAlert size={18} className="shrink-0 text-red-600" />
                    <div>
                      <span className="block font-black uppercase text-[10px] text-red-900 mb-0.5">Dual-Timestamp Policy Flag</span>
                      {gapAlert}
                    </div>
                  </div>
                )}

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
              </section>              {/* Insurance Coverage Summary Based on Booking selection */}
              {selectedBooking && (
                <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-blue-600" />
                      Dynamic Policy Coverage
                    </h4>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/60 space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Active Protection Deck</span>
                      <h5 className="text-xs font-extrabold text-slate-900 uppercase">
                        {selectedBooking.insuranceType === 'premium' ? 'Premium Zero Deductible Cover' : selectedBooking.insuranceType === 'basic' ? 'Basic Collision Waiver Coverage' : 'Third-Party Liability Only'}
                      </h5>
                    </div>
                    
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      {selectedBooking.insuranceType === 'premium' ? (
                        'Congratulations. You chose Premium Cover! Renter carries absolutely 100% replacement protection. PKR 0 financial deductible applies; damage costs completely covered.'
                      ) : selectedBooking.insuranceType === 'basic' ? (
                        'Under LCW Basic, accidental damages are covered with customer offset capped at maximum Rs. 30,000 diagnostic fees. EliteDrive covers costs beyond Rs. 30,000.'
                      ) : (
                        'No supplementary coverage selected. You opted for standard Third-Party Only liability. Renter is 100% accountable for restoration invoice costs.'
                      )}
                    </p>

                    <div className="border-t border-blue-100/50 pt-2 space-y-2">
                      <div>
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider block">🛡️ Covered:</span>
                        <ul className="list-disc list-inside text-[9px] text-slate-600 font-semibold mt-0.5 space-y-0.5">
                          {selectedBooking.insuranceType === 'premium' && (
                            <>
                              <li>100% accident collision repairs (Rs. 0 deductible)</li>
                              <li>Full vehicle body dents & major scratches</li>
                              <li>Mechanical failures under standard operation</li>
                              <li>Complete vehicle theft / hijack recovery</li>
                            </>
                          )}
                          {selectedBooking.insuranceType === 'basic' && (
                            <>
                              <li>Accident repair costs exceeding Rs. 30,000</li>
                              <li>Major body panel replacements</li>
                              <li>Third-party damage liability coverage</li>
                            </>
                          )}
                          {(selectedBooking.insuranceType === 'none' || !selectedBooking.insuranceType) && (
                            <>
                              <li>Government statutory third-party bodily injury only</li>
                            </>
                          )}
                        </ul>
                      </div>

                      <div>
                        <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider block">❌ NOT Covered:</span>
                        <ul className="list-disc list-inside text-[9px] text-slate-600 font-semibold mt-0.5 space-y-0.5">
                          {selectedBooking.insuranceType === 'premium' && (
                            <>
                              <li>Intentional sabotage or negligent abuse</li>
                              <li>Driving off-road on unauthorized mountain dirt tracks</li>
                              <li>Operating under influence of prohibited substances</li>
                            </>
                          )}
                          {selectedBooking.insuranceType === 'basic' && (
                            <>
                              <li>First Rs. 30,000 deductible fee per claim</li>
                              <li>Flat tires, cabin interior wear & stain cleaning</li>
                              <li>Negligent water logging or engine hydrolock</li>
                            </>
                          )}
                          {(selectedBooking.insuranceType === 'none' || !selectedBooking.insuranceType) && (
                            <>
                              <li>Any vehicle body scratches, dents, or paint scrapes</li>
                              <li>Engine or mechanical wear, engine hydrolock</li>
                              <li>Total vehicle theft, loss of parts or keys</li>
                              <li>100% of body shop restoration & downtime loss-of-use fees</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
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
