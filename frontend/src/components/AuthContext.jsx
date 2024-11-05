import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state with localStorage values
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');

  // Login function to set token and email
  const login = (token, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  // Logout function to clear token and email
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserEmail('');
  };

  // Listen for changes to the token or userEmail in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      setIsLoggedIn(!!token);
      setUserEmail(email || '');
    };

    // Attach the listener (useful if handling multiple tabs)
    window.addEventListener('storage', handleStorageChange);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access to AuthContext
export const useAuth = () => React.useContext(AuthContext);
