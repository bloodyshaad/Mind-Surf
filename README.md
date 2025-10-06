# MindSurf - Teen Stress Management Platform

A comprehensive web application designed to help teenagers understand, assess, and manage stress effectively.

## Features

- **Interactive Stress Assessment Quiz**: 12-question comprehensive quiz covering 6 stress categories
- **Personalized Results**: Detailed breakdown of stress levels with category-specific insights
- **Educational Content**: Information about stress effects (mental, physical, emotional, social)
- **Evidence-Based Solutions**: 8 proven stress management strategies
- **Admin Dashboard**: Analytics and monitoring tools for administrators
- **User Authentication**: Secure login and registration system

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **Charts**: Chart.js
- **Authentication**: Supabase Auth

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mind-surf
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a Supabase project at https://supabase.com
   - Run the SQL scripts in order:
     - `supabase-setup.sql` - Creates tables and RLS policies
     - `setup-admin.sql` - Sets up admin user (after registration)
     - `verify-setup.sql` - Verifies database setup

4. Update configuration:
   - Edit `js/config.js` with your Supabase credentials

5. Start the server:
```bash
npm start
```

6. Open your browser:
   - Main site: http://localhost:3000
   - Admin dashboard: http://localhost:3000/admin

## Project Structure

```
mind-surf/
├── js/
│   ├── admin.js          # Admin dashboard functionality
│   ├── animations.js     # UI animations and interactions
│   ├── auth.js          # Authentication management
│   ├── config.js        # Configuration settings
│   ├── main.js          # Main application logic
│   └── quiz.js          # Quiz functionality
├── styles/
│   ├── admin.css        # Admin dashboard styles
│   ├── animations.css   # Animation styles
│   ├── auth.css         # Authentication page styles
│   └── main.css         # Main application styles
├── admin.html           # Admin dashboard page
├── index.html           # Main landing page
├── login.html           # Login page
├── signup.html          # Registration page
├── server.js            # Express server
└── package.json         # Project dependencies
```

## Usage

### For Users

1. **Sign Up**: Create an account with your email, name, and age
2. **Take Quiz**: Complete the 12-question stress assessment
3. **View Results**: Get personalized stress analysis and recommendations
4. **Explore Solutions**: Learn evidence-based stress management techniques

### For Administrators

1. **Login**: Use admin credentials to access the dashboard
2. **Overview**: View statistics and charts about user stress levels
3. **Users**: Manage and view detailed user information
4. **Quiz Results**: Analyze individual quiz submissions
5. **Analytics**: Access advanced insights and trends

## Security Features

- Row Level Security (RLS) policies on all database tables
- Secure authentication with Supabase Auth
- Password hashing and secure session management
- Admin-only access controls for sensitive data
- Input validation and sanitization

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (Text, Unique)
- `full_name` (Text)
- `age` (Integer)
- `is_admin` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Quiz Results Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `total_score` (Numeric)
- `stress_percentage` (Integer)
- `stress_level` (Text)
- `category_scores` (JSONB)
- `time_spent_seconds` (Integer)
- `answers` (JSONB)
- `created_at` (Timestamp)

## Stress Categories

1. **Academic**: School work, grades, college pressure
2. **Social**: Peer relationships, social media, fitting in
3. **Family**: Family conflicts, expectations, dynamics
4. **Personal**: Self-identity, body image, future uncertainty
5. **Physical**: Sleep quality, physical symptoms
6. **Lifestyle**: Work-life balance, time management

## Stress Levels

- **Low** (0-30%): Well-managed stress
- **Mild** (31-50%): Some stress, generally manageable
- **Moderate** (51-70%): Noticeable stress affecting daily life
- **High** (71-90%): Concerning stress levels
- **Severe** (91-100%): Requires immediate attention

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or open an issue in the repository.

## Acknowledgments

- Crisis Text Line: Text HOME to 741741
- National Suicide Prevention Lifeline: 988
- NIMH (National Institute of Mental Health) for research resources

## Version History

- **1.0.0** (2024): Initial release
  - Interactive stress assessment quiz
  - User authentication system
  - Admin dashboard with analytics
  - Educational content and solutions
