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

  // Categorized sections for newsfeed, videos, and pictures
  const newsfeedSections = {
    announcements: document.getElementById("announcements-section"),
    events: document.getElementById("events-section"),
    updates: document.getElementById("updates-section"),
    videos: document.getElementById("videos-section"),
    pictures: document.getElementById("pictures-section")
  };

  // Filtering options for newsfeed categories
  const filterOptions = document.getElementById("filter-options");
  filterOptions.addEventListener("change", function() {
    const selectedCategory = filterOptions.value;
    for (const section in newsfeedSections) {
      if (section === selectedCategory || selectedCategory === "all") {
        newsfeedSections[section].style.display = "block";
      } else {
        newsfeedSections[section].style.display = "none";
      }
    }
  });

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
