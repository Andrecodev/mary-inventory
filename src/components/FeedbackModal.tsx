import React, { useState } from 'react';
import { X, Send, Lightbulb } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks';
import { supabase } from '../lib/supabase';
import { t } from '../utils/translations';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { state } = useApp();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState('feature');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      showError('Por favor, escribe tu sugerencia');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id,
          email: email || user?.email,
          feedback_text: feedback.trim(),
          category,
          status: 'pending'
        });

      if (error) throw error;

      success('¡Gracias por tu feedback! Tu sugerencia nos ayuda a mejorar.');
      setFeedback('');
      setCategory('feature');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      showError('Error al enviar tu feedback. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categories = {
    es: [
      { value: 'feature', label: '✨ Nueva Funcionalidad' },
      { value: 'improvement', label: '⚡ Mejora' },
      { value: 'bug', label: '🐛 Problema' },
      { value: 'design', label: '🎨 Diseño' },
      { value: 'other', label: '💭 Otro' }
    ],
    en: [
      { value: 'feature', label: '✨ New Feature' },
      { value: 'improvement', label: '⚡ Improvement' },
      { value: 'bug', label: '🐛 Bug' },
      { value: 'design', label: '🎨 Design' },
      { value: 'other', label: '💭 Other' }
    ]
  };

  const messages = {
    es: {
      title: '¿Qué funcionalidad te gustaría tener?',
      subtitle: 'Tus sugerencias nos ayudan a mejorar InvenFlow',
      placeholder: 'Cuéntanos qué necesitas o qué cambios te gustaría ver...',
      emailLabel: 'Email (opcional)',
      categoryLabel: 'Categoría',
      submitBtn: 'Enviar Feedback',
      description: 'Tu opinión es valiosa y nos ayuda a crear un mejor producto para ti.'
    },
    en: {
      title: 'What feature would you like?',
      subtitle: 'Your suggestions help us improve InvenFlow',
      placeholder: 'Tell us what you need or what changes you\'d like to see...',
      emailLabel: 'Email (optional)',
      categoryLabel: 'Category',
      submitBtn: 'Send Feedback',
      description: 'Your opinion is valuable and helps us create a better product for you.'
    }
  };

  const lang = state.language as 'es' | 'en';
  const msg = messages[lang];
  const cats = categories[lang];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">{msg.title}</h2>
              <p className="text-xs sm:text-sm text-green-100">{msg.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Description */}
          <p className="text-sm text-gray-600">{msg.description}</p>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {msg.categoryLabel}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-sm"
            >
              {cats.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Feedback Text Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {lang === 'es' ? 'Tu Sugerencia' : 'Your Feedback'} *
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={msg.placeholder}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none text-sm"
              rows={5}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {feedback.length}/500
            </p>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {msg.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={lang === 'es' ? 'tu@email.com' : 'your@email.com'}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'es'
                ? 'Te contactaremos si queremos más detalles'
                : 'We\'ll contact you if we need more details'}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !feedback.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 sm:py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{isSubmitting ? (lang === 'es' ? 'Enviando...' : 'Sending...') : msg.submitBtn}</span>
          </button>

          {/* Motivational Message */}
          <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
            <p className="text-xs sm:text-sm text-green-800">
              {lang === 'es'
                ? '💚 Cada sugerencia es importante. Juntos hacemos InvenFlow mejor.'
                : '💚 Every suggestion matters. Together we make InvenFlow better.'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
