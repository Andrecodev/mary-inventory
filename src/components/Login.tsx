import React, { useState } from 'react';
import { Package, Chrome, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <Package className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">InvenFlow</h1>
          <p className="text-xl text-gray-600">Sistema de Gestión Empresarial</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido</h2>
            <p className="text-gray-600">Inicia sesión para continuar</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="h-6 w-6 animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <Chrome className="h-6 w-6 text-blue-600" />
                <span>Continuar con Google</span>
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Al iniciar sesión, aceptas nuestros{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Términos de Servicio
              </a>{' '}
              y{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Política de Privacidad
              </a>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">✓</div>
              <p className="text-xs text-gray-600">Seguro</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600 mb-1">⚡</div>
              <p className="text-xs text-gray-600">Rápido</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-orange-600 mb-1">☁</div>
              <p className="text-xs text-gray-600">En la Nube</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
