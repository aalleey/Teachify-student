import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { quizResultsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const subjects = [
    'All Subjects',
    'Mathematics',
    'English',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'History',
    'Geography',
    'Economics',
    'Business'
  ];

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterSubject && filterSubject !== 'All Subjects') {
        params.subject = filterSubject;
      }
      params.timeRange = timeRange;
      
      const response = await quizResultsAPI.getLeaderboard(params);
      setLeaderboard(response.data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [filterSubject, timeRange]);

  const fetchMyRank = useCallback(async () => {
    try {
      const params = filterSubject && filterSubject !== 'All Subjects' ? { subject: filterSubject } : {};
      const response = await quizResultsAPI.getMyRank(params);
      setMyRank(response.data);
    } catch (error) {
      console.error('Error fetching my rank:', error);
    }
  }, [filterSubject]);

  useEffect(() => {
    fetchLeaderboard();
    if (user?.role === 'student') {
      fetchMyRank();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchLeaderboard, fetchMyRank]);

  const filteredLeaderboard = leaderboard.filter(item => {
    if (!item.student) return false;
    return searchTerm === '' || 
      item.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    if (rank === 2) return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    if (rank === 3) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
    return 'bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#000000] transition-colors duration-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Top performers ranked by average quiz scores
          </p>
        </div>

        {/* My Rank Card (for students) */}
        {myRank && user?.role === 'student' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 border-2 border-primary-300 dark:border-primary-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Your Ranking
                  </h3>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        {myRank.rank}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        out of {myRank.totalStudents}
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {myRank.averageScore}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Average Score
                      </div>
                    </div>
                    {myRank.nextTarget && (
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Next Target: {myRank.nextTarget.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {myRank.nextTarget.gap > 0 ? `+${myRank.nextTarget.gap}% ahead` : 'Keep it up!'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Student
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject === 'All Subjects' ? '' : subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Leaderboard Table */}
        {loading ? (
          <Card>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading leaderboard...</p>
            </div>
          </Card>
        ) : filteredLeaderboard.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No students found in leaderboard.</p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Student</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Average Score</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Attempts</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.map((item, index) => {
                    const isCurrentUser = user?.role === 'student' && item.student._id === user._id;
                    const accuracy = item.totalQuestions > 0 
                      ? Math.round((item.totalCorrect / item.totalQuestions) * 100) 
                      : 0;

                    return (
                      <motion.tr
                        key={item.student._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border-b border-gray-200 dark:border-gray-800 transition-colors ${
                          isCurrentUser 
                            ? 'bg-primary-50 dark:bg-primary-900/20' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${getRankColor(item.rank)}`}>
                            {getRankBadge(item.rank)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3 ${
                              isCurrentUser
                                ? 'bg-primary-600 dark:bg-primary-500'
                                : 'bg-gray-400 dark:bg-gray-600'
                            }`}>
                              {item.student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {item.student.name}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs bg-primary-200 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 px-2 py-0.5 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {item.student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {item.averageScore}%
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="text-gray-900 dark:text-gray-100 font-medium">
                            {item.totalAttempts}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <div className="text-gray-900 dark:text-gray-100 font-medium">
                              {accuracy}%
                            </div>
                            <div className="w-16 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full transition-all"
                                style={{ width: `${accuracy}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

