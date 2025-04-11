
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { authService } from '@/services/authService';
import { Home, FileText, Zap, Bell } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  
  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/dashboard" className="text-2xl font-bold text-zenith-700 mr-8">
            Invoice Zenith
          </Link>
          
          <nav className="hidden md:flex space-x-1">
            <Link to="/dashboard">
              <Button 
                variant={isActive('/dashboard') ? "default" : "ghost"} 
                className="flex items-center gap-2"
              >
                <Home size={18} />
                Dashboard
              </Button>
            </Link>
            <Link to="/invoices">
              <Button 
                variant={isActive('/invoices') ? "default" : "ghost"} 
                className="flex items-center gap-2"
              >
                <FileText size={18} />
                Invoices
              </Button>
            </Link>
            <Link to="/automation">
              <Button 
                variant={isActive('/automation') ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <Zap size={18} />
                Automation
              </Button>
            </Link>
          </nav>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Bell size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-auto p-2">
                  <p className="text-sm text-muted-foreground text-center py-8">No new notifications</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.imageUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer"
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/settings')}
                  className="cursor-pointer"
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
