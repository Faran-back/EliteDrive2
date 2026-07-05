import React, { useState } from 'react';
import { 
  Wallet, 
  Search, 
  User, 
  FileText, 
  AlertTriangle,
  Scale,
  Calendar,
  Car,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion } from 'motion/react';

const RemainingBalances: React.FC = () => {
  const { allUsers, allBookings, eChallans, vehicles } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter customers with an outstanding balance
  const customersWithBalance = allUsers.filter(u => {
    const hasBalance = (u.outstandingBalance || 0) > 0;
    const matchesSearch = searchQuery === '' || 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return hasBalance && matchesSearch;
  });

  const getCustomerReasons = (customerId: string, outstandingBalance: number) => {
    const reasons: { title: string; amount: number; date?: string; icon: any }[] = [];
    
    // 1. Get matched e-challans
    const matchedChallans = eChallans.filter(c => c.matchedUserId === customerId);
    matchedChallans.forEach(c => {
      reasons.push({
        title: `Traffic E-Challan #${c.challanNumber}`,
        amount: c.amount,
        date: c.date || c.createdAt,
        icon: Scale
      });
    });

    // 2. Get bookings with penalty amounts
    const matchedBookings = allBookings.filter(b => b.userId === customerId && (b.penaltyAmount || 0) > 0);
    matchedBookings.forEach(b => {
      const v = vehicles.find(veh => veh.id === b.vehicleId);
      reasons.push({
        title: `Late Return / Damage Penalty (${v?.name || 'Vehicle'} - ID: ${b.id.slice(0, 8).toUpperCase()})`,
        amount: b.penaltyAmount || 0,
        date: b.endDate,
        icon: Car
      });
    });

    // Calculate sum of known penalties
    const sumPenalties = reasons.reduce((acc, r) => acc + r.amount, 0);
    
    // 3. If there is a discrepancy or no specific reasons found, add a miscellaneous entry
    if (sumPenalties < outstandingBalance) {
      reasons.push({
        title: 'Account Balance Adjustment / Unresolved Security Surcharge',
        amount: outstandingBalance - sumPenalties,
        icon: Wallet
      });
    }

    return reasons;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Wallet className="text-blue-600" size={24} />
            Customer Outstanding Balances
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitor real-time customer receivables, auto-debited traffic violations, and late return surcharges.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search customer name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600/20 text-slate-800"
          />
        </div>
      </div>

      {customersWithBalance.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <Wallet className="text-emerald-600" size={28} />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase">All Accounts Clear</h3>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            There are currently no customers with active outstanding balances. All accounts are fully settled.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {customersWithBalance.map((customer) => {
            const balance = customer.outstandingBalance || 0;
            const reasons = getCustomerReasons(customer.id, balance);

            return (
              <div 
                key={customer.id} 
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-md transition-all"
              >
                {/* Left side: Customer details & Reasons breakdown */}
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                      {customer.avatar ? (
                        <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        customer.name?.charAt(0).toUpperCase() || 'C'
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{customer.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {customer.id} • {customer.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Penalties & Charge Details</span>
                    <div className="grid grid-cols-1 gap-2">
                      {reasons.map((reason, index) => {
                        const IconComponent = reason.icon;
                        return (
                          <div key={index} className="flex items-start justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                            <div className="flex items-start gap-2.5">
                              <div className="p-1.5 bg-white border border-slate-100 text-slate-500 rounded-md mt-0.5">
                                <IconComponent size={14} />
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block">{reason.title}</span>
                                {reason.date && (
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    Logged on: {new Date(reason.date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-extrabold text-slate-900 whitespace-nowrap ml-4">
                              PKR {reason.amount.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right side: Total remaining balance Card */}
                <div className="w-full md:w-64 bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between border border-slate-950 shadow-inner">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Outstanding Balance</span>
                    <span className="text-2xl font-black text-amber-400 block">PKR {balance.toLocaleString()}</span>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                    <Clock size={12} className="text-amber-400" />
                    <span>Awaiting Payment Settlement</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RemainingBalances;
