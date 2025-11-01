import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import RegisterForm from '../components/RegisterForm';

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();

  // Redirect if already logged in (also handled by PublicRoute, but keeping for safety)
  React.useEffect(() => {
    if (!loading && isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user?.role === 'student') {
        navigate('/student/dashboard', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true }); // Default fallback
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  const handleRegisterSuccess = (userData) => {
    // Navigate based on user role from register response
    const role = userData?.role || user?.role;
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'student') {
      navigate('/student/dashboard', { replace: true });
    } else {
      navigate('/admin/dashboard', { replace: true }); // Default fallback
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <Card>
          <RegisterForm onSuccess={handleRegisterSuccess} />
        </Card>
      </div>
    </div>
  );
};

export default Register;
