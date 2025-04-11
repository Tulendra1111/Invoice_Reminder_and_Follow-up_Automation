
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authService.loginWithGoogle();
      toast({
        title: "Login Successful",
        description: "You've successfully logged in with Google.",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-zenith-700">
            Invoice Zenith
          </h1>
          <p className="mt-2 text-gray-600">
            Automate your invoice reminders and follow-ups
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Sign in with your Google account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button 
              variant="outline" 
              onClick={handleGoogleLogin} 
              disabled={isLoading}
              className="flex items-center justify-center gap-2"
            >
              <FcGoogle className="w-5 h-5" />
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-sm text-muted-foreground text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
