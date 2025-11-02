import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { usersAPI } from '../services/api';
import Card from './Card';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    pendingApproval: 0,
    blockedUsers: 0,
    approvedUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, students, teachers, pending, blocked, approved
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      
      // When filter is 'all', don't set any filters - API will return all non-admin users
      if (filter === 'students') {
        params.role = 'student';
      } else if (filter === 'teachers') {
        params.role = 'faculty';
      } else if (filter === 'pending') {
        params.isApproved = 'false';
        params.isBlocked = 'false';
      } else if (filter === 'blocked') {
        params.isBlocked = 'true';
      } else if (filter === 'approved') {
        params.isApproved = 'true';
        params.isBlocked = 'false';
      }
      // filter === 'all' means no specific filters
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      console.log('Fetching users with params:', params);
      const response = await usersAPI.getAll(params);
      console.log('Users API response:', response);
      console.log('Response data:', response.data);
      
      // Axios automatically parses JSON, so response.data should be the array directly
      const usersData = Array.isArray(response.data) ? response.data : [];
      console.log('Parsed users data:', usersData, 'Count:', usersData.length);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response);
      setUsers([]);
      alert('Failed to fetch users: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await usersAPI.getStats();
      console.log('Stats response:', response);
      console.log('Stats data:', response.data);
      setStats(response.data || {
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        pendingApproval: 0,
        blockedUsers: 0,
        approvedUsers: 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      console.error('Error response:', error.response);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [filter, fetchStats, fetchUsers]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchUsers]);

  const handleApprove = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this user?')) return;
    
    try {
      await usersAPI.approve(userId);
      await fetchUsers();
      await fetchStats();
    } catch (error) {
      alert('Failed to approve user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBlock = async (userId) => {
    if (!window.confirm('Are you sure you want to block this user?')) return;
    
    try {
      await usersAPI.block(userId);
      await fetchUsers();
      await fetchStats();
    } catch (error) {
      alert('Failed to block user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUnblock = async (userId) => {
    if (!window.confirm('Are you sure you want to unblock this user?')) return;
    
    try {
      await usersAPI.unblock(userId);
      await fetchUsers();
      await fetchStats();
    } catch (error) {
      alert('Failed to unblock user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to revoke approval for this user?')) return;
    
    try {
      await usersAPI.reject(userId);
      await fetchUsers();
      await fetchStats();
    } catch (error) {
      alert('Failed to revoke approval: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (userId) => {
    const userName = users.find(u => u._id === userId)?.name || 'this user';
    if (!window.confirm(`⚠️ WARNING: Are you sure you want to permanently delete ${userName}?\n\nThis action cannot be undone!`)) return;
    
    // Double confirmation for delete
    if (!window.confirm(`Are you absolutely certain? This will permanently delete ${userName} and all their data.`)) return;
    
    try {
      console.log('Deleting user with ID:', userId);
      console.log('API delete call:', usersAPI.delete);
      const response = await usersAPI.delete(userId);
      console.log('Delete response:', response);
      await fetchUsers();
      await fetchStats();
    } catch (error) {
      console.error('Delete error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method
      });
      alert('Failed to delete user: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    }
  };

  const getStatusBadge = (user) => {
    if (user.isBlocked) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          🚫 Blocked
        </span>
      );
    }
    if (!user.isApproved) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
          ⏳ Pending
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        ✅ Approved
      </span>
    );
  };

  const getRoleBadge = (role) => {
    if (role === 'student') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
          🎓 Student
        </span>
      );
    } else if (role === 'faculty') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
          👨‍🏫 Teacher
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalUsers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Users</div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.approvedUsers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Approved</div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pendingApproval}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending</div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.blockedUsers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Blocked</div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalStudents}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Students</div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.totalTeachers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Teachers</div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white dark:bg-[#0d0d0d]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="md:w-64">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Users</option>
              <option value="students">Students</option>
              <option value="teachers">Teachers</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users List */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading users...</p>
          </div>
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
              No users found{filter !== 'all' ? ' matching your criteria' : ''}.
            </p>
            {filter === 'all' && (
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Try registering a new student or teacher to see them here.
              </p>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#0d0d0d] rounded-xl shadow-lg border border-gray-200 dark:border-[#1a1a1a] p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    {getRoleBadge(user.role)}
                    {user.role === 'faculty' && user.majorSubject && (
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {user.majorSubject}
                      </span>
                    )}
                  </div>
                  {getStatusBadge(user)}
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex gap-2 flex-1">
                  {!user.isApproved && !user.isBlocked && (
                    <button
                      onClick={() => handleApprove(user._id)}
                      className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                    >
                      ✅ Approve
                    </button>
                  )}
                  {user.isApproved && !user.isBlocked && (
                    <button
                      onClick={() => handleReject(user._id)}
                      className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
                    >
                      ❌ Revoke
                    </button>
                  )}
                  {!user.isBlocked ? (
                    <button
                      onClick={() => handleBlock(user._id)}
                      className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                      🚫 Block
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnblock(user._id)}
                      className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      🔓 Unblock
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(user._id)}
                  className="px-3 py-2 text-sm font-semibold rounded-lg bg-gray-800 hover:bg-gray-900 dark:bg-red-800 dark:hover:bg-red-900 text-white transition-colors"
                  title="Permanently delete this user"
                >
                  🗑️ Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;

