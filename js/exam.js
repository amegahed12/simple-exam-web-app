// Exam state variables to track progress, answers, and timing
let currentQuestionIndex = 0; // Index of the current question being displayed
let questions = []; // Array to hold all exam questions
let userAnswers = {}; // Object to store user's answers by question ID
let markedQuestions = new Set(); // Set to track questions marked for review
let examTimer = null; // Reference to the timer interval
let timeRemaining = 0; // Time left in seconds

// Initialize the exam when the page loads
function initializeExam() {
    // Check if the user is authenticated
    const user = checkAuth();
    if (!user) return;

    // Load questions from storage
    questions = getQuestions();
    if (questions.length === 0) {
        alert('No questions available');
        handleLogout();
        return;
    }

    // Initialize userAnswers with null for each question
    questions.forEach(q => {
        userAnswers[q.id] = null;
    });

    // Set exam duration from settings (default to 60 minutes if not set)
    const duration = parseInt(localStorage.getItem('exam_duration')) || 60;
    timeRemaining = duration * 60; // Convert minutes to seconds

    // Start the countdown timer
    startTimer();

    // Render the first question and navigation panel
    renderQuestion();
    renderNavigation();
}

// Start the countdown timer and handle time expiration
function startTimer() {
    updateTimerDisplay();
    examTimer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        // If time runs out, submit the exam automatically
        if (timeRemaining <= 0) {
            clearInterval(examTimer);
            submitExam();
        }
    }, 1000);
}

// Update the timer display in the UI
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer').textContent = 
        `Time Remaining: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Render the current question and its options/answer area
function renderQuestion() {
    const question = questions[currentQuestionIndex];
    const container = document.getElementById('questionContainer');
    
    let html = `
        <div class="question-text">
            <strong>Question ${currentQuestionIndex + 1}:</strong> ${question.question}
        </div>
    `;

    // Render MCQ or True/False options as radio buttons
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
        // Render a textarea for written answers
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

    // Insert the generated HTML into the container
    container.innerHTML = html;
    updateNavigationButtons();
}

// Render navigation buttons for each question and update their states
function renderNavigation() {
    const navContainer = document.getElementById('questionNav');
    navContainer.innerHTML = '';

    questions.forEach((_, index) => {
        const button = document.createElement('button');
        button.className = 'nav-button';
        button.textContent = index + 1;
        
        // Highlight the current question
        if (index === currentQuestionIndex) {
            button.classList.add('current');
        }
        // Mark answered questions
        if (userAnswers[questions[index].id] !== null) {
            button.classList.add('answered');
        }
        // Mark questions flagged for review
        if (markedQuestions.has(index)) {
            button.classList.add('marked');
        }

        // Set up navigation to the selected question
        button.onclick = () => goToQuestion(index);
        navContainer.appendChild(button);
    });
}

// Enable/disable navigation buttons based on current position
function updateNavigationButtons() {
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').disabled = currentQuestionIndex === questions.length - 1;
}

// Go to a specific question by index
function goToQuestion(index) {
    currentQuestionIndex = index;
    renderQuestion();
    renderNavigation();
}

// Go to the next question if not at the end
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        goToQuestion(currentQuestionIndex + 1);
    }
}

// Go to the previous question if not at the beginning
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        goToQuestion(currentQuestionIndex - 1);
    }
}

// Save the user's answer for the current question
function saveAnswer(answer) {
    const question = questions[currentQuestionIndex];
    userAnswers[question.id] = answer;
    renderNavigation();
}

// Mark or unmark the current question for review
function markQuestion() {
    if (markedQuestions.has(currentQuestionIndex)) {
        markedQuestions.delete(currentQuestionIndex);
    } else {
        markedQuestions.add(currentQuestionIndex);
    }
    renderNavigation();
}

// Submit the exam, calculate the score, and show results
function submitExam() {
    // Confirm submission with the user
    if (!confirm('Are you sure you want to submit the exam?')) {
        return;
    }

    clearInterval(examTimer); // Stop the timer
    
    const currentUser = getCurrentUser(); // Get the current user's username
    const questions = getQuestions(); // Reload questions from storage
    let score = 0;
    let totalQuestions = questions.length;
    let answeredQuestions = 0;

    // Calculate the user's score and answered questions
    questions.forEach(question => {
        const userAnswer = userAnswers[question.id];
        if (userAnswer !== null) {
            answeredQuestions++;
            if (question.type !== 'written' && userAnswer === question.correctAnswer) {
                score++;
            }
        }
    });

    // Create an attempt object to store the exam results
    const attempt = {
        username: currentUser,
        timestamp: new Date().toISOString(),
        answers: userAnswers,
        timeSpent: (60 * 60 - timeRemaining) / 60, // Time spent in minutes
        markedQuestions: Array.from(markedQuestions),
        score: score,
        totalQuestions: totalQuestions,
        answeredQuestions: answeredQuestions
    };

    saveAttempt(attempt); // Save the attempt to storage
    
    // Prepare and show the results message
    const scorePercentage = (score / totalQuestions * 100).toFixed(1);
    const message = `
Exam submitted successfully!

Your Results:
- Score: ${score} out of ${totalQuestions} (${scorePercentage}%)
- Questions Answered: ${answeredQuestions} out of ${totalQuestions}
- Time Spent: ${Math.floor(attempt.timeSpent)} minutes
    `;
    
    alert(message); // Show the results to the user
    handleLogout(); // Log the user out after submission
}

// Set up the exam when the page finishes loading
document.addEventListener('DOMContentLoaded', initializeExam);
