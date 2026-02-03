import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import Calendar from './Calendar';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  min?: string;
  max?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  label,
  required = false,
  min,
  max,
  disabled = false,
  placeholder = 'Seleccionar fecha',
  className = '',
  error,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleContainerClick = () => {
    if (!disabled) {
      setShowCalendar(true);
    }
  };

  return (
    <div className={`w-full relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onClick={handleContainerClick}
        className={`
          relative flex items-center w-full gap-2
          px-3 sm:px-4 py-2 sm:py-2.5
          border border-gray-300 rounded-lg
          transition-all duration-200 cursor-pointer
          bg-white
          ${disabled
            ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
            : 'hover:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200'
          }
          ${showCalendar ? 'ring-2 ring-blue-500 border-blue-500 shadow-md' : ''}
          ${error ? 'border-red-500 ring-2 ring-red-300' : ''}
        `}
      >
        {/* Calendar Icon */}
        <CalendarIcon
          className={`w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0 ${disabled ? 'text-gray-400' : 'text-blue-600'}`}
          aria-hidden="true"
        />

        {/* Display Area */}
        <div className="flex-1 min-w-0">
          {value ? (
            <span className="text-gray-900 text-sm sm:text-base block truncate">
              {formatDisplayDate(value)}
            </span>
          ) : (
            <span className="text-gray-400 text-sm sm:text-base">
              {placeholder}
            </span>
          )}
        </div>

        {/* Clear button when value exists */}
        {value && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="flex items-center justify-center flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            aria-label="Limpiar fecha"
            title="Limpiar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Hidden input for form validation */}
        <input
          type="hidden"
          value={value}
          required={required}
        />
      </div>

      {/* Custom Calendar Popup */}
      {showCalendar && (
        <Calendar
          value={value}
          onChange={onChange}
          onClose={() => setShowCalendar(false)}
          min={min}
          max={max}
        />
      )}

      {error && (
        <p className="mt-1 text-xs sm:text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default DateInput;
