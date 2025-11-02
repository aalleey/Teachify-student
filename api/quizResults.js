const express = require('express');
const { body, validationResult } = require('express-validator');
const { connectToDatabase } = require('./_utils');
const QuizResult = require('../server/models/QuizResult');
const MCQ = require('../server/models/MCQ');
const User = require('../server/models/User');
const { auth } = require('../server/middleware/auth');

const app = express();

// Enable CORS for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database connection
let dbReady = false;
connectToDatabase().then(() => {
  dbReady = true;
}).catch(err => {
  console.error('Database connection failed:', err);
});

// Submit quiz results
app.post('/submit', auth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student role required.' });
    }

    const { subject, chapter, answers } = req.body;

    if (!subject || !chapter || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Subject, chapter, and answers array are required' });
    }

    // Validate and calculate score
    let correctCount = 0;
    let totalQuestions = answers.length;
    const detailedAnswers = [];

    for (const answer of answers) {
      const mcq = await MCQ.findById(answer.questionId);
      if (!mcq) {
        return res.status(400).json({ message: `MCQ with ID ${answer.questionId} not found` });
      }

      const isCorrect = mcq.correctAnswer.toLowerCase() === answer.selectedAnswer.toLowerCase();
      if (isCorrect) correctCount++;

      detailedAnswers.push({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer.toLowerCase(),
        isCorrect
      });
    }

    const score = Math.round((correctCount / totalQuestions) * 100);
    const wrongAnswers = totalQuestions - correctCount;

    // Save quiz result
    const quizResult = new QuizResult({
      studentId: req.user._id,
      subject,
      chapter,
      score,
      totalQuestions,
      correctAnswers: correctCount,
      wrongAnswers,
      answers: detailedAnswers,
      dateAttempted: new Date()
    });

    await quizResult.save();

    // Update student's average score
    const student = await User.findById(req.user._id);
    const oldAverage = student.averageScore || 0;
    const oldAttempts = student.totalAttempts || 0;
    const newAverage = oldAttempts === 0 
      ? score 
      : Math.round(((oldAverage * oldAttempts) + score) / (oldAttempts + 1));
    
    student.averageScore = newAverage;
    student.totalAttempts = oldAttempts + 1;
    student.progressHistory.push({
      subject,
      score,
      date: new Date()
    });
    await student.save();

    // Get questions with explanations
    const questionIds = answers.map(a => a.questionId);
    const questions = await MCQ.find({ _id: { $in: questionIds } });

    res.status(201).json({
      message: 'Quiz submitted successfully',
      result: {
        ...quizResult.toObject(),
        questions: questions.map(q => ({
          _id: q._id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        }))
      },
      summary: {
        totalQuestions,
        correctAnswers: correctCount,
        wrongAnswers,
        score,
        newAverage
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's quiz history
app.get('/my-results', auth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student role required.' });
    }

    const { subject, chapter, limit = 50 } = req.query;
    let filter = { studentId: req.user._id };
    
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    
    const results = await QuizResult.find(filter)
      .sort('-dateAttempted')
      .limit(parseInt(limit));
    
    res.json(results);
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard
app.get('/leaderboard', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const { subject, timeRange = 'all' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    if (timeRange === 'week') {
      dateFilter.dateAttempted = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
    } else if (timeRange === 'month') {
      dateFilter.dateAttempted = { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
    }

    let matchStage = { ...dateFilter };
    if (subject) matchStage.subject = subject;

    const leaderboard = await QuizResult.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$studentId',
          averageScore: { $avg: '$score' },
          totalAttempts: { $sum: 1 },
          totalCorrect: { $sum: '$correctAnswers' },
          totalQuestions: { $sum: '$totalQuestions' }
        }
      },
      { $sort: { averageScore: -1 } },
      { $limit: 100 }
    ]);

    const studentIds = leaderboard.map(item => item._id);
    const students = await User.find({ _id: { $in: studentIds }, role: 'student' })
      .select('name email averageScore totalAttempts');

    const leaderboardData = leaderboard.map((item, index) => {
      const student = students.find(s => s._id.toString() === item._id.toString());
      return {
        rank: index + 1,
        student: student ? {
          _id: student._id,
          name: student.name,
          email: student.email
        } : null,
        averageScore: Math.round(item.averageScore),
        totalAttempts: item.totalAttempts,
        totalCorrect: item.totalCorrect,
        totalQuestions: item.totalQuestions
      };
    }).filter(item => item.student !== null);

    res.json(leaderboardData);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's rank
app.get('/my-rank', auth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const students = await User.find({ role: 'student' })
      .select('name averageScore totalAttempts')
      .sort({ averageScore: -1 });

    const studentRank = students.findIndex(
      s => s._id.toString() === req.user._id.toString()
    ) + 1;

    const nextTarget = studentRank > 1 ? students[studentRank - 2] : null;

    res.json({
      rank: studentRank,
      totalStudents: students.length,
      averageScore: req.user.averageScore || 0,
      totalAttempts: req.user.totalAttempts || 0,
      nextTarget: nextTarget ? {
        name: nextTarget.name,
        averageScore: nextTarget.averageScore,
        gap: (nextTarget.averageScore || 0) - (req.user.averageScore || 0)
      } : null
    });
  } catch (error) {
    console.error('Get student rank error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics (Admin only)
app.get('/analytics', auth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const totalAttempts = await QuizResult.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    const subjectStats = await QuizResult.aggregate([
      {
        $group: {
          _id: '$subject',
          averageScore: { $avg: '$score' },
          totalAttempts: { $sum: 1 },
          totalStudents: { $addToSet: '$studentId' }
        }
      },
      {
        $project: {
          subject: '$_id',
          averageScore: { $round: ['$averageScore', 2] },
          totalAttempts: 1,
          uniqueStudents: { $size: '$totalStudents' }
        }
      },
      { $sort: { totalAttempts: -1 } }
    ]);

    const recentAttempts = await QuizResult.find()
      .sort('-dateAttempted')
      .limit(10)
      .populate('studentId', 'name email');

    res.json({
      totalAttempts,
      totalStudents,
      subjectStats,
      recentAttempts
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = app;

