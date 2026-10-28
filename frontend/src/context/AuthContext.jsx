import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          setRole(res.data.role);
          localStorage.setItem('role', res.data.role);
        } catch (err) {
          console.error("Failed to restore auth session:", err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    // Send JSON payload to login endpoint
    const response = await api.post('/auth/login', {
      email,
      password
    });

    const { access_token, role: userRole, user_id } = response.data;
    setToken(access_token);
    setRole(userRole);
    localStorage.setItem('token', access_token);
    localStorage.setItem('role', userRole);

    const userRes = await api.get('/auth/me');
    setUser(userRes.data);
    return userRes.data;
  };

  const register = async (email, password, userRole) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      role: userRole
    });
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
