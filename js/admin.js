// Track the ID of the question currently being edited (null if adding a new question)
let editingQuestionId = null;

// Initialize admin dashboard and check admin authentication
function initializeAdmin() {
    // Check if user is admin
    const user = checkAuth();
    if (!user || !user.isAdmin) {
        window.location.href = 'index.html'; // Redirect if not admin
        return;
    }

    // Load exam settings, questions, and user results
    loadExamSettings();
    renderQuestions();
    renderUserResults();

    // Allow closing the modal by clicking outside its content
    document.getElementById('questionModal').addEventListener('click', function(event) {
        if (event.target === this) {
            closeQuestionModal();
        }
    });
}

// Load exam duration from localStorage and set it in the input field
function loadExamSettings() {
    const duration = localStorage.getItem('exam_duration') || 60;
    document.getElementById('examDuration').value = duration;
}

// Save exam duration to localStorage after validation
function saveExamSettings() {
    const duration = parseInt(document.getElementById('examDuration').value);
    if (duration < 1) {
        alert('Exam duration must be at least 1 minute');
        return;
    }
    localStorage.setItem('exam_duration', duration);
    alert('Exam settings saved successfully!');
}

// Render all questions in the admin dashboard
function renderQuestions() {
    const questions = getQuestions();
    const container = document.getElementById('questionList');
    container.innerHTML = '';

    questions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.className = 'question-item';
        questionElement.innerHTML = `
            <h3>${question.question}</h3>
            <p><strong>Type:</strong> ${question.type}</p>
            ${question.type !== 'written' ? `<p><strong>Options:</strong> ${question.options.join(', ')}</p>` : ''}
            ${question.correctAnswer ? `<p><strong>Correct Answer:</strong> ${question.correctAnswer}</p>` : ''}
            <div class="question-actions">
                <button class="btn btn-warning" onclick="editQuestion(${question.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteQuestion(${question.id})">Delete</button>
            </div>
        `;
        container.appendChild(questionElement);
    });
}

// Show the modal form for adding a new question
function showAddQuestionForm() {
    editingQuestionId = null;
    document.getElementById('modalTitle').textContent = 'Add New Question';
    document.getElementById('questionForm').reset();
    updateQuestionForm();
    document.getElementById('questionModal').classList.remove('hidden');
}

// Show the modal form for editing an existing question
function editQuestion(questionId) {
    const questions = getQuestions();
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    editingQuestionId = questionId;
    document.getElementById('modalTitle').textContent = 'Edit Question';
    document.getElementById('questionType').value = question.type;
    document.getElementById('questionText').value = question.question;
    
    updateQuestionForm();
    
    if (question.type === 'mcq') {
        const optionsContainer = document.getElementById('optionsContainer');
        const options = question.options;
        options.forEach((option, index) => {
            const input = optionsContainer.querySelector(`input[name="option${index}"]`);
            if (input) input.value = option;
        });
        document.getElementById('correctAnswer').value = question.correctAnswer || '';
    } else if (question.type === 'true_false') {
        const radio = document.querySelector(`input[name="correctAnswer"][value="${question.correctAnswer}"]`);
        if (radio) radio.checked = true;
    }
    
    document.getElementById('questionModal').classList.remove('hidden');
}

