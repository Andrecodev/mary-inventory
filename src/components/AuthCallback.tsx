import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      navigate('/', { replace: true });
    }
  }, [loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-xl text-gray-600">Completando inicio de sesión...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
