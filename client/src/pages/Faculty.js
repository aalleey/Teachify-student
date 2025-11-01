import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { facultyAPI } from '../services/api';
import { Link } from 'react-router-dom';

// Enhanced status styles with animations and dark mode support
const statusStyles = {
  available: {
    dot: 'bg-green-500',
    glow: 'shadow-green-500/50',
    text: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/30',
    ring: 'ring-green-200 dark:ring-green-800',
    pulse: 'animate-pulse'
  },
  busy: {
    dot: 'bg-red-500',
    glow: 'shadow-red-500/50',
    text: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/30',
    ring: 'ring-red-200 dark:ring-red-800',
    pulse: ''
  },
  'on leave': {
    dot: 'bg-yellow-400',
    glow: 'shadow-yellow-400/50',
    text: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    ring: 'ring-yellow-200 dark:ring-yellow-800',
    pulse: ''
  }
};

// Enhanced Avatar component with gradient border and better styling
const Avatar = ({ name, src, size = 'large' }) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20'
  };

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (src) {
    return (
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Gradient border ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 p-0.5">
          <div className="h-full w-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
            <img
              src={src}
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Gradient border ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 p-0.5">
        <div className="h-full w-full rounded-full bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 flex items-center justify-center">
          <span className="text-white font-bold text-lg dark:text-primary-100">
            {initials || 'T'}
          </span>
        </div>
      </div>
      {/* Decorative dot */}
      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 dark:bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
    </div>
  );
};

