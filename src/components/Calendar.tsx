import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  min?: string;
  max?: string;
}

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const Calendar: React.FC<CalendarProps> = ({ value, onChange, onClose, min, max }) => {
  const calendarRef = useRef<HTMLDivElement>(null);

  // Parse initial date
  const getInitialDate = () => {
    if (value) {
      const [year, month] = value.split('-').map(Number);
      return { month: month - 1, year };
    }
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialDate().month);
  const [currentYear, setCurrentYear] = useState(getInitialDate().year);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateDisabled = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (min && dateStr < min) return true;
    if (max && dateStr > max) return true;

    return false;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [year, month, dayOfMonth] = value.split('-').map(Number);
    return (
      day === dayOfMonth &&
      currentMonth === month - 1 &&
      currentYear === year
    );
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    if (isDateDisabled(day)) return;

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
    onClose();
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(parseInt(e.target.value));
  };

  // Generate years array (current year - 10 to current year + 10)
  const currentYearNow = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYearNow - 10 + i);

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  return (
    <div
      ref={calendarRef}
      className="absolute z-50 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden"
      style={{ minWidth: '320px', maxWidth: '400px', width: '100%' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <select
              value={currentMonth}
              onChange={handleMonthChange}
              className="bg-white/20 text-white border-0 rounded-lg px-3 py-2 text-base font-semibold cursor-pointer hover:bg-white/30 transition-colors appearance-none text-center"
              style={{ minWidth: '120px' }}
            >
              {MONTHS_ES.map((month, index) => (
                <option key={month} value={index} className="text-gray-900">
                  {month}
                </option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={handleYearChange}
              className="bg-white/20 text-white border-0 rounded-lg px-3 py-2 text-base font-semibold cursor-pointer hover:bg-white/30 transition-colors appearance-none text-center"
              style={{ minWidth: '80px' }}
            >
              {years.map((year) => (
                <option key={year} value={year} className="text-gray-900">
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Cerrar calendario"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {DAYS_ES.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-sm font-semibold text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 p-2 gap-1">
        {Array.from({ length: totalCells }).map((_, index) => {
          const day = index - firstDay + 1;
          const isValidDay = day > 0 && day <= daysInMonth;
          const disabled = isValidDay && isDateDisabled(day);
          const selected = isValidDay && isSelected(day);
          const today = isValidDay && isToday(day);

          if (!isValidDay) {
            return <div key={index} className="aspect-square" />;
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectDate(day)}
              disabled={disabled}
              className={`
                aspect-square flex items-center justify-center
                text-base md:text-lg font-medium rounded-xl
                transition-all duration-200
                min-h-[44px] md:min-h-[48px]
                ${selected
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : today
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : disabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Footer with quick actions */}
      <div className="border-t border-gray-200 p-3 bg-gray-50 flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={() => {
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            if (!isDateDisabled(today.getDate()) || (min && dateStr >= min) || !min) {
              onChange(dateStr);
              onClose();
            }
          }}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClose();
          }}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default Calendar;
