document.addEventListener("DOMContentLoaded", function() {
  // Firebase Authentication
  const auth = firebase.auth();

  // Check if user is authenticated
  auth.onAuthStateChanged(function(user) {
    if (!user) {
      // Redirect to login page if not authenticated
      window.location.href = "login.html";
    }
  });

  // Account page functionality
  const accountForm = document.getElementById("account-form");
  accountForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    // Input validation and error messages
    if (!validateInput(email) || !validateInput(password) || !validateInput(role)) {
      document.getElementById("account-error").innerText = "Please fill in all fields.";
      return;
    }

    // Update account information
    const user = auth.currentUser;
    user.updateEmail(email).then(function() {
      return user.updatePassword(password);
    }).then(function() {
      // Update role in Firestore
      const userRef = firebase.firestore().collection("users").doc(user.uid);
      return userRef.update({ role: role });
    }).then(function() {
      console.log("Account information updated successfully.");
      document.getElementById("account-success").innerText = "Account information updated successfully.";
    }).catch(function(error) {
      console.error("Error updating account information:", error);
      document.getElementById("account-error").innerText = error.message;
    });
  });

  // Input validation and error messages
  function validateInput(input) {
    if (input.trim() === "") {
      return false;
    }
    return true;
  }

  // Animations and transitions for engaging user experience
  const fadeInElements = document.querySelectorAll(".fade-in");
  fadeInElements.forEach(function(element) {
    element.classList.add("fade-in-animation");
  });

  const slideInElements = document.querySelectorAll(".slide-in");
  slideInElements.forEach(function(element) {
    element.classList.add("slide-in-animation");
  });

  // Progress indicator and loading spinner
  const progressIndicator = document.getElementById("progress-indicator");
  const loadingSpinner = document.getElementById("loading-spinner");

  function showProgressIndicator() {
    progressIndicator.style.display = "block";
  }

  function hideProgressIndicator() {
    progressIndicator.style.display = "none";
  }

  function showLoadingSpinner() {
    loadingSpinner.style.display = "block";
  }

  function hideLoadingSpinner() {
    loadingSpinner.style.display = "none";
  }

  // Example usage of progress indicator and loading spinner
  showProgressIndicator();
  setTimeout(hideProgressIndicator, 2000);

  showLoadingSpinner();
  setTimeout(hideLoadingSpinner, 2000);
});
