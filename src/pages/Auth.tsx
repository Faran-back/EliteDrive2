import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Car, AlertCircle, Mail, Lock, User as UserIcon, ArrowRight, Chrome, Shield, ChevronDown, ChevronUp, IdCard, FileBadge, Info } from 'lucide-react';
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
  const { showToast, login, registerUser } = useStore();
  const [invitationToken, setInvitationToken] = useState<string | null>(null);

  // Sync mode with URL if needed, or just default to signin
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('invitation');
    if (token) {
      setInvitationToken(token);
      setMode('signup');
      return;
    }

    const tab = params.get('tab');
    if (tab === 'signup' || tab === 'register') {
      setMode('signup');
    } else if (tab === 'login' || tab === 'signin') {
      setMode('signin');
    } else if (location.pathname === '/signup') {
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
    setValue: setValueSignup,
    watch: watchSignup,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      requestedRole: 'customer'
    }
  });

  const requestedRole = watchSignup('requestedRole');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [docImages, setDocImages] = useState<{ [key: string]: string | null }>({
    cnicFront: null,
    cnicBack: null,
    license: null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocImages(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRedirect = (userRole: string) => {
    const storedRedirect = localStorage.getItem('elitedrive_redirect');
    if (storedRedirect && userRole === 'customer') {
      localStorage.removeItem('elitedrive_redirect');
      navigate(storedRedirect);
      return;
    }
    
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
      const loggedUser = await login(data.email, data.password);
      showToast('Welcome back!', 'success');
      handleRedirect(loggedUser.role);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        requestedRole: data.requestedRole,
        cnicFront: docImages.cnicFront || null,
        cnicBack: docImages.cnicBack || null,
        license: docImages.license || null,
      };

      const loggedUser = await registerUser(payload);
      showToast('Account created successfully!', 'success');
      handleRedirect(loggedUser.role);
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // Shortcut to pre-seeded admin user for local flow testing
      const loggedUser = await login('test@test.com', 'password');
      showToast('Welcome back! Signed in with Google (Simulated).', 'success');
      handleRedirect(loggedUser.role);
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
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
        <div className="hidden lg:flex flex-col justify-between p-16 bg-blue-50 text-slate-900 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
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
                className="text-5xl font-black leading-[1.1] tracking-tight text-slate-900"
              >
                {mode === 'signin' ? 'Unlock your premium journey.' : 'Join the elite mobility club.'}
              </motion.h2>
              <p className="text-slate-500 text-xl font-medium leading-relaxed">
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
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                    src={`https://i.pravatar.cc/150?u=${i}`}
                    alt="User"
                  />
                ))}
              </div>
              <p className="text-sm font-bold text-slate-500">
                Joined by <span className="text-blue-600">2,000+</span> premium members
              </p>
            </div>
            
            <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-slate-400">
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Terms of Service</span>
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

            {mode === 'signin' ? (
              <form 
                onSubmit={handleSubmitLogin(onLoginSubmit)} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email"
                      key="signin-email"
                      {...registerLogin('email')}
                      className={`w-full bg-slate-50 border ${loginErrors.email ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-300`} 
                      placeholder="name@example.com"
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-[10px] text-red-500 font-bold ml-1">
                      {loginErrors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password"
                      key="signin-password"
                      {...registerLogin('password')}
                      className={`w-full bg-slate-50 border ${loginErrors.password ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-300`} 
                      placeholder="••••••••"
                    />
                  </div>
                  {loginErrors.password && (
                    <p className="text-[10px] text-red-500 font-bold ml-1">
                      {loginErrors.password.message}
                    </p>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-6 rounded-3xl transition-all shadow-xl shadow-blue-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form 
                onSubmit={handleSubmitSignup(onSignupSubmit)} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      key="signup-name"
                      {...registerSignup('name')}
                      className={`w-full bg-slate-50 border ${signupErrors.name ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-300`} 
                      placeholder="John Doe"
                    />
                  </div>
                  {signupErrors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{signupErrors.name.message}</p>}
                </div>

                <div className="space-y-2 relative">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Select Role</label>
                  
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
                    <button
                      type="button"
                      onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                      className={`w-full bg-[#f8faff] border ${signupErrors.requestedRole ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 flex items-center justify-between focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-slate-900 shadow-sm relative`}
                    >
                      <span className="capitalize">{requestedRole}</span>
                      {isRoleDropdownOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </button>

                    <AnimatePresence>
                      {isRoleDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden p-2"
                        >
                          {(['admin', 'customer', 'manager'] as const).map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => {
                                setValueSignup('requestedRole', role);
                                setIsRoleDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                                requestedRole === role 
                                  ? 'bg-blue-50 text-blue-600' 
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span className="capitalize">{role}</span>
                              {requestedRole === role && (
                                <div className="size-1.5 bg-blue-600 rounded-full" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {signupErrors.requestedRole && <p className="text-[10px] text-red-500 font-bold ml-1">{signupErrors.requestedRole.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email"
                      key="signup-email"
                      {...registerSignup('email')}
                      className={`w-full bg-slate-50 border ${signupErrors.email ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-300`} 
                      placeholder="name@example.com"
                    />
                  </div>
                  {signupErrors.email && (
                    <p className="text-[10px] text-red-500 font-bold ml-1">
                      {signupErrors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password"
                      key="signup-password"
                      {...registerSignup('password')}
                      className={`w-full bg-slate-50 border ${signupErrors.password ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-300`} 
                      placeholder="••••••••"
                    />
                  </div>
                  {signupErrors.password && (
                    <p className="text-[10px] text-red-500 font-bold ml-1">
                      {signupErrors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-4 pt-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Identity Documents</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'cnicFront', label: 'CNIC FRONT', icon: <IdCard size={24} /> },
                      { id: 'cnicBack', label: 'CNIC BACK', icon: <IdCard size={24} /> },
                      { id: 'license', label: 'DRIVING LICENSE', icon: <FileBadge size={24} /> },
                    ].map((doc) => (
                      <div key={doc.id} className="relative group">
                        <input 
                          type="file" 
                          id={`file-${doc.id}`}
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, doc.id)}
                        />
                        <label 
                          htmlFor={`file-${doc.id}`}
                          className={`h-24 border-2 border-dashed ${docImages[doc.id] ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100 bg-slate-50/30'} rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer overflow-hidden relative`}
                        >
                          {docImages[doc.id] ? (
                            <img src={docImages[doc.id]!} alt={doc.label} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
                                {doc.icon}
                              </div>
                              <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 text-center px-1">{doc.label}</span>
                            </>
                          )}
                          
                          {docImages[doc.id] && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[8px] font-black text-white uppercase tracking-widest">Change</span>
                            </div>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50/50 border-l-4 border-blue-600 p-4 rounded-xl flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg shrink-0">
                      <Info className="text-blue-600" size={14} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 leading-relaxed pt-0.5">
                      Your documents will be verified within 24 hours. You can browse but cannot book until verified.
                    </p>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-6 rounded-3xl transition-all shadow-xl shadow-blue-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="relative flex items-center justify-center py-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white">Continue with</span>
            </div>

            <div className="w-full">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-100 py-4 px-6 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 font-black text-xs shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Chrome size={18} className="text-blue-500" />
                Google
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
