// Storage keys
const STORAGE_KEYS = {
    USERS: 'exam_app_users',
    QUESTIONS: 'exam_app_questions',
    ATTEMPTS: 'exam_app_attempts',
    CURRENT_USER: 'exam_app_current_user'
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

// User management
function getUsers() {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    console.log('Retrieved users:', users);
    return users;
}

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

function getUser(username) {
    const users = getUsers();
    const user = users[username];
    console.log('Retrieved user for username:', username, user);
    return user;
}

// Question management
function getQuestions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
}

function saveQuestions(questions) {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
}

function addQuestion(question) {
    const questions = getQuestions();
    question.id = questions.length + 1;
    questions.push(question);
    saveQuestions(questions);
}

function updateQuestion(questionId, updatedQuestion) {
    const questions = getQuestions();
    const index = questions.findIndex(q => q.id === questionId);
    if (index !== -1) {
        questions[index] = { ...questions[index], ...updatedQuestion };
        saveQuestions(questions);
    }
}

function deleteQuestion(questionId) {
    const questions = getQuestions();
    const filteredQuestions = questions.filter(q => q.id !== questionId);
    saveQuestions(filteredQuestions);
}

// Attempt management
function getAttempts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '[]');
}

function saveAttempt(attempt) {
    const attempts = getAttempts();
    attempts.push(attempt);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
}

function getUserAttempts(username) {
    const attempts = getAttempts();
    return attempts.filter(attempt => attempt.username === username);
}

// Current user management
function setCurrentUser(username) {
    console.log('Setting current user to:', username);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
}

function getCurrentUser() {
    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    console.log('Getting current user:', currentUser);
    return currentUser;
}

function clearCurrentUser() {
    console.log('Clearing current user');
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Initialize storage when the script loads
initializeStorage();
