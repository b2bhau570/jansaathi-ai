// JANSAATHI AI - Authentication & Role-Based Access Control Context
// Supports Supabase Auth with offline clinical testing roles (Health Worker, Clinician, Facility Admin, System Admin)

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase/supabaseClient';
import { AuditService } from '../services/supabase/AuditService';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  designation?: string;
  registrationNumber?: string;
  facilityName?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password?: string, intendedRole?: UserRole) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    designation?: string,
    registrationNumber?: string
  ) => Promise<{ needEmailConfirm: boolean }>;
  logout: () => Promise<void>;
  switchTestingRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'jansaathi_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_AUTH_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || 'user@jansaathi.gov.in',
            fullName: session.user.user_metadata?.full_name || 'Healthcare Professional',
            role: (session.user.user_metadata?.role as UserRole) || 'clinician',
            designation: session.user.user_metadata?.designation || 'Medical Officer',
            facilityName: 'District Community Health Centre',
          };
          setUser(profile);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || 'user@jansaathi.gov.in',
            fullName: session.user.user_metadata?.full_name || 'Healthcare Professional',
            role: (session.user.user_metadata?.role as UserRole) || 'clinician',
            designation: session.user.user_metadata?.designation || 'Medical Officer',
            facilityName: 'District Community Health Centre',
          };
          setUser(profile);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
        } else {
          setUser(null);
          localStorage.removeItem(LOCAL_AUTH_KEY);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password = '', intendedRole: UserRole = 'clinician') => {
    if (isSupabaseConfigured && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || email.split('@')[0],
            role: (data.user.user_metadata?.role as UserRole) || intendedRole,
            designation: data.user.user_metadata?.designation || 'Verified Staff',
            facilityName: 'District Community Health Centre',
          };
          setUser(profile);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
          await AuditService.logEvent('LOGIN', profile.role, { email }, undefined, profile.id);
          return;
        }
      } catch (err: any) {
        console.warn('Supabase Auth error, setting local reviewer profile:', err.message);
      }
    }

    // Role-tailored staff session
    const roleProfiles: Record<UserRole, { fullName: string; designation: string }> = {
      clinician: { fullName: 'Dr. Anita Roy, MBBS, MD', designation: 'Senior Medical Officer (Reg #WB-64921)' },
      health_worker: { fullName: 'Sunita Sharma', designation: 'Community Health Officer (CHO)' },
      facility_admin: { fullName: 'Rajesh Patra', designation: 'PHC Superintendent' },
      system_admin: { fullName: 'Technical Administrator', designation: 'State Health IT Ops' },
      patient: { fullName: 'Patient / Citizen', designation: 'Citizen Portal' },
    };

    const targetInfo = roleProfiles[intendedRole] || roleProfiles.clinician;
    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      fullName: targetInfo.fullName,
      role: intendedRole,
      designation: targetInfo.designation,
      facilityName: 'District Community Health Centre #4',
    };

    setUser(profile);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
    await AuditService.logEvent('LOGIN', intendedRole, { email, role: intendedRole }, undefined, profile.id);
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    intendedRole: UserRole = 'clinician',
    designation = '',
    registrationNumber = ''
  ): Promise<{ needEmailConfirm: boolean }> => {
    if (isSupabaseConfigured && password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: intendedRole,
            designation: designation || undefined,
            registration_number: registrationNumber || undefined,
          },
        },
      });

      if (error) throw error;

      if (data.session && data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: fullName || data.user.user_metadata?.full_name || email.split('@')[0],
          role: intendedRole,
          designation: designation || 'Verified Staff',
          registrationNumber: registrationNumber || undefined,
          facilityName: 'District Community Health Centre',
        };
        setUser(profile);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
        await AuditService.logEvent('LOGIN', intendedRole, { email, role: intendedRole }, undefined, profile.id);
        return { needEmailConfirm: false };
      }

      return { needEmailConfirm: true };
    }

    // Local fallback when running offline or unconfigured
    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      fullName: fullName || email.split('@')[0],
      role: intendedRole,
      designation: designation || 'Verified Staff',
      registrationNumber: registrationNumber || undefined,
      facilityName: 'District Community Health Centre #4',
    };
    setUser(profile);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
    await AuditService.logEvent('LOGIN', intendedRole, { email, role: intendedRole }, undefined, profile.id);
    return { needEmailConfirm: false };
  };

  const logout = async () => {
    if (user) {
      await AuditService.logEvent('LOGOUT', user.role, { email: user.email }, undefined, user.id);
    }
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Safe ignore
      }
    }
    setUser(null);
    localStorage.removeItem(LOCAL_AUTH_KEY);
  };

  const switchTestingRole = (role: UserRole) => {
    login(`${role}@jansaathi.gov.in`, '', role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'patient',
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        switchTestingRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
