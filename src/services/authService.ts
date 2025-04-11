
import { toast } from '@/components/ui/use-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  accessToken: string;
}

const LOCAL_STORAGE_KEY = 'invoice_zenith_user';

class AuthService {
  private googleAuth: any;
  private user: User | null = null;

  constructor() {
    this.loadUserFromLocalStorage();
    this.initGoogleAuth();
  }

  private initGoogleAuth() {
    // In a real app, we would use the Google OAuth API
    // This is a mock implementation
    window.addEventListener('load', () => {
      console.log('Mock Google OAuth initialized');
    });
  }

  private loadUserFromLocalStorage() {
    const userData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (error) {
        console.error('Failed to parse user data from localStorage', error);
      }
    }
  }

  private saveUserToLocalStorage(user: User) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
  }

  public isAuthenticated(): boolean {
    return !!this.user;
  }

  public getCurrentUser(): User | null {
    return this.user;
  }

  public async loginWithGoogle(): Promise<User> {
    // In a real app, this would trigger the Google OAuth flow
    // For now, we'll simulate a successful login with mock data
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        imageUrl: 'https://i.pravatar.cc/150?img=3',
        accessToken: 'mock-access-token'
      };
      
      this.user = mockUser;
      this.saveUserToLocalStorage(mockUser);
      return mockUser;
    } catch (error) {
      console.error('Google login failed', error);
      toast({
        title: "Login Failed",
        description: "Failed to login with Google. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }

  public logout(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    this.user = null;
    // In a real app, we would also revoke the Google token
  }
}

export const authService = new AuthService();
