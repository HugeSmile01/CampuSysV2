const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase Authentication
const auth = firebase.auth();

// Enhanced login function with security features
function login(email, password) {
  // Input validation
  const sanitizedEmail = securityManager.sanitizeHTML(email.trim());
  
  if (!securityManager.validateEmail(sanitizedEmail)) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Email',
      text: 'Please enter a valid email address.',
    });
    return;
  }

  // Rate limiting check
  const rateLimit = securityManager.checkRateLimit(sanitizedEmail, 'login');
  if (!rateLimit.allowed) {
    Swal.fire({
      icon: 'error',
      title: 'Too Many Attempts',
      text: `Too many login attempts. Please try again in ${rateLimit.timeRemaining} minutes.`,
    });
    securityManager.logSecurityEvent('login_rate_limit_exceeded', { email: sanitizedEmail });
    return;
  }

  auth.signInWithEmailAndPassword(sanitizedEmail, password)
    .then((userCredential) => {
      // Login successful
      const user = userCredential.user;
      console.log("Login successful:", user);
      
      // Log successful login
      securityManager.logSecurityEvent('login_success', { 
        userId: user.uid,
        email: user.email 
      });
      
      // Generate and store session token
      const sessionToken = securityManager.generateSecureToken();
      localStorage.setItem('sessionToken', sessionToken);
      localStorage.setItem('loginTime', Date.now().toString());
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Welcome back!',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        // Redirect to homepage
        window.location.href = "index.html";
      });
    })
    .catch((error) => {
      // Handle login errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Login error:", errorCode, errorMessage);
      
      // Log failed login attempt
      securityManager.logSecurityEvent('login_failed', { 
        email: sanitizedEmail,
        errorCode: errorCode,
        errorMessage: errorMessage
      });
      
      // Display user-friendly error message
      let userMessage = 'Login failed. Please check your credentials.';
      if (errorCode === 'auth/user-not-found') {
        userMessage = 'No account found with this email address.';
      } else if (errorCode === 'auth/wrong-password') {
        userMessage = 'Incorrect password. Please try again.';
      } else if (errorCode === 'auth/too-many-requests') {
        userMessage = 'Too many failed attempts. Please try again later.';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: userMessage,
        footer: rateLimit.attemptsRemaining > 0 ? 
          `${rateLimit.attemptsRemaining} attempts remaining` : ''
      });
    });
}

// Enhanced registration function with security features
function register(email, password, confirmPassword) {
  // Input validation
  const sanitizedEmail = securityManager.sanitizeHTML(email.trim());
  
  if (!securityManager.validateEmail(sanitizedEmail)) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Email',
      text: 'Please enter a valid email address.',
    });
    return;
  }

  // Password validation
  const passwordValidation = securityManager.validatePassword(password);
  if (!passwordValidation.isValid) {
    Swal.fire({
      icon: 'error',
      title: 'Weak Password',
      html: 'Password requirements:<br>' + passwordValidation.errors.join('<br>'),
    });
    return;
  }

  // Password confirmation
  if (password !== confirmPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Password Mismatch',
      text: 'Passwords do not match. Please try again.',
    });
    return;
  }

  // Rate limiting check
  const rateLimit = securityManager.checkRateLimit(sanitizedEmail, 'register');
  if (!rateLimit.allowed) {
    Swal.fire({
      icon: 'error',
      title: 'Too Many Attempts',
      text: `Too many registration attempts. Please try again in ${rateLimit.timeRemaining} minutes.`,
    });
    securityManager.logSecurityEvent('register_rate_limit_exceeded', { email: sanitizedEmail });
    return;
  }

  auth.createUserWithEmailAndPassword(sanitizedEmail, password)
    .then((userCredential) => {
      // Registration successful
      const user = userCredential.user;
      console.log("Registration successful:", user);
      
      // Log successful registration
      securityManager.logSecurityEvent('registration_success', { 
        userId: user.uid,
        email: user.email 
      });
      
      // Send email verification
      user.sendEmailVerification()
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Registration Successful',
            text: 'Please check your email to verify your account.',
            confirmButtonText: 'OK'
          }).then(() => {
            // Redirect to login page
            window.location.href = "login.html";
          });
        })
        .catch((error) => {
          console.error("Email verification error:", error);
          Swal.fire({
            icon: 'warning',
            title: 'Registration Successful',
            text: 'Account created successfully, but email verification failed. You can still proceed to login.',
            confirmButtonText: 'Continue to Login'
          }).then(() => {
            window.location.href = "login.html";
          });
        });
    })
    .catch((error) => {
      // Handle registration errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Registration error:", errorCode, errorMessage);
      
      // Log failed registration attempt
      securityManager.logSecurityEvent('registration_failed', { 
        email: sanitizedEmail,
        errorCode: errorCode,
        errorMessage: errorMessage
      });
      
      // Display user-friendly error message
      let userMessage = 'Registration failed. Please try again.';
      if (errorCode === 'auth/email-already-in-use') {
        userMessage = 'An account with this email address already exists.';
      } else if (errorCode === 'auth/weak-password') {
        userMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (errorCode === 'auth/invalid-email') {
        userMessage = 'Invalid email address format.';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: userMessage,
      });
    });
}

