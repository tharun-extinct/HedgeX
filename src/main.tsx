import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css' // Make sure App.css is imported

// Set up demo account
const setUpDemoAccount = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const demoUser = users.find((u: any) => u.email === 'demo@example.com');
  
  if (!demoUser) {
    users.push({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123',
    });
    localStorage.setItem('users', JSON.stringify(users));
  }
};

// Initialize demo account
setUpDemoAccount();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(<App />);
