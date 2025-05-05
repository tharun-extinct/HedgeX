import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import authApi from '@/services/authApi';
import { initializeStocksData } from '@/services/financialData';

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const isValid = await authApi.verifyToken();
          
          if (isValid) {
            setUser(parsedUser);
            setIsAuthenticated(true);
            // Initialize data after authentication is verified - but don't wait for it
            // This prevents the white screen issue if data initialization fails
            setTimeout(() => {
              initializeStocksData().catch(error => {
                console.error('Failed to initialize data:', error);
                // Continue even if data initialization fails
              });
            }, 0);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error verifying authentication:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    
    verifyAuth();
  }, []);


  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password);
      
      const userToStore = response.user;
      setUser(userToStore);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userToStore));
      localStorage.setItem('token', response.token);
      
      // Initialize data after successful login - but don't wait for it
      // This prevents the white screen issue if data initialization fails
      setTimeout(() => {
        initializeStocksData().catch(dataError => {
          console.error('Failed to initialize data after login:', dataError);
          // Continue with login even if data initialization fails
        });
      }, 0);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userToStore.name}!`,
      });
      
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password. Please try again.",
      });
      return false;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.register(name, email, password);
      
      const userToStore = response.user;
      setUser(userToStore);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userToStore));
      localStorage.setItem('token', response.token);
      
      // Initialize data after successful registration - but don't wait for it
      // This prevents the white screen issue if data initialization fails
      setTimeout(() => {
        initializeStocksData().catch(dataError => {
          console.error('Failed to initialize data after registration:', dataError);
          // Continue with registration even if data initialization fails
        });
      }, 0);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      });
      
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
      });
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
