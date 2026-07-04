import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Bell,
  Check,
  Trash2,
  Calendar,
  XCircle,
  Tag,
  Info,
  ExternalLink,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { checkPushSubscription, registerPushNotifications } from '../utils/pushRegister';
import { formatNotificationTime, getNotificationTone } from '../utils/notifications';

const NotificationDropdown: React.FC = () => {
  const { notifications, markNotificationAsRead, deleteNotification, showToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsPushSupported(supported);
    if (supported) {
      checkPushSubscription().then(setIsSubscribed);
    }
  }, []);

  const handleEnablePush = async () => {
    const result = await registerPushNotifications();
    if (result.success) {
      setIsSubscribed(true);
      showToast('Desktop notifications successfully enabled!', 'success');
    } else {
      if (result.reason === 'iframe') {
        showToast(
          'Desktop alerts are blocked in the preview window. Please open the app in a new tab (button at top right) to enable alerts!',
          'info'
        );
      } else if (result.reason === 'permission_denied') {
        showToast('Notification permission was denied. Please allow notifications in your browser address bar.', 'error');
      } else if (result.reason === 'unsupported') {
        showToast('Push notifications are not supported in this browser.', 'error');
      } else {
        showToast('An error occurred while enabling desktop alerts. Please try again.', 'error');
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed': return <Calendar className="text-emerald-500" size={18} />;
      case 'booking_cancelled': return <XCircle className="text-rose-500" size={18} />;
      case 'promotion': return <Tag className="text-amber-500" size={18} />;
      case 'invitation': return <ShieldCheck className="text-blue-500" size={18} />;
      default: return <Info className="text-slate-500" size={18} />;
    }
  };

  const unreadNotifications = notifications.filter((notification) => !notification.read);
  const readNotifications = notifications.filter((notification) => notification.read);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-slate-100 transition-colors relative text-slate-600"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 min-w-4 h-4 px-1 bg-[#2463eb] text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden z-[100]"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Notifications</h3>
                <p className="text-xs text-slate-500 font-medium">Real-time updates from your account</p>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {unreadCount} New
              </span>
            </div>

            {isPushSupported && (
              <div className="mx-4 mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Bell className="text-blue-500 shrink-0" size={16} />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800">Desktop alerts</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">Get instant booking and support updates</p>
                  </div>
                </div>
                {isSubscribed ? (
                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border border-emerald-100 shrink-0">
                    Active
                  </span>
                ) : (
                  <button
                    onClick={handleEnablePush}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-colors shadow-sm shrink-0"
                  >
                    Enable
                  </button>
                )}
              </div>
            )}

            <div className="max-h-[420px] overflow-y-auto p-4 space-y-4">
              {notifications.length > 0 ? (
                <>
                  {unreadNotifications.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <Sparkles size={12} />
                        New
                      </div>
                      {unreadNotifications.map((notification) => {
                        const tone = getNotificationTone(notification.type, notification.read);
                        return (
                          <div
                            key={notification.id}
                            className={`p-4 rounded-[22px] border transition-all relative group ${tone.accent}`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone.badge}`}>
                                {getIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-900 truncate">{notification.title}</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{tone.chipLabel}</p>
                                  </div>
                                  <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                                    {formatNotificationTime(notification.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">
                                  {notification.message}
                                </p>
                                {notification.link && (
                                  <Link
                                    to={notification.link}
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex items-center gap-1 text-[10px] font-black text-[#2463eb] uppercase tracking-widest mt-3 hover:underline"
                                  >
                                    View details
                                    <ExternalLink size={10} />
                                  </Link>
                                )}
                              </div>
                            </div>

                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => markNotificationAsRead(notification.id)}
                                className="p-1.5 bg-white border border-slate-100 shadow-sm rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Mark as read"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1.5 bg-white border border-slate-100 shadow-sm rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {readNotifications.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <Check size={12} />
                        Earlier
                      </div>
                      {readNotifications.map((notification) => {
                        const tone = getNotificationTone(notification.type, notification.read);
                        return (
                          <div
                            key={notification.id}
                            className={`p-4 rounded-[22px] border transition-all relative group ${tone.accent}`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone.badge}`}>
                                {getIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">{notification.title}</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{tone.chipLabel}</p>
                                  </div>
                                  <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                                    {formatNotificationTime(notification.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
                                  {notification.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="text-slate-300" size={32} />
                  </div>
                  <p className="text-sm font-black text-slate-900">All caught up!</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">No new notifications at the moment.</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {unreadNotifications.length} unread
                </span>
                <button
                  onClick={() => {
                    notifications.forEach((notification) => !notification.read && markNotificationAsRead(notification.id));
                  }}
                  className="text-[10px] font-black text-[#2463eb] uppercase tracking-widest hover:underline"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
