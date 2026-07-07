import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Database, 
  Globe, 
  Bell, 
  Lock, 
  UserPlus, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Key,
  Database as DatabaseIcon,
  CloudUpload
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const SystemConfig: React.FC = () => {
  const { user, allUsers, showToast, migrateVehicleIds } = useStore();
  const [activeTab, setActiveTab] = useState<'roles' | 'fleet' | 'integrations' | 'backup'>('roles');
  const [isMigrating, setIsMigrating] = useState(false);
  const [minDeposit, setMinDeposit] = useState<number>(() => {
    const stored = localStorage.getItem('min_security_deposit');
    return stored ? Number(stored) : 10000;
  });

  // Webhook Simulator state
  const [webhookUserId, setWebhookUserId] = useState('');
  const [webhookType, setWebhookType] = useState('info');
  const [webhookTitle, setWebhookTitle] = useState('New Live Alert');
  const [webhookMessage, setWebhookMessage] = useState('A real-time notification was received via the Webhook API!');
  const [webhookLink, setWebhookLink] = useState('/admin-dashboard');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const tabs = [
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'fleet', label: 'Fleet Parameters', icon: Settings },
    { id: 'integrations', label: 'API Integrations', icon: Globe },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
  ];

  const handleSave = () => {
    localStorage.setItem('min_security_deposit', minDeposit.toString());
    showToast('Settings saved successfully', 'success');
  };

  const handleMigrate = async () => {
    if (window.confirm('Are you sure you want to migrate all legacy vehicle IDs to random strings? This will update all vehicles, bookings, and user favorites.')) {
      setIsMigrating(true);
      try {
        await migrateVehicleIds();
      } finally {
        setIsMigrating(false);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h1>
          <p className="text-slate-500 font-medium">Configure system-wide settings and parameters</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
        >
          <Save size={20} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar Tabs */}
        <div className="col-span-12 lg:col-span-3 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="col-span-12 lg:col-span-9 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          {activeTab === 'roles' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">User Roles & Permissions</h3>
                <button className="flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">
                  <UserPlus size={16} />
                  Invite User
                </button>
              </div>
              
              <div className="space-y-4">
                {[
                  { role: 'Administrator', users: 2, access: 'Full System Access', color: 'blue' },
                  { role: 'Manager', users: 5, access: 'Fleet & Booking Management', color: 'emerald' },
                  { role: 'Support Agent', users: 8, access: 'Customer Support & Ticketing', color: 'amber' },
                ].map((role, i) => (
                  <div key={i} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex items-center justify-between group hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-5">
                      <div className={`size-12 rounded-2xl flex items-center justify-center ${
                        role.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        role.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        <Shield size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{role.role}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{role.access}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Users</p>
                        <p className="text-sm font-black text-slate-900">{role.users}</p>
                      </div>
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-all">
                        <Settings size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fleet' && (
            <div className="space-y-10">
              <h3 className="text-xl font-black text-slate-900">Fleet Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Maintenance Threshold (km)</label>
                  <input type="number" placeholder="5000" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 transition-all" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Max Booking Duration (Days)</label>
                  <input type="number" placeholder="30" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 transition-all" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Default Currency</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 transition-all">
                    <option>PKR</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Minimum Security Deposit (PKR)</label>
                  <input 
                    type="number" 
                    value={minDeposit} 
                    onChange={(e) => setMinDeposit(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 transition-all" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Booking Confirmation</label>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <input type="checkbox" defaultChecked className="size-5 rounded-lg text-blue-600 focus:ring-blue-600" />
                    <span className="text-sm font-bold text-slate-600">Require manual approval</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-black text-slate-900">External API Integrations</h3>
                <p className="text-sm text-slate-500 font-medium">Manage and configure active API services connected to the EliteDrive platform</p>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Stripe Payments', status: 'Connected', icon: Key, color: 'emerald' },
                  { name: 'Google Maps API', status: 'Connected', icon: Globe, color: 'blue' },
                  { name: 'Twilio SMS', status: 'Disconnected', icon: Bell, color: 'rose' },
                  { name: 'AWS S3 Storage', status: 'Connected', icon: DatabaseIcon, color: 'emerald' },
                ].map((api, i) => (
                  <div key={i} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={`size-12 rounded-2xl flex items-center justify-center ${
                        api.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                        api.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        'bg-rose-100 text-rose-600'
                      }`}>
                        <api.icon size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{api.name}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${
                          api.color === 'emerald' ? 'text-emerald-600' :
                          api.color === 'blue' ? 'text-blue-600' :
                          'text-rose-600'
                        }`}>{api.status}</p>
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                      Configure
                    </button>
                  </div>
                ))}
              </div>

              {/* Live Webhook & Notification Playground */}
              <div className="pt-8 border-t border-slate-100 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    Live Webhook Notification Desk
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    Trigger and receive instant real-time notifications over the Webhook integration. Test external system pings live.
                  </p>
                </div>

                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Config & Copy */}
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Webhook Target URL</span>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-xs text-slate-600 select-all break-all">
                        {window.location.origin}/api/webhooks/notification
                      </div>
                      <div className="flex gap-4 text-xs font-bold text-slate-500">
                        <span>Method: <strong className="text-blue-600">POST</strong></span>
                        <span>Content: <strong className="text-slate-800">JSON</strong></span>
                      </div>
                    </div>

                    <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3 relative overflow-hidden font-mono text-xs">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>cURL Integration Command</span>
                        <button 
                          onClick={() => {
                            const curlCmd = `curl -X POST ${window.location.origin}/api/webhooks/notification \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "userId": "${webhookUserId || (user?.id || '')}",\n    "title": "${webhookTitle}",\n    "message": "${webhookMessage}",\n    "type": "${webhookType}",\n    "link": "${webhookLink}"\n  }'`;
                            navigator.clipboard.writeText(curlCmd);
                            setCopiedCurl(true);
                            setTimeout(() => setCopiedCurl(false), 2000);
                          }}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all font-sans"
                        >
                          {copiedCurl ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="overflow-x-auto whitespace-pre-wrap select-all leading-relaxed max-h-[140px] text-slate-300 text-[10px]">
{`curl -X POST ${window.location.origin}/api/webhooks/notification \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "${webhookUserId || (user?.id || '')}",
    "title": "${webhookTitle}",
    "message": "${webhookMessage}",
    "type": "${webhookType}",
    "link": "${webhookLink}"
  }'`}
                      </pre>
                    </div>
                  </div>

                  {/* Right Column: Interactive Form */}
                  <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Webhook Simulator Console</span>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target Recipient</label>
                        <select 
                          value={webhookUserId}
                          onChange={(e) => setWebhookUserId(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                        >
                          <option value="">Default Admin ({user?.name || 'Me'})</option>
                          {allUsers.map(u => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Type</label>
                          <select 
                            value={webhookType}
                            onChange={(e) => setWebhookType(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                          >
                            <option value="info">Info / System</option>
                            <option value="booking_confirmed">Booking Confirmed</option>
                            <option value="booking_cancelled">Booking Cancelled</option>
                            <option value="promotion">Promo / Message</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Redirect Route</label>
                          <input 
                            type="text"
                            value={webhookLink}
                            onChange={(e) => setWebhookLink(e.target.value)}
                            placeholder="/admin-dashboard"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Notification Title</label>
                        <input 
                          type="text"
                          value={webhookTitle}
                          onChange={(e) => setWebhookTitle(e.target.value)}
                          placeholder="Notification Title"
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Notification Message</label>
                        <textarea 
                          rows={2}
                          value={webhookMessage}
                          onChange={(e) => setWebhookMessage(e.target.value)}
                          placeholder="Type notification message body..."
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20 resize-none"
                        />
                      </div>

                      <button
                        onClick={async () => {
                          setIsSendingWebhook(true);
                          try {
                            const res = await fetch('/api/webhooks/notification', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                userId: webhookUserId || user?.id,
                                title: webhookTitle,
                                message: webhookMessage,
                                type: webhookType,
                                link: webhookLink
                              })
                            });
                            if (!res.ok) throw new Error('Webhook failed');
                            const data = await res.json();
                            showToast('Webhook successfully triggered! Live broadcast dispatched.', 'success');
                          } catch (err) {
                            console.error('Webhook trigger failed:', err);
                            showToast('Failed to trigger Webhook endpoint.', 'error');
                          } finally {
                            setIsSendingWebhook(false);
                          }
                        }}
                        disabled={isSendingWebhook}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                      >
                        {isSendingWebhook ? 'Triggering...' : 'Dispatch Live Webhook'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-10">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">Backup & Restore</h3>
                <span className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 size={16} />
                  System Healthy
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-[32px] bg-blue-50 border border-blue-100 space-y-6">
                  <div className="size-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                    <CloudUpload size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">Manual Backup</h4>
                    <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">Create a complete snapshot of your system data, including vehicles, bookings, and user records.</p>
                    <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                      Start Backup Now
                    </button>
                  </div>
                </div>

                <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 space-y-6">
                  <div className="size-16 rounded-3xl bg-white text-slate-400 flex items-center justify-center border border-slate-200">
                    <RefreshCw size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">Restore Point</h4>
                    <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">Restore your system to a previous state. Warning: This will overwrite current data.</p>
                    <button className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                      Select Restore Point
                    </button>
                  </div>
                </div>
                <div className="p-8 rounded-[32px] bg-amber-50 border border-amber-100 space-y-6">
                  <div className="size-16 rounded-3xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-200">
                    <RefreshCw size={32} className={isMigrating ? 'animate-spin' : ''} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">Migrate Vehicle IDs</h4>
                    <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">Convert all legacy numeric vehicle IDs to random alphanumeric strings. This ensures system-wide consistency.</p>
                    <button 
                      onClick={handleMigrate}
                      disabled={isMigrating}
                      className="w-full py-4 bg-amber-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-xl shadow-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMigrating ? 'Migrating...' : 'Migrate Now'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                <AlertCircle className="text-amber-500 shrink-0" size={24} />
                <div>
                  <p className="text-xs font-black text-slate-900 mb-1 uppercase tracking-widest">Automatic Backups Enabled</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Last automatic backup: Today at 04:00 AM (UTC)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
