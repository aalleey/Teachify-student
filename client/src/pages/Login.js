import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import LoginForm from '../components/LoginForm';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();

  // Redirect if already logged in (this is also handled by PublicRoute, but keeping for safety)
  React.useEffect(() => {
    if (!loading && isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user?.role === 'faculty' || user?.role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else if (user?.role === 'student') {
        navigate('/student/dashboard', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true }); // Default fallback
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  const handleLoginSuccess = (userData) => {
    // Navigate based on user role from login response
    const role = userData?.role || user?.role;
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'faculty' || role === 'teacher') {
      navigate('/teacher/dashboard', { replace: true });
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <Card>
          <LoginForm onSuccess={handleLoginSuccess} />
        </Card>
      </div>
    </div>
  );
};

export default Login;
