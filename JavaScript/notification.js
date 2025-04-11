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