// Enhanced Status Badge with pulsing animation and glow effect
const StatusBadge = ({ status = 'available' }) => {
  const key = String(status).toLowerCase();
  const style = statusStyles[key] || statusStyles.available;
  
  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${style.bg} ${style.text} ring-2 ${style.ring} shadow-lg ${style.glow} ${style.pulse} transition-all duration-300`}
    >
      <span className={`w-2 h-2 rounded-full ${style.dot} ${style.pulse}`}></span>
      {key.replace(/^./, (c) => c.toUpperCase())}
    </span>
  );
};

// Rating component (optional feature)
const Rating = ({ rating = 4.5, showNumber = true }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half-fill">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" fill="url(#half-fill)" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-gray-300 dark:text-gray-600 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// Verified Badge component (optional feature)
const VerifiedBadge = () => {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white ml-1.5" title="Verified Teacher">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </span>
  );
};

const Faculty = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch faculty list
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        setError('');
        const params = {};
        if (subjectFilter) params.subject = subjectFilter;
        const res = await facultyAPI.getAll(params);
        // Add mock rating for demo (in production, this would come from backend)
        const facultyWithRating = (res.data || []).map(f => ({
          ...f,
          rating: f.rating || (Math.random() * 1.5 + 3.5).toFixed(1), // Mock rating between 3.5-5.0
          verified: f.verified !== undefined ? f.verified : Math.random() > 0.5 // Mock verified status
        }));
        setFaculty(facultyWithRating);
      } catch (e) {
        console.error('Failed to fetch faculty:', e);
        setError(e.response?.data?.message || 'Failed to load faculty. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, [subjectFilter]);

  // Get unique subjects for filter dropdown
  const uniqueSubjects = useMemo(() => {
    const subjects = [...new Set(faculty.map((f) => f.subject).filter(Boolean))];
    return subjects.sort();
  }, [faculty]);

  // Derived list with search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = faculty;
    
    if (q) {
      result = result.filter((f) =>
        [f.name, f.subject, f.department, f.email]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [faculty, query]);

  // Open modal with details
  const openDetails = (f) => setSelected(f);
  const closeDetails = () => setSelected(null);

  // Check if user can update status
  const canUpdateStatus = (f) => {
    if (!isAuthenticated) return false;
    if (isAdmin) return true;
    return user?.email && f?.email && user.email.toLowerCase() === f.email.toLowerCase();
  };

  // Update status
  const updateStatus = async (f, newStatus) => {
    try {
      setUpdating(true);
      await facultyAPI.updateStatus(f._id, newStatus);
      setFaculty((prev) => prev.map((p) => (p._id === f._id ? { ...p, status: newStatus } : p)));
      setSelected((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 dark:from-[#000000] dark:via-[#000000] dark:to-[#000000] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-600">
              Our Faculty
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
              Meet the dedicated educators powering Teachify
            </p>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, subject..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl p-4">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <svg className="w-10 h-10 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No faculty members found matching your search.</p>
            {(query || subjectFilter) && (
              <button
                onClick={() => {
                  setQuery('');
                  setSubjectFilter('');
                }}
                className="mt-4 px-4 py-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((f, idx) => (
              <div
                key={f._id || idx}
                className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 p-6 overflow-hidden"
                style={{ 
                  animation: `fadeInUp 600ms ease ${(idx % 12) * 50}ms both`,
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-blue-500/0 group-hover:from-primary-500/5 group-hover:to-blue-500/5 rounded-2xl transition-all duration-500 pointer-events-none"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <StatusBadge status={f.status || 'Available'} />
                  </div>

                  {/* Avatar and Name Section */}
                  <div className="flex flex-col items-center text-center mb-4 pt-2">
                    <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                      <Avatar name={f.name} src={f.photoUrl} size="large" />
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {f.name}
                      </h3>
                      {f.verified && <VerifiedBadge />}
                    </div>
                    <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm mt-1">
                      {f.subject}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                      {f.department}
                    </p>
                    
                    {/* Rating */}
                    <div className="mt-2">
                      <Rating rating={parseFloat(f.rating)} />
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 line-clamp-3 text-center min-h-[3.75rem]">
                    {f.bio || 'Passionate educator dedicated to student success and innovative teaching methods.'}
                  </p>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => openDetails(f)}
                      className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <span>View More</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Status Update Chips (if authorized) */}
                    {canUpdateStatus(f) && (
                      <div className="flex items-center gap-2">
                        {['Available', 'Busy', 'On Leave'].map((s) => {
                          const isActive = (f.status || 'Available').toLowerCase() === s.toLowerCase();
                          return (
                            <button
                              key={s}
                              disabled={updating}
                              onClick={() => updateStatus(f, s)}
                              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border-2 transition-all duration-200 transform hover:scale-105 ${
                                isActive
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-md'
                                  : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Modal */}
        {selected && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_200ms_ease_forwards]"
            onClick={closeDetails}
          >
            <div 
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md w-full max-w-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 animate-[slideUp_300ms_ease_forwards] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <Avatar name={selected.name} src={selected.photoUrl} size="large" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selected.name}
                        </h3>
                        {selected.verified && <VerifiedBadge />}
                      </div>
                      <p className="text-primary-600 dark:text-primary-400 font-semibold text-lg">
                        {selected.subject}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {selected.department}
                      </p>
                      <div className="mt-2">
                        <Rating rating={parseFloat(selected.rating)} />
                      </div>
                    </div>
                    <StatusBadge status={selected.status || 'Available'} />
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mt-4 leading-relaxed">
                    {selected.bio || 'No additional bio provided.'}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selected.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{selected.email}</span>
                    </div>
                  )}
                  {selected.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{selected.phone}</span>
                    </div>
                  )}
                  {selected.office && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 sm:col-span-2">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{selected.office}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Update Section */}
              {canUpdateStatus(selected) && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Update Status:
                  </label>
                  <div className="flex gap-2">
                    {['Available', 'Busy', 'On Leave'].map((s) => {
                      const isActive = (selected.status || 'Available').toLowerCase() === s.toLowerCase();
                      return (
                        <button
                          key={s}
                          disabled={updating}
                          onClick={() => {
                            updateStatus(selected, s);
                            setTimeout(() => closeDetails(), 500);
                          }}
                          className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 transform hover:scale-105 ${
                            isActive
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-lg'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-600'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updating && isActive ? 'Updating...' : s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={closeDetails}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                {canUpdateStatus(selected) && (
                  <Link
                    to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                    onClick={closeDetails}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-center transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom Animations */}
        <style>{`
          @keyframes fadeInUp {
            from { 
              opacity: 0; 
              transform: translate3d(0, 30px, 0) scale(0.95); 
            }
            to { 
              opacity: 1; 
              transform: translate3d(0, 0, 0) scale(1); 
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0; 
              transform: translateY(20px) scale(0.95); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Faculty;
