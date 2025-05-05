import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getWatchlists, 
  updateWatchlistName,
  resetWatchlists 
} from '@/services/watchlistService';
import {
  CreditCard,
  DollarSign,
  HelpCircle,
  LogOut,
  Mail,
  Moon,
  Sun,
  UserRound,
  Users,
  Zap,
  Globe,
  Link,
  FileText,
  Save,
  Star,
  RefreshCw
} from 'lucide-react';

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [funds, setFunds] = useState('0.00');
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [marketNews, setMarketNews] = useState(true);
  const [watchlists, setWatchlists] = useState<Array<{ id: string, name: string }>>([]);
  const [watchlistNames, setWatchlistNames] = useState<Record<string, string>>({});
  
  // Load watchlists on mount
  useEffect(() => {
    const loadWatchlists = async () => {
      const loadedWatchlists = await getWatchlists();
      setWatchlists(loadedWatchlists);
      
      // Initialize watchlist names
      const names: Record<string, string> = {};
      loadedWatchlists.forEach(wl => {
        names[wl.id] = wl.name;
      });
      setWatchlistNames(names);
    };

    loadWatchlists();
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };
  
  const handleAddFunds = () => {
    toast({
      title: "Funds added",
      description: `$${funds} has been added to your account.`,
    });
    setFunds('0.00');
  };
  
  const handleWithdrawFunds = () => {
    toast({
      title: "Withdrawal initiated",
      description: `$${funds} withdrawal has been initiated.`,
    });
    setFunds('0.00');
  };
  
  const handleSavePreferences = () => {
    toast({
      title: "Preferences saved",
      description: "Your preferences have been updated successfully.",
    });
  };
  
  const handleInviteFriends = () => {
    toast({
      title: "Invitation sent",
      description: "Your invitation has been sent successfully.",
    });
  };
  
  const handleWatchlistNameChange = (id: string, value: string) => {
    setWatchlistNames(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSaveWatchlistNames = () => {
    let updatedWatchlists = [...watchlists];
    
    Object.entries(watchlistNames).forEach(([id, name]) => {
      if (name.trim() !== '') {
        updatedWatchlists = updateWatchlistName(id, name.trim());
      }
    });
    
    setWatchlists(updatedWatchlists);
    
    toast({
      title: "Watchlists updated",
      description: "Your watchlist names have been updated successfully.",
    });
  };
  
  const handleResetWatchlists = async () => {
    const resetList = await resetWatchlists();
    setWatchlists(resetList);
    
    // Reset watchlist names
    const names: Record<string, string> = {};
    resetList.forEach(wl => {
      names[wl.id] = wl.name;
    });
    setWatchlistNames(names);
    
    toast({
      title: "Watchlists reset",
      description: "Your watchlists have been reset to default.",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Account Section */}
          <div className="md:col-span-2 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Account</h1>
            
            {/* Funds Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <CardTitle>Funds</CardTitle>
                </div>
                <CardDescription>Add or withdraw funds from your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="funds">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input 
                        id="funds" 
                        type="number" 
                        min="0.01" 
                        step="0.01" 
                        className="pl-8" 
                        value={funds}
                        onChange={(e) => setFunds(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleWithdrawFunds}>
                    Withdraw
                  </Button>
                  <Button onClick={handleAddFunds}>
                    Add Funds
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Watchlists Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <CardTitle>Watchlists</CardTitle>
                </div>
                <CardDescription>Customize your watchlist names</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {watchlists.map((watchlist) => (
                    <div key={watchlist.id} className="space-y-2">
                      <Label htmlFor={`watchlist-${watchlist.id}`}>
                        {watchlist.id.replace('watchlist-', 'Watchlist ')}
                      </Label>
                      <Input 
                        id={`watchlist-${watchlist.id}`} 
                        value={watchlistNames[watchlist.id] || ''}
                        placeholder={`Watchlist ${watchlist.id.split('-')[1]}`}
                        onChange={(e) => handleWatchlistNameChange(watchlist.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 justify-end mt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleResetWatchlists}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                  <Button onClick={handleSaveWatchlistNames}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Watchlists
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-primary" />
                  <CardTitle>Profile</CardTitle>
                </div>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={user?.email} 
                    disabled 
                  />
                  <p className="text-xs text-muted-foreground">
                    Contact support to change your email address
                  </p>
                </div>
                
                <Button onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </CardContent>
            </Card>
            
            {/* Settings Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle>Settings</CardTitle>
                </div>
                <CardDescription>Configure your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={darkMode} 
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <Label htmlFor="price-alerts">Price Alerts</Label>
                  </div>
                  <Switch 
                    id="price-alerts" 
                    checked={priceAlerts} 
                    onCheckedChange={setPriceAlerts}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <Label htmlFor="market-news">Market News</Label>
                  </div>
                  <Switch 
                    id="market-news" 
                    checked={marketNews} 
                    onCheckedChange={setMarketNews}
                  />
                </div>
                
                <Button onClick={handleSavePreferences}>
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
            
            {/* Connected Apps Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-primary" />
                  <CardTitle>Connected Apps</CardTitle>
                </div>
                <CardDescription>Manage applications connected to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">PaymentPro</h4>
                        <p className="text-sm text-muted-foreground">Connected on Apr 12, 2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Disconnect</Button>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">MarketWatch</h4>
                        <p className="text-sm text-muted-foreground">Connected on Mar 28, 2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Disconnect</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Logout Card */}
            <Card>
              <CardContent className="pt-6">
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
            
            {/* Support Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <CardTitle>Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-4 hover:bg-accent cursor-pointer transition-colors">
                  <h4 className="font-medium">Support Portal</h4>
                  <p className="text-sm text-muted-foreground">
                    Get help with common issues
                  </p>
                </div>
                
                <div className="rounded-md border p-4 hover:bg-accent cursor-pointer transition-colors">
                  <h4 className="font-medium">User Manual</h4>
                  <p className="text-sm text-muted-foreground">
                    Learn how to use FinView
                  </p>
                </div>
                
                <div className="rounded-md border p-4 hover:bg-accent cursor-pointer transition-colors">
                  <h4 className="font-medium">Contact Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Email: support@finview.com
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Others Section */}
            <Card>
              <CardHeader>
                <CardTitle>Others</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="rounded-md border p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={handleInviteFriends}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Invite Friends</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Share FinView with your network
                  </p>
                </div>
                
                <div className="rounded-md border p-4 hover:bg-accent cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Licenses</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    View software licenses
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Account;
