// JANSAATHI AI - Professional Healthcare Header
// Clean navigation, language switcher, user role status, and emergency advisory

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Globe, Shield, User, LogOut, LogIn, Menu, X } from 'lucide-react';
import { ClinicalDisclaimer } from './ClinicalDisclaimer';

export const Header: React.FC = () => {
  const { currentLanguage, setLanguage, availableLanguages, t } = useLanguage();
  const { user, isAuthenticated, logout, switchTestingRole } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50">
      {/* Top Clinical Safety Bar */}
      <ClinicalDisclaimer compact />

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center space-x-3 text-slate-100 hover:text-white">
            <div className="w-10 h-10 rounded bg-teal-700 flex items-center justify-center border border-teal-500 shadow-xs">
              <Stethoscope className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-tight">
                JANSAATHI <span className="text-teal-400 font-semibold">AI</span>
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                Human-in-the-Loop Multilingual Triage Assistant
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive('/') ? 'bg-slate-800 text-teal-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t.nav.home}
            </Link>
            <Link
              to="/patient"
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive('/patient') ? 'bg-slate-800 text-teal-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t.nav.patientPortal}
            </Link>
            <Link
              to="/cases"
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive('/cases') ? 'bg-slate-800 text-teal-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t.nav.clinicalQueue}
            </Link>
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive('/dashboard') ? 'bg-slate-800 text-teal-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t.nav.dashboard}
            </Link>
            <Link
              to="/reports"
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive('/reports') ? 'bg-slate-800 text-teal-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t.nav.reports}
            </Link>
            <Link
              to="/referrals"
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive('/referrals') ? 'bg-slate-800 text-teal-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t.nav.referrals}
            </Link>
            <Link
              to="/audit"
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive('/audit') ? 'bg-slate-800 text-teal-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t.nav.audit}
            </Link>
          </nav>

          {/* Right Tools: Language Picker & Auth */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Language Dropdown */}
            <div className="relative inline-flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5" aria-hidden="true" />
              <label htmlFor="language-select" className="sr-only">
                Select Interface Language
              </label>
              <select
                id="language-select"
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-teal-400 focus:outline-hidden"
              >
                {availableLanguages
                  .filter((l) => l.uiSupported)
                  .map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
              </select>
            </div>

            {/* Role / Auth Menu */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-200 flex items-center justify-end gap-1">
                    <User className="w-3 h-3 text-teal-400" />
                    <span>{user.fullName.split(' ')[0]}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.2 bg-teal-950 text-teal-300 border border-teal-800 rounded">
                      {user.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {user.designation?.slice(0, 20)}
                  </div>
                </div>

                {/* Quick Role Tester Selector */}
                <select
                  aria-label="Switch test role"
                  value={user.role}
                  onChange={(e) => switchTestingRole(e.target.value as any)}
                  className="bg-slate-800 text-[11px] text-slate-300 border border-slate-700 rounded px-1.5 py-0.5"
                  title="Switch Role for Validation"
                >
                  <option value="clinician">Clinician (MD)</option>
                  <option value="health_worker">Health Worker</option>
                  <option value="facility_admin">Facility Admin</option>
                  <option value="system_admin">System Admin</option>
                  <option value="patient">Patient</option>
                </select>

                <button
                  onClick={logout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.nav.login}</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800 px-4 pt-3 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            {t.nav.home}
          </Link>
          <Link
            to="/patient"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            {t.nav.patientPortal}
          </Link>
          <Link
            to="/cases"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            {t.nav.clinicalQueue}
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            {t.nav.dashboard}
          </Link>
          <Link
            to="/reports"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            {t.nav.reports}
          </Link>
          <Link
            to="/referrals"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            {t.nav.referrals}
          </Link>
          <Link
            to="/audit"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            {t.nav.audit}
          </Link>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Language:</span>
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs"
            >
              {availableLanguages.filter((l) => l.uiSupported).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded"
            >
              {t.nav.logout}
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center bg-teal-700 text-white py-2 rounded text-sm font-medium"
            >
              {t.nav.login}
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
