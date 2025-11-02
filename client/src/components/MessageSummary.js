import React, { useState, useEffect } from 'react';
import { messagesAPI } from '../services/api';
import Card from './Card';
import { format } from 'date-fns';

const MessageSummary = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lastMessage'); // 'lastMessage' or 'count'

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getSummary();
      setSummary(response.data || []);
    } catch (error) {
      console.error('Error fetching message summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSummary = summary.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.studentName.toLowerCase().includes(search) ||
      item.teacherName.toLowerCase().includes(search) ||
      item.subject.toLowerCase().includes(search)
    );
  });

  const sortedSummary = [...filteredSummary].sort((a, b) => {
    if (sortBy === 'lastMessage') {
      return new Date(b.lastMessage) - new Date(a.lastMessage);
    } else {
      return b.messageCount - a.messageCount;
    }
  });

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading message summary...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            📊 Message Summary
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by student, teacher, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="lastMessage">Sort by Recent</option>
              <option value="count">Sort by Message Count</option>
            </select>
          </div>
        </div>

        {sortedSummary.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchTerm ? 'No conversations found matching your search.' : 'No messages yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Student
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Teacher
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Subject
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Messages
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Last Message
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSummary.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {item.studentName}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {item.teacherName}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {item.subject}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold">
                        {item.messageCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                      {item.lastMessage
                        ? format(new Date(item.lastMessage), 'MMM dd, yyyy HH:mm')
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Total conversations: {sortedSummary.length}
        </div>
      </Card>
    </div>
  );
};

export default MessageSummary;

