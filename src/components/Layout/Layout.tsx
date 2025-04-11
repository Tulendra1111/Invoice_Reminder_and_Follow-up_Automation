
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {isAuthenticated && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
