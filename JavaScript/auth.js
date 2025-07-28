// Firebase config is now loaded from config.js

// Firebase config is now loaded from config.js

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase Authentication
const auth = firebase.auth();

// Security Manager
class SecurityManager {
  constructor() {
    this.loginAttempts = {};
    this.maxAttempts = appConfig.security.maxLoginAttempts;
    this.lockoutTime = appConfig.security.lockoutTime;
  }

  isAccountLocked(email) {
    const attempts = this.loginAttempts[email];
    if (!attempts) return false;
    
    const now = Date.now();
    if (attempts.count >= this.maxAttempts && (now - attempts.lastAttempt) < this.lockoutTime) {
      return true;
    }
    
    // Reset if lockout time has passed
    if ((now - attempts.lastAttempt) >= this.lockoutTime) {
      delete this.loginAttempts[email];
      return false;
    }
    
    return false;
  }

  recordFailedAttempt(email) {
    const now = Date.now();
    if (!this.loginAttempts[email]) {
      this.loginAttempts[email] = { count: 0, lastAttempt: now };
    }
    
    this.loginAttempts[email].count++;
    this.loginAttempts[email].lastAttempt = now;
  }

  clearFailedAttempts(email) {
    delete this.loginAttempts[email];
  }

  getRemainingLockoutTime(email) {
    const attempts = this.loginAttempts[email];
    if (!attempts) return 0;
    
    const elapsed = Date.now() - attempts.lastAttempt;
    const remaining = this.lockoutTime - elapsed;
    return remaining > 0 ? remaining : 0;
  }
}

const securityManager = new SecurityManager();

// Enhanced Login function with security
function login(email, password) {
  // Check if account is locked
  if (securityManager.isAccountLocked(email)) {
    const remainingTime = Math.ceil(securityManager.getRemainingLockoutTime(email) / 1000 / 60);
    toastManager.show(`Account locked. Try again in ${remainingTime} minutes.`, 'error');
    return;
  }

  loadingManager.show('Signing in...');

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Login successful
      const user = userCredential.user;
      console.log("Login successful:", user);
      
      // Clear failed attempts
      securityManager.clearFailedAttempts(email);
      
      // Show success message
      toastManager.show('Login successful!', 'success');
      
      // Redirect to homepage
      setTimeout(() => {
        window.location.href = appConfig.auth.redirectAfterLogin || "index.html";
      }, 1000);
    })
    .catch((error) => {
      // Handle login errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Login error:", errorCode, errorMessage);
      
      // Record failed attempt
      securityManager.recordFailedAttempt(email);
      
      // Display error message to user
      let message = 'Login failed. Please check your credentials.';
      if (errorCode === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (errorCode === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (errorCode === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      
      toastManager.show(message, 'error');
    })
    .finally(() => {
      loadingManager.hide();
    });
}

// Enhanced Registration function
function register(email, password) {
  loadingManager.show('Creating account...');

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Registration successful
      const user = userCredential.user;
      console.log("Registration successful:", user);
      
      // Show success message
      toastManager.show('Account created successfully!', 'success');
      
      // Redirect to homepage
      setTimeout(() => {
        window.location.href = appConfig.auth.redirectAfterLogin || "index.html";
      }, 1000);
    })
    .catch((error) => {
      // Handle registration errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Registration error:", errorCode, errorMessage);
      
      let message = 'Registration failed. Please try again.';
      if (errorCode === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      } else if (errorCode === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (errorCode === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      
      toastManager.show(message, 'error');
    })
    .finally(() => {
      loadingManager.hide();
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

// Enhanced social media login options
function loginWithGoogle() {
  loadingManager.show('Signing in with Google...');
  
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      // Google login successful
      const user = result.user;
      console.log("Google login successful:", user);
      
      toastManager.show('Google login successful!', 'success');
      
      setTimeout(() => {
        window.location.href = appConfig.auth.redirectAfterLogin || "index.html";
      }, 1000);
    })
    .catch((error) => {
      // Handle Google login errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Google login error:", errorCode, errorMessage);
      
      let message = 'Google login failed. Please try again.';
      if (errorCode === 'auth/popup-closed-by-user') {
        message = 'Login cancelled.';
      }
      
      toastManager.show(message, 'error');
    })
    .finally(() => {
      loadingManager.hide();
    });
}

function loginWithFacebook() {
  loadingManager.show('Signing in with Facebook...');
  
  const provider = new firebase.auth.FacebookAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      // Facebook login successful
      const user = result.user;
      console.log("Facebook login successful:", user);
      
      toastManager.show('Facebook login successful!', 'success');
      
      setTimeout(() => {
        window.location.href = appConfig.auth.redirectAfterLogin || "index.html";
      }, 1000);
    })
    .catch((error) => {
      // Handle Facebook login errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Facebook login error:", errorCode, errorMessage);
      
      let message = 'Facebook login failed. Please try again.';
      if (errorCode === 'auth/popup-closed-by-user') {
        message = 'Login cancelled.';
      }
      
      toastManager.show(message, 'error');
    })
    .finally(() => {
      loadingManager.hide();
    });
}

// Logout function
function logout() {
  loadingManager.show('Signing out...');
  
  auth.signOut().then(() => {
    toastManager.show('Logged out successfully', 'success');
    setTimeout(() => {
      window.location.href = appConfig.auth.redirectAfterLogout || "login.html";
    }, 1000);
  }).catch((error) => {
    console.error('Logout error:', error);
    toastManager.show('Logout failed', 'error');
  }).finally(() => {
    loadingManager.hide();
  });
}

// Auth state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User is signed in:', user);
    // Update UI for authenticated user
    updateUIForAuthenticatedUser(user);
  } else {
    console.log('User is signed out');
    // Update UI for unauthenticated user
    updateUIForUnauthenticatedUser();
  }
});

function updateUIForAuthenticatedUser(user) {
  const userEmail = document.getElementById('user-email');
  const userAvatar = document.getElementById('user-avatar');
  const loginLink = document.getElementById('login-link');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (userEmail) userEmail.textContent = user.email;
  if (userAvatar) userAvatar.src = user.photoURL || 'images/user.jpg';
  if (loginLink) loginLink.style.display = 'none';
  if (logoutBtn) {
    logoutBtn.style.display = 'block';
    logoutBtn.onclick = logout;
  }
}

function updateUIForUnauthenticatedUser() {
  const loginLink = document.getElementById('login-link');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (loginLink) loginLink.style.display = 'block';
  if (logoutBtn) logoutBtn.style.display = 'none';
}
