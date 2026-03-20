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
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const NotificationDropdown: React.FC = () => {
  const { notifications, markNotificationAsRead, deleteNotification } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

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
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-slate-100 transition-colors relative text-slate-600"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-[#2463eb] text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden z-[100]"
          >
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Notifications</h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {unreadCount} New
              </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-5 transition-colors hover:bg-slate-50 relative group ${!notification.read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          notification.type === 'booking_confirmed' ? 'bg-emerald-50' :
                          notification.type === 'booking_cancelled' ? 'bg-rose-50' :
                          notification.type === 'promotion' ? 'bg-amber-50' : 'bg-blue-50'
                        }`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-black text-slate-900">{notification.title}</p>
                            <span className="text-[10px] font-bold text-slate-400">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            {notification.message}
                          </p>
                          {notification.link && (
                            <Link 
                              to={notification.link}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1 text-[10px] font-black text-[#2463eb] uppercase tracking-widest mt-2 hover:underline"
                            >
                              View Details
                              <ExternalLink size={10} />
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button 
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="p-1.5 bg-white shadow-sm rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 bg-white shadow-sm rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="text-slate-300" size={32} />
                  </div>
                  <p className="text-sm font-black text-slate-900">All caught up!</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">No new notifications at the moment.</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <button 
                  onClick={() => {
                    notifications.forEach(n => !n.read && markNotificationAsRead(n.id));
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
