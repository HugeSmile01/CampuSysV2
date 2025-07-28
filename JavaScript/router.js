// Simple SPA Router
class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRouteChange());
    window.addEventListener('load', () => this.handleRouteChange());
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.location.hash = path;
  }

  handleRouteChange() {
    const hash = window.location.hash.slice(1) || 'home';
    const route = this.routes[hash];
    
    if (route) {
      this.currentRoute = hash;
      route();
      this.updateActiveNavigation(hash);
    } else {
      // Default route
      this.navigate('home');
    }
  }

  updateActiveNavigation(activeRoute) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Add active class to current route
    const activeLink = document.querySelector(`[href="#${activeRoute}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
}

// Page Handlers
const pageHandlers = {
  home: () => {
    updatePageTitle('Home');
    loadPageContent('home');
  },
  
  login: () => {
    updatePageTitle('Login');
    loadPageContent('login');
  },
  
  register: () => {
    updatePageTitle('Register');
    loadPageContent('register');
  },
  
  account: () => {
    updatePageTitle('Account');
    loadPageContent('account');
  },
  
  resources: () => {
    updatePageTitle('Resources');
    loadPageContent('resources');
  },
  
  notifications: () => {
    updatePageTitle('Notifications');
    loadPageContent('notifications');
  }
};

function updatePageTitle(title) {
  document.title = `CampuSysV2 - ${title}`;
  const headerTitle = document.getElementById('page-title');
  if (headerTitle) {
    headerTitle.textContent = title;
  }
}

function loadPageContent(page) {
  const contentArea = document.getElementById('main-content');
  if (!contentArea) return;

  // Show loading
  loadingManager.show('Loading page...');

  // Simulate page loading (in real app, this would load from server or templates)
  setTimeout(() => {
    contentArea.innerHTML = getPageTemplate(page);
    
    // Initialize page-specific functionality
    initializePageFunctionality(page);
    
    loadingManager.hide();
  }, 300);
}

function getPageTemplate(page) {
  const templates = {
    home: `
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="card">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-primary-500 text-white">
                <span class="material-icons">school</span>
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                <p class="text-xl font-semibold">2,847</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-500 text-white">
                <span class="material-icons">person</span>
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">Faculty</p>
                <p class="text-xl font-semibold">156</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-yellow-500 text-white">
                <span class="material-icons">book</span>
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">Courses</p>
                <p class="text-xl font-semibold">89</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-purple-500 text-white">
                <span class="material-icons">event</span>
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">Events</p>
                <p class="text-xl font-semibold">23</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Recent Activities</h3>
            <div class="space-y-3">
              <div class="flex items-center p-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                <span class="material-icons text-primary-500 mr-3">assignment</span>
                <div>
                  <p class="font-medium">New assignment posted</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Mathematics - Due Monday</p>
                </div>
              </div>
              <div class="flex items-center p-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                <span class="material-icons text-green-500 mr-3">event</span>
                <div>
                  <p class="font-medium">Upcoming exam</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Physics - Next Friday</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 gap-3">
              <button class="btn-primary flex items-center justify-center py-3">
                <span class="material-icons mr-2">add</span>
                Add Course
              </button>
              <button class="btn-secondary flex items-center justify-center py-3">
                <span class="material-icons mr-2">people</span>
                Manage Users
              </button>
              <button class="btn-secondary flex items-center justify-center py-3">
                <span class="material-icons mr-2">assessment</span>
                Reports
              </button>
              <button class="btn-secondary flex items-center justify-center py-3">
                <span class="material-icons mr-2">settings</span>
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
    
    login: `
      <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
          <div class="text-center">
            <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Sign in to your account
            </h2>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Or 
              <a href="#register" class="font-medium text-primary-600 hover:text-primary-500">
                create a new account
              </a>
            </p>
          </div>
          <form class="mt-8 space-y-6" id="login-form">
            <div class="space-y-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <input id="email" name="email" type="email" required class="input-field">
              </div>
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input id="password" name="password" type="password" required class="input-field">
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
                <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div class="text-sm">
                <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button type="submit" class="btn-primary w-full">
                Sign in
              </button>
            </div>

            <div class="mt-6">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white dark:bg-dark-100 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div class="mt-6 grid grid-cols-2 gap-3">
                <button type="button" onclick="loginWithGoogle()" class="btn-secondary flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>

                <button type="button" onclick="loginWithFacebook()" class="btn-secondary flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `,
    
    register: `
      <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
          <div class="text-center">
            <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Create your account
            </h2>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Already have an account? 
              <a href="#login" class="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </a>
            </p>
          </div>
          <form class="mt-8 space-y-6" id="register-form">
            <div class="space-y-4">
              <div>
                <label for="reg-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <input id="reg-email" name="email" type="email" required class="input-field">
              </div>
              <div>
                <label for="reg-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input id="reg-password" name="password" type="password" required class="input-field">
              </div>
              <div>
                <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <input id="confirm-password" name="confirm-password" type="password" required class="input-field">
              </div>
            </div>

            <div>
              <button type="submit" class="btn-primary w-full">
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    `,
    
    account: `
      <div class="space-y-6">
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Account Information</h3>
          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <img src="images/user.jpg" alt="Profile" class="w-16 h-16 rounded-full">
              <div>
                <h4 class="font-medium" id="user-email">user@example.com</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">Member since 2024</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Security</h3>
          <div class="space-y-4">
            <button class="btn-secondary">Change Password</button>
            <button class="btn-secondary">Enable Two-Factor Authentication</button>
            <button class="btn-primary" onclick="logout()">Sign Out</button>
          </div>
        </div>
      </div>
    `,
    
    resources: `
      <div class="space-y-6">
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Learning Resources</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span class="material-icons text-primary-500 mb-2">book</span>
              <h4 class="font-medium">Course Materials</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Access lecture notes and presentations</p>
            </div>
            <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span class="material-icons text-green-500 mb-2">video_library</span>
              <h4 class="font-medium">Video Lectures</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Watch recorded lectures</p>
            </div>
            <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span class="material-icons text-purple-500 mb-2">assignment</span>
              <h4 class="font-medium">Assignments</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">View and submit assignments</p>
            </div>
          </div>
        </div>
      </div>
    `,
    
    notifications: `
      <div class="space-y-6">
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Recent Notifications</h3>
          <div class="space-y-3">
            <div class="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
              <span class="material-icons text-blue-500 mr-3 mt-1">info</span>
              <div>
                <p class="font-medium">System Maintenance</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Scheduled maintenance on Sunday 2 AM - 4 AM</p>
                <p class="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>
            
            <div class="flex items-start p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
              <span class="material-icons text-green-500 mr-3 mt-1">check_circle</span>
              <div>
                <p class="font-medium">Assignment Submitted</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Your mathematics assignment has been submitted successfully</p>
                <p class="text-xs text-gray-500 mt-1">1 day ago</p>
              </div>
            </div>
            
            <div class="flex items-start p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
              <span class="material-icons text-yellow-500 mr-3 mt-1">warning</span>
              <div>
                <p class="font-medium">Deadline Reminder</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Physics assignment due tomorrow</p>
                <p class="text-xs text-gray-500 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  };

  return templates[page] || templates.home;
}

function initializePageFunctionality(page) {
  switch(page) {
    case 'login':
      initializeLoginForm();
      break;
    case 'register':
      initializeRegisterForm();
      break;
    case 'account':
      initializeAccountPage();
      break;
  }
}

function initializeLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      if (email && password) {
        login(email, password);
      } else {
        toastManager.show('Please fill in all fields', 'error');
      }
    });
  }
}

function initializeRegisterForm() {
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      if (!email || !password || !confirmPassword) {
        toastManager.show('Please fill in all fields', 'error');
        return;
      }
      
      if (password !== confirmPassword) {
        toastManager.show('Passwords do not match', 'error');
        return;
      }
      
      if (password.length < 6) {
        toastManager.show('Password must be at least 6 characters', 'error');
        return;
      }
      
      register(email, password);
    });
  }
}

function initializeAccountPage() {
  // Update account page with current user info
  const user = firebase.auth().currentUser;
  if (user) {
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement) {
      userEmailElement.textContent = user.email;
    }
  }
}

// Initialize router
let router;
document.addEventListener('DOMContentLoaded', () => {
  router = new Router();
  
  // Add routes
  Object.keys(pageHandlers).forEach(route => {
    router.addRoute(route, pageHandlers[route]);
  });
});

// Export for global use
window.router = router;