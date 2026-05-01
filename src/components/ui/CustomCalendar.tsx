import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomCalendarProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  minDate?: Date;
  className?: string;
  showTimeSelect?: boolean;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selected,
  onChange,
  placeholder = 'Select date',
  label,
  error,
  minDate,
  className = '',
  showTimeSelect = false
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-2">
          <CalendarIcon size={12} className="text-blue-600" />
          {label}
        </label>
      )}
      <div className="relative group">
        <DatePicker
          selected={selected}
          onChange={onChange}
          placeholderText={placeholder}
          minDate={minDate}
          showTimeSelect={showTimeSelect}
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="Time"
          dateFormat={showTimeSelect ? "MMM d, yyyy h:mm aa" : "MMM d, yyyy"}
          className={`w-full pl-6 pr-6 py-4 bg-slate-50 rounded-[20px] border-2 border-slate-50 transition-all text-slate-900 font-bold placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white ${
            error ? 'border-red-500 bg-red-50' : ''
          }`}
          calendarClassName="premium-calendar"
          renderCustomHeader={({
            date,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
              <button
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                type="button"
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-black text-slate-900 uppercase tracking-widest">
                {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                type="button"
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        />
        <CalendarIcon 
          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" 
          size={18} 
        />
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 px-1">{error}</p>}

      <style>{`
        .premium-calendar {
          font-family: 'Inter', sans-serif !important;
          border: 1px solid #f1f5f9 !important;
          border-radius: 24px !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
          overflow: hidden !important;
          background: white !important;
        }
        .react-datepicker__month-container {
          background: white !important;
        }
        .react-datepicker__day-name {
          color: #94a3b8 !important;
          font-weight: 800 !important;
          font-size: 10px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          width: 2.5rem !important;
          line-height: 2.5rem !important;
        }
        .react-datepicker__day {
          color: #1e293b !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          width: 2.5rem !important;
          line-height: 2.5rem !important;
          border-radius: 12px !important;
          margin: 0.1rem !important;
          transition: all 0.2s !important;
        }
        .react-datepicker__day:hover {
          background-color: #f1f7ff !important;
          color: #2563eb !important;
          transform: scale(1.1) !important;
        }
        .react-datepicker__day--selected {
          background-color: #2563eb !important;
          color: white !important;
          box-shadow: 0 4px 6px -1px rgb(37 99 235 / 0.2) !important;
        }
        .react-datepicker__day--outside-month {
          color: #cbd5e1 !important;
          opacity: 0.5 !important;
        }
        .react-datepicker__day--today {
          border: 2px solid #2563eb !important;
          color: #2563eb !important;
        }
        .react-datepicker__header {
          background-color: white !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding-top: 0 !important;
        }
        .react-datepicker__day-names {
          padding-top: 8px !important;
        }
      `}</style>
    </div>
  );
};

export default CustomCalendar;
