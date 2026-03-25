import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Vehicle, Booking, Notification, INITIAL_VEHICLES, Invitation, RoleRequest } from '../types';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, sendEmailVerification, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import Toast from '../components/Toast';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  getDocs,
  getDoc,
  deleteDoc
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function safeStringify(obj: any): string {
  const cache = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular]';
      }
      cache.add(value);
      
      // Handle objects with toJSON that might cause issues if they return circularity
      // or if they are complex Firebase objects.
      if (value.constructor && (value.constructor.name === 'Y2' || value.constructor.name === 'Ka')) {
        return `[FirebaseObject: ${value.constructor.name}]`;
      }
    }
    return value;
  });
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isPermissionError = errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('insufficient');
  
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  const stringifiedInfo = safeStringify(errInfo);
  console.error('Firestore Error: ', stringifiedInfo);

  // Return a user-friendly message for the UI
  if (isPermissionError) {
    throw new Error('Access denied. You do not have permission to perform this action. Please contact support if you believe this is an error.');
  } else if (errorMessage.toLowerCase().includes('offline') || errorMessage.toLowerCase().includes('network')) {
    throw new Error('Connection lost. Please check your internet connection and try again.');
  }
  
  throw new Error('An unexpected database error occurred. Please try again later.');
}

interface StoreContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  vehicles: Vehicle[];
  bookings: Booking[];
  allBookings: Booking[];
  allUsers: User[];
  notifications: Notification[];
  roleRequests: RoleRequest[];
  addBooking: (booking: Booking) => Promise<void>;
  approveBooking: (id: string) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  toggleFavorite: (vehicleId: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  logout: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  isAuthReady: boolean;
  inviteUser: (email: string, role: 'admin' | 'manager') => Promise<string>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
  updateUserRole: (userId: string, role: 'admin' | 'manager' | 'customer') => Promise<void>;
  bulkUpdateUserRoles: (userIds: string[], role: 'admin' | 'manager' | 'customer') => Promise<void>;
  createRoleRequest: (requestedRole: 'admin' | 'manager', userData?: User) => Promise<void>;
  approveRoleRequest: (requestId: string) => Promise<void>;
  rejectRoleRequest: (requestId: string) => Promise<void>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addVehicle: (vehicle: Vehicle) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  setupRecaptcha: (containerId: string) => void;
  sendPhoneVerificationCode: (phoneNumber: string) => Promise<ConfirmationResult>;
  verifyPhoneCode: (confirmationResult: ConfirmationResult, code: string) => Promise<void>;
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUser(userDoc.data() as User);
            } else {
              // Create a new user profile if it doesn't exist
              const newUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'New User',
                email: firebaseUser.email || '',
                phone: firebaseUser.phoneNumber || '',
                role: firebaseUser.email === 'test@test.com' || firebaseUser.email === 'inotfarhan@gmail.com' || firebaseUser.email === 'testingdaflow@test.com' ? 'admin' : 'customer',
                rewardPoints: 0,
                avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
                emailVerified: firebaseUser.emailVerified,
                createdAt: new Date().toISOString()
              };

              // Check if there's an invitation for this email
              if (firebaseUser.email) {
                const invitationsQuery = query(
                  collection(db, 'invitations'),
                  where('email', '==', firebaseUser.email),
                  where('status', '==', 'pending')
                );
                const invitationDocs = await getDocs(invitationsQuery);
                if (!invitationDocs.empty) {
                  const invitation = invitationDocs.docs[0].data() as Invitation;
                  newUser.pendingInvitation = {
                    role: invitation.role,
                    invitedBy: invitation.invitedBy,
                    invitedAt: invitation.createdAt,
                    invitationId: invitation.id
                  };
                }
              }

              await setDoc(userDocRef, newUser);
              setUser(newUser);
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) {
      setBookings([]);
      return;
    }

    const bookingsQuery = query(collection(db, 'bookings'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(bookingsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  useEffect(() => {
    if (!isAuthReady || !user || (user.role !== 'admin' && user.role !== 'manager')) {
      setAllBookings([]);
      return;
    }

    const allBookingsQuery = query(collection(db, 'bookings'));
    const unsubscribe = onSnapshot(allBookingsQuery, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setAllBookings(bookingsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  useEffect(() => {
    if (!isAuthReady || !user || (user.role !== 'admin' && user.role !== 'manager')) {
      setAllUsers([]);
      return;
    }

    const allUsersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(allUsersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setAllUsers(usersData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  useEffect(() => {
    if (!isAuthReady || !user || user.role !== 'admin') {
      setRoleRequests([]);
      return;
    }

    const roleRequestsQuery = query(collection(db, 'roleRequests'));
    const unsubscribe = onSnapshot(roleRequestsQuery, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoleRequest));
      // Sort by createdAt descending
      requestsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRoleRequests(requestsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'roleRequests');
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  useEffect(() => {
    if (!isAuthReady || !user) {
      setNotifications([]);
      return;
    }

    const notificationsQuery = query(
      collection(db, 'notifications'), 
      where('userId', '==', user.id)
    );
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      // Sort by createdAt descending
      notificationsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(notificationsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
      if (snapshot.empty) {
        // If vehicles collection is empty, seed it with INITIAL_VEHICLES
        // ONLY if the user is an admin
        if (user?.role === 'admin' || user?.email === 'inotfarhan@gmail.com') {
          INITIAL_VEHICLES.forEach(async (vehicle) => {
            try {
              await setDoc(doc(db, 'vehicles', vehicle.id), vehicle);
            } catch (error) {
              console.error('Error seeding vehicle:', error);
            }
          });
        }
        setVehicles(INITIAL_VEHICLES);
      } else {
        const vehiclesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
        setVehicles(vehiclesData);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'vehicles');
    });

    return () => unsubscribe();
  }, [user]);

  const addBooking = async (booking: Booking) => {
    try {
      await setDoc(doc(db, 'bookings', booking.id), booking);
      
      // Add notification for booking confirmation (pending approval)
      const vehicle = vehicles.find(v => v.id === booking.vehicleId);
      await addNotification({
        userId: booking.userId,
        title: 'Booking Received',
        message: `Your booking for ${vehicle?.name || 'a vehicle'} has been received and is pending manager approval.`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/my-bookings'
      });

      // Notify all managers and admins
      const managersAndAdmins = allUsers.filter(u => u.role === 'admin' || u.role === 'manager');
      for (const staff of managersAndAdmins) {
        await addNotification({
          userId: staff.id,
          title: 'New Booking Approval Required',
          message: `A new booking for ${vehicle?.name || 'a vehicle'} requires your approval.`,
          type: 'booking_confirmed',
          read: false,
          createdAt: new Date().toISOString(),
          link: staff.role === 'admin' ? '/admin-dashboard?view=bookings' : '/manager-dashboard?view=bookings'
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `bookings/${booking.id}`);
    }
  };

  const approveBooking = async (id: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'active' });
      
      const booking = allBookings.find(b => b.id === id);
      if (booking) {
        const vehicle = vehicles.find(v => v.id === booking.vehicleId);
        await addNotification({
          userId: booking.userId,
          title: 'Booking Approved!',
          message: `Your booking for ${vehicle?.name || 'a vehicle'} has been approved and is now active.`,
          type: 'booking_confirmed',
          read: false,
          createdAt: new Date().toISOString(),
          link: '/my-bookings'
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      await updateDoc(doc(db, 'bookings', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'cancelled' });
      
      const booking = allBookings.find(b => b.id === id);
      if (booking) {
        const vehicle = vehicles.find(v => v.id === booking.vehicleId);
        await addNotification({
          userId: booking.userId,
          title: 'Booking Cancelled',
          message: `Your booking for ${vehicle?.name || 'a vehicle'} has been cancelled.`,
          type: 'booking_cancelled',
          read: false,
          createdAt: new Date().toISOString(),
          link: '/my-bookings'
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    try {
      await setDoc(doc(db, 'notifications', id), { ...notification, id });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `notifications/${id}`);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notifications/${id}`);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.id), updates);
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  const toggleFavorite = async (vehicleId: string) => {
    if (!user) return;
    const currentFavorites = user.favorites || [];
    const newFavorites = currentFavorites.includes(vehicleId)
      ? currentFavorites.filter(id => id !== vehicleId)
      : [...currentFavorites, vehicleId];
    
    try {
      await updateDoc(doc(db, 'users', user.id), { favorites: newFavorites });
      setUser(prev => prev ? { ...prev, favorites: newFavorites } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const inviteUser = async (email: string, role: 'admin' | 'manager') => {
    if (!user) throw new Error('Not authenticated');
    const invitationId = Math.random().toString(36).substr(2, 9);
    const token = Math.random().toString(36).substr(2, 15);
    
    const invitation: Invitation = {
      id: invitationId,
      email,
      role,
      invitedBy: user.name || user.email,
      status: 'pending',
      createdAt: new Date().toISOString(),
      token
    };

    try {
      await setDoc(doc(db, 'invitations', invitationId), invitation);
      
      // Check if user already exists to add notification
      const usersQuery = query(collection(db, 'users'), where('email', '==', email));
      const userDocs = await getDocs(usersQuery);
      
      if (!userDocs.empty) {
        const targetUserId = userDocs.docs[0].id;
        await addNotification({
          userId: targetUserId,
          title: 'Role Invitation',
          message: `${user.name} has invited you to become an ${role}.`,
          type: 'invitation',
          read: false,
          createdAt: new Date().toISOString(),
          invitationId
        });
        
        // Also update the user's pendingInvitation field
        await updateDoc(doc(db, 'users', targetUserId), {
          pendingInvitation: {
            role,
            invitedBy: user.name || user.email,
            invitedAt: invitation.createdAt,
            invitationId
          }
        });
      }

      return token;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `invitations/${invitationId}`);
      throw error;
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    if (!user) return;
    try {
      const invitationDoc = await getDoc(doc(db, 'invitations', invitationId));
      if (!invitationDoc.exists()) throw new Error('Invitation not found');
      
      const invitation = invitationDoc.data() as Invitation;
      
      await updateDoc(doc(db, 'users', user.id), {
        role: invitation.role,
        pendingInvitation: null
      });
      
      await updateDoc(doc(db, 'invitations', invitationId), {
        status: 'accepted'
      });
      
      setUser(prev => prev ? { ...prev, role: invitation.role, pendingInvitation: undefined } : null);
      showToast(`You are now an ${invitation.role}!`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `invitations/${invitationId}`);
    }
  };

  const declineInvitation = async (invitationId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.id), {
        pendingInvitation: null
      });
      
      await updateDoc(doc(db, 'invitations', invitationId), {
        status: 'declined'
      });
      
      setUser(prev => prev ? { ...prev, pendingInvitation: undefined } : null);
      showToast('Invitation declined', 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `invitations/${invitationId}`);
    }
  };

  const searchUsers = async (searchTerm: string) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const snapshot = await getDocs(q);
      const allUsers = snapshot.docs.map(doc => doc.data() as User);
      
      return allUsers.filter(u => 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return [];
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'manager' | 'customer') => {
    try {
      const updates = { 
        role,
        lastUpdatedBy: user?.name || user?.email || 'System',
        lastUpdatedAt: new Date().toISOString()
      };
      await updateDoc(doc(db, 'users', userId), updates);
      showToast(`Role updated to ${role} successfully`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const bulkUpdateUserRoles = async (userIds: string[], role: 'admin' | 'manager' | 'customer') => {
    try {
      const updates = { 
        role,
        lastUpdatedBy: user?.name || user?.email || 'System',
        lastUpdatedAt: new Date().toISOString()
      };
      const promises = userIds.map(id => updateDoc(doc(db, 'users', id), updates));
      await Promise.all(promises);
      showToast(`Roles updated for ${userIds.length} users`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users/bulk');
    }
  };

  const createRoleRequest = async (requestedRole: 'admin' | 'manager', userData?: User) => {
    const currentUser = userData || user;
    if (!currentUser) return;
    const id = Math.random().toString(36).substr(2, 9);
    const request: RoleRequest = {
      id,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      requestedRole,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'roleRequests', id), request);
      showToast(`Request for ${requestedRole} role submitted!`, 'success');
      
      // Notify admins
      const admins = allUsers.filter(u => u.role === 'admin');
      for (const admin of admins) {
        await addNotification({
          userId: admin.id,
          title: 'New Role Request',
          message: `${currentUser.name} is requesting to become an ${requestedRole}.`,
          type: 'info',
          read: false,
          createdAt: new Date().toISOString(),
          link: '/admin-dashboard?view=role-requests'
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `roleRequests/${id}`);
    }
  };

  const approveRoleRequest = async (requestId: string) => {
    if (!user || user.role !== 'admin') return;
    try {
      const requestDoc = await getDoc(doc(db, 'roleRequests', requestId));
      if (!requestDoc.exists()) return;
      const request = requestDoc.data() as RoleRequest;

      // Update user role
      await updateDoc(doc(db, 'users', request.userId), { role: request.requestedRole });
      
      // Update request status
      await updateDoc(doc(db, 'roleRequests', requestId), {
        status: 'approved',
        processedBy: user.name || user.email,
        processedAt: new Date().toISOString()
      });

      // Notify user
      await addNotification({
        userId: request.userId,
        title: 'Role Request Approved!',
        message: `Your request for the ${request.requestedRole} role has been approved.`,
        type: 'role_request_approved',
        read: false,
        createdAt: new Date().toISOString()
      });

      showToast(`Approved ${request.userName} as ${request.requestedRole}`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `roleRequests/${requestId}`);
    }
  };

  const rejectRoleRequest = async (requestId: string) => {
    if (!user || user.role !== 'admin') return;
    try {
      const requestDoc = await getDoc(doc(db, 'roleRequests', requestId));
      if (!requestDoc.exists()) return;
      const request = requestDoc.data() as RoleRequest;

      // Update request status
      await updateDoc(doc(db, 'roleRequests', requestId), {
        status: 'rejected',
        processedBy: user.name || user.email,
        processedAt: new Date().toISOString()
      });

      // Notify user
      await addNotification({
        userId: request.userId,
        title: 'Role Request Rejected',
        message: `Your request for the ${request.requestedRole} role has been rejected.`,
        type: 'role_request_rejected',
        read: false,
        createdAt: new Date().toISOString()
      });

      showToast(`Rejected ${request.userName}'s request`, 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `roleRequests/${requestId}`);
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    try {
      await updateDoc(doc(db, 'vehicles', id), updates);
      showToast('Vehicle updated successfully', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `vehicles/${id}`);
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'vehicles', id));
      showToast('Vehicle deleted successfully', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `vehicles/${id}`);
    }
  };

  const addVehicle = async (vehicle: Vehicle) => {
    try {
      await setDoc(doc(db, 'vehicles', vehicle.id), vehicle);
      showToast('Vehicle added successfully', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `vehicles/${vehicle.id}`);
    }
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      await sendEmailVerification(auth.currentUser);
      showToast('Verification email sent! Please check your inbox.', 'success');
    } catch (error) {
      console.error('Email verification error:', error);
      showToast('Failed to send verification email. Please try again later.', 'error');
    }
  };

  const setupRecaptcha = (containerId: string) => {
    if (recaptchaVerifier) return;
    try {
      const verifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          console.log('Recaptcha verified');
        }
      });
      setRecaptchaVerifier(verifier);
    } catch (error) {
      console.error('Recaptcha setup error:', error);
    }
  };

  const sendPhoneVerificationCode = async (phoneNumber: string) => {
    if (!recaptchaVerifier) throw new Error('Recaptcha not initialized');
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      showToast('Verification code sent to your phone.', 'success');
      return confirmationResult;
    } catch (error: any) {
      console.error('Phone verification error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        showToast('Phone authentication is not enabled in Firebase. Please enable it in the Firebase Console.', 'error');
      } else {
        showToast('Failed to send verification code. Please check the number and try again.', 'error');
      }
      throw error;
    }
  };

  const verifyPhoneCode = async (confirmationResult: ConfirmationResult, code: string) => {
    try {
      await confirmationResult.confirm(code);
      if (user) {
        await updateDoc(doc(db, 'users', user.id), { phoneVerified: true });
        setUser(prev => prev ? { ...prev, phoneVerified: true } : null);
      }
      showToast('Phone number verified successfully!', 'success');
    } catch (error: any) {
      console.error('Code verification error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        showToast('Phone authentication is not enabled in Firebase. Please enable it in the Firebase Console.', 'error');
      } else {
        showToast('Invalid verification code. Please try again.', 'error');
      }
      throw error;
    }
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
      cancelBooking,
      updateUser,
      toggleFavorite,
      addNotification,
      markNotificationAsRead,
      deleteNotification,
      logout,
      showToast,
      isAuthReady,
      inviteUser,
      acceptInvitation,
      declineInvitation,
      searchUsers,
      updateUserRole,
      bulkUpdateUserRoles,
      createRoleRequest,
      approveRoleRequest,
      rejectRoleRequest,
      updateVehicle,
      deleteVehicle,
      addVehicle,
      sendVerificationEmail,
      setupRecaptcha,
      sendPhoneVerificationCode,
      verifyPhoneCode,
      isChatOpen,
      setIsChatOpen,
      roleRequests
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
