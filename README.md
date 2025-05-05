# Simple Exam Web App

A minimal yet functional web application for taking and managing online exams.

## Features

### User Features
- User registration and login system
- Exam interface with:
  - One question at a time display
  - Next/Previous navigation
  - Question marking for review
  - Countdown timer
  - Navigation panel showing answered/marked/unanswered questions
  - Exam submission

### Admin Features
- Admin login panel
- Dashboard for:
  - Exam editing
  - Question management (MCQ, written answer, True/False)
  - User performance tracking
  - Results viewing

## Project Structure
```
simple-exam-web-app/
│
├── index.html                # Landing page (Login/Register)
├── exam.html                 # Exam interface (for users)
├── admin.html                # Admin dashboard
│
├── css/
│   └── style.css            # Shared styles
│
├── js/
│   ├── auth.js              # Login/Registration logic
│   ├── exam.js              # Exam logic
│   ├── admin.js             # Admin panel logic
│   ├── storage.js           # LocalStorage helper functions
│   └── data.js              # Initial questions & mock data
│
└── assets/                  # Images and other assets
```

## Setup
1. Clone the repository
2. Open `index.html` in a web browser
3. Register a new account or use the admin credentials:
   - Username: admin
   - Password: admin123

## Technical Details
- Built with vanilla HTML, CSS, and JavaScript
- Uses localStorage for data persistence
- No external dependencies required

## Notes
- This is a demo application and uses localStorage for data storage
- Not recommended for production use without proper security measures
