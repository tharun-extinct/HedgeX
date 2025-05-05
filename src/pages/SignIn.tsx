
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '../contexts/AuthContext';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 md:px-10 border-b">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">FinView</h1>
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input 
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
                
                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
          
          {/* Demo Account Information */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Demo Account</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Don't want to create an account? Use these demo credentials:
            </p>
            <div className="text-sm grid gap-1">
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-mono">demo@example.com</span>
              </div>
              <div className="flex justify-between">
                <span>Password:</span>
                <span className="font-mono">password123</span>
              </div>
            </div>
            <div className="mt-3">
              <Button 
                variant="outline" 
                className="w-full text-sm"
                onClick={() => {
                  setEmail('demo@example.com');
                  setPassword('password123');
                }}
              >
                Fill Demo Credentials
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FinView. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SignIn;
