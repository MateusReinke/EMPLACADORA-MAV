import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/dbClient';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'seller' | 'physical' | 'juridical';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'physical' | 'juridical';
  phone?: string;
  document?: string;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  login: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching auth session:', error);
        setLoading(false);
      });

    const { data: { subscription } } = db.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await db
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else if (data) {
        setUserProfile({
          ...data,
          role: data.role as 'admin' | 'seller' | 'physical' | 'juridical'
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user && !error) {
      await fetchUserProfile(data.user.id);
    }

    return { error };
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await signIn(email, password);
    return !result.error;
  };

  const signOut = async () => {
    await db.auth.signOut();
    setUser(null);
    setUserProfile(null);
  };

  const logout = signOut;

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    signIn,
    login,
    signOut,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
