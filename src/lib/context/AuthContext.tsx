'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, RoleName, NotificationItem } from '@/types/database';
import { hrmsStore } from '@/lib/services/store';

interface AuthContextType {
  user: UserProfile;
  activeRole: RoleName;
  setActiveRole: (role: RoleName) => void;
  availableProfiles: UserProfile[];
  switchProfile: (profileId: string) => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    hrmsStore.init();
    const loadedProfiles = hrmsStore.getUserProfiles();
    setProfiles(loadedProfiles);

    const initialRole = (hrmsStore.getCurrentRole() as RoleName) || 'super_admin';
    const foundProfile = loadedProfiles.find((p) => p.role === initialRole) || loadedProfiles[0];
    setCurrentProfile(foundProfile);

    setNotifications(hrmsStore.getNotifications());

    const unsubscribe = hrmsStore.subscribe(() => {
      setNotifications([...hrmsStore.getNotifications()]);
    });

    return unsubscribe;
  }, []);

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
    }
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
    display_name: 'Alexander Ross',
    email: 'admin@qevn.io',
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
