
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  LogOut, 
  User,
  Bell,
  Search,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Star,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';
import { getWatchlists } from '@/services/watchlistService';

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [watchlists, setWatchlists] = useState<Array<{ id: string, name: string }>>([]);
  
  // Load watchlists on mount
  useEffect(() => {
    getWatchlists().then((loadedWatchlists) => {
      if (Array.isArray(loadedWatchlists)) {
        setWatchlists(loadedWatchlists);
      } else {
        console.error('Expected an array for watchlists, but got:', loadedWatchlists);
      }
    }).catch(error => {
      console.error('Error loading watchlists:', error);
    });
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const navigateToAccount = () => {
    navigate('/account');
  };

  const notificationItems = [
    { 
      id: 1, 
      text: "Price Alert: AAPL up 2.5%", 
      time: "Just now", 
      icon: <TrendingUp className="h-4 w-4 text-green-500" /> 
    },
    { 
      id: 2, 
      text: "Price Alert: TSLA down 1.8%", 
      time: "10 min ago", 
      icon: <TrendingDown className="h-4 w-4 text-red-500" /> 
    },
    { 
      id: 3, 
      text: "Funds added: $1,000", 
      time: "1 hour ago", 
      icon: <DollarSign className="h-4 w-4 text-blue-500" /> 
    },
    { 
      id: 4, 
      text: "Bought AMZN: 5 shares at $145.20", 
      time: "Yesterday", 
      icon: <ShoppingCart className="h-4 w-4 text-primary" /> 
    }
  ];

  const handleNotificationClick = (notification) => {
    toast({
      title: "Notification",
      description: notification.text,
    });
  };
  
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold hidden md:block">FinView</h1>
            </Link>
            
            <div className="relative max-w-sm hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stocks..."
                className="pl-8 w-[200px] lg:w-[300px]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Watchlists Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span className="hidden md:inline">Watchlists</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Your Watchlists</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {watchlists.map((watchlist) => (
                  <DropdownMenuItem 
                    key={watchlist.id}
                    onClick={() => {
                      navigate('/dashboard');
                      // We'll handle selecting the watchlist on the dashboard via URL params or context in a future update
                      toast({
                        title: "Watchlist selected",
                        description: `Switched to ${watchlist.name}`,
                      });
                    }}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    <span>{watchlist.name}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/account')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Customize Watchlists</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Recent Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notificationItems.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className="py-2 px-4 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{notification.icon}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{notification.text}</div>
                        <div className="text-xs text-muted-foreground">{notification.time}</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary text-sm" onClick={() => navigate('/account')}>
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center gap-2 cursor-pointer" onClick={navigateToAccount}>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
