import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, area?: string) => Promise<void>;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Simulate checking for stored authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } catch (error) {
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      // This would be an API call in a real application
      // Simulating API response for demonstration
      const mockUsers = [
        {
          id: '1',
          name: 'Super Admin',
          email: 'superadmin@ctpga.com',
          role: 'superadmin',
          status: 'approved',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Admin User',
          email: 'admin@ctpga.com',
          role: 'admin',
          area: 'Technology',
          status: 'approved',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Instructor User',
          email: 'instructor@ctpga.com',
          role: 'instructor',
          area: 'Engineering',
          status: 'approved',
          createdAt: new Date().toISOString(),
        },
      ] as User[];

      const user = mockUsers.find(u => u.email === email);
      
      if (user && password === 'password') { // Simplified authentication
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid email or password' });
      }
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  };

  const register = async (name: string, email: string, password: string, area?: string) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      // This would be an API call in a real application
      // Simulating API response for demonstration
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role: 'instructor',
        area,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      // In a real app, we would not store the user in localStorage at registration
      // especially since the status is pending
      dispatch({ type: 'REGISTER_SUCCESS', payload: newUser });
      
      // Show registration success but not authenticated yet
      setTimeout(() => {
        dispatch({ type: 'LOGOUT' });
      }, 2000);
      
    } catch (error) {
      dispatch({ 
        type: 'REGISTER_FAILURE', 
        payload: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};