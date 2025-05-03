import { createContext, useState, useEffect } from 'react';
import db from '../utils/db';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  
  // Load users from database when component mounts
  useEffect(() => {
    const loadUsers = async () => {
      const allUsers = await db.users.toArray();
      setUsers(allUsers);
    };
    
    loadUsers();
  }, []);
  
  // Register a new user
  const register = async (username, password) => {
    try {
      // Check if username already exists
      const existingUser = await db.users.where({ username }).first();
      if (existingUser) {
        return { success: false, message: 'Username already exists' };
      }
      
      // Create new user
      const id = await db.users.add({
        username,
        password, // In a real app, you would hash this password
        createdAt: new Date().toISOString()
      });
      
      // Initialize game progress
      await db.gameProgress.put({
        userId: id,
        coins: 0,
        highScore: 0,
        unlockedBirds: ['captain-bird'],
        selectedBird: 'captain-bird'
      });
      
      // Update local state
      const newUser = { id, username, password };
      setUsers([...users, newUser]);
      
      return { success: true, user: { id, username } };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  };
  
  // Login a user
  const login = async (username, password) => {
    try {
      const user = await db.users.where({ username, password }).first();
      
      if (user) {
        return { success: true, user: { id: user.id, username: user.username } };
      } else {
        return { success: false, message: 'Invalid username or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };
  
  // Play as guest
  const playAsGuest = () => {
    return { success: true, user: { isGuest: true } };
  };
  
  return (
    <AuthContext.Provider value={{ register, login, playAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};