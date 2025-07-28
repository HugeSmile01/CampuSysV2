// Theme Management
class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || appConfig.theme.defaultMode;
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupThemeToggle();
    if (appConfig.theme.enableAutoTheme) {
      this.setupAutoTheme();
    }
  }

  getStoredTheme() {
    return localStorage.getItem('theme');
  }

  setStoredTheme(theme) {
    localStorage.setItem('theme', theme);
  }

  applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    this.currentTheme = theme;
    this.setStoredTheme(theme);
    this.updateThemeIcon();
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  updateThemeIcon() {
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    if (themeToggleIcon) {
      themeToggleIcon.textContent = this.currentTheme === 'light' ? 'dark_mode' : 'light_mode';
    }
  }

  setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  setupAutoTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addListener((e) => {
      if (!this.getStoredTheme()) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

// Loading Manager
class LoadingManager {
  constructor() {
    this.isLoading = false;
    this.createLoadingElement();
  }

  createLoadingElement() {
    const loadingHTML = `
      <div id="loading-overlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-white dark:bg-dark-100 rounded-lg p-8 flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p class="mt-4 text-gray-700 dark:text-gray-200">Loading...</p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
  }

  show(message = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const text = overlay.querySelector('p');
    if (text) text.textContent = message;
    overlay.classList.remove('hidden');
    this.isLoading = true;
  }

  hide() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.add('hidden');
    this.isLoading = false;
  }
}

// Toast Notifications
class ToastManager {
  constructor() {
    this.container = this.createContainer();
  }

  createContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(container);
    return container;
  }

  show(message, type = 'info', duration = 3000) {
    const toast = this.createToast(message, type);
    this.container.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('translate-x-0'), 10);

    // Auto hide
    setTimeout(() => this.hide(toast), duration);
  }

  createToast(message, type) {
    const toast = document.createElement('div');
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };

    toast.className = `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 max-w-sm`;
    toast.innerHTML = `
      <div class="flex items-center justify-between">
        <span>${message}</span>
        <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <span class="material-icons text-sm">close</span>
        </button>
      </div>
    `;

    return toast;
  }

  hide(toast) {
    toast.classList.add('translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }
}

// Initialize global instances
let themeManager, loadingManager, toastManager;

document.addEventListener('DOMContentLoaded', () => {
  themeManager = new ThemeManager();
  loadingManager = new LoadingManager();
  toastManager = new ToastManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeManager, LoadingManager, ToastManager };
}