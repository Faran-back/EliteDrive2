import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Layout from './components/Layout';

// Pages
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import VehicleDetails from './pages/VehicleDetails';
import RulesPolicies from './pages/RulesPolicies';
import PenaltyCharges from './pages/PenaltyCharges';
import ReportIncident from './pages/ReportIncident';
import Payment from './pages/Payment';
import BookingConfirmed from './pages/BookingConfirmed';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EditVehicle from './pages/EditVehicle';
import AddVehicle from './pages/AddVehicle';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, isAuthReady } = useStore();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    const currentQuery = typeof window !== 'undefined' ? window.location.search : '';
    return <Navigate to={`/auth${currentQuery}`} />;
  }

  if (user.isBlacklisted || (user as any).isBlackListed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center text-white font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-black uppercase tracking-wider text-rose-500 mb-3">ACCESS DENIED</h1>
          <h2 className="text-md font-bold text-slate-200 mb-4">You are blacklisted by EliteDrive</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-8">
            Your account has been restricted due to terms of service violations, active damage disputes, or outstanding payment irregularities.
          </p>
          <div className="border-t border-slate-800 pt-6">
            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Contact Administration</p>
            <p className="text-[10px] text-slate-400">Please reach out to the support line or visit the corporate office to resolve pending outstanding balances.</p>
          </div>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" />;
    if (user.role === 'manager') return <Navigate to="/manager-dashboard" />;
    return <Navigate to="/customer-dashboard" />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user } = useStore();
  
  if (!user) return <Navigate to="/auth" />;
  
  if (user.role === 'admin') {
    return <Navigate to="/admin-dashboard" />;
  }
  
  if (user.role === 'manager') {
    return <Navigate to="/manager-dashboard" />;
  }
  
  return <Navigate to="/customer-dashboard" />;
};

const AppContent: React.FC = () => {
  const { isAuthReady } = useStore();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Navigate to="/auth" />} />
        <Route path="/signup" element={<Navigate to="/auth" />} />
        <Route path="/" element={<Layout><Landing /></Layout>} />
        <Route path="/customer-dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/dashboard" element={<Navigate to="/customer-dashboard" />} />
        <Route path="/fleet" element={<Layout><Fleet /></Layout>} />
        <Route path="/rules-policies" element={<ProtectedRoute><Layout><RulesPolicies /></Layout></ProtectedRoute>} />
        <Route path="/penalty-charges" element={<ProtectedRoute><Layout><PenaltyCharges /></Layout></ProtectedRoute>} />
        <Route path="/report-incident" element={<ProtectedRoute><Layout><ReportIncident /></Layout></ProtectedRoute>} />
        <Route path="/vehicle/:id" element={<Layout><VehicleDetails /></Layout>} />
        <Route path="/payment/:id" element={<ProtectedRoute><Layout><Payment /></Layout></ProtectedRoute>} />
        <Route path="/booking-confirmed" element={<ProtectedRoute><Layout><BookingConfirmed /></Layout></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><Layout><MyBookings /></Layout></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Layout><Favorites /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/manager-dashboard" element={<ProtectedRoute allowedRoles={['manager']}><Layout><ManagerDashboard /></Layout></ProtectedRoute>} />
        <Route path="/edit-vehicle/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Layout><EditVehicle /></Layout></ProtectedRoute>} />
        <Route path="/add-vehicle" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Layout><AddVehicle /></Layout></ProtectedRoute>} />
        <Route path="/admin" element={<Navigate to="/admin-dashboard" />} />
        <Route path="/manager" element={<Navigate to="/manager-dashboard" />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;
