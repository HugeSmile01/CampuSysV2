// Firebase Configuration
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

// App Configuration
const appConfig = {
  theme: {
    defaultMode: 'light',
    enableAutoTheme: true
  },
  auth: {
    enableGoogleAuth: true,
    enableFacebookAuth: true,
    enableEmailAuth: true,
    redirectAfterLogin: 'index.html#home',
    redirectAfterLogout: 'index.html#login'
  },
  ui: {
    showLoadingSpinner: true,
    animationDuration: 300,
    toastPosition: 'top-right'
  },
  security: {
    enableCSRF: true,
    enableRateLimit: true,
    maxLoginAttempts: 5,
    lockoutTime: 300000 // 5 minutes
  }
};

// Export configurations
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig, appConfig };
} else {
  window.firebaseConfig = firebaseConfig;
  window.appConfig = appConfig;
}