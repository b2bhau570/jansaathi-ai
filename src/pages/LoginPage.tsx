// JANSAATHI AI - High-Fidelity Claymorphism Staff Authentication & Registration Portal
// Tactile silicone & glass-clay card, recessed inputs, squish action buttons, and quick evaluator roles

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ClinicalDisclaimer } from '../components/common/ClinicalDisclaimer';
import {
  Stethoscope,
  Lock,
  UserCheck,
  Shield,
  Building,
  AlertCircle,
  UserPlus,
  LogIn,
  CheckCircle2,
  User,
} from 'lucide-react';

interface LoginPageProps {
  initialTab?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialTab }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const [mode, setMode] = useState<'login' | 'register'>(
    initialTab || (tabParam === 'register' ? 'register' : 'login')
  );

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('clinician');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('clinician');
  const [regDesignation, setRegDesignation] = useState('');
  const [regMedicalId, setRegMedicalId] = useState('');

  // Status feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await login(loginEmail || `${selectedRole}@jansaathi.gov.in`, loginPassword, selectedRole);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regFullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register(
        regEmail.trim(),
        regPassword,
        regFullName.trim(),
        regRole,
        regDesignation.trim() || undefined,
        regMedicalId.trim() || undefined
      );

      if (result.needEmailConfirm) {
        setSuccessMessage('Account registered! Please check your email for confirmation before signing in.');
      } else {
        setSuccessMessage('Account registered successfully! You are now logged in.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
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
    <div className="min-h-screen py-10">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="mb-4">
          <ClinicalDisclaimer compact />
        </div>

        <div className="clay-card rounded-[36px] p-7 sm:p-9 mt-4">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A78BFA] via-[#7C3AED] to-[#DB2777] text-white flex items-center justify-center mx-auto mb-3 shadow-clayOrb">
              <Stethoscope className="w-7 h-7 drop-shadow-sm" />
            </div>
            <h1 className="text-2xl font-black text-[#332F3A] font-heading">
              {mode === 'login' ? 'Healthcare Staff Portal' : 'Register New Account'}
            </h1>
            <p className="text-xs font-semibold text-[#635F69] mt-1">
              Authorized clinical, administrative, and public health access
            </p>
          </div>

          {/* Mode Tabs in Recessed Clay Bar */}
          <div className="rounded-full bg-[#EFEBF5] p-1.5 shadow-clayPressed mb-6 flex gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2.5 rounded-full text-xs font-black font-heading flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-clayPill'
                  : 'text-[#635F69] hover:text-[#332F3A]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2.5 rounded-full text-xs font-black font-heading flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-clayPill'
                  : 'text-[#635F69] hover:text-[#332F3A]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          {errorMessage && (
            <div role="alert" className="mb-4 p-4 rounded-[20px] bg-rose-500/15 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2 shadow-clayPill">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div role="status" className="mb-4 p-4 rounded-[20px] bg-emerald-500/15 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-clayPill">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            <>
              {/* Quick Clinical Role Switcher */}
              <div className="mb-6 p-4 rounded-[24px] bg-[#EFEBF5] shadow-clayPressed">
                <span className="block text-xs font-black text-[#635F69] uppercase tracking-wider mb-2.5 font-heading">
                  Quick Access (Testing / Evaluation):
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleRoleQuickLogin('clinician')}
                    className="p-3 rounded-[18px] bg-white/90 hover:bg-violet-50 text-left shadow-clayPill transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="font-black text-[#332F3A] flex items-center gap-1.5 font-heading">
                      <UserCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
                      Clinician (MD)
                    </div>
                    <div className="text-[10px] text-[#635F69] font-medium">Case review</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleQuickLogin('health_worker')}
                    className="p-3 rounded-[18px] bg-white/90 hover:bg-violet-50 text-left shadow-clayPill transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="font-black text-[#332F3A] flex items-center gap-1.5 font-heading">
                      <Stethoscope className="w-3.5 h-3.5 text-[#7C3AED]" />
                      Health Worker
                    </div>
                    <div className="text-[10px] text-[#635F69] font-medium">Intake & vitals</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleQuickLogin('facility_admin')}
                    className="p-3 rounded-[18px] bg-white/90 hover:bg-violet-50 text-left shadow-clayPill transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="font-black text-[#332F3A] flex items-center gap-1.5 font-heading">
                      <Building className="w-3.5 h-3.5 text-[#7C3AED]" />
                      Facility Admin
                    </div>
                    <div className="text-[10px] text-[#635F69] font-medium">Hospital admin</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleQuickLogin('system_admin')}
                    className="p-3 rounded-[18px] bg-white/90 hover:bg-violet-50 text-left shadow-clayPill transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="font-black text-[#332F3A] flex items-center gap-1.5 font-heading">
                      <Shield className="w-3.5 h-3.5 text-[#7C3AED]" />
                      System Admin
                    </div>
                    <div className="text-[10px] text-[#635F69] font-medium">Audit logs</div>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#332F3A] mb-1 font-heading">Email Address</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="doctor@phc-kendrapara.gov.in"
                    className="clay-input rounded-2xl p-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#332F3A] mb-1 font-heading">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="clay-input rounded-2xl p-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#332F3A] mb-1 font-heading">Designated Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="clay-input rounded-2xl p-3 text-xs"
                  >
                    <option value="clinician">Clinician (MD / MBBS)</option>
                    <option value="health_worker">Community Health Officer (CHO)</option>
                    <option value="facility_admin">Facility Administrator</option>
                    <option value="system_admin">System Administrator</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="clay-btn-primary w-full py-3.5 h-13 rounded-[20px] text-xs font-black disabled:opacity-50 mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
                </button>
              </form>
            </>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#332F3A] mb-1 font-heading">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#7C3AED] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Dr. Priya Sharma"
                    className="clay-input rounded-2xl pl-9 pr-3 py-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332F3A] mb-1 font-heading">Official Email *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="priya.sharma@phc-gov.in"
                  className="clay-input rounded-2xl p-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#332F3A] mb-1 font-heading">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="clay-input rounded-2xl p-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#332F3A] mb-1 font-heading">Confirm *</label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat"
                    className="clay-input rounded-2xl p-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332F3A] mb-1 font-heading">Staff Role *</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="clay-input rounded-2xl p-3 text-xs"
                >
                  <option value="clinician">Clinician (MD / MBBS Doctor)</option>
                  <option value="health_worker">Community Health Officer (CHO)</option>
                  <option value="facility_admin">Facility Administrator</option>
                  <option value="system_admin">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332F3A] mb-1 font-heading">Designation / Title</label>
                <input
                  type="text"
                  value={regDesignation}
                  onChange={(e) => setRegDesignation(e.target.value)}
                  placeholder="Senior Medical Officer, Kendrapara PHC"
                  className="clay-input rounded-2xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332F3A] mb-1 font-heading">Medical Council / Staff ID</label>
                <input
                  type="text"
                  value={regMedicalId}
                  onChange={(e) => setRegMedicalId(e.target.value)}
                  placeholder="MCI-2024-89104"
                  className="clay-input rounded-2xl p-3 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="clay-btn-primary w-full py-3.5 h-13 rounded-[20px] text-xs font-black disabled:opacity-50 mt-3"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Account...' : 'Register Account'}</span>
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-purple-100 text-center text-xs text-[#635F69] font-medium flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Secured via Supabase Row-Level Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};
