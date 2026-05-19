import React from 'react';
import { motion } from 'motion/react';
import { 
  Code2, 
  Workflow, 
  Database, 
  ShieldCheck, 
  Users, 
  Car, 
  CreditCard, 
  Zap,
  ChevronRight,
  ArrowRight,
  Layers,
  Cpu,
  Globe
} from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[48px] bg-slate-900 p-12 text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
            <Cpu size={14} /> Application Blueprints
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 italic">
            Elite<span className="text-blue-500">Drive</span> Architecture
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
            A high-performance car rental ecosystem built with a focus on real-time data sync, 
            granular security, and premium user experience.
          </p>
        </motion.div>
      </section>

      {/* Tech Stack Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Globe, title: 'Frontend', desc: 'React 18 + Vite', color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { icon: Layers, title: 'Styles', desc: 'Tailwind CSS v4', color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { icon: Database, title: 'Storage', desc: 'Cloud Firestore', color: 'text-orange-500', bg: 'bg-orange-500/5' },
          { icon: ShieldCheck, title: 'Auth', desc: 'Firebase Auth', color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
        ].map((tech, i) => (
          <motion.div 
            key={tech.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-blue-600/20 transition-all"
          >
            <div className={`size-14 ${tech.bg} ${tech.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <tech.icon size={28} />
            </div>
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-1">{tech.title}</h3>
            <p className="text-slate-500 font-bold text-sm tracking-tight">{tech.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Application Core Flow Diagram */}
      <section className="bg-white rounded-[48px] border border-slate-100 shadow-xl shadow-slate-100/50 p-12">
        <div className="flex items-center gap-4 mb-12">
          <div className="size-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Workflow size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">The Lifecycle</h2>
            <p className="text-slate-500 font-medium tracking-tight">End-to-end user journey mapping.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Vertical Connectors for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
          
          {[
            { step: '1', title: 'Discovery', icon: Car, desc: 'User browses fleet with dynamic filters.' },
            { step: '2', title: 'Intent', icon: Zap, desc: 'Selection of dates & vehicle inspection.' },
            { step: '3', title: 'Security', icon: ShieldCheck, desc: 'Real-time ID & eligibility verification.' },
            { step: '4', title: 'Transaction', icon: CreditCard, desc: 'Secure booking & state lock in DB.' },
            { step: '5', title: 'Fulfillment', icon: Code2, desc: 'Manager approval & vehicle handover.' }
          ].map((item, i) => (
            <div key={item.title} className="relative z-10">
              <div className="bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col items-center text-center hover:shadow-xl hover:shadow-slate-100 transition-all">
                <div className="size-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-xs mb-4">0{item.step}</div>
                <item.icon className="text-blue-600 mb-2" size={32} />
                <h4 className="font-black text-slate-900 tracking-tight mb-2">{item.title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
              {i < 4 && <div className="md:hidden flex justify-center py-4 text-slate-200"><ArrowRight className="rotate-90" /></div>}
            </div>
          ))}
        </div>
      </section>

      {/* User Roles & Permissions Matrix */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[40px] p-10 text-white flex flex-col h-full">
          <div className="flex items-center gap-4 mb-8">
            <Users size={32} className="text-blue-400" />
            <h2 className="text-3xl font-black tracking-tight italic uppercase">Role <span className="text-blue-400">Hierarchy</span></h2>
          </div>
          
          <div className="space-y-6 flex-1">
            {[
              { role: 'Admin', powers: 'System override, revenue tools, total role management, fleet control.' },
              { role: 'Manager', powers: 'Inventory operations, booking approvals, performance analytics, support.' },
              { role: 'Customer', powers: 'Premium search, booking management, profile verification, favorite tracking.' }
            ].map((r) => (
              <div key={r.role} className="flex gap-4 group">
                <div className="size-5 rounded-full border-2 border-blue-500 mt-1 flex-shrink-0 group-hover:bg-blue-500 transition-all"></div>
                <div>
                  <h4 className="font-black text-lg tracking-tight mb-1">{r.role}</h4>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">{r.powers}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-200 p-10 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-8">
            <Code2 size={32} className="text-blue-600" />
            <h2 className="text-3xl font-black tracking-tight italic uppercase">Flow <span className="text-blue-600">Logic</span></h2>
          </div>
          
          <div className="bg-slate-50 rounded-3xl p-6 font-mono text-[11px] text-slate-700 space-y-4 overflow-x-auto leading-relaxed shadow-inner">
            <div>
              <p className="text-blue-600 font-bold">// Pseudocode: Secure Booking Flow</p>
              <p className="pl-4">function handleBooking(carId, user) {"{"}</p>
              <p className="pl-8">if (!user.isVerified) throw "Verification Required";</p>
              <p className="pl-8">if (car.status != 'available') throw "Conflict";</p>
              <p className="pl-8 mt-2">const booking = {"{"}</p>
              <p className="pl-12">userId: user.uid,</p>
              <p className="pl-12">carId: carId,</p>
              <p className="pl-12">status: 'pending',</p>
              <p className="pl-12">timestamp: ServerValue.TIMESTAMP</p>
              <p className="pl-8">{"}"};</p>
              <p className="pl-8 mt-2">await atomicWrite([</p>
              <p className="pl-12">createDoc('bookings', booking),</p>
              <p className="pl-12">updateDoc('cars', carId, {"{ status: 'booked' }"})</p>
              <p className="pl-8">]);</p>
              <p className="pl-4">{"}"}</p>
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <p className="text-emerald-600 font-bold">// Firestore Security Hook</p>
              <p className="pl-4">match /vehicles/{"{vehicleId}"} {"{"}</p>
              <p className="pl-8">allow update: if isAdmin() || (</p>
              <p className="pl-12">request.auth != null &&</p>
              <p className="pl-12">request.resource.data.diff(resource.data).affectedKeys()</p>
              <p className="pl-12">.hasOnly(['status', 'lastUpdated'])</p>
              <p className="pl-8">);</p>
              <p className="pl-4">{"}"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Feature Breakdown */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">CORE CAPABILITIES</h2>
          <p className="text-slate-500 font-medium tracking-tight">Advanced features powering the EliteDrive engine.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: 'Smart Inventory', 
              desc: 'Dynamic fleet management with real-time status updates (Available, Rented, Maintenance). Managers can CRUD vehicles and monitor health.',
              features: ['Image Optimization', 'Specs Management', 'Status Locking']
            },
            { 
              title: 'Granular Auth', 
              desc: 'Identity management using Firebase Auth with custom role resolution in StoreContext. Multi-tier access for Admin, Manager, and Customer.',
              features: ['Invitation System', 'Role-based Redirects', 'Permission Guards']
            },
            { 
              title: 'Support Matrix', 
              desc: 'In-app real-time chat with support agents (Managers/Admins). Powered by real-time Firestore listeners for instant messaging.',
              features: ['Live Status', 'Message History', 'Quick Replies']
            },
            { 
              title: 'Dynamic Reporting', 
              desc: 'Automatic generation of rental reports, revenue tracking, and customer performance metrics for decision making.',
              features: ['PDF Exports (Planned)', 'Visual Charts', 'Trend Analysis']
            },
            { 
              title: 'Verification Engine', 
              desc: 'Strict profile verification flow ensuring only valid users can proceed to booking, protecting assets for the rental firm.',
              features: ['Email Verification', 'KYC Logic', 'Phone Validation']
            },
            { 
              title: 'State Protection', 
              desc: 'Firestore security rules preventing unauthorized data modification. Sub-resource locking during active transactions.',
              features: ['Audit Logging', 'Immutable Fields', 'Key Validation']
            }
          ].map((feature, i) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[40px] border border-slate-100 group hover:bg-slate-900 hover:text-white transition-all duration-500 shadow-sm"
            >
              <h3 className="text-xl font-black mb-4 italic group-hover:text-blue-400 transition-colors">{feature.title}</h3>
              <p className="text-slate-500 group-hover:text-slate-400 text-sm font-medium leading-relaxed mb-6">
                {feature.desc}
              </p>
              <ul className="space-y-2">
                {feature.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <ChevronRight size={14} className="text-blue-600 group-hover:text-blue-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footnote / Call to Action */}
      <section className="bg-blue-600 rounded-[48px] p-12 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl font-black tracking-tight mb-4 italic uppercase">Ready to explore?</h2>
          <p className="text-white/80 font-medium mb-8 leading-relaxed">
            Experience the full potential of EliteDrive. Browse our premium collection or 
            manage your operations with data-driven precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 font-black rounded-2xl shadow-xl shadow-blue-900/20 active:scale-95 transition-all">
              Go to Dashboard
            </button>
            <button className="px-8 py-4 bg-blue-500 text-white font-black rounded-2xl border border-white/20 active:scale-95 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* Code Signature */}
      <div className="text-center pb-10">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
          Built with <span className="text-rose-500">❤️</span> by EliteDrive Engineering • 2026
        </p>
      </div>
    </div>
  );
};

export default About;
