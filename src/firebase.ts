import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';

export const login = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: 'Invalid email or password. Please try again.' 
    };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Error signing out' };
  }
};
