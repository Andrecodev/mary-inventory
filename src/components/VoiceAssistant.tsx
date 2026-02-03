import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { processSpanishCommand, processEnglishCommand } from '../utils/voiceCommandProcessor';
import { formatForSpeech, formatForSpeechEN } from '../utils/numberToWords';

const VoiceAssistant: React.FC = () => {
  const { state } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ query: string; response: string }>>([]);

  // Cargar voces disponibles al iniciar
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Forzar la carga de voces
      speechSynthesis.getVoices();

      // En algunos navegadores, las voces se cargan de forma asíncrona
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
          const voices = speechSynthesis.getVoices();
          console.log('📢 Voces disponibles:', voices.length);
        };
      }
    }
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = state.language === 'en' ? 'en-US' : 'es-ES';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        processVoiceCommand(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);

        if (event.error === 'no-speech') {
          setResponse('No te escuché. Intenta de nuevo.');
        } else if (event.error === 'not-allowed') {
          setResponse('Por favor, permite el acceso al micrófono en la configuración de tu navegador.');
        }
      };

      const startListening = () => {
        try {
          recognition.start();
          setIsMinimized(false);
        } catch (error) {
          console.error('Error starting recognition:', error);
        }
      };

      const stopListening = () => {
        recognition.stop();
      };

      // Attach to window for component access
      window.speechRecognition = recognition;
      window.startListening = startListening;
      window.stopListening = stopListening;
    }
  }, [state.language]);

  const processVoiceCommand = (command: string) => {
    console.log('🎤 Processing command:', command);

    const result = state.language === 'en'
      ? processEnglishCommand(command, state)
      : processSpanishCommand(command, state);

    setResponse(result.response);
    speakResponse(result.response);

    // Guardar en historial
    setConversationHistory(prev => [
      { query: command, response: result.response },
      ...prev.slice(0, 4) // Mantener solo los últimos 5
    ]);
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancelar cualquier speech en progreso
      speechSynthesis.cancel();

      // Convertir números y monedas a palabras para mejor pronunciación
      const textForSpeech = state.language === 'en'
        ? formatForSpeechEN(text)
        : formatForSpeech(text);

      const utterance = new SpeechSynthesisUtterance(textForSpeech);
      utterance.lang = state.language === 'en' ? 'en-US' : 'es-MX';

      // Obtener las voces disponibles
      const voices = speechSynthesis.getVoices();

      // Seleccionar la mejor voz disponible
      let selectedVoice = null;

      if (state.language === 'en') {
        // Preferencias para inglés: voces naturales de calidad
        const preferredVoices = [
          'Samantha', 'Karen', 'Daniel', 'Moira', 'Fiona',
          'Google US English', 'Microsoft Zira', 'Alex'
        ];

        for (const voiceName of preferredVoices) {
          selectedVoice = voices.find(v =>
            v.lang.includes('en') && v.name.includes(voiceName)
          );
          if (selectedVoice) break;
        }

        // Si no encuentra ninguna preferida, buscar cualquier voz en inglés
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.includes('en-US')) ||
                         voices.find(v => v.lang.includes('en'));
        }
      } else {
        // Preferencias para español: voces mexicanas/latinoamericanas naturales
        const preferredVoices = [
          'Paulina', 'Monica', 'Juan', 'Diego', 'Angelica',
          'Google español', 'Microsoft Sabina', 'Mónica'
        ];

        for (const voiceName of preferredVoices) {
          selectedVoice = voices.find(v =>
            (v.lang.includes('es') || v.lang.includes('spa')) &&
            v.name.includes(voiceName)
          );
          if (selectedVoice) break;
        }

        // Si no encuentra ninguna preferida, buscar voces en español
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.includes('es-MX')) ||
                         voices.find(v => v.lang.includes('es-US')) ||
                         voices.find(v => v.lang.includes('es-ES')) ||
                         voices.find(v => v.lang.includes('es'));
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Configuración para una voz más natural y amena
      utterance.rate = 0.95;  // Velocidad ligeramente más lenta para claridad
      utterance.pitch = 1.05;  // Pitch ligeramente más alto para sonar más amigable
      utterance.volume = 1;

      console.log('🗣️ Using voice:', selectedVoice?.name || 'default');
      speechSynthesis.speak(utterance);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      window.stopListening?.();
    } else {
      window.startListening?.();
    }
  };

  const clearHistory = () => {
    setConversationHistory([]);
    setTranscript('');
    setResponse('');
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
          title="Abrir Asistente de Voz"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-11/12 sm:w-full sm:max-w-md">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl border-2 border-blue-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              <h3 className="font-bold text-white text-base sm:text-lg">Asistente Inteligente</h3>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={handleMicClick}
                className={`p-1.5 sm:p-2 rounded-full transition-all ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5 text-white" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Listening Indicator */}
        {isListening && (
          <div className="bg-red-50 border-b-2 border-red-200 py-2 sm:py-3 px-3 sm:px-4">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <div className="flex space-x-0.5 sm:space-x-1">
                <div className="w-1.5 h-6 sm:w-2 sm:h-8 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-8 sm:w-2 sm:h-10 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-5 sm:w-2 sm:h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                <div className="w-1.5 h-7 sm:w-2 sm:h-9 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }}></div>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-red-700">Escuchando...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-3 sm:p-4 max-h-72 sm:max-h-96 overflow-y-auto space-y-2 sm:space-y-3">
          {/* Current Query */}
          {transcript && (
            <div className="bg-blue-100 border-l-4 border-blue-600 p-2 sm:p-3 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 mb-1">Tú dijiste:</p>
              <p className="text-xs sm:text-sm text-gray-900 break-words">{transcript}</p>
            </div>
          )}

          {/* Current Response */}
          {response && (
            <div className="bg-purple-50 border-l-4 border-purple-600 p-2 sm:p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-purple-800">Respuesta:</p>
                <button
                  onClick={() => speakResponse(response)}
                  className="p-0.5 sm:p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded transition-colors"
                  title="Repetir respuesta"
                >
                  <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-900 break-words">{response}</p>
            </div>
          )}

          {/* Conversation History */}
          {conversationHistory.length > 0 && (
            <div className="pt-2 sm:pt-3 border-t-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600">Historial</p>
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Limpiar
                </button>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {conversationHistory.map((item, index) => (
                  <div key={index} className="text-xs bg-gray-50 p-1.5 sm:p-2 rounded">
                    <p className="text-gray-600 mb-0.5 break-words">👤 {item.query}</p>
                    <p className="text-gray-800 break-words">🤖 {item.response}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 sm:p-4 border-t-2 border-gray-200 max-h-40 sm:max-h-none overflow-y-auto sm:overflow-visible">
          <p className="text-xs font-semibold text-gray-700 mb-2">💡 Prueba preguntar:</p>
          <div className="space-y-0.5 sm:space-y-1 text-xs text-gray-600">
            {state.language === 'en' ? (
              <>
                <p>• "How much do customers owe?"</p>
                <p>• "Show overdue payments"</p>
                <p>• "Low stock items"</p>
                <p>• "How many products do I have?"</p>
                <p>• "Profit this month"</p>
              </>
            ) : (
              <>
                <p>• "¿Cuánto debe Juan Pérez?"</p>
                <p>• "¿Cuánto debe María en enero?"</p>
                <p>• "Productos con poco stock"</p>
                <p>• "¿Cuántos clientes tengo?"</p>
                <p>• "Pagos vencidos"</p>
                <p>• "Ganancia de este mes"</p>
                <p>• "Ganancia de esta semana"</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
