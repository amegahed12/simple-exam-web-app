// Toggle between login and registration forms
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // Toggle the 'hidden' class to show/hide forms
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission
    
    // Get username and password from input fields
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    console.log('Attempting login for:', username);
    
    // Retrieve user data from storage
    const user = getUser(username);
    console.log('Retrieved user:', user);
    
    // Check if user exists
    if (!user) {
        alert('User not found');
        return false;
    }
    
    // Check if password matches
    if (user.password !== password) {
        alert('Invalid password');
        return false;
    }
    
    // Set current user and redirect to appropriate dashboard
    setCurrentUser(username);
    console.log('Current user set to:', username);
    
    // Add a small delay before redirecting to ensure storage is updated
    setTimeout(() => {
        if (user.isAdmin) {
            window.location.href = 'admin.html'; // Redirect admin
        } else {
            window.location.href = 'exam.html'; // Redirect regular user
        }
    }, 100);
    
    return false;
}

// Handle registration form submission
function handleRegistration(event) {
    event.preventDefault(); // Prevent default form submission
    
    // Get registration form values
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    console.log('Attempting registration for:', username);
    
    // Validate input: passwords must match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return false;
    }
    
    // Validate input: password length
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return false;
    }
    
    // Check if username already exists
    if (getUser(username)) {
        alert('Username already exists');
        return false;
    }
    
    // Create new user object
    const userData = {
        username,
        password,
        isAdmin: false
    };
    
    console.log('Saving user data:', userData);
    saveUser(username, userData); // Save new user to storage
    
    // Verify user was saved
    const savedUser = getUser(username);
    console.log('Verified saved user:', savedUser);
    
    if (savedUser) {
        alert('Registration successful! Please login.');
        toggleForms(); // Switch to login form
    } else {
        alert('Registration failed. Please try again.');
    }
    
    return false;
}

// Check if user is logged in and redirect if not
function checkAuth() {
    const currentUser = getCurrentUser();
    console.log('Checking auth for user:', currentUser);
    
    if (!currentUser) {
        console.log('No current user found, redirecting to login');
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.endsWith('index.html')) {
            window.location.href = 'index.html';
        }
        return;
    }
    
    // Retrieve user object for current user
    const user = getUser(currentUser);
    console.log('Retrieved user for auth check:', user);
    
    if (!user) {
        console.log('User not found, clearing session and redirecting');
        clearCurrentUser();
        window.location.href = 'index.html';
        return;
    }
    
    return user;
}

// Handle logout: clear session and redirect to login
function handleLogout() {
    console.log('Logging out user:', getCurrentUser());
    clearCurrentUser();
    window.location.href = 'index.html';
}
