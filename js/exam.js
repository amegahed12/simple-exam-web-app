// Exam state
let currentQuestionIndex = 0;
let questions = [];
let userAnswers = {};
let markedQuestions = new Set();
let examTimer = null;
let timeRemaining = 0;

// Initialize exam
function initializeExam() {
    // Check authentication
    const user = checkAuth();
    if (!user) return;

    // Load questions
    questions = getQuestions();
    if (questions.length === 0) {
        alert('No questions available');
        handleLogout();
        return;
    }

    // Initialize user answers
    questions.forEach(q => {
        userAnswers[q.id] = null;
    });

    // Set exam duration from settings
    const duration = parseInt(localStorage.getItem('exam_duration')) || 60;
    timeRemaining = duration * 60; // Convert minutes to seconds

    // Start timer
    startTimer();

    // Render first question
    renderQuestion();
    renderNavigation();
}

// Timer functions
function startTimer() {
    updateTimerDisplay();
    examTimer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(examTimer);
            submitExam();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer').textContent = 
        `Time Remaining: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Question rendering
function renderQuestion() {
    const question = questions[currentQuestionIndex];
    const container = document.getElementById('questionContainer');
    
    let html = `
        <div class="question-text">
            <strong>Question ${currentQuestionIndex + 1}:</strong> ${question.question}
        </div>
    `;

    if (question.type === 'mcq' || question.type === 'true_false') {
        html += '<ul class="options-list">';
        question.options.forEach((option, index) => {
            html += `
                <li class="option-item">
                    <label>
                        <input type="radio" 
                               name="answer" 
                               value="${option}"
                               ${userAnswers[question.id] === option ? 'checked' : ''}
                               onchange="saveAnswer('${option}')">
                        ${option}
                    </label>
                </li>
            `;
        });
        html += '</ul>';
    } else if (question.type === 'written') {
        html += `
            <div class="written-answer">
                <textarea 
                    onchange="saveAnswer(this.value)"
                    placeholder="Type your answer here..."
                    rows="4"
                    style="width: 100%; padding: 10px; margin-top: 10px;"
                >${userAnswers[question.id] || ''}</textarea>
            </div>
        `;
    }

    container.innerHTML = html;
    updateNavigationButtons();
}

// Navigation
function renderNavigation() {
    const navContainer = document.getElementById('questionNav');
    navContainer.innerHTML = '';

    questions.forEach((_, index) => {
        const button = document.createElement('button');
        button.className = 'nav-button';
        button.textContent = index + 1;
        
        if (index === currentQuestionIndex) {
            button.classList.add('current');
        }
        if (userAnswers[questions[index].id] !== null) {
            button.classList.add('answered');
        }
        if (markedQuestions.has(index)) {
            button.classList.add('marked');
        }

        button.onclick = () => goToQuestion(index);
        navContainer.appendChild(button);
    });
}

function updateNavigationButtons() {
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').disabled = currentQuestionIndex === questions.length - 1;
}

function goToQuestion(index) {
    currentQuestionIndex = index;
    renderQuestion();
    renderNavigation();
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        goToQuestion(currentQuestionIndex + 1);
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        goToQuestion(currentQuestionIndex - 1);
    }
}

// Answer handling
function saveAnswer(answer) {
    const question = questions[currentQuestionIndex];
    userAnswers[question.id] = answer;
    renderNavigation();
}

function markQuestion() {
    if (markedQuestions.has(currentQuestionIndex)) {
        markedQuestions.delete(currentQuestionIndex);
    } else {
        markedQuestions.add(currentQuestionIndex);
    }
    renderNavigation();
}

// Exam submission
function submitExam() {
    if (!confirm('Are you sure you want to submit the exam?')) {
        return;
    }

    clearInterval(examTimer);
    
    const currentUser = getCurrentUser();
    const questions = getQuestions();
    let score = 0;
    let totalQuestions = questions.length;
    let answeredQuestions = 0;

    // Calculate score
    questions.forEach(question => {
        const userAnswer = userAnswers[question.id];
        if (userAnswer !== null) {
            answeredQuestions++;
            if (question.type !== 'written' && userAnswer === question.correctAnswer) {
                score++;
            }
        }
    });

    const attempt = {
        username: currentUser,
        timestamp: new Date().toISOString(),
        answers: userAnswers,
        timeSpent: (60 * 60 - timeRemaining) / 60, // Convert to minutes
        markedQuestions: Array.from(markedQuestions),
        score: score,
        totalQuestions: totalQuestions,
        answeredQuestions: answeredQuestions
    };

    saveAttempt(attempt);
    
    // Show results to user
    const scorePercentage = (score / totalQuestions * 100).toFixed(1);
    const message = `
Exam submitted successfully!

Your Results:
- Score: ${score} out of ${totalQuestions} (${scorePercentage}%)
- Questions Answered: ${answeredQuestions} out of ${totalQuestions}
- Time Spent: ${Math.floor(attempt.timeSpent)} minutes
    `;
    
    alert(message);
    handleLogout();
}

// Initialize exam when page loads
document.addEventListener('DOMContentLoaded', initializeExam);
