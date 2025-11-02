import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const RegisterForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '', // Start with empty role - user must select
    majorSubject: '' // For teachers
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();

  // Common subjects for teachers
  const subjects = [
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
    'Computer Science',
    'English',
    'History',
    'Geography',
    'Economics',
    'Business Studies',
    'Accounting',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate role selection
    if (!formData.role) {
      setError('Please select whether you are signing up as a Teacher or Student');
      setLoading(false);
      return;
    }

    // Validate majorSubject for teachers
    if (formData.role === 'faculty' && !formData.majorSubject) {
      setError('Please select your major subject');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role,
      formData.majorSubject
    );
    
    if (result.success) {
      // Show success message about approval
      if (result.user.role !== 'admin' && !result.user.isApproved) {
        alert('Registration successful! Your account is pending admin approval. You will be notified once approved.');
      }
      // Pass user data to onSuccess callback for navigation
      onSuccess && onSuccess(result.user);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="input-field mt-1"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="input-field mt-1"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Sign up as
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="input-field mt-1"
        >
          <option value="">Select your role...</option>
          <option value="student">Student</option>
          <option value="faculty">Teacher</option>
        </select>
      </div>

      {formData.role === 'faculty' && (
        <div>
          <label htmlFor="majorSubject" className="block text-sm font-medium text-gray-700">
            Major Subject <span className="text-red-500">*</span>
          </label>
          <select
            id="majorSubject"
            name="majorSubject"
            value={formData.majorSubject}
            onChange={handleChange}
            required
            className="input-field mt-1"
          >
            <option value="">Select your major subject...</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            You will only see MCQs, syllabus, and past papers related to this subject
          </p>
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="input-field mt-1"
          placeholder="Enter your password"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="input-field mt-1"
          placeholder="Confirm your password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default RegisterForm;
