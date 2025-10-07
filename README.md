# MindSurf - Teen Stress Management Platform

A web application designed to help teenagers understand, assess, and manage stress effectively.

## Features

- Interactive stress assessment quiz
- Personalized stress analysis and recommendations
- User authentication with email/password and Google OAuth
- Admin dashboard for monitoring and analytics
- Quiz history tracking
- Evidence-based stress management strategies

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Backend: Node.js with Express
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Charts: Chart.js

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Create a Supabase project at https://supabase.com
   - Run `supabase-setup.sql` in your Supabase SQL Editor
   - Run `setup-admin.sql` after creating your first admin user
   - Run `verify-setup.sql` to verify the setup

3. Configure the application:
   - Update `js/config.js` with your Supabase credentials

4. Start the server:
```bash
npm start
```

5. Open your browser:
   - Main site: http://localhost:3000
   - Admin dashboard: http://localhost:3000/admin

## Database Setup

The application requires three SQL scripts to be run in order:

1. **supabase-setup.sql** - Creates tables, policies, and triggers
2. **setup-admin.sql** - Grants admin privileges (run after first user registration)
3. **verify-setup.sql** - Verifies the database setup

## Project Structure

```
mind-surf/
├── js/                  # JavaScript modules
│   ├── admin.js        # Admin dashboard
│   ├── animations.js   # UI animations
│   ├── auth.js         # Authentication
│   ├── config.js       # Configuration
│   ├── feedback.js     # User feedback
│   ├── history.js      # Quiz history
│   ├── main.js         # Main app logic
│   ├── quiz.js         # Quiz functionality
│   └── toast.js        # Toast notifications
├── styles/             # CSS stylesheets
├── assets/             # Images and icons
├── admin.html          # Admin dashboard
├── index.html          # Main page
├── login.html          # Login page
├── signup.html         # Registration page
└── server.js           # Express server

```

## License

MIT License

## Support Resources

- Crisis Text Line: Text HOME to 741741
- National Suicide Prevention Lifeline: 988
- NIMH: https://www.nimh.nih.gov/health/topics/child-and-adolescent-mental-health
