import type { User } from '../types';

const USER_STORAGE_KEY = 'content_studio_user';

// Mock user data for the simulation
const mockUser: User = {
  name: 'Alex Johnson',
  handle: '@alexj',
  avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=Alex%20Johnson`,
};

export const authService = {
  /**
   * Simulates signing in with Google.
   * In a real app, this would involve a Google OAuth flow.
   */
  signInWithGoogle: (): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
          resolve(mockUser);
        } catch (error) {
          console.error("Could not save user to localStorage", error);
          // Still resolve with the user, but it won't be persisted.
          resolve(mockUser);
        }
      }, 500); // Simulate network latency
    });
  },

  /**
   * Simulates signing out.
   */
  signOut: (): Promise<void> => {
     return new Promise((resolve) => {
      try {
        localStorage.removeItem(USER_STORAGE_KEY);
      } catch (error) {
        console.error("Could not remove user from localStorage", error);
      }
      resolve();
    });
  },

  /**
   * Checks for a currently signed-in user in localStorage.
   */
  getCurrentUser: (): User | null => {
    try {
      const userJson = localStorage.getItem(USER_STORAGE_KEY);
      if (userJson) {
        return JSON.parse(userJson) as User;
      }
      return null;
    } catch (error) {
      console.error("Could not retrieve user from localStorage", error);
      return null;
    }
  },
};
