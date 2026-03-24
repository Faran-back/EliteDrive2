import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Layout from './components/Layout';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import VehicleDetails from './pages/VehicleDetails';
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
    return <Navigate to="/auth" />;
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
        <Route path="/" element={<ProtectedRoute><Layout><RootRedirect /></Layout></ProtectedRoute>} />
        <Route path="/customer-dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/dashboard" element={<Navigate to="/customer-dashboard" />} />
        <Route path="/fleet" element={<ProtectedRoute><Layout><Fleet /></Layout></ProtectedRoute>} />
        <Route path="/vehicle/:id" element={<ProtectedRoute><Layout><VehicleDetails /></Layout></ProtectedRoute>} />
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
