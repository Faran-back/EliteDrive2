import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Shield, 
  User as UserIcon, 
  Search,
  Check,
  ChevronDown,
  AlertCircle,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Info,
  History,
  CheckSquare,
  Square,
  UserCheck,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmationModal from '../ConfirmationModal';
import { User } from '../../types';

const ROLE_DESCRIPTIONS = {
  admin: 'Full access to system configurations, financial reports, and user management.',
  manager: 'Can manage fleet, bookings, and view reports. Limited system access.',
  customer: 'Standard user access. Can book vehicles and manage personal profile.'
};

const RoleBadge: React.FC<{ role: User['role'] }> = ({ role }) => {
  const styles = {
    admin: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    manager: 'bg-blue-100 text-blue-700 border-blue-200',
    customer: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const icons = {
    admin: <ShieldCheck size={12} />,
    manager: <UserCheck size={12} />,
    customer: <UserIcon size={12} />
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[role]}`}>
      {icons[role]}
      {role}
    </span>
  );
};

const RoleAssignment: React.FC = () => {
  const { allUsers, updateUserRole, bulkUpdateUserRoles, user: currentUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | User['role']>('all');
  const [domainFilter, setDomainFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; userId?: string; newRole?: User['role']; isBulk?: boolean } | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Filtering and Sorting Logic
  const filteredAndSortedUsers = useMemo(() => {
    let result = allUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesDomain = !domainFilter || user.email.toLowerCase().endsWith(domainFilter.toLowerCase());
      return matchesSearch && matchesRole && matchesDomain;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [allUsers, searchTerm, roleFilter, domainFilter, sortConfig]);

  const handleSort = (key: keyof User) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredAndSortedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredAndSortedUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    setUpdatingUserId(userId);
    try {
      await updateUserRole(userId, newRole);
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setUpdatingUserId(null);
      setActiveDropdown(null);
    }
  };

  const handleBulkRoleChange = async (newRole: User['role']) => {
    try {
      await bulkUpdateUserRoles(selectedUsers, newRole);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to update bulk roles:', error);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Security Notice Alert */}
      <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px] flex gap-4 shadow-sm">
        <div className="size-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
          <AlertCircle size={28} />
        </div>
        <div className="flex-1">
          <h4 className="text-amber-900 font-black text-lg mb-1 tracking-tight">System Security Protocol</h4>
          <p className="text-amber-700 text-sm font-medium leading-relaxed max-w-3xl">
            Administrative privileges grant unrestricted access to core system infrastructure, financial data, and sensitive user PII. 
            Always verify identity through secondary channels before escalating permissions.
          </p>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Role Management</h2>
          <p className="text-slate-500 font-medium">Governance and access control for {allUsers.length} system entities</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-2xl shadow-sm">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="pl-3 pr-8 py-1.5 bg-transparent text-xs font-black uppercase tracking-wider text-slate-600 outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="manager">Managers</option>
              <option value="customer">Customers</option>
            </select>
            <div className="w-px h-4 bg-slate-200" />
            <input 
              type="text" 
              placeholder="Domain (e.g. @test.com)" 
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="pl-3 pr-4 py-1.5 bg-transparent text-xs font-bold text-slate-600 outline-none w-32"
            />
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedUsers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white text-slate-900 px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-8 border border-slate-100 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xs">
                {selectedUsers.length}
              </div>
              <span className="text-sm font-black uppercase tracking-widest">Selected</span>
            </div>
            
            <div className="h-6 w-px bg-slate-200" />
            
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Bulk Role:</span>
              <div className="flex gap-2">
                {(['customer', 'manager', 'admin'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setConfirmModal({ isOpen: true, newRole: role, isBulk: true })}
                    className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setSelectedUsers([])}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <AlertCircle size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-visible">
        <div className="overflow-x-auto overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 w-12 rounded-tl-[40px]">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600 transition-colors">
                    {selectedUsers.length === filteredAndSortedUsers.length ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                </th>
                <th className="px-6 py-6">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                    User Entity <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-6 py-6">
                  <button onClick={() => handleSort('role')} className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                    Current Role <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Audit Trail</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right rounded-tr-[40px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 overflow-visible">
              {filteredAndSortedUsers.length > 0 ? (
                filteredAndSortedUsers.map((user, idx) => (
                  <tr key={user.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-blue-50/30 transition-colors group`}>
                    <td className={`px-8 py-5 ${idx === filteredAndSortedUsers.length - 1 ? 'rounded-bl-[40px]' : ''}`}>
                      <button onClick={() => toggleSelectUser(user.id)} className="text-slate-300 group-hover:text-blue-600 transition-colors">
                        {selectedUsers.includes(user.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                          <img 
                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <RoleBadge role={user.role} />
                        <div className="group/tooltip relative">
                          <Info size={14} className="text-slate-300 cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-white text-[10px] font-medium rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 shadow-2xl">
                            {ROLE_DESCRIPTIONS[user.role]}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {user.lastUpdatedAt ? (
                        <div className="flex items-center gap-2 text-slate-400">
                          <History size={14} />
                          <div className="text-[10px] font-medium">
                            <p>By {user.lastUpdatedBy}</p>
                            <p>{new Date(user.lastUpdatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No History</span>
                      )}
                    </td>
                    <td className={`px-6 py-5 text-right ${idx === filteredAndSortedUsers.length - 1 ? 'rounded-br-[40px]' : ''}`}>
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                          className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900"
                        >
                          <MoreVertical size={20} />
                        </button>
                        
                        <AnimatePresence>
                          {activeDropdown === user.id && (
                            <>
                              <div className="fixed inset-0 z-[100]" onClick={() => setActiveDropdown(null)} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className={`absolute right-0 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[110] overflow-hidden ${
                                  idx >= filteredAndSortedUsers.length - 2 ? 'bottom-full mb-2' : 'mt-2'
                                }`}
                              >
                                <div className="p-2">
                                  <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign New Role</p>
                                  {(['customer', 'manager', 'admin'] as const).map(role => (
                                    <button
                                      key={role}
                                      disabled={user.role === role || updatingUserId === user.id}
                                      onClick={() => setConfirmModal({ isOpen: true, userId: user.id, newRole: role })}
                                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                                        user.role === role 
                                          ? 'bg-slate-50 text-slate-400 cursor-default' 
                                          : 'hover:bg-blue-50 text-slate-700 hover:text-blue-600'
                                      }`}
                                    >
                                      <span className="capitalize">{role}</span>
                                      {user.role === role && <Check size={14} />}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-32 text-center rounded-b-[40px]">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <Users size={64} strokeWidth={1} />
                      <div>
                        <p className="text-xl font-black text-slate-400">No Entities Found</p>
                        <p className="text-sm font-medium">Try adjusting your filters or search terms</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredAndSortedUsers.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                  <img 
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={() => toggleSelectUser(user.id)}
                className={selectedUsers.includes(user.id) ? 'text-blue-600' : 'text-slate-300'}
              >
                {selectedUsers.includes(user.id) ? <CheckSquare size={24} /> : <Square size={24} />}
              </button>
            </div>

            <div className="flex items-center justify-between py-4 border-y border-slate-50">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Role</p>
                <RoleBadge role={user.role} />
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</p>
                <p className="text-xs font-bold text-slate-600">{user.lastUpdatedAt ? new Date(user.lastUpdatedAt).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign New Role</p>
              <div className="grid grid-cols-3 gap-2">
                {(['customer', 'manager', 'admin'] as const).map(role => (
                  <button
                    key={role}
                    disabled={user.role === role || updatingUserId === user.id}
                    onClick={() => setConfirmModal({ isOpen: true, userId: user.id, newRole: role })}
                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      user.role === role
                        ? 'bg-slate-50 text-slate-400 border-slate-100'
                        : 'bg-white text-slate-600 border-slate-200 active:bg-blue-50 active:border-blue-200 active:text-blue-600'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={!!confirmModal?.isOpen}
        onClose={() => setConfirmModal(null)}
        onConfirm={() => {
          if (confirmModal?.isBulk) {
            handleBulkRoleChange(confirmModal.newRole!);
          } else if (confirmModal?.userId && confirmModal?.newRole) {
            handleRoleChange(confirmModal.userId, confirmModal.newRole);
          }
        }}
        title={confirmModal?.isBulk ? 'Confirm Bulk Role Change' : 'Confirm Role Escalation'}
        message={confirmModal?.isBulk 
          ? `Are you sure you want to update the role for ${selectedUsers.length} users to ${confirmModal.newRole}?`
          : `You are about to change this user's role to ${confirmModal?.newRole}. This will modify their system permissions immediately.`
        }
        confirmLabel="Update Role"
        type={confirmModal?.newRole === 'admin' ? 'danger' : 'warning'}
      />
    </div>
  );
};

export default RoleAssignment;