// Dynamically update the question form fields based on the selected type
function updateQuestionForm() {
    const type = document.getElementById('questionType').value;
    const optionsContainer = document.getElementById('optionsContainer');
    
    optionsContainer.innerHTML = '';
    
    if (type === 'mcq') {
        // Add inputs for MCQ options
        for (let i = 0; i < 4; i++) {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.innerHTML = `
                <label for="option${i}">Option ${i + 1}</label>
                <input type="text" id="option${i}" name="option${i}" required>
            `;
            optionsContainer.appendChild(div);
        }
        // Add input for correct answer
        const correctAnswerDiv = document.createElement('div');
        correctAnswerDiv.className = 'form-group';
        correctAnswerDiv.innerHTML = `
            <label for="correctAnswer">Correct Answer</label>
            <input type="text" id="correctAnswer" required>
        `;
        optionsContainer.appendChild(correctAnswerDiv);
    } else if (type === 'true_false') {
        // Add radio buttons for True/False
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label>Correct Answer</label>
            <div class="true-false-options">
                <label class="true-false-option">
                    <input type="radio" name="correctAnswer" value="True" required> True
                </label>
                <label class="true-false-option">
                    <input type="radio" name="correctAnswer" value="False"> False
                </label>
            </div>
        `;
        optionsContainer.appendChild(div);
    }
    // For written questions, no additional inputs are needed
}

// Handle submission of the question form (add or edit)
function handleQuestionSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const type = document.getElementById('questionType').value;
    const questionText = document.getElementById('questionText').value;
    let options = [];
    let correctAnswer = null;
    
    if (type === 'mcq') {
        for (let i = 0; i < 4; i++) {
            const option = document.getElementById(`option${i}`).value;
            if (!option) {
                alert('Please fill in all options');
                return false;
            }
            options.push(option);
        }
        correctAnswer = document.getElementById('correctAnswer').value;
        if (!correctAnswer) {
            alert('Please specify the correct answer');
            return false;
        }
    } else if (type === 'true_false') {
        options = ['True', 'False'];
        correctAnswer = document.querySelector('input[name="correctAnswer"]:checked')?.value;
        if (!correctAnswer) {
            alert('Please select the correct answer');
            return false;
        }
    } else if (type === 'written') {
        options = [];
        correctAnswer = null;
    }
    
    // Build question object
    const question = {
        type,
        question: questionText,
        options,
        correctAnswer
    };
    
    // Update or add question
    if (editingQuestionId) {
        updateQuestion(editingQuestionId, question);
    } else {
        addQuestion(question);
    }
    
    closeQuestionModal();
    renderQuestions();
    return false;
}

// Close the question modal and reset the form
function closeQuestionModal() {
    const modal = document.getElementById('questionModal');
    modal.classList.add('hidden');
    editingQuestionId = null;
    // Reset form
    document.getElementById('questionForm').reset();
}

// Render user results and exam attempts in the admin dashboard
function renderUserResults() {
    const attempts = getAttempts();
    const users = getUsers();
    const container = document.getElementById('userList');
    container.innerHTML = '';

    // Group attempts by user
    const userAttempts = {};
    attempts.forEach(attempt => {
        if (!userAttempts[attempt.username]) {
            userAttempts[attempt.username] = [];
        }
        userAttempts[attempt.username].push(attempt);
    });

    // Display results for each user
    Object.entries(userAttempts).forEach(([username, attempts]) => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        
        let html = `
            <div class="user-header">
                <h3>${username}</h3>
                <span class="attempt-count">${attempts.length} attempt${attempts.length > 1 ? 's' : ''}</span>
            </div>
            <div class="attempts-list">
        `;

        // Sort attempts by timestamp (newest first)
        attempts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        attempts.forEach(attempt => {
            const date = new Date(attempt.timestamp).toLocaleString();
            const scorePercentage = (attempt.score / attempt.totalQuestions * 100).toFixed(1);
            const timeSpent = Math.floor(attempt.timeSpent);
            
            html += `
                <div class="attempt-item">
                    <div class="attempt-header">
                        <span class="attempt-date">${date}</span>
                        <span class="attempt-score">Score: ${attempt.score}/${attempt.totalQuestions} (${scorePercentage}%)</span>
                    </div>
                    <div class="attempt-details">
                        <p><strong>Time Spent:</strong> ${timeSpent} minutes</p>
                        <p><strong>Questions Answered:</strong> ${attempt.answeredQuestions}/${attempt.totalQuestions}</p>
                        <p><strong>Marked Questions:</strong> ${attempt.markedQuestions.length}</p>
                    </div>
                    <div class="attempt-actions">
                        <button class="btn btn-primary" onclick="viewAttempt('${username}', '${attempt.timestamp}')">View Details</button>
                    </div>
                </div>
            `;
        });

        html += '</div></div>';
        userElement.innerHTML = html;
        container.appendChild(userElement);
    });
}

// Show detailed information about a specific exam attempt
function viewAttempt(username, timestamp) {
    const attempts = getAttempts();
    const attempt = attempts.find(a => a.username === username && a.timestamp === timestamp);
    if (!attempt) return;

    const questions = getQuestions();
    let details = `
Exam Details for ${username}
Date: ${new Date(attempt.timestamp).toLocaleString()}
Score: ${attempt.score}/${attempt.totalQuestions} (${(attempt.score/attempt.totalQuestions*100).toFixed(1)}%)
Time Spent: ${Math.floor(attempt.timeSpent)} minutes
Questions Answered: ${attempt.answeredQuestions}/${attempt.totalQuestions}

Detailed Answers:
`;

    questions.forEach(question => {
        const answer = attempt.answers[question.id];
        details += `\nQuestion: ${question.question}`;
        details += `\nAnswer: ${answer || 'Not answered'}`;
        if (question.type !== 'written' && question.correctAnswer) {
            details += `\nCorrect Answer: ${question.correctAnswer}`;
            details += `\nStatus: ${answer === question.correctAnswer ? '✓ Correct' : '✗ Incorrect'}`;
        }
        details += '\n';
    });

    alert(details);
}

// Delete a question after confirmation and refresh the list
function deleteQuestion(questionId) {
    if (confirm('Are you sure you want to delete this question?')) {
        const questions = getQuestions();
        const filteredQuestions = questions.filter(q => q.id !== questionId);
        saveQuestions(filteredQuestions);
        renderQuestions(); // Refresh the questions list
    }
}

// Initialize admin dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeAdmin);
