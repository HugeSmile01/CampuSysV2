// Firebase configuration is now handled in config.js
// Auth service is imported from there

// Login function
function login(email, password) {
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Login successful
      const user = userCredential.user;
      console.log("Login successful:", user);
      // Redirect to homepage
      window.location.href = "index.html";
    })
    .catch((error) => {
      // Handle login errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Login error:", errorCode, errorMessage);
      // Display error message to user
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessage,
      });
    });
}

// Registration function
function register(email, password) {
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Registration successful
      const user = userCredential.user;
      console.log("Registration successful:", user);
      // Redirect to homepage
      window.location.href = "index.html";
    })
    .catch((error) => {
      // Handle registration errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Registration error:", errorCode, errorMessage);
      // Display error message to user
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessage,
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
      // Redirect to homepage
      window.location.href = "index.html";
    })
    .catch((error) => {
      // Handle Facebook login errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Facebook login error:", errorCode, errorMessage);
      // Display error message to user
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessage,
      });
    });
}
