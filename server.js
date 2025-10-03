const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Quiz Response Schema
const quizResponseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  responses: [{
    question: String,
    answer: String
  }],
  stressLevel: String,
  createdAt: { type: Date, default: Date.now }
});

const QuizResponse = mongoose.model('QuizResponse', quizResponseSchema);

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.userId && req.session.isAdmin) {
    next();
  } else {
    res.status(403).send('Access denied');
  }
};

// Routes
app.get('/', (req, res) => {
  res.render('index', { user: req.session.userId ? req.session : null });
});

app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  res.render('login', { error: null });
});

app.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render('register', { error: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.render('register', { error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.render('register', { error: 'Registration failed. Please try again.' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.isAdmin = user.isAdmin;

    if (user.isAdmin) {
      res.redirect('/admin');
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'Login failed. Please try again.' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/quiz', isAuthenticated, (req, res) => {
  res.render('quiz', { user: req.session });
});

app.post('/submit-quiz', isAuthenticated, async (req, res) => {
  try {
    const { q1, q2, q3, q4 } = req.body;
    
    // Calculate stress level based on responses
    const responses = [q1, q2, q3, q4];
    const highStressCount = responses.filter(r => r === 'always' || r === 'often').length;
    
    let stressLevel;
    if (highStressCount >= 3) {
      stressLevel = 'High';
    } else if (highStressCount >= 2) {
      stressLevel = 'Moderate';
    } else {
      stressLevel = 'Low';
    }

    const quizResponse = new QuizResponse({
      userId: req.session.userId,
      username: req.session.username,
      responses: [
        { question: 'How often do you feel nervous before speaking in front of others?', answer: q1 },
        { question: 'Do you experience physical symptoms (sweating, shaking) when performing?', answer: q2 },
        { question: 'How often do you worry about being judged by others?', answer: q3 },
        { question: 'Do you avoid situations where you have to perform in public?', answer: q4 }
      ],
      stressLevel
    });

    await quizResponse.save();
    res.json({ success: true, stressLevel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to submit quiz' });
  }
});

app.get('/admin', isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuizzes = await QuizResponse.countDocuments();
    const quizResponses = await QuizResponse.find().sort({ createdAt: -1 }).limit(50);
    
    // Calculate stress level distribution
    const stressDistribution = await QuizResponse.aggregate([
      { $group: { _id: '$stressLevel', count: { $sum: 1 } } }
    ]);

    res.render('admin', {
      user: req.session,
      totalUsers,
      totalQuizzes,
      quizResponses,
      stressDistribution
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading admin dashboard');
  }
});

// Admin Users Page
app.get('/admin/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const regularUsers = totalUsers - adminUsers;

    res.render('admin-users', {
      user: req.session,
      users,
      totalUsers,
      adminUsers,
      regularUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading users page');
  }
});

// Admin Quiz Responses Page
app.get('/admin/responses', isAdmin, async (req, res) => {
  try {
    const quizResponses = await QuizResponse.find().sort({ createdAt: -1 });
    const totalResponses = await QuizResponse.countDocuments();
    
    const stressDistribution = await QuizResponse.aggregate([
      { $group: { _id: '$stressLevel', count: { $sum: 1 } } }
    ]);

    res.render('admin-responses', {
      user: req.session,
      quizResponses,
      totalResponses,
      stressDistribution
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading responses page');
  }
});

// Admin Analytics Page
app.get('/admin/analytics', isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuizzes = await QuizResponse.countDocuments();
    
    const stressDistribution = await QuizResponse.aggregate([
      { $group: { _id: '$stressLevel', count: { $sum: 1 } } }
    ]);

    const monthlyActivity = await QuizResponse.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    res.render('admin-analytics', {
      user: req.session,
      totalUsers,
      totalQuizzes,
      stressDistribution,
      monthlyActivity
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading analytics page');
  }
});

// Admin Settings Page
app.get('/admin/settings', isAdmin, async (req, res) => {
  try {
    res.render('admin-settings', {
      user: req.session
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading settings page');
  }
});

app.get('/api/admin/stats', isAdmin, async (req, res) => {
  try {
    const stressDistribution = await QuizResponse.aggregate([
      { $group: { _id: '$stressLevel', count: { $sum: 1 } } }
    ]);

    const recentActivity = await QuizResponse.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);

    res.json({ stressDistribution, recentActivity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
