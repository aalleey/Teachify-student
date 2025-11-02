import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mcqsAPI, quizResultsAPI } from '../services/api';
import Card from '../components/Card';

const PracticeMCQs = () => {
  const [searchParams] = useSearchParams();
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [chapter, setChapter] = useState(searchParams.get('chapter') || '');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableChapters, setAvailableChapters] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [mcqs, setMcqs] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timer, setTimer] = useState(null);

  // Fetch available subjects and chapters when component loads
  useEffect(() => {
    fetchAvailableSubjects();
  }, []);

  const fetchChaptersForSubject = useCallback(async (selectedSubject) => {
    try {
      // Fetch MCQs for the selected subject to get available chapters
      const response = await mcqsAPI.getAll({ subject: selectedSubject, limit: 1000 });
      const mcqsForSubject = response.data || [];
      
      // Get unique chapters for this subject
      const chapters = [...new Set(mcqsForSubject.map(mcq => mcq.chapter))].sort();
      setAvailableChapters(chapters);
      
      // Auto-select first chapter if available and none selected
      if (chapters.length > 0 && !chapter) {
        setChapter(chapters[0]);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setAvailableChapters([]);
    }
  }, [chapter]);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (subject) {
      fetchChaptersForSubject(subject);
    } else {
      setAvailableChapters([]);
      setChapter('');
    }
  }, [subject, fetchChaptersForSubject]);

  useEffect(() => {
    if (quizStarted && mcqs.length > 0) {
      // Start timer
      const interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      setTimer(interval);
      return () => clearInterval(interval);
    }
  }, [quizStarted, mcqs]);

  const fetchAvailableSubjects = async () => {
    try {
      setLoadingSubjects(true);
      // Fetch all MCQs to get unique subjects
      const response = await mcqsAPI.getAll({ limit: 1000 });
      const allMCQs = response.data || [];
      
      // Get unique subjects
      const subjects = [...new Set(allMCQs.map(mcq => mcq.subject))].sort();
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleStartQuiz = async () => {
    if (!subject) {
      alert('Please select a subject');
      return;
    }

    try {
      setLoading(true);
      let response;
      
      // If chapter is selected, get MCQs for that specific chapter
      // Otherwise, get MCQs from all chapters of the selected subject
      if (chapter && chapter !== 'all') {
        response = await mcqsAPI.getPractice({ subject, chapter });
      } else {
        // Get all MCQs for the subject (all chapters)
        const allResponse = await mcqsAPI.getAll({ subject, limit: 100 });
        // Remove correctAnswer before showing to students
        response = {
          data: (allResponse.data || []).map(mcq => {
            const { correctAnswer, ...mcqWithoutAnswer } = mcq;
            return mcqWithoutAnswer;
          })
        };
      }
      
      if (!response.data || response.data.length === 0) {
        alert('No MCQs available for this subject' + (chapter && chapter !== 'all' ? ' and chapter' : ''));
        return;
      }
      
      // Shuffle MCQs for better practice
      const shuffled = response.data.sort(() => Math.random() - 0.5);
      setMcqs(shuffled);
      setQuizStarted(true);
      setCurrentQuestion(0);
      setAnswers({});
      setTimeSpent(0);
    } catch (error) {
      console.error('Error fetching MCQs:', error);
      alert('Failed to load MCQs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, selectedAnswer) => {
    setAnswers({
      ...answers,
      [questionId]: selectedAnswer
    });
  };

  const handleNext = () => {
    if (currentQuestion < mcqs.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length < mcqs.length) {
      if (!window.confirm('You have not answered all questions. Submit anyway?')) {
        return;
      }
    }

    try {
      setLoading(true);
      const answersArray = mcqs.map(mcq => ({
        questionId: mcq._id,
        selectedAnswer: answers[mcq._id] || 'a' // Default to 'a' if not answered
      }));

      // For "all chapters", use a generic chapter name or the first chapter from MCQs
      const quizChapter = chapter && chapter !== 'all' 
        ? chapter 
        : (mcqs.length > 0 ? mcqs[0]?.chapter || 'All Chapters' : 'All Chapters');
      
      const response = await quizResultsAPI.submit({
        subject,
        chapter: quizChapter,
        answers: answersArray
      });

      if (timer) clearInterval(timer);
      setResult(response.data);
      setQuizSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuizStarted(false);
    setQuizSubmitted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setMcqs([]);
    setTimeSpent(0);
    if (timer) clearInterval(timer);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mcqs.length > 0 ? ((currentQuestion + 1) / mcqs.length) * 100 : 0;

  if (quizSubmitted && result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#000000] transition-colors duration-300 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#0d0d0d] rounded-xl shadow-lg border border-gray-200 dark:border-[#1a1a1a] p-8"
          >
            <div className="text-center mb-8">
              <div className={`text-6xl mb-4 ${result.summary.score >= 80 ? 'text-green-500' : result.summary.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                {result.summary.score >= 90 ? '🎉' : result.summary.score >= 70 ? '👍' : '📚'}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {result.summary.score >= 90 
                  ? 'Excellent Work!' 
                  : result.summary.score >= 70 
                  ? 'Great Job!' 
                  : 'Keep Practicing!'}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                You scored {result.summary.score}%
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {result.summary.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {result.summary.correctAnswers}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {result.summary.wrongAnswers}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Wrong</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatTime(timeSpent)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Review Your Answers
              </h3>
              {result.result.questions.map((question, index) => {
                const userAnswer = answers[question._id];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div
                    key={question._id}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Question {index + 1}: {question.question}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        isCorrect 
                          ? 'bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300' 
                          : 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                      }`}>
                        {isCorrect ? '✓ Correct' : '✗ Wrong'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {Object.entries(question.options).map(([key, value]) => {
                        const isSelected = userAnswer === key;
                        const isCorrectAnswer = question.correctAnswer === key;
                        return (
                          <div
                            key={key}
                            className={`p-2 rounded ${
                              isCorrectAnswer
                                ? 'bg-green-200 dark:bg-green-900/50 border-2 border-green-500 dark:border-green-400'
                                : isSelected && !isCorrect
                                ? 'bg-red-200 dark:bg-red-900/50 border-2 border-red-500 dark:border-red-400'
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}
                          >
                            <span className="font-medium">{key.toUpperCase()}:</span> {value}
                            {isCorrectAnswer && <span className="ml-2">✓</span>}
                            {isSelected && !isCorrectAnswer && <span className="ml-2">✗</span>}
                          </div>
                        );
                      })}
                    </div>
                    {question.explanation && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Take Another Quiz
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#000000] transition-colors duration-300 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Practice MCQs
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Select a subject to practice MCQs. You can choose a specific chapter or practice from all chapters.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                {loadingSubjects ? (
                  <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                    <span className="text-gray-600 dark:text-gray-400">Loading subjects...</span>
                  </div>
                ) : (
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setChapter(''); // Reset chapter when subject changes
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select Subject</option>
                    {availableSubjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                )}
                {availableSubjects.length === 0 && !loadingSubjects && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    No subjects available. Teachers need to upload MCQs first.
                  </p>
                )}
              </div>

              {subject && availableChapters.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chapter (Optional)
                  </label>
                  <select
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
                  >
                    <option value="all">All Chapters ({availableChapters.length} chapters)</option>
                    {availableChapters.map((ch) => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select a specific chapter or "All Chapters" to practice from all chapters in {subject}
                  </p>
                </div>
              )}

              {subject && availableChapters.length === 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    No chapters found for {subject}. Please check back later or contact your teacher.
                  </p>
                </div>
              )}

              <button
                onClick={handleStartQuiz}
                disabled={loading || !subject || availableChapters.length === 0}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading MCQs...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Quiz {chapter && chapter !== 'all' ? `- ${chapter}` : `- All Chapters`}
                  </>
                )}
              </button>

              {subject && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        {subject} Practice Quiz
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        {chapter === 'all' || !chapter 
                          ? `You'll practice MCQs from all ${availableChapters.length} chapters in ${subject}.`
                          : `You'll practice MCQs from chapter: ${chapter}.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const currentMCQ = mcqs[currentQuestion];
  if (!currentMCQ) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#000000] transition-colors duration-300 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Question {currentQuestion + 1} of {mcqs.length}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Time: {formatTime(timeSpent)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
            <motion.div
              className="bg-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-[#0d0d0d] rounded-xl shadow-lg border border-gray-200 dark:border-[#1a1a1a] p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-1 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded">
              {subject}
            </span>
            {currentMCQ.chapter && (
              <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                {currentMCQ.chapter}
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {currentMCQ.question}
          </h3>

          <div className="space-y-3">
            {['a', 'b', 'c', 'd'].map((option) => (
              <motion.button
                key={option}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswerSelect(currentMCQ._id, option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentMCQ._id] === option
                    ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <span className="font-semibold text-primary-600 dark:text-primary-400 mr-2">
                  {option.toUpperCase()}:
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {currentMCQ.options[option]}
                </span>
                {answers[currentMCQ._id] === option && (
                  <span className="float-right text-primary-600 dark:text-primary-400">✓</span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {currentQuestion < mcqs.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>

        {/* Question Navigation Dots */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {mcqs.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-full transition-colors ${
                index === currentQuestion
                  ? 'bg-primary-600 text-white'
                  : answers[mcqs[index]._id]
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PracticeMCQs;

