// Storage keys used for localStorage
const STORAGE_KEYS = {
    USERS: 'exam_app_users', // Key for storing user data
    QUESTIONS: 'exam_app_questions', // Key for storing questions
    ATTEMPTS: 'exam_app_attempts', // Key for storing exam attempts
    CURRENT_USER: 'exam_app_current_user' // Key for storing the current logged-in user
};

// Initialize storage with default data if empty
function initializeStorage() {
    console.log('Initializing storage...');
    
    // Only initialize if storage is completely empty
    if (!localStorage.getItem(STORAGE_KEYS.USERS) && !localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
        console.log('Storage is empty, creating initial data');
        
        // Add default admin user
        const defaultUsers = {
            'admin': {
                username: 'admin',
                password: 'admin123',
                isAdmin: true
            }
        };
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));

        // Add some sample questions
        const defaultQuestions = [
            {
                id: 1,
                type: 'mcq',
                question: 'What is the capital of France?',
                options: ['London', 'Berlin', 'Paris', 'Madrid'],
                correctAnswer: 'Paris'
            },
            {
                id: 2,
                type: 'true_false',
                question: 'The Earth is flat.',
                options: ['True', 'False'],
                correctAnswer: 'False'
            },
            {
                id: 3,
                type: 'written',
                question: 'Explain the concept of gravity in your own words.',
                correctAnswer: null // Written answers need manual grading
            }
        ];
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(defaultQuestions));
    } else {
        console.log('Storage already initialized, skipping initialization');
    }
    
    console.log('Storage initialization complete');
}

// User management functions

// Retrieve all users from storage
function getUsers() {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    console.log('Retrieved users:', users);
    return users;
}

// Save or update a user in storage
function saveUser(username, userData) {
    console.log('Saving user:', username, userData);
    const users = getUsers();
    users[username] = userData;
    try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        console.log('User saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving user:', error);
        return false;
    }
}

// Retrieve a single user by username
function getUser(username) {
    const users = getUsers();
    const user = users[username];
    console.log('Retrieved user for username:', username, user);
    return user;
}

// Question management functions

// Retrieve all questions from storage
function getQuestions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
}

// Save the entire questions array to storage
function saveQuestions(questions) {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
}

// Add a new question to storage
function addQuestion(question) {
    const questions = getQuestions();
    question.id = questions.length + 1;
    questions.push(question);
    saveQuestions(questions);
}

// Update an existing question by ID
function updateQuestion(questionId, updatedQuestion) {
    const questions = getQuestions();
    const index = questions.findIndex(q => q.id === questionId);
    if (index !== -1) {
        questions[index] = { ...questions[index], ...updatedQuestion };
        saveQuestions(questions);
    }
}

// Delete a question by ID
function deleteQuestion(questionId) {
    const questions = getQuestions();
    const filteredQuestions = questions.filter(q => q.id !== questionId);
    saveQuestions(filteredQuestions);
}

// Attempt management functions

// Retrieve all exam attempts from storage
function getAttempts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '[]');
}

// Save a new exam attempt to storage
function saveAttempt(attempt) {
    const attempts = getAttempts();
    attempts.push(attempt);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
}

// Retrieve all attempts for a specific user
function getUserAttempts(username) {
    const attempts = getAttempts();
    return attempts.filter(attempt => attempt.username === username);
}

// Current user management functions

// Set the current logged-in user
function setCurrentUser(username) {
    console.log('Setting current user to:', username);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
}

// Get the current logged-in user
function getCurrentUser() {
    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    console.log('Getting current user:', currentUser);
    return currentUser;
}

// Clear the current user from storage (logout)
function clearCurrentUser() {
    console.log('Clearing current user');
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Initialize storage when the script loads
initializeStorage();
