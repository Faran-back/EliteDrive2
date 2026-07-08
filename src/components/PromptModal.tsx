import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X } from 'lucide-react';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  defaultValue?: string;
  type?: 'info' | 'warning' | 'danger';
}

const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder = 'Enter details...',
  confirmLabel = 'Submit',
  cancelLabel = 'Cancel',
  defaultValue = '',
  type = 'info'
}) => {
  const [value, setValue] = useState(defaultValue);

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <HelpCircle className="text-red-500" size={24} />,
          confirmBtn: 'bg-red-500 hover:bg-red-600 text-white shadow-red-100',
          bg: 'bg-red-50'
        };
      case 'warning':
        return {
          icon: <HelpCircle className="text-amber-500" size={24} />,
          confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100',
          bg: 'bg-amber-50'
        };
      default:
        return {
          icon: <HelpCircle className="text-blue-500" size={24} />,
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100',
          bg: 'bg-blue-50'
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm(value);
    setValue('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${styles.bg}`}>
                  {styles.icon}
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2 mb-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{message}</p>
              </div>

              <div className="mb-8">
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none font-bold text-sm transition-all placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!value.trim()}
                  className={`flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 disabled:grayscale ${styles.confirmBtn}`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PromptModal;
