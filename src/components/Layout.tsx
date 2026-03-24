import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  History, 
  Compass,
  MapPin,
  HelpCircle,
  Bell,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Heart,
  ShieldCheck,
  Settings,
  Users,
  BarChart3,
  FileText,
  Search
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

import NotificationDropdown from './NotificationDropdown';
import SupportChatWidget from './SupportChatWidget';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, acceptInvitation, declineInvitation, notifications, markNotificationAsRead, allBookings } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isVerticalNav = user?.role === 'admin' || user?.role === 'manager';

  const pendingBookingsCount = allBookings.filter(b => b.status === 'pending').length;

  if (location.pathname === '/auth') return <>{children}</>;

  const customerNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/customer-dashboard' },
    { icon: Compass, label: 'Explore Fleet', path: '/fleet' },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
    { icon: History, label: 'My Bookings', path: '/my-bookings' },
  ];

  const adminNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin-dashboard' },
    { icon: Car, label: 'Fleet Inventory', path: '/fleet' },
    { icon: History, label: 'Bookings', path: '/admin-dashboard?view=bookings', badge: pendingBookingsCount },
    { icon: Users, label: 'Assign Roles', path: '/admin-dashboard?view=role-assignment' },
    { icon: FileText, label: 'Reports', path: '/admin-dashboard?view=reports' },
  ];

  const managerNavItems = [
    { icon: BarChart3, label: 'Overview', path: '/manager-dashboard' },
    { icon: Car, label: 'Fleet Inventory', path: '/fleet' },
    { icon: History, label: 'Bookings', path: '/manager-dashboard?view=bookings', badge: pendingBookingsCount },
    { icon: FileText, label: 'Reports', path: '/manager-dashboard?view=reports' },
  ];

  const managementNavItems = [
    { icon: Users, label: 'Customers', path: (user?.role === 'admin' ? '/admin-dashboard' : '/manager-dashboard') + '?view=customers' },
    { icon: BarChart3, label: 'Performance', path: (user?.role === 'admin' ? '/admin-dashboard' : '/manager-dashboard') + '?view=performance' },
  ];

  const settingsNavItems = [
    { icon: Settings, label: 'System Config', path: (user?.role === 'admin' ? '/admin-dashboard' : '/manager-dashboard') + '?view=system-config' },
    { icon: HelpCircle, label: 'Support Center', path: (user?.role === 'admin' ? '/admin-dashboard' : '/manager-dashboard') + '?view=support-center' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const NavLink = ({ item, horizontal = false }: { item: any, horizontal?: boolean, key?: string }) => {
    const currentPath = location.pathname + location.search;
    const isActive = currentPath === item.path;
    
    if (horizontal) {
      return (
        <Link
          to={item.path}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            isActive 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
              : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
          {item.label}
        </Link>
      );
    }

    return (
      <Link
        to={item.path}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium text-sm transition-all ${
          isActive 
            ? 'bg-blue-600/10 text-blue-600' 
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          {item.label}
        </div>
        {item.badge > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className={`min-h-screen bg-[#f6f6f8] font-display overflow-hidden ${isVerticalNav ? 'flex' : 'flex-col'}`}>
      <AnimatePresence>
        {user?.pendingInvitation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-slate-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-600/20">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Role Invitation</h2>
                <p className="text-slate-500 mb-8 leading-relaxed font-medium text-lg">
                  <span className="text-slate-900 font-bold">{user.pendingInvitation.invitedBy}</span> has invited you to become an <span className="text-blue-600 font-black uppercase tracking-wider">{user.pendingInvitation.role}</span>.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => acceptInvitation(user.pendingInvitation!.invitationId)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => declineInvitation(user.pendingInvitation!.invitationId)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all active:scale-[0.98]"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Toggle for Vertical Nav */}
      {isVerticalNav && (
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-[60] size-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Sidebar Navigation (Vertical) */}
      {isVerticalNav && (
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6 flex items-center gap-2">
            <div className="text-blue-600 flex items-center">
              <Car size={32} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col -gap-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">EliteDrive</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {user?.role === 'admin' ? 'Admin Panel' : 'Manager Panel'}
              </p>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2 custom-scrollbar">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>
            {user?.role === 'admin' && adminNavItems.map(item => <NavLink key={item.path} item={item} />)}
            {user?.role === 'manager' && managerNavItems.map(item => <NavLink key={item.path} item={item} />)}
            
            <div className="pt-4">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Management</p>
              {managementNavItems.map(item => <NavLink key={item.path} item={item} />)}
            </div>

            <div className="pt-4">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Settings</p>
              {settingsNavItems.map(item => <NavLink key={item.path} item={item} />)}
            </div>
          </nav>

          <div className="p-4 border-t border-slate-200">
            <Link to="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-100 group-hover:border-blue-600/20 transition-all">
                <img 
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">{user?.name || 'Ahmed Khan'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'ahmed@elitedrive.pk'}</p>
              </div>
            </Link>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col h-screen overflow-hidden relative ${!isVerticalNav ? 'w-full' : ''}`}>
        {/* Top Bar / Horizontal Nav */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-40 sticky top-0">
          <div className="flex items-center gap-8 flex-1">
            {/* Logo for Horizontal Nav */}
            {!isVerticalNav && (
              <Link to="/customer-dashboard" className="flex items-center gap-3">
                <div className="size-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <Car size={24} strokeWidth={2.5} />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 hidden sm:block">EliteDrive</h1>
              </Link>
            )}

            {/* Title for Admin/Manager */}
            {isVerticalNav && (
              <h2 className="text-lg font-semibold text-slate-900">
                {user?.role === 'admin' ? 'Admin Dashboard' : 'Manager Dashboard'}
              </h2>
            )}

            {/* Horizontal Navigation Links (Customer only) */}
            {!isVerticalNav && (
              <nav className="hidden lg:flex items-center gap-1">
                {customerNavItems.map(item => <NavLink key={item.path} item={item} horizontal />)}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search data..." 
                className="w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <NotificationDropdown />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-rose-600 font-bold text-sm hover:bg-rose-50 rounded-xl transition-all"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {/* Profile for Customer */}
            {!isVerticalNav && (
              <>
                <Link to="/profile" className="flex items-center gap-3 group">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors">{user?.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{user?.role}</p>
                  </div>
                  <div className="size-10 rounded-xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 group-hover:ring-blue-600/20 transition-all">
                    <img 
                      src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Mobile Navigation Dropdown (Customer only) */}
        {!isVerticalNav && (
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-200 z-30 p-6 shadow-xl"
              >
                <div className="space-y-2">
                  {customerNavItems.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-4 rounded-2xl font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
                    >
                      <item.icon size={20} />
                      {item.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-slate-100">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl text-rose-600 font-bold hover:bg-rose-50 transition-all"
                    >
                      <LogOut size={20} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 lg:p-12 max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>

        {/* Global Support Chat Widget */}
        <SupportChatWidget />
      </main>
    </div>
  );
};

export default Layout;
