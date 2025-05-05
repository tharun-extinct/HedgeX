
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, TrendingUp, PieChart, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    // Initialize scroll observer
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Once the element is visible, stop observing it
          observerRef.current?.unobserve(entry.target);
        }
      });
    }, options);
    
    // Get all elements with the scroll-reveal class
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => {
      observerRef.current?.observe(el);
    });
    
    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center py-4 px-6 md:px-10 border-b">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">FinView</h1>
        </div>
        <div className="flex gap-4">
          {isAuthenticated ? (
            <Button asChild variant="default">
              <Link to="/dashboard">
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button asChild variant="default">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 md:px-10 max-w-6xl mx-auto text-center">
        <h1 className="scroll-reveal text-4xl md:text-6xl font-bold mb-6">
          Master Your Financial Future
        </h1>
        <p className="scroll-reveal scroll-reveal-delay-1 text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
          Track, analyze, and optimize your investment portfolio with our powerful yet simple dashboard.
        </p>
        <div className="scroll-reveal scroll-reveal-delay-2 flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <Button asChild size="lg" className="text-lg">
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" variant="default" className="text-lg">
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg">
                <Link to="/signin">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-16 md:py-24 px-6 md:px-10 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="scroll-reveal text-3xl md:text-4xl font-bold mb-12 text-center">
            Why Choose FinView?
          </h2>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="scroll-reveal bg-card rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Real-time Portfolio Tracking
              </h3>
              <p className="text-muted-foreground">
                Monitor your investments with simulated real-time updates. Watch your portfolio value change as market conditions fluctuate throughout the day.
              </p>
            </div>
            <div className="scroll-reveal scroll-reveal-delay-1 bg-card rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                Interactive Performance Charts
              </h3>
              <p className="text-muted-foreground">
                Visualize your investment performance over different time periods. Our interactive charts help you understand trends and make informed decisions.
              </p>
            </div>
            <div className="scroll-reveal scroll-reveal-delay-2 bg-card rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <PieChart className="mr-2 h-5 w-5 text-primary" />
                Portfolio Diversification Analysis
              </h3>
              <p className="text-muted-foreground">
                See how your investments are distributed across different sectors. Ensure proper diversification to manage risk and optimize returns.
              </p>
            </div>
            <div className="scroll-reveal scroll-reveal-delay-3 bg-card rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
                Safe and Secure Platform
              </h3>
              <p className="text-muted-foreground">
                Practice investment strategies without risking real money. Our platform is ideal for both beginners learning to invest and experienced traders testing strategies.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-24 px-6 md:px-10 max-w-6xl mx-auto">
        <h2 className="scroll-reveal text-3xl md:text-4xl font-bold mb-6 text-center">
          Powerful Features for Smart Investors
        </h2>
        <p className="scroll-reveal scroll-reveal-delay-1 text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          Everything you need to track, analyze, and optimize your investments in one place.
        </p>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Portfolio Summary",
              description: "Get a quick overview of your portfolio's performance at a glance with daily, weekly, and monthly metrics.",
              delay: ""
            },
            {
              title: "Stock Performance Cards",
              description: "Monitor individual stocks with clear, concise cards showing key performance metrics.",
              delay: "scroll-reveal-delay-1"
            },
            {
              title: "Performance Charts",
              description: "Visualize your performance with interactive charts that can be filtered by different timeframes.",
              delay: "scroll-reveal-delay-2"
            },
            {
              title: "Sector Allocation",
              description: "Understand your exposure to different market sectors with intuitive pie and bar charts.",
              delay: "scroll-reveal-delay-1"
            },
            {
              title: "Simulated Trading",
              description: "Practice buying and selling stocks without risking real money to test your investment strategies.",
              delay: "scroll-reveal-delay-2"
            },
            {
              title: "Mobile Responsive",
              description: "Access your portfolio dashboard on any device, from desktop to smartphone, for investing on the go.",
              delay: "scroll-reveal-delay-3"
            },
          ].map((feature, index) => (
            <div 
              key={index} 
              className={`scroll-reveal ${feature.delay} bg-card border rounded-lg p-6 hover:shadow-md transition-shadow`}
            >
              <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 px-6 md:px-10 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="scroll-reveal text-3xl md:text-4xl font-bold mb-6">
            Ready to Take Control of Your Investments?
          </h2>
          <p className="scroll-reveal scroll-reveal-delay-1 text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join FinView today and start your journey to becoming a more informed and successful investor.
          </p>
          <div className="scroll-reveal scroll-reveal-delay-2">
            {isAuthenticated ? (
              <Button asChild size="lg" variant="secondary" className="text-lg">
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="secondary" className="text-lg">
                <Link to="/signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-6 md:px-10 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">FinView</span>
          </div>
          <p className="text-muted-foreground text-sm text-center md:text-right">
            &copy; {new Date().getFullYear()} FinView. All rights reserved. 
            <br />
            <span className="text-xs">
              This is a simulated financial application. No real money is involved.
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
