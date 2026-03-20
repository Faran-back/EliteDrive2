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
  User,
  Heart
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

import NotificationDropdown from './NotificationDropdown';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/customer-dashboard' },
    { icon: Compass, label: 'Explore Fleet', path: '/fleet' },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
    { icon: History, label: 'My Bookings', path: '/my-bookings' },
  ];

  const adminNavItems = [
    { icon: LayoutDashboard, label: 'Admin Panel', path: '/admin-dashboard' },
  ];

  const managerNavItems = [
    { icon: LayoutDashboard, label: 'Manager Panel', path: '/manager-dashboard' },
  ];

  if (location.pathname === '/auth') return <>{children}</>;

  const currentNavItems = [
    ...navItems,
    ...(user?.role === 'admin' ? adminNavItems : []),
    ...(user?.role === 'admin' || user?.role === 'manager' ? managerNavItems : []),
  ];

  return (
    <div className="min-h-screen bg-[#f6f6f8] flex flex-col font-display">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-full mx-auto px-10 md:px-20">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="text-[#2463eb] flex items-center">
                <Car size={30} strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">EliteDrive</h1>
            </div>

            {/* Global Navigation Framework */}
            <nav className="hidden md:flex items-center gap-1">
              {currentNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    location.pathname === item.path 
                      ? 'text-[#2463eb] bg-[#2463eb]/10 font-semibold' 
                      : 'text-slate-600 hover:text-[#2463eb] hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={18} className={location.pathname === item.path ? 'fill-[#2463eb]/10' : ''} />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <NotificationDropdown />
              
              <Link 
                to="/profile"
                className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden border border-slate-300 cursor-pointer hover:ring-2 hover:ring-[#2463eb]/20 transition-all"
              >
                <img 
                  src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </Link>

              <button 
                onClick={async () => {
                  await logout();
                  navigate('/auth');
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                title="Sign Out"
              >
                <LogOut size={18} />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-full mx-auto px-10 md:px-20 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
