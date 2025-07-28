// Mock Firebase for development/testing when external resources are blocked
if (typeof firebase === 'undefined') {
  console.log('Firebase not available, using mock implementation');
  
  // Mock Firebase implementation for testing
  window.firebase = {
    initializeApp: function(config) {
      console.log('Mock Firebase initialized with config:', config);
      return {};
    },
    
    auth: function() {
      return {
        signInWithEmailAndPassword: function(email, password) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (email === 'admin@campusys.com' && password === 'password123') {
                resolve({
                  user: {
                    uid: 'mock-user-id',
                    email: email,
                    displayName: 'Mock User',
                    photoURL: 'images/user.jpg'
                  }
                });
              } else {
                reject({
                  code: 'auth/invalid-credentials',
                  message: 'Invalid email or password'
                });
              }
            }, 1000);
          });
        },
        
        createUserWithEmailAndPassword: function(email, password) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (email && password && password.length >= 6) {
                resolve({
                  user: {
                    uid: 'mock-new-user-id',
                    email: email,
                    displayName: 'New Mock User',
                    photoURL: 'images/user.jpg'
                  }
                });
              } else {
                reject({
                  code: 'auth/weak-password',
                  message: 'Password should be at least 6 characters'
                });
              }
            }, 1000);
          });
        },
        
        signInWithPopup: function(provider) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve({
                user: {
                  uid: 'mock-social-user-id',
                  email: 'user@gmail.com',
                  displayName: 'Social User',
                  photoURL: 'images/user.jpg'
                }
              });
            }, 1000);
          });
        },
        
        signOut: function() {
          return new Promise((resolve) => {
            setTimeout(resolve, 500);
          });
        },
        
        onAuthStateChanged: function(callback) {
          // Simulate no user initially
          setTimeout(() => callback(null), 100);
          return function() {}; // Unsubscribe function
        },
        
        currentUser: null,
        
        GoogleAuthProvider: function() {
          return {};
        },
        
        FacebookAuthProvider: function() {
          return {};
        }
      };
    }
  };
  
  // Add auth providers to firebase namespace
  firebase.auth.GoogleAuthProvider = function() { return {}; };
  firebase.auth.FacebookAuthProvider = function() { return {}; };
}