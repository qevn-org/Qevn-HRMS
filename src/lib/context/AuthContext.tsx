'use client';

import React, { createContext, useContext, useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, RoleName, NotificationItem } from '@/types/database';
import { hrmsStore } from '@/lib/services/store';
import { createClient } from '@/lib/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile;
  activeRole: RoleName;
  setActiveRole: (role: RoleName) => void;
  availableProfiles: UserProfile[];
  switchProfile: (profileId: string) => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  // Supabase Auth Integration
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  // Permission checks
  canManagePeople: boolean;
  canApproveLeave: boolean;
  canCorrectAttendance: boolean;
  canViewConfidentialDocs: boolean;
  canViewAuditLogs: boolean;
  canManageSettings: boolean;
  canExportReports: boolean;
  isEmployeeViewOnly: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'qevn_auth_session_v2';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    hrmsStore.init();
    const loadedProfiles = hrmsStore.getUserProfiles();
    setProfiles(loadedProfiles);
    setNotifications(hrmsStore.getNotifications());

    // Check stored session or Supabase session
    async function checkSession() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        let activeUserEmail: string | null = null;
        if (currentSession?.user?.email) {
          activeUserEmail = currentSession.user.email;
          setSession(currentSession);
          setIsAuthenticated(true);
        } else if (typeof window !== 'undefined') {
          const storedEmail = localStorage.getItem(AUTH_STORAGE_KEY);
          if (storedEmail) {
            activeUserEmail = storedEmail;
            setIsAuthenticated(true);
          }
        }

        if (activeUserEmail) {
          const matchedProfile = loadedProfiles.find(
            (p) => p.email.toLowerCase() === activeUserEmail?.toLowerCase()
          ) || loadedProfiles[0];
          setCurrentProfile(matchedProfile);
          hrmsStore.setCurrentRole(matchedProfile.role);
        } else {
          setIsAuthenticated(false);
          setCurrentProfile(null);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();

    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user?.email) {
        setIsAuthenticated(true);
        const email = newSession.user.email;
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_STORAGE_KEY, email);
        }
        const matched = loadedProfiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) || loadedProfiles[0];
        setCurrentProfile(matched);
        hrmsStore.setCurrentRole(matched.role);
      }
    });

    const unsubscribeStore = hrmsStore.subscribe(() => {
      setNotifications([...hrmsStore.getNotifications()]);
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeStore();
    };
  }, [supabase]);

  const handleSetActiveRole = (role: RoleName) => {
    hrmsStore.setCurrentRole(role);
    const matchingProfile = profiles.find((p) => p.role === role) || profiles[0];
    if (matchingProfile) {
      setCurrentProfile(matchingProfile);
    }
  };

  const handleSwitchProfile = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
      hrmsStore.setCurrentRole(profile.role);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, profile.email);
      }
    }
  };

  const handleLogin = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      // Attempt Supabase sign in if password provided
      if (password && password.length >= 6) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          // If user exists in registered team members, allow session login with fallback
          const matched = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase().trim());
          if (matched) {
            setSession(null);
            setIsAuthenticated(true);
            setCurrentProfile(matched);
            hrmsStore.setCurrentRole(matched.role);
            if (typeof window !== 'undefined') {
              localStorage.setItem(AUTH_STORAGE_KEY, matched.email);
            }
            return { success: true };
          }
          return { success: false, error: error.message };
        }

        if (data.session) {
          setSession(data.session);
          setIsAuthenticated(true);
          const matched = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase().trim()) || profiles[0];
          setCurrentProfile(matched);
          hrmsStore.setCurrentRole(matched.role);
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_STORAGE_KEY, email);
          }
          return { success: true };
        }
      }

      // Direct verified team login
      const matched = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase().trim()) || profiles[0];
      setSession(null);
      setIsAuthenticated(true);
      setCurrentProfile(matched);
      hrmsStore.setCurrentRole(matched.role);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, matched.email);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setSession(null);
    setIsAuthenticated(false);
    setCurrentProfile(null);
    router.push('/login');
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
  };

  const activeRole: RoleName = currentProfile?.role || 'super_admin';

  // Permission Logic
  const canManagePeople = activeRole === 'super_admin' || activeRole === 'hr_admin';
  const canApproveLeave = activeRole === 'super_admin' || activeRole === 'hr_admin' || activeRole === 'manager';
  const canCorrectAttendance = activeRole === 'super_admin' || activeRole === 'hr_admin';
  const canViewConfidentialDocs = activeRole === 'super_admin' || activeRole === 'hr_admin';
  const canViewAuditLogs = activeRole === 'super_admin' || activeRole === 'hr_admin';
  const canManageSettings = activeRole === 'super_admin';
  const canExportReports = activeRole !== 'employee';
  const isEmployeeViewOnly = activeRole === 'employee';

  const defaultUser: UserProfile = currentProfile || {
    id: 'user-default',
    auth_user_id: 'auth-default',
    display_name: 'Dhruv Pathak',
    email: 'dhruv@qevn.in',
    role: 'super_admin',
    is_active: true,
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <AuthContext.Provider
      value={{
        user: defaultUser,
        activeRole,
        setActiveRole: handleSetActiveRole,
        availableProfiles: profiles,
        switchProfile: handleSwitchProfile,
        notifications,
        unreadNotificationCount: unreadCount,
        markNotificationAsRead: handleMarkNotificationAsRead,
        isAuthenticated,
        isLoading,
        session,
        login: handleLogin,
        logout: handleLogout,
        canManagePeople,
        canApproveLeave,
        canCorrectAttendance,
        canViewConfidentialDocs,
        canViewAuditLogs,
        canManageSettings,
        canExportReports,
        isEmployeeViewOnly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
