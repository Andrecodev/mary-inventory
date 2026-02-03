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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onClick={handleContainerClick}
        className={`
          relative flex items-center w-full
          px-3 py-2 border rounded-lg
          transition-all duration-200 cursor-pointer
          ${disabled
            ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
            : 'bg-white border-gray-300 hover:border-gray-400'
          }
          ${showCalendar ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          ${error ? 'border-red-500 ring-2 ring-red-300' : ''}
        `}
      >
        {/* Calendar Icon */}
        <CalendarIcon
          className={`w-4 h-4 mr-2 flex-shrink-0 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}
        />

        {/* Display Area */}
        <div className="flex-1">
          {value ? (
            <span className="text-gray-900 text-sm">
              {formatDisplayDate(value)}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">
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
            className="flex items-center justify-center ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Limpiar fecha"
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
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default DateInput;
