import type { User } from '../types';

const USER_STORAGE_KEY = 'content_studio_user';

const mockUser: User = {
  name: 'Alex Chen',
  handle: '@alexchen',
  // Using a placeholder avatar service
  avatarUrl: `https://i.pravatar.cc/150?u=alexchen`,
};

export const authService = {
  /**
   * Simulates a sign-in process and returns a mock user.
   */
  signIn: (): Promise<User> => {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
        } catch (error) {
          console.error("Could not save user to localStorage", error);
        }
        resolve(mockUser);
      }, 500);
    });
  },

  /**
   * Signs the user out by clearing their session from localStorage.
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