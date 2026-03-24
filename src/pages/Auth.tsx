import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Car, AlertCircle, Mail, Lock, User as UserIcon, ArrowRight, Github, Chrome } from 'lucide-react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { getAuthErrorMessage } from '../utils/authErrors';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, signupSchema, LoginFormData, SignupFormData } from '../schemas/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { User } from '../types';

type AuthMode = 'signin' | 'signup';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, setUser } = useStore();
  const [invitationToken, setInvitationToken] = useState<string | null>(null);

  // Sync mode with URL if needed, or just default to signin
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('invitation');
    if (token) {
      setInvitationToken(token);
      setMode('signup');
    }

    if (location.pathname === '/signup') {
      setMode('signup');
    } else if (location.pathname === '/signin' || location.pathname === '/auth') {
      setMode('signin');
    }
  }, [location.pathname, location.search]);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors },
    reset: resetSignup,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const handleRedirect = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'manager':
        navigate('/manager-dashboard');
        break;
      default:
        navigate('/customer-dashboard');
        break;
    }
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);
    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      } catch (err: any) {
        // Special case for default admin: if login fails because user doesn't exist, try to create it
        if ((data.email === 'test@test.com' || data.email === 'testingdaflow@test.com') && data.password === 'password' && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
          userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
          await updateProfile(userCredential.user, { displayName: 'Super Admin' });
        } else {
          throw err;
        }
      }

      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);
        handleRedirect(userData.role);
      } else {
        // If doc doesn't exist (e.g. just created default admin), it will be created by StoreContext's onAuthStateChanged
        // But we can also create it here to be safe and redirect immediately
        const role = (data.email === 'test@test.com' || data.email === 'testingdaflow@test.com') ? 'admin' : 'customer';
        const newUser: User = {
          id: userCredential.user.uid,
          name: userCredential.user.displayName || 'Super Admin',
          email: userCredential.user.email || '',
          phone: '',
          role,
          rewardPoints: 0,
          avatar: `https://ui-avatars.com/api/?name=Super+Admin&background=random`
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
        setUser(newUser);
        handleRedirect(role);
      }
      showToast('Welcome back!', 'success');
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Update Firebase Auth profile
      await updateProfile(userCredential.user, {
        displayName: data.name
      });

      let role: 'customer' | 'admin' | 'manager' = 'customer';
      
      // Check for invitation if token exists
      if (invitationToken) {
        try {
          const invitationsQuery = query(
            collection(db, 'invitations'),
            where('token', '==', invitationToken),
            where('status', '==', 'pending')
          );
          const invitationDocs = await getDocs(invitationsQuery);
          if (!invitationDocs.empty) {
            const invitation = invitationDocs.docs[0].data() as any;
            role = invitation.role;
            // Mark invitation as accepted
            await updateDoc(doc(db, 'invitations', invitation.id), {
              status: 'accepted'
            });
          }
        } catch (err) {
          console.error('Error checking invitation:', err);
        }
      }

      // Create user document in Firestore
      const newUser: User = {
        id: userCredential.user.uid,
        name: data.name,
        email: data.email,
        phone: '',
        role,
        rewardPoints: 0,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      setUser(newUser);
      
      showToast('Account created successfully!', 'success');
      handleRedirect(role);
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);
        handleRedirect(userData.role);
      } else {
        // Create new user doc for Google login if it doesn't exist
        const newUser: User = {
          id: result.user.uid,
          name: result.user.displayName || 'New User',
          email: result.user.email || '',
          phone: '',
          role: 'customer', // Default role
          rewardPoints: 0,
          avatar: result.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.displayName || 'U')}&background=random`
        };
        await setDoc(doc(db, 'users', result.user.uid), newUser);
        setUser(newUser);
        handleRedirect('customer');
      }
      showToast('Welcome!', 'success');
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
    resetLogin();
    resetSignup();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans selection:bg-blue-100">
      <div className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/60 border border-slate-100 relative">
        
        {/* Left Side: Brand & Visuals */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Car className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">EliteDrive</h1>
            </div>

            <div className="space-y-8 max-w-md">
              <motion.h2 
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-black leading-[1.1] tracking-tight"
              >
                {mode === 'signin' ? 'Unlock your premium journey.' : 'Join the elite mobility club.'}
              </motion.h2>
              <p className="text-slate-400 text-xl font-medium leading-relaxed">
                Experience the most advanced AI-driven vehicle rental platform in Pakistan.
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img 
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover"
                    src={`https://i.pravatar.cc/150?u=${i}`}
                    alt="User"
                  />
                ))}
              </div>
              <p className="text-sm font-bold text-slate-300">
                Joined by <span className="text-white">2,000+</span> premium members
              </p>
            </div>
            
            <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="flex flex-col justify-center p-8 sm:p-16 lg:p-20 bg-white">
          <div className="w-full max-w-sm mx-auto">
            <div className="lg:hidden flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic text-slate-900">EliteDrive</h1>
            </div>

            <div className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-slate-500 font-medium">
                {mode === 'signin' ? 'Enter your credentials to access your account.' : 'Fill in your details to start your journey.'}
              </p>
            </div>

            {/* Mode Toggle Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-10">
              <button 
                onClick={() => setMode('signin')}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${mode === 'signin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setMode('signup')}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${mode === 'signup' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign Up
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-bold"
                >
                  <AlertCircle className="shrink-0 mt-0.5" size={18} />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form 
              onSubmit={mode === 'signin' ? handleSubmitLogin(onLoginSubmit) : handleSubmitSignup(onSignupSubmit)} 
              className="space-y-6"
            >
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text"
                        {...registerSignup('name')}
                        className={`w-full bg-slate-50 border ${signupErrors.name ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-300`} 
                        placeholder="John Doe"
                      />
                    </div>
                    {signupErrors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{signupErrors.name.message}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email"
                    {...(mode === 'signin' ? registerLogin('email') : registerSignup('email'))}
                    className={`w-full bg-slate-50 border ${(mode === 'signin' ? loginErrors.email : signupErrors.email) ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-300`} 
                    placeholder="name@example.com"
                  />
                </div>
                {(mode === 'signin' ? loginErrors.email : signupErrors.email) && (
                  <p className="text-[10px] text-red-500 font-bold ml-1">
                    {(mode === 'signin' ? loginErrors.email : signupErrors.email)?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                  {mode === 'signin' && (
                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">Forgot?</button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password"
                    {...(mode === 'signin' ? registerLogin('password') : registerSignup('password'))}
                    className={`w-full bg-slate-50 border ${(mode === 'signin' ? loginErrors.password : signupErrors.password) ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-300`} 
                    placeholder="••••••••"
                  />
                </div>
                {(mode === 'signin' ? loginErrors.password : signupErrors.password) && (
                  <p className="text-[10px] text-red-500 font-bold ml-1">
                    {(mode === 'signin' ? loginErrors.password : signupErrors.password)?.message}
                  </p>
                )}
              </div>

              <button 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-6 rounded-3xl transition-all shadow-xl shadow-blue-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="relative flex items-center justify-center py-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white">Continue with</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center gap-3 bg-white border border-slate-100 py-4 px-6 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 font-black text-xs shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Chrome size={18} className="text-blue-500" />
                Google
              </button>
              <button 
                disabled={loading}
                className="flex items-center justify-center gap-3 bg-white border border-slate-100 py-4 px-6 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 font-black text-xs shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Github size={18} className="text-slate-900" />
                GitHub
              </button>
            </div>

            <p className="mt-12 text-center text-sm font-bold text-slate-500">
              {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-700 ml-2 font-black underline decoration-2 underline-offset-4"
              >
                {mode === 'signin' ? 'Sign up for free' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
