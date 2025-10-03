const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// MongoDB URI with database name
const getMongoUri = () => {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set!');
    return null;
  }
  
  // Ensure database name is present
  if (uri.includes('mongodb.net/?')) {
    uri = uri.replace('mongodb.net/?', 'mongodb.net/mindsurf?');
  }
  
  return uri;
};

const mongoUri = getMongoUri();

// Session store setup
let store;
if (mongoUri) {
  try {
    store = MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: 'native',
      touchAfter: 0, // Always update
      stringify: false,
      mongoOptions: {
        serverSelectionTimeoutMS: 5000, // Reduce timeout
        socketTimeoutMS: 10000,
        connectTimeoutMS: 5000
      }
    });
    
    store.on('create', (sid) => console.log('✓ Session created:', sid));
    store.on('touch', (sid) => console.log('✓ Session touched:', sid));
    store.on('update', (sid) => console.log('✓ Session updated:', sid));
    store.on('set', (sid) => console.log('✓ Session set:', sid));
    store.on('destroy', (sid) => console.log('✓ Session destroyed:', sid));
    store.on('error', (err) => console.error('✗ Session store error:', err));
    
    console.log('✓ MongoDB session store initialized successfully');
  } catch (error) {
    console.error('✗ Failed to create MongoDB session store:', error);
    store = null;
  }
} else {
  console.error('✗ MONGODB_URI not set - sessions will NOT persist!');
}

// Session middleware
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-this',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: store,
  proxy: true, // Trust the reverse proxy
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    secure: isProduction, // Use secure cookies in production (HTTPS)
    sameSite: 'lax', // 'lax' works for same-site requests
    path: '/'
  },
  name: 'sessionId'
}));

// Debug middleware - log every request with session info
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('User authenticated:', !!req.session?.userId);
  next();
});

// MongoDB Connection for app data
let cachedDb = null;

async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    cachedDb = mongoose.connection;
    console.log('MongoDB connected successfully');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

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

const User = mongoose.models.User || mongoose.model('User', userSchema);
const QuizResponse = mongoose.models.QuizResponse || mongoose.model('QuizResponse', quizResponseSchema);

// Auth middleware
const isAuthenticated = (req, res, next) => {
  console.log('Auth check - Session:', req.session.userId ? 'exists' : 'missing');
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.isAdmin) {
    return next();
  }
  res.status(403).send('Access denied');
};

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    user: req.session && req.session.userId ? req.session : null 
  });
});

app.get('/login', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }
  res.render('login', { error: null });
});

app.get('/register', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
  try {
    await connectDB();
    
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.render('register', { error: 'All fields are required' });
    }

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
    console.log('User registered:', username);
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('register', { error: `Registration failed: ${error.message}` });
  }
});

app.post('/login', async (req, res) => {
  try {
    await connectDB();
    
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    if (!username || !password) {
      return res.render('login', { error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.render('login', { error: 'Invalid username or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', username);
      return res.render('login', { error: 'Invalid username or password' });
    }

    console.log('Credentials valid, setting up session for:', username);
    console.log('Session before login:', req.session);

    // Set session data directly (skip regenerate for now to test)
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.isAdmin = user.isAdmin;

    console.log('Session after setting data:', req.session);

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        return res.render('login', { error: 'Login failed. Please try again.' });
      }

      console.log('✅ Session saved successfully!');
      console.log('Session ID:', req.sessionID);
      console.log('Session data:', {
        userId: req.session.userId,
        username: req.session.username,
        isAdmin: req.session.isAdmin
      });
      
      if (user.isAdmin) {
        return res.redirect('/admin');
      }
      return res.redirect('/');
    });
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: 'Login failed. Please try again.' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

app.get('/quiz', isAuthenticated, (req, res) => {
  res.render('quiz', { user: req.session });
});

app.post('/submit-quiz', isAuthenticated, async (req, res) => {
  try {
    await connectDB();
    
    const { q1, q2, q3, q4 } = req.body;
    
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
    console.error('Quiz submission error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit quiz' });
  }
});

app.get('/admin', isAdmin, async (req, res) => {
  try {
    await connectDB();
    
    const totalUsers = await User.countDocuments();
    const totalQuizzes = await QuizResponse.countDocuments();
    const quizResponses = await QuizResponse.find().sort({ createdAt: -1 }).limit(50);
    
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
    console.error('Admin dashboard error:', error);
    res.status(500).send('Error loading admin dashboard');
  }
});

app.get('/admin/users', isAdmin, async (req, res) => {
  try {
    await connectDB();
    
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
    console.error('Admin users error:', error);
    res.status(500).send('Error loading users page');
  }
});

app.get('/admin/responses', isAdmin, async (req, res) => {
  try {
    await connectDB();
    
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
    console.error('Admin responses error:', error);
    res.status(500).send('Error loading responses page');
  }
});

app.get('/admin/analytics', isAdmin, async (req, res) => {
  try {
    await connectDB();
    
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
    console.error('Admin analytics error:', error);
    res.status(500).send('Error loading analytics page');
  }
});

app.get('/admin/settings', isAdmin, async (req, res) => {
  try {
    res.render('admin-settings', {
      user: req.session
    });
  } catch (error) {
    console.error('Admin settings error:', error);
    res.status(500).send('Error loading settings page');
  }
});

app.get('/api/admin/stats', isAdmin, async (req, res) => {
  try {
    await connectDB();
    
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
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    sessionStore: store ? 'mongodb' : 'memory'
  });
});

module.exports = app;
