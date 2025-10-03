# MindSurf 🧠🌊

A comprehensive web application designed to help teenagers understand, manage, and overcome stress, with a focus on public performance anxiety.

## ✨ Features

### Main Website
- **Engaging Homepage** with animated hero section
- **Educational Content** about stress effects (mental, physical, emotional, social)
- **Interactive Quiz** to assess public performance stress levels
- **8 Stress Management Tips** with practical strategies
- **Responsive Design** - works on all devices

### Authentication System
- User registration and login
- Secure password hashing with bcryptjs
- Session management
- Protected routes

### Admin Dashboard
- Real-time statistics and analytics
- Interactive charts (Chart.js)
- User management
- Quiz response tracking
- Multiple admin pages (Dashboard, Users, Responses, Analytics, Settings)
- Fully responsive design

## 🚀 Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Create `.env` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_secret_key
   PORT=3000
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Website: http://localhost:3000
   - Admin: http://localhost:3000/admin

### Deploy to Vercel

See [DEPLOY.md](DEPLOY.md) for complete deployment instructions.

**Quick Deploy:**
```bash
vercel
```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Template Engine**: EJS
- **Authentication**: bcryptjs, express-session
- **Charts**: Chart.js
- **Styling**: Custom CSS with animations
- **Icons**: Font Awesome

## 📱 Responsive Design

Fully optimized for:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1920px+)

## 🔐 Creating an Admin User

1. Register a user through the website
2. Connect to MongoDB Atlas
3. Find the user in `users` collection
4. Set `isAdmin: true`

## 📂 Project Structure

```
mind-surf/
├── public/
│   ├── css/          # Stylesheets
│   └── js/           # Client-side JavaScript
├── views/            # EJS templates
├── server.js         # Express server
├── package.json      # Dependencies
├── vercel.json       # Vercel configuration
└── .env             # Environment variables (not in repo)
```

## 🎨 Key Features

- ✅ Full responsive design
- ✅ User authentication
- ✅ Admin dashboard with analytics
- ✅ Interactive quiz system
- ✅ Real-time statistics
- ✅ Data visualization
- ✅ Secure session management
- ✅ Cross-platform compatibility

## 📊 Admin Dashboard Pages

1. **Dashboard** - Overview with stats and charts
2. **Users** - User management and search
3. **Responses** - Quiz response tracking
4. **Analytics** - Detailed data analysis
5. **Settings** - System configuration

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## 📝 License

This project is created for educational purposes.

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

## 📞 Support Resources

The website provides information about stress management and includes references to:
- 988 Suicide & Crisis Lifeline
- Crisis Text Line (Text HOME to 741741)

---

**Made with ❤️ for teen mental health awareness**

**Status**: Production Ready ✅