// Input validation and error messages
function validateInput(input) {
  if (input.value.trim() === "") {
    input.classList.add("error");
    return false;
  } else {
    input.classList.remove("error");
    return true;
  }
}

// Social media login options
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      // Google login successful
      const user = result.user;
      console.log("Google login successful:", user);
      // Redirect to homepage
      window.location.href = "index.html";
    })
    .catch((error) => {
      // Handle Google login errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Google login error:", errorCode, errorMessage);
      // Display error message to user
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessage,
      });
    });
}

function loginWithFacebook() {
  const provider = new firebase.auth.FacebookAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      // Facebook login successful
      const user = result.user;
      console.log("Facebook login successful:", user);
      
      // Log successful social login
      securityManager.logSecurityEvent('social_login_success', { 
        userId: user.uid,
        email: user.email,
        provider: 'facebook'
      });
      
      // Generate and store session token
      const sessionToken = securityManager.generateSecureToken();
      localStorage.setItem('sessionToken', sessionToken);
      localStorage.setItem('loginTime', Date.now().toString());
      
      // Redirect to homepage
      window.location.href = "index.html";
    })
    .catch((error) => {
      // Handle Facebook login errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Facebook login error:", errorCode, errorMessage);
      
      securityManager.logSecurityEvent('social_login_failed', { 
        errorCode: errorCode,
        provider: 'facebook'
      });
      
      // Display error message to user
      Swal.fire({
        icon: 'error',
        title: 'Facebook Login Failed',
        text: 'Unable to login with Facebook. Please try again.',
      });
    });
}

// Session management functions
function checkSession() {
  const sessionToken = localStorage.getItem('sessionToken');
  const loginTime = localStorage.getItem('loginTime');
  const maxSessionTime = 24 * 60 * 60 * 1000; // 24 hours
  
  if (!sessionToken || !loginTime) {
    return false;
  }
  
  const currentTime = Date.now();
  const timeDiff = currentTime - parseInt(loginTime);
  
  if (timeDiff > maxSessionTime) {
    // Session expired
    logout();
    return false;
  }
  
  return true;
}

function logout() {
  auth.signOut().then(() => {
    // Clear session data
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('loginTime');
    
    securityManager.logSecurityEvent('logout_success');
    
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have been successfully logged out.',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      window.location.href = "login.html";
    });
  }).catch((error) => {
    console.error('Logout error:', error);
    securityManager.logSecurityEvent('logout_failed', { error: error.message });
  });
}

// Password reset function
function resetPassword(email) {
  const sanitizedEmail = securityManager.sanitizeHTML(email.trim());
  
  if (!securityManager.validateEmail(sanitizedEmail)) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Email',
      text: 'Please enter a valid email address.',
    });
    return;
  }

  // Rate limiting check
  const rateLimit = securityManager.checkRateLimit(sanitizedEmail, 'password_reset');
  if (!rateLimit.allowed) {
    Swal.fire({
      icon: 'error',
      title: 'Too Many Attempts',
      text: `Too many password reset attempts. Please try again in ${rateLimit.timeRemaining} minutes.`,
    });
    return;
  }

  auth.sendPasswordResetEmail(sanitizedEmail)
    .then(() => {
      securityManager.logSecurityEvent('password_reset_requested', { email: sanitizedEmail });
      
      Swal.fire({
        icon: 'success',
        title: 'Password Reset Email Sent',
        text: 'Please check your email for password reset instructions.',
      });
    })
    .catch((error) => {
      console.error('Password reset error:', error);
      securityManager.logSecurityEvent('password_reset_failed', { 
        email: sanitizedEmail,
        error: error.code 
      });
      
      let userMessage = 'Failed to send password reset email.';
      if (error.code === 'auth/user-not-found') {
        userMessage = 'No account found with this email address.';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Password Reset Failed',
        text: userMessage,
      });
    });
}

// Initialize session check on protected pages
function initializeSessionCheck() {
  // Skip session check on login and registration pages
  const currentPage = window.location.pathname.split('/').pop();
  const publicPages = ['login.html', 'registration.html', ''];
  
  if (!publicPages.includes(currentPage)) {
    if (!checkSession()) {
      window.location.href = "login.html";
      return;
    }
    
    // Set up periodic session checks
    setInterval(() => {
      if (!checkSession()) {
        Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          confirmButtonText: 'OK'
        }).then(() => {
          window.location.href = "login.html";
        });
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeSessionCheck();
});
