import React from 'react';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Shield, 
  User as UserIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  History
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { RoleRequest } from '../../types';

const RoleRequests: React.FC = () => {
  const { roleRequests, approveRoleRequest, rejectRoleRequest } = useStore();

  const pendingRequests = roleRequests.filter(r => r.status === 'pending');
  const processedRequests = roleRequests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Role Requests</h2>
        <p className="text-slate-500 font-medium">Manage pending requests for Manager and Admin roles</p>
      </div>

      {/* Pending Requests */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-amber-600">
          <Clock size={20} />
          <h3 className="font-black uppercase tracking-widest text-sm">Pending Approval ({pendingRequests.length})</h3>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-[32px] border border-slate-200 text-center space-y-4">
            <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <CheckCircle size={32} />
            </div>
            <p className="text-slate-500 font-bold">No pending role requests at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((request) => (
              <motion.div 
                key={request.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">{request.userName}</h4>
                      <p className="text-xs text-slate-500 font-medium">{request.userEmail}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    request.requestedRole === 'admin' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                  }`}>
                    {request.requestedRole}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-6">
                  <Clock size={14} />
                  <span>Requested on {new Date(request.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => approveRoleRequest(request.id)}
                    className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 active:scale-[0.98]"
                  >
                    <UserCheck size={16} />
                    Approve
                  </button>
                  <button 
                    onClick={() => rejectRoleRequest(request.id)}
                    className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-100 hover:text-red-600 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98]"
                  >
                    <UserX size={16} />
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-500">
            <History size={20} />
            <h3 className="font-black uppercase tracking-widest text-sm">Recently Processed</h3>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Requested Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Processed By</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {processedRequests.slice(0, 10).map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                          <UserIcon size={16} />
                        </div>
                        <span className="font-bold text-slate-900">{request.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold capitalize text-slate-600">{request.requestedRole}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${
                        request.status === 'approved' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {request.status === 'approved' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500">{request.processedBy || 'System'}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(request.processedAt || request.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleRequests;
