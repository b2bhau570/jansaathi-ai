// JANSAATHI AI - Staff Authentication & Role Session Selector
// Supports Supabase Auth and designated clinical roles (Clinician, Health Worker, Facility Admin, System Admin)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import { Stethoscope, Lock, UserCheck, Shield, Building, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('clinician');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login(email || `${selectedRole}@jansaathi.gov.in`, password, selectedRole);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleQuickLogin = async (role: UserRole) => {
    setSelectedRole(role);
    setIsSubmitting(true);
    await login(`${role}@jansaathi.gov.in`, '', role);
    setIsSubmitting(false);
    navigate('/dashboard');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <ClinicalDisclaimer compact />

        <div className="bg-white rounded border border-slate-300 p-6 md:p-8 shadow-xs mt-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded bg-teal-800 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Healthcare Staff Portal</h1>
            <p className="text-xs text-slate-500 mt-1">
              Authorized clinical, administrative, and public health access
            </p>
          </div>

          {errorMessage && (
            <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-300 text-red-900 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Clinical Role Switcher for Evaluators / Medical Reviewers */}
          <div className="mb-6 p-3 bg-slate-50 rounded border border-slate-200">
            <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Authorized Clinical Role:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('clinician')}
                className="p-2.5 rounded border border-slate-300 hover:border-teal-700 hover:bg-teal-50/50 bg-white text-left transition-colors"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                  Clinician (MD)
                </div>
                <div className="text-[10px] text-slate-500">Case review & referrals</div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLogin('health_worker')}
                className="p-2.5 rounded border border-slate-300 hover:border-teal-700 hover:bg-teal-50/50 bg-white text-left transition-colors"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                  Health Worker
                </div>
                <div className="text-[10px] text-slate-500">Intake & vitals capture</div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLogin('facility_admin')}
                className="p-2.5 rounded border border-slate-300 hover:border-teal-700 hover:bg-teal-50/50 bg-white text-left transition-colors"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-teal-700" />
                  Facility Admin
                </div>
                <div className="text-[10px] text-slate-500">Hospital management</div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLogin('system_admin')}
                className="p-2.5 rounded border border-slate-300 hover:border-teal-700 hover:bg-teal-50/50 bg-white text-left transition-colors"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-teal-700" />
                  System Admin
                </div>
                <div className="text-[10px] text-slate-500">Rules & audit control</div>
              </button>
            </div>
          </div>

          {/* Standard Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="staff-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email:
              </label>
              <input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.gov.in"
                className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-900 focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <div>
              <label htmlFor="staff-password" className="block text-xs font-semibold text-slate-700 mb-1">
                Password:
              </label>
              <input
                id="staff-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-900 focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-teal-800 hover:bg-teal-700 text-white font-semibold rounded text-xs shadow-xs disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Clinical Workstation'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Supabase PostgreSQL Role-Based Authorization</span>
          </div>
        </div>
      </div>
    </div>
  );
};
