import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { quizResultsAPI } from '../services/api';
import Card from './Card';

const QuizResultsHistory = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterChapter, setFilterChapter] = useState('');

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterSubject) params.subject = filterSubject;
      if (filterChapter) params.chapter = filterChapter;
      
      const response = await quizResultsAPI.getMyResults(params);
      setResults(response.data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  }, [filterSubject, filterChapter]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Prepare data for charts
  const chartData = results
    .slice()
    .reverse()
    .map((result, index) => ({
      attempt: index + 1,
      score: result.score,
      date: new Date(result.dateAttempted).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      correct: result.correctAnswers,
      total: result.totalQuestions
    }));

  const subjectStats = results.reduce((acc, result) => {
    if (!acc[result.subject]) {
      acc[result.subject] = { total: 0, sum: 0, count: 0 };
    }
    acc[result.subject].total += result.totalQuestions;
    acc[result.subject].sum += result.score;
    acc[result.subject].count += 1;
    return acc;
  }, {});

  const subjectData = Object.entries(subjectStats).map(([subject, stats]) => ({
    subject,
    averageScore: Math.round(stats.sum / stats.count),
    totalAttempts: stats.count
  }));

  const uniqueSubjects = [...new Set(results.map(r => r.subject))].sort();
  const uniqueChapters = filterSubject 
    ? [...new Set(results.filter(r => r.subject === filterSubject).map(r => r.chapter))].sort()
    : [];

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading results...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Quiz Results History
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your performance over time
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select
              value={filterSubject}
              onChange={(e) => {
                setFilterSubject(e.target.value);
                setFilterChapter('');
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          {filterSubject && uniqueChapters.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chapter
              </label>
              <select
                value={filterChapter}
                onChange={(e) => setFilterChapter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
              >
                <option value="">All Chapters</option>
                {uniqueChapters.map((chapter) => (
                  <option key={chapter} value={chapter}>{chapter}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Stats Cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {results.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 mt-2">Total Attempts</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)}%
              </div>
              <div className="text-gray-600 dark:text-gray-400 mt-2">Average Score</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {uniqueSubjects.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 mt-2">Subjects</div>
            </div>
          </Card>
        </div>
      )}

      {/* Charts */}
      {results.length > 0 && (
        <>
          <Card>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Performance Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#8884d8" opacity={0.3} />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis domain={[0, 100]} stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ fill: '#4f46e5', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Average Score by Subject
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#8884d8" opacity={0.3} />
                <XAxis dataKey="subject" stroke="#888" />
                <YAxis domain={[0, 100]} stroke="#888" />
                <Tooltip />
                <Bar dataKey="averageScore" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {/* Results List */}
      {results.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No quiz results found. Start practicing to see your results here!
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Recent Attempts
          </h3>
          {results.map((result) => (
            <motion.div
              key={result._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#0d0d0d] rounded-xl shadow-lg border border-gray-200 dark:border-[#1a1a1a] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded">
                      {result.subject}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                      {result.chapter}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(result.dateAttempted).toLocaleString()}
                  </p>
                </div>
                <div className={`text-3xl font-bold ${
                  result.score >= 80 
                    ? 'text-green-600 dark:text-green-400' 
                    : result.score >= 60 
                    ? 'text-yellow-600 dark:text-yellow-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {result.score}%
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Questions</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {result.totalQuestions}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {result.correctAnswers}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Wrong</div>
                  <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {result.wrongAnswers}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizResultsHistory;

