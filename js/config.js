// Firebase Configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0gGIsNNRPXuGNx9xpuOEuCtJmh7Uvcsw",
  authDomain: "silago911.firebaseapp.com",
  databaseURL: "https://silago911-default-rtdb.firebaseio.com",
  projectId: "silago911",
  storageBucket: "silago911.firebasestorage.app",
  messagingSenderId: "624672428258",
  appId: "1:624672428258:web:2c9038f5e789b34054cebb",
  measurementId: "G-QBZSJ9HH1Q"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Dark/Light mode management
class ThemeManager {
  constructor() {
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    this.init();
  }

  init() {
    this.updateTheme();
    this.createToggleButton();
  }

  updateTheme() {
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', this.darkMode);
  }

  toggle() {
    this.darkMode = !this.darkMode;
    this.updateTheme();
  }

  createToggleButton() {
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => this.toggle());
      this.updateToggleIcon(toggleButton);
    }
  }

  updateToggleIcon(button) {
    const icon = button.querySelector('i') || button.querySelector('svg');
    if (icon) {
      if (this.darkMode) {
        icon.textContent = 'light_mode';
        icon.className = 'material-icons';
      } else {
        icon.textContent = 'dark_mode';
        icon.className = 'material-icons';
      }
    }
  }
}

// Loading manager
class LoadingManager {
  static show(message = 'Loading...') {
    const loader = document.getElementById('global-loader');
    if (loader) {
      loader.classList.remove('hidden');
      const messageEl = loader.querySelector('.loading-message');
      if (messageEl) messageEl.textContent = message;
    }
  }

  static hide() {
    const loader = document.getElementById('global-loader');
    if (loader) {
      loader.classList.add('hidden');
    }
  }
}

// Router for SPA navigation
class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.init();
  }

  init() {
    window.addEventListener('popstate', () => this.handleRoute());
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-route]')) {
        e.preventDefault();
        this.navigate(e.target.getAttribute('data-route'));
      }
    });
    this.handleRoute();
  }

  addRoute(path, handler) {
    this.routes.set(path, handler);
  }

  navigate(path) {
    window.history.pushState(null, null, path);
    this.handleRoute();
  }

  handleRoute() {
    const path = window.location.pathname;
    const handler = this.routes.get(path) || this.routes.get('/404');
    if (handler) {
      this.currentRoute = path;
      handler();
    }
  }
}

// Security utilities
class Security {
  static sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return re.test(password);
  }
}

// Initialize theme manager on page load
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
  window.loadingManager = LoadingManager;
  window.router = new Router();
  window.security = Security;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    firebaseConfig,
    auth,
    db,
    ThemeManager,
    LoadingManager,
    Router,
    Security
  };
}