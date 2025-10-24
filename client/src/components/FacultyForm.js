import React, { useState, useEffect } from 'react';
import { facultyAPI } from '../services/api';

const FacultyForm = ({ 
  faculty, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    email: '',
    department: '',
    phone: '',
    office: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (faculty) {
      setFormData({
        name: faculty.name,
        subject: faculty.subject,
        email: faculty.email,
        department: faculty.department,
        phone: faculty.phone || '',
        office: faculty.office || '',
        bio: faculty.bio || ''
      });
    }
  }, [faculty]);

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

    try {
      if (faculty) {
        // Update existing faculty
        await facultyAPI.update(faculty._id, formData);
      } else {
        // Create new faculty
        await facultyAPI.create(formData);
      }
      
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {faculty ? 'Edit Faculty Member' : 'Add Faculty Member'}
        </h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field mt-1"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="input-field mt-1"
              placeholder="Enter subject"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field mt-1"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department *
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="input-field mt-1"
              placeholder="Enter department"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field mt-1"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label htmlFor="office" className="block text-sm font-medium text-gray-700">
              Office
            </label>
            <input
              type="text"
              id="office"
              name="office"
              value={formData.office}
              onChange={handleChange}
              className="input-field mt-1"
              placeholder="Enter office location"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="input-field mt-1"
              placeholder="Enter bio"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : (faculty ? 'Update' : 'Create')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyForm;
