import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "/favicon.png";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm border-b border-border/20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <img src={logo} alt="Corners logo" className="w-10 h-10" />
            <span className="text-2xl font-extralight tracking-tight">corners</span>
          </div>
          
          {/* Navigation links */}
          {!isAuthPage && (
            <div className="hidden md:flex items-center gap-8">
              <a href="#what" className="text-base font-medium text-foreground hover:text-primary transition-colors duration-300">
                What
              </a>
              <a href="#why" className="text-base font-medium text-foreground hover:text-primary transition-colors duration-300">
                Why
              </a>
              <a href="#how" className="text-base font-medium text-foreground hover:text-primary transition-colors duration-300">
                How
              </a>
            </div>
          )}
          
          {/* CTA buttons */}
          {!isAuthPage && (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="default" onClick={() => navigate('/auth')} className="text-base">
                Login
              </Button>
              <Button variant="default" size="default" onClick={() => navigate('/auth')} className="text-base">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
