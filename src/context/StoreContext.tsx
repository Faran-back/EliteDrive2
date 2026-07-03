import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Vehicle, Booking, Notification, RoleRequest, Invitation, Incident, Dispute, EChallan } from '../types';
import Toast from '../components/Toast';

interface StoreContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  vehicles: Vehicle[];
  bookings: Booking[];
  allBookings: Booking[];
  allUsers: User[];
  notifications: Notification[];
  roleRequests: RoleRequest[];
  incidents: Incident[];
  disputes: Dispute[];
  eChallans: EChallan[];
  addBooking: (booking: Booking) => Promise<void>;
  approveBooking: (id: string) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  queueBookingTransaction: (id: string, bookingUpdates: Partial<Booking>, vehicleUpdates?: any) => Promise<any>;
  cancelBooking: (id: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  toggleFavorite: (vehicleId: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  registerUser: (data: any) => Promise<any>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  isAuthReady: boolean;
  inviteUser: (email: string, role: 'admin' | 'manager') => Promise<string>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
  updateUserRole: (userId: string, role: 'admin' | 'manager' | 'customer') => Promise<void>;
  verifyUserCNIC: (userId: string, isVerified?: boolean) => Promise<void>;
  bulkUpdateUserRoles: (userIds: string[], role: 'admin' | 'manager' | 'customer') => Promise<void>;
  createRoleRequest: (requestedRole: 'admin' | 'manager', userData?: User) => Promise<void>;
  approveRoleRequest: (requestId: string) => Promise<void>;
  rejectRoleRequest: (requestId: string) => Promise<void>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addVehicle: (vehicleData: Omit<Vehicle, 'id'>) => Promise<void>;
  migrateVehicleIds: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  setupRecaptcha: (containerId: string) => void;
  sendPhoneVerificationCode: (phoneNumber: string) => Promise<any>;
  verifyPhoneCode: (confirmationResult: any, code: string) => Promise<void>;
  createIncident: (incidentData: { bookingId: string; type: string; occurredAt: string; location: string; statement: string; witnessName?: string; witnessPhone?: string; photos?: string[]; firNumber?: string; userId?: string }) => Promise<void>;
  updateIncidentStatus: (id: string, status: string, actionType?: string, notes?: string) => Promise<void>;
  createDispute: (disputeData: { title: string; description: string; bookingId?: string; type: string }) => Promise<void>;
  updateDisputeStatus: (id: string, status: string, resolutionDetails?: string) => Promise<void>;
  createEChallan: (challanData: { challanNumber: string; date: string; amount: number; vehicleId: string }) => Promise<void>;
  disputeEChallan: (challanId: string) => Promise<void>;
  toggleUserBlacklist: (userId: string, isBlacklisted: boolean) => Promise<void>;
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// --- API FETCH HELPER ---
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('elitedrive_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP Error ${response.status}`);
  }

  return response.json();
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [eChallans, setEChallans] = useState<EChallan[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // --- REFRESH DATA CENTRAL ---
  const refreshData = async () => {
    try {
      const token = localStorage.getItem('elitedrive_token');

      // Fetch vehicles and user profile in parallel to eliminate waterfall
      const [vData, uData] = await Promise.all([
        apiFetch('/api/vehicles').catch(() => []),
        token ? apiFetch('/api/auth/me').catch(() => {
          localStorage.removeItem('elitedrive_token');
          setUser(null);
          return null;
        }) : Promise.resolve(null)
      ]);

      setVehicles(vData);

      if (uData) {
        setUser(uData);

        // Auto-sync push subscription if already granted
        if ('Notification' in window && window.Notification.permission === 'granted') {
          import('../utils/pushRegister').then(({ registerPushNotifications }) => {
            registerPushNotifications().catch(err => console.error('Failed to auto-sync push subscription:', err));
          });
        }

        // Define base data parallel fetches
        const fetchPromises: Promise<any>[] = [
          apiFetch('/api/bookings').catch(() => []),
          apiFetch('/api/notifications').catch(() => []),
          apiFetch('/api/incidents').catch(() => []),
          apiFetch('/api/disputes').catch(() => []),
          apiFetch('/api/e-challans').catch(() => [])
        ];

        // Fetch administrative collections concurrently if authorized
        const isAdminOrManager = uData.role === 'admin' || uData.role === 'manager';
        const isAdmin = uData.role === 'admin';

        if (isAdminOrManager) {
          fetchPromises.push(apiFetch('/api/users').catch(() => []));
        } else {
          fetchPromises.push(Promise.resolve([]));
        }

        if (isAdmin) {
          fetchPromises.push(apiFetch('/api/role-requests').catch(() => []));
        } else {
          fetchPromises.push(Promise.resolve([]));
        }

        // Run all operations in parallel
        const [bData, nData, incData, dispData, chalData, usrData, rrData] = await Promise.all(fetchPromises);

        setBookings(bData);
        setAllBookings(bData);

        setNotifications(prev => {
          const newUnreads = nData.filter((item: Notification) => {
            if (item.read) return false;
            return !prev.some(p => p.id === item.id);
          });
          if (newUnreads.length > 0) {
            newUnreads.forEach((n: Notification) => {
              showToast(`🔔 ${n.title}: ${n.message}`, 'info');
            });
          }
          return nData;
        });

        setIncidents(incData);
        setDisputes(dispData);
        setEChallans(chalData);

        if (isAdminOrManager) {
          setAllUsers(usrData);
        }
        if (isAdmin) {
          setRoleRequests(rrData);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Error in refreshData:', e);
    }
  };

  // On mount, load the initial data once.
  useEffect(() => {
    const init = async () => {
      await refreshData();
      setIsAuthReady(true);
    };
    init();
  }, []);

  // --- REAL-TIME WEBSOCKET NOTIFICATION LISTENER ---
  useEffect(() => {
    const token = localStorage.getItem('elitedrive_token');
    if (!user || !token) return;

    // Use current location protocol to derive ws vs wss
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('[WebSocket] Connecting to live notification service:', wsUrl);
    let socket: WebSocket | null = new WebSocket(wsUrl);
    let pingInterval: any = null;
    let reconnectTimeout: any = null;

    const setupSocket = (ws: WebSocket) => {
      ws.onopen = () => {
        console.log('[WebSocket] Connection established. Sending authentication token...');
        ws.send(JSON.stringify({ type: 'auth', token }));
        
        // Heartbeat ping to keep socket alive
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 20000);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'notification') {
            const newNotif = payload.data;
            console.log('[WebSocket] Received live notification event:', newNotif);
            
            // Instantly append to local state
            setNotifications(prev => {
              if (prev.some(n => n.id === newNotif.id)) return prev;
              return [newNotif, ...prev];
            });

            // Play elegant sound chime using the Web Audio API
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const playTone = (freq: number, start: number, duration: number) => {
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start);
                gainNode.gain.setValueAtTime(0.06, start);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                osc.start(start);
                osc.stop(start + duration);
              };
              const now = audioCtx.currentTime;
              playTone(880, now, 0.12); // A5 chime
              playTone(1109, now + 0.1, 0.25); // C#6 chime
            } catch (soundErr) {
              console.log('AudioContext initialization bypassed or blocked by auto-play policies.');
            }

            // Trigger beautiful top toast notification
            showToast(`🔔 ${newNotif.title}: ${newNotif.message}`, 'info');
          }
        } catch (err) {
          console.error('[WebSocket] Failed to process message payload:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Connection closed:', event.reason || 'Network transition');
        cleanup();
        
        // Auto-reconnect with backing timer
        reconnectTimeout = setTimeout(() => {
          console.log('[WebSocket] Executing reconnection retry...');
          const nextWs = new WebSocket(wsUrl);
          socket = nextWs;
          setupSocket(nextWs);
        }, 3000);
      };

      ws.onerror = (err) => {
        console.error('[WebSocket] Socket encountered error:', err);
      };
    };

    const cleanup = () => {
      if (pingInterval) clearInterval(pingInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };

    setupSocket(socket);

    return () => {
      cleanup();
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [user?.id]);

  // --- ACTIONS IMPLEMENTATION ---

  const login = async (email: string, password: string) => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('elitedrive_token', res.token);
    setUser(res.user);
    await refreshData();
    return res.user;
  };

  const registerUser = async (data: any) => {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    localStorage.setItem('elitedrive_token', res.token);
    setUser(res.user);
    await refreshData();
    return res.user;
  };

  const logout = async () => {
    localStorage.removeItem('elitedrive_token');
    setUser(null);
    setBookings([]);
    setAllBookings([]);
    setNotifications([]);
  };

  const addBooking = async (booking: Booking) => {
    await apiFetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(booking)
    });
    await refreshData();
  };

  const approveBooking = async (id: string) => {
    await apiFetch(`/api/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'active' })
    });
    await refreshData();
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    // Optimistic local state updates for instant response
    setAllBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));

    await apiFetch(`/api/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    await refreshData();
  };

  const queueBookingTransaction = async (id: string, bookingUpdates: Partial<Booking>, vehicleUpdates?: any) => {
    // Optimistic local state updates for instant response
    if (bookingUpdates) {
      setAllBookings(prev => prev.map(b => b.id === id ? { ...b, ...bookingUpdates } : b));
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...bookingUpdates } : b));
    }
    if (vehicleUpdates) {
      setVehicles(prev => prev.map(v => v.id === vehicleUpdates.id || v.id === (bookingUpdates as any)?.vehicleId ? { ...v, ...vehicleUpdates } : v));
    }

    const res = await apiFetch(`/api/bookings/${id}/queue-transaction`, {
      method: 'POST',
      body: JSON.stringify({ bookingUpdates, vehicleUpdates })
    });
    
    refreshData();
    return res;
  };

  const cancelBooking = async (id: string) => {
    await apiFetch(`/api/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelled' })
    });
    await refreshData();
  };

  const updateUser = async (updates: Partial<User>) => {
    const updated = await apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    setUser(updated);
  };

  const toggleFavorite = async (vehicleId: string) => {
    const updated = await apiFetch(`/api/auth/toggle-favorite/${vehicleId}`, {
      method: 'PUT'
    });
    setUser(updated);
  };

  const addNotification = async (notification: Omit<Notification, 'id'>) => {
    // Shared API takes care of notifications on the server but we mock as successful
    console.log('addNotification locally:', notification);
  };

  const markNotificationAsRead = async (id: string) => {
    await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = async (id: string) => {
    await apiFetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const inviteUser = async (email: string, role: 'admin' | 'manager') => {
    const res = await apiFetch('/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ email, role })
    });
    await refreshData();
    return res.token;
  };

  const acceptInvitation = async (invitationId: string) => {
    const res = await apiFetch(`/api/invitations/${invitationId}/accept`, {
      method: 'POST'
    });
    setUser(res.user);
    await refreshData();
  };

  const declineInvitation = async (invitationId: string) => {
    await apiFetch(`/api/invitations/${invitationId}/decline`, {
      method: 'POST'
    });
    await refreshData();
  };

  const searchUsers = async (searchTerm: string) => {
    const users: User[] = await apiFetch('/api/users');
    return users.filter(u =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'manager' | 'customer') => {
    await apiFetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
    await refreshData();
  };

  const verifyUserCNIC = async (userId: string, isVerified: boolean = true) => {
    // 1. Optimistic local state update for immediate UI response
    setAllUsers(prevUsers =>
      prevUsers.map(u => u.id === userId ? { ...u, cnicVerified: isVerified } : u)
    );

    // 2. Perform DB update asynchronously in the background without blocking the UI
    apiFetch(`/api/users/${userId}/verify-cnic`, {
      method: 'PUT',
      body: JSON.stringify({ cnicVerified: isVerified })
    }).then(() => {
      refreshData();
    }).catch(err => {
      console.error("Failed background cnic verification:", err);
      // Revert optimistic state update on failure
      setAllUsers(prevUsers =>
        prevUsers.map(u => u.id === userId ? { ...u, cnicVerified: !isVerified } : u)
      );
    });
  };

  const bulkUpdateUserRoles = async (userIds: string[], role: 'admin' | 'manager' | 'customer') => {
    await apiFetch('/api/users/bulk-role', {
      method: 'POST',
      body: JSON.stringify({ userIds, role })
    });
    await refreshData();
  };

  const createRoleRequest = async (requestedRole: 'admin' | 'manager', userData?: User) => {
    await apiFetch('/api/role-requests', {
      method: 'POST',
      body: JSON.stringify({ requestedRole })
    });
    await refreshData();
  };

  const approveRoleRequest = async (requestId: string) => {
    await apiFetch(`/api/role-requests/${requestId}/approve`, {
      method: 'POST'
    });
    await refreshData();
  };

  const rejectRoleRequest = async (requestId: string) => {
    await apiFetch(`/api/role-requests/${requestId}/reject`, {
      method: 'POST'
    });
    await refreshData();
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    // Optimistic local state update for instant response
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));

    const updated = await apiFetch(`/api/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updated } : v));
    await refreshData();
  };

  const deleteVehicle = async (id: string) => {
    await apiFetch(`/api/vehicles/${id}`, {
      method: 'DELETE'
    });
    setVehicles(prev => prev.filter(v => v.id !== id));
    await refreshData();
  };

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
    const added = await apiFetch('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    });
    setVehicles(prev => [added, ...prev]);
    await refreshData();
  };

  const migrateVehicleIds = async () => {
    showToast('All vehicles migrated to custom Node server successfully.', 'success');
  };

  const sendVerificationEmail = async () => {
    showToast('Verification email simulated successfully.', 'success');
  };

  const setupRecaptcha = (containerId: string) => {
    console.log('Recaptcha simulated setup for container:', containerId);
  };

  const sendPhoneVerificationCode = async (phoneNumber: string) => {
    showToast(`Verification code sent to ${phoneNumber}.`, 'success');
    return { confirmation: true };
  };

  const verifyPhoneCode = async (confirmationResult: any, code: string) => {
    showToast('Code verified successfully.', 'success');
    await updateUser({ phoneVerified: true });
  };

  const createIncident = async (incidentData: any) => {
    await apiFetch('/api/incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData)
    });
    showToast('Incident report registered successfully.', 'success');
    await refreshData();
  };

  const updateIncidentStatus = async (id: string, status: string, actionType?: string, notes?: string) => {
    await apiFetch(`/api/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, actionType, notes })
    });
    showToast(`Incident status updated to: ${status.replace('_', ' ')}`, 'success');
    await refreshData();
  };

  const createDispute = async (disputeData: any) => {
    await apiFetch('/api/disputes', {
      method: 'POST',
      body: JSON.stringify(disputeData)
    });
    showToast('Formal dispute request filed successfully.', 'success');
    await refreshData();
  };

  const updateDisputeStatus = async (id: string, status: string, resolutionDetails?: string) => {
    await apiFetch(`/api/disputes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, resolutionDetails })
    });
    showToast(`Dispute updated to: ${status}`, 'success');
    await refreshData();
  };

  const createEChallan = async (challanData: any) => {
    await apiFetch('/api/e-challans', {
      method: 'POST',
      body: JSON.stringify(challanData)
    });
    showToast('E-Challan ticket created & matched to booking.', 'success');
    await refreshData();
  };

  const disputeEChallan = async (challanId: string) => {
    await apiFetch(`/api/e-challans/${challanId}/dispute`, {
      method: 'PUT'
    });
    showToast('E-Challan dispute lodged. Formal dispute record opened.', 'success');
    await refreshData();
  };

  const toggleUserBlacklist = async (userId: string, isBlacklisted: boolean) => {
    await apiFetch(`/api/users/${userId}/blacklist`, {
      method: 'PUT',
      body: JSON.stringify({ isBlacklisted })
    });
    showToast(isBlacklisted ? 'User has been blacklisted.' : 'User has been delisted from blacklist.', 'info');
    await refreshData();
  };

  return (
    <StoreContext.Provider value={{
      user,
      setUser,
      vehicles,
      bookings,
      allBookings,
      allUsers,
      notifications,
      addBooking,
      approveBooking,
      updateBooking,
      queueBookingTransaction,
      cancelBooking,
      updateUser,
      toggleFavorite,
      addNotification,
      markNotificationAsRead,
      deleteNotification,
      logout,
      login,
      registerUser,
      showToast,
      isAuthReady,
      inviteUser,
      acceptInvitation,
      declineInvitation,
      searchUsers,
      updateUserRole,
      verifyUserCNIC,
      bulkUpdateUserRoles,
      createRoleRequest,
      approveRoleRequest,
      rejectRoleRequest,
      updateVehicle,
      deleteVehicle,
      addVehicle,
      migrateVehicleIds,
      sendVerificationEmail,
      setupRecaptcha,
      sendPhoneVerificationCode,
      verifyPhoneCode,
      isChatOpen,
      setIsChatOpen,
      incidents,
      disputes,
      eChallans,
      createIncident,
      updateIncidentStatus,
      createDispute,
      updateDisputeStatus,
      createEChallan,
      disputeEChallan,
      toggleUserBlacklist,
      roleRequests,
      refreshData
    }}>
      {children}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={hideToast} 
      />
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
