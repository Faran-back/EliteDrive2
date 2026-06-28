import React, { useState, useEffect } from 'react';
import { Mail, Search, RefreshCw, ChevronRight, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface SentEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  sentAt: string;
  status: 'sent' | 'failed';
  error?: string;
}

interface EmailLogsSandboxProps {
  isAdminView?: boolean;
}

const EmailLogsSandbox: React.FC<EmailLogsSandboxProps> = ({ isAdminView = false }) => {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('elitedrive_token');
      const endpoint = isAdminView ? '/api/sent-emails' : '/api/my-emails';
      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setEmails(data);
        if (data.length > 0 && !selectedEmail) {
          setSelectedEmail(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch emails:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [isAdminView]);

  const filteredEmails = emails.filter(email => 
    email.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[650px] flex flex-col">
      {/* Header Panel */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-950 flex items-center gap-2">
            <Mail className="text-blue-600" size={20} />
            {isAdminView ? 'System Outbound Mailer Sandbox (Nodemailer)' : 'My Notification Emails'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdminView 
              ? 'Real-time SMTP outbox tracker showing automated customer notifications.' 
              : 'Archive of transactional emails and system alerts sent to your address.'}
          </p>
        </div>
        <button 
          onClick={fetchEmails} 
          disabled={loading}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Outbox
        </button>
      </div>

      {/* Main Sandbox Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left list panel */}
        <div className="w-full sm:w-2/5 border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
          <div className="p-3 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search mail logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="animate-spin text-blue-600" size={24} />
                Scanning outbound queue...
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400 flex flex-col items-center justify-center gap-2 h-48">
                <AlertCircle size={24} />
                No emails found in queue
              </div>
            ) : (
              filteredEmails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`w-full text-left p-4 transition-all hover:bg-white flex flex-col gap-1.5 border-l-4 ${
                    selectedEmail?.id === email.id 
                      ? 'bg-blue-50/30 border-blue-600' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {email.id}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock size={10} />
                      {new Date(email.sentAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <span className="font-bold text-xs text-slate-900 line-clamp-1">
                    {email.subject}
                  </span>

                  <span className="text-xs text-slate-500 font-medium line-clamp-1">
                    To: {email.to}
                  </span>

                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(email.sentAt).toLocaleDateString()}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                      email.status === 'sent' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {email.status === 'sent' ? (
                        <>
                          <CheckCircle size={10} /> Sent
                        </>
                      ) : (
                        <>
                          <AlertCircle size={10} /> Failed
                        </>
                      )}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Preview Drawer / Iframe Sandbox */}
        <div className="hidden sm:flex flex-1 flex-col h-full bg-white">
          {selectedEmail ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Envelope meta details */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedEmail.subject}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      <strong>From:</strong> EliteDrive Notifications &lt;no-reply@elitedrive.pk&gt;
                    </p>
                    <p className="text-xs text-slate-500">
                      <strong>To:</strong> {selectedEmail.to}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono block">
                      {new Date(selectedEmail.sentAt).toLocaleString()}
                    </span>
                    {selectedEmail.error && (
                      <span className="text-[10px] text-red-600 bg-red-50 font-semibold px-2 py-1 rounded block mt-1">
                        Err: {selectedEmail.error}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Styled Iframe sandbox rendering HTML */}
              <div className="flex-1 bg-slate-100 p-4 overflow-hidden flex flex-col">
                <div className="w-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
                  {/* Simulated browser/email frame controls */}
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-xs">
                      http://elitedrive-sandbox/mail/preview/{selectedEmail.id}
                    </span>
                  </div>

                  {/* Sandboxed Iframe content rendering */}
                  <iframe
                    title="Email Preview"
                    srcDoc={selectedEmail.html}
                    className="w-full flex-1 border-0 bg-slate-50"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Eye size={36} className="stroke-[1.5]" />
              <p className="text-sm font-medium">Select an email from the outbox queue to preview styling.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailLogsSandbox;
