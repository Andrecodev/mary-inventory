import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';

const VoiceAssistant: React.FC = () => {
  const { state } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

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
      };

      const startListening = () => {
        recognition.start();
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
    const lowerCommand = command.toLowerCase();
    let responseText = '';

    if (state.language === 'en') {
      if (lowerCommand.includes('how much') && lowerCommand.includes('owe')) {
        const totalDebt = state.customers.reduce((sum, customer) => sum + customer.totalDebt, 0);
        responseText = `Customers owe a total of $${totalDebt.toLocaleString()}`;
      } else if (lowerCommand.includes('overdue') && lowerCommand.includes('payment')) {
        const overdueCount = state.payments.filter(p => p.status === 'overdue').length;
        responseText = `There are ${overdueCount} overdue payments`;
      } else if (lowerCommand.includes('search') || lowerCommand.includes('find')) {
        responseText = 'Please tell me what product you are looking for';
      } else if (lowerCommand.includes('low stock')) {
        const lowStockCount = state.products.filter(p => p.quantity <= p.lowStockThreshold).length;
        responseText = `There are ${lowStockCount} products with low stock`;
      } else {
        responseText = 'I can help you with inventory, customers, and payments. What would you like to know?';
      }
    } else {
      if (lowerCommand.includes('cuánto') && lowerCommand.includes('debe')) {
        const totalDebt = state.customers.reduce((sum, customer) => sum + customer.totalDebt, 0);
        responseText = `Los clientes deben un total de $${totalDebt.toLocaleString()}`;
      } else if (lowerCommand.includes('vencido') && lowerCommand.includes('pago')) {
        const overdueCount = state.payments.filter(p => p.status === 'overdue').length;
        responseText = `Hay ${overdueCount} pagos vencidos`;
      } else if (lowerCommand.includes('buscar') || lowerCommand.includes('encontrar')) {
        responseText = 'Por favor dime qué producto estás buscando';
      } else if (lowerCommand.includes('poco stock')) {
        const lowStockCount = state.products.filter(p => p.quantity <= p.lowStockThreshold).length;
        responseText = `Hay ${lowStockCount} productos con poco stock`;
      } else {
        responseText = 'Te puedo ayudar con inventario, clientes y pagos. ¿Qué te gustaría saber?';
      }
    }

    setResponse(responseText);
    speakResponse(responseText);
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = state.language === 'en' ? 'en-US' : 'es-ES';
      utterance.rate = 0.8;
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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">{t('voiceAssistant', state.language)}</h3>
          <button
            onClick={handleMicClick}
            className={`p-2 rounded-full transition-colors ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        </div>

        {isListening && (
          <div className="text-center py-4">
            <div className="animate-pulse">
              <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">{t('listening', state.language)}</p>
            </div>
          </div>
        )}

        {transcript && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-1">You said:</p>
            <p className="text-sm bg-gray-100 p-2 rounded">{transcript}</p>
          </div>
        )}

        {response && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-gray-600">Response:</p>
              <button
                onClick={() => speakResponse(response)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm bg-blue-50 p-2 rounded">{response}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>Try saying:</p>
          <ul className="list-disc list-inside space-y-1">
            {state.language === 'en' ? (
              <>
                <li>"How much do customers owe?"</li>
                <li>"Show overdue payments"</li>
                <li>"Search for product"</li>
                <li>"Low stock items"</li>
              </>
            ) : (
              <>
                <li>"¿Cuánto deben los clientes?"</li>
                <li>"Mostrar pagos vencidos"</li>
                <li>"Buscar producto"</li>
                <li>"Productos con poco stock"</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;