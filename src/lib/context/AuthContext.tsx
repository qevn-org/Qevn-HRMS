'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, RoleName, NotificationItem } from '@/types/database';
import { hrmsStore } from '@/lib/services/store';
import { createClient } from '@/lib/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { getRoleFromUser } from '@/lib/auth/roles';

interface AuthContextType {
  user: UserProfile;
  activeRole: RoleName;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
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

function toProfile(user: SupabaseUser): UserProfile {
  const meta = (user.user_metadata || {}) as { name?: string };
  return {
    id: user.id,
    auth_user_id: user.id,
    display_name: meta.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    role: getRoleFromUser(user),
    is_active: true,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const applyUser = (user: SupabaseUser | null, newSession: Session | null) => {
    setSession(newSession);
    if (user) {
      const profile = toProfile(user);
      setCurrentProfile(profile);
      hrmsStore.setCurrentRole(profile.role);
    } else {
      setCurrentProfile(null);
      hrmsStore.setCurrentRole('employee');
    }
  };

  useEffect(() => {
    hrmsStore.init();
    setNotifications(hrmsStore.getNotifications());

    async function checkSession() {
      try {
        // getUser() verifies the token with the Supabase Auth server.
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: { session: s } } = await supabase.auth.getSession();
          applyUser(user, s);
        } else {
          applyUser(null, null);
        }
      } catch {
        applyUser(null, null);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      applyUser(newSession?.user ?? null, newSession);
    });

    const unsubscribeStore = hrmsStore.subscribe(() => {
      setNotifications([...hrmsStore.getNotifications()]);
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeStore();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleLogin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!email.trim() || !password) {
      return { success: false, error: 'Email and password are required.' };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error || !data.user) {
      // Deliberately generic: do not reveal whether the account exists.
      return { success: false, error: 'Invalid email or password.' };
    }
    applyUser(data.user, data.session);
    return { success: true };
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // proceed to clear local state regardless
    }
    applyUser(null, null);
    router.replace('/login');
    router.refresh();
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
  };

  const activeRole: RoleName = currentProfile?.role || 'employee';
  const isAuthenticated = !!currentProfile;

  const canManagePeople = activeRole === 'super_admin' || activeRole === 'hr_admin';
  const canApproveLeave = activeRole === 'super_admin' || activeRole === 'hr_admin' || activeRole === 'manager';
  const canCorrectAttendance = activeRole === 'super_admin' || activeRole === 'hr_admin';
  const canViewConfidentialDocs = activeRole === 'super_admin' || activeRole === 'hr_admin';
  const canViewAuditLogs = activeRole === 'super_admin' || activeRole === 'hr_admin';
  const canManageSettings = activeRole === 'super_admin';
  const canExportReports = activeRole !== 'employee';
  const isEmployeeViewOnly = activeRole === 'employee';

  const emptyUser: UserProfile = {
    id: '',
    auth_user_id: '',
    display_name: '',
    email: '',
    role: 'employee',
    is_active: false,
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <AuthContext.Provider
      value={{
        user: currentProfile || emptyUser,
        activeRole,
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
