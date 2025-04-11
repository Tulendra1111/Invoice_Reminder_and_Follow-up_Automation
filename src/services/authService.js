
// This file simulates authentication service with Google OAuth
// In a real application, you would integrate with the actual Google OAuth API

const LOCAL_STORAGE_KEY = 'invoice_zenith_user';

// Mock user data
const mockUser = {
  id: '12345',
  name: 'John Doe',
  email: 'john.doe@example.com',
  imageUrl: 'https://api.dicebear.com/6.x/avataaars/svg?seed=John',
};

export const authService = {
  // Simulate Google login
  loginWithGoogle: async () => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // Store user in local storage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockUser));
        resolve(mockUser);
      }, 1000);
    });
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem(LOCAL_STORAGE_KEY) !== null;
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem(LOCAL_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },
};
