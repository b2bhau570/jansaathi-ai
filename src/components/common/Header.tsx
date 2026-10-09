// JANSAATHI AI - High-Fidelity Claymorphism Navigation Header with Universal Hamburger Menu
// Clean, uncluttered bar with tactile clay hamburger drawer containing all clinical & patient portals

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  Globe,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Home,
  FileSearch,
  ClipboardList,
  BarChart3,
  FileText,
  Share2,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ClinicalDisclaimer } from './ClinicalDisclaimer';

export const Header: React.FC = () => {
  const { currentLanguage, setLanguage, availableLanguages, t } = useLanguage();
  const { user, isAuthenticated, logout, switchTestingRole } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      category: 'Patient Care & Intake',
      items: [
        {
          path: '/',
          label: t.nav.home,
          description: 'Welcome portal & clinical triage overview',
          icon: Home,
          color: 'from-violet-500 to-purple-600',
        },
        {
          path: '/patient',
          label: t.nav.patientPortal,
          description: 'Voice, text, reports & vitals intake',
          icon: UserPlus,
          color: 'from-pink-500 to-rose-600',
        },
        {
          path: '/status',
          label: t.nav.trackStatus,
          description: 'Track case triage, clinician notes & AI doubts',
          icon: FileSearch,
          color: 'from-amber-500 to-orange-600',
        },
        {
          path: '/softly',
          label: 'Softly Wellness',
          description: 'Minimalist digital living room & tactile breathwork',
          icon: Sparkles,
          color: 'from-rose-400 to-orange-300',
        },
      ],
    },
    {
      category: 'PHC Clinical & Operations',
      items: [
        {
          path: '/cases',
          label: t.nav.clinicalQueue,
          description: 'Urgency-prioritized clinician triage inbox',
          icon: ClipboardList,
          color: 'from-emerald-500 to-teal-600',
        },
        {
          path: '/dashboard',
          label: t.nav.dashboard,
          description: 'Epidemic surveillance & facility analytics',
          icon: BarChart3,
          color: 'from-blue-500 to-indigo-600',
        },
        {
          path: '/reports',
          label: t.nav.reports,
          description: 'Multilingual lab & radiology diagnostic review',
          icon: FileText,
          color: 'from-cyan-500 to-sky-600',
        },
        {
          path: '/referrals',
          label: t.nav.referrals,
          description: 'Secondary & tertiary hospital referral slips',
          icon: Share2,
          color: 'from-fuchsia-500 to-pink-600',
        },
        {
          path: '/audit',
          label: t.nav.audit,
          description: 'Tamper-evident clinical compliance logs',
          icon: ShieldCheck,
          color: 'from-slate-600 to-zinc-800',
        },
      ],
    },
  ];

  // Current active label for breadcrumb badge
  const currentNav = navItems.flatMap((c) => c.items).find((i) => i.path === location.pathname);

  return (
    <header className="sticky top-2 sm:top-4 z-50 px-3 sm:px-6 lg:px-8 transition-all">
      {/* Top Clinical Safety Bar */}
      <div className="max-w-7xl mx-auto mb-2">
        <ClinicalDisclaimer compact />
      </div>

      {/* Floating High-Fidelity Clay Navbar */}
      <div className="max-w-7xl mx-auto rounded-[28px] sm:rounded-[36px] bg-white/85 backdrop-blur-2xl border border-white/95 shadow-clayCard px-4 sm:px-6 lg:px-7 py-2.5 sm:py-3 transition-all duration-300">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#A78BFA] via-[#7C3AED] to-[#DB2777] flex items-center justify-center shadow-clayOrb transition-transform duration-300 group-hover:scale-105 active:scale-95">
              <Stethoscope className="w-6 h-6 text-white drop-shadow-sm" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#332F3A] block leading-tight font-heading">
                JANSAATHI <span className="text-[#7C3AED]">AI</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#635F69] hidden md:block tracking-wide">
                Frontline Clinical Triage Assistant
              </span>
            </div>
          </Link>

          {/* Center Quick Link / Active Badge */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/patient"
              className={`px-4 py-2 rounded-2xl text-xs font-black font-heading transition-all duration-200 flex items-center space-x-1.5 ${
                isActive('/patient')
                  ? 'clay-btn-primary shadow-clayPill text-white'
                  : 'clay-btn-secondary text-[#7C3AED] hover:bg-violet-50'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.nav.patientPortal}</span>
            </Link>

            <Link
              to="/status"
              className={`px-4 py-2 rounded-2xl text-xs font-bold font-heading transition-all duration-200 flex items-center space-x-1.5 ${
                isActive('/status')
                  ? 'clay-btn-primary shadow-clayPill text-white'
                  : 'clay-btn-secondary text-[#635F69] hover:bg-violet-50'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>{t.nav.trackStatus}</span>
            </Link>

            <Link
              to="/cases"
              className={`px-4 py-2 rounded-2xl text-xs font-bold font-heading transition-all duration-200 flex items-center space-x-1.5 ${
                isActive('/cases')
                  ? 'clay-btn-primary shadow-clayPill text-white'
                  : 'clay-btn-secondary text-[#635F69] hover:bg-violet-50'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{t.nav.clinicalQueue}</span>
            </Link>
          </div>

          {/* Right Tools: Language Picker, Role/Auth & Prominent Hamburger Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Selector */}
            <div className="relative inline-flex items-center bg-[#EFEBF5] rounded-full px-2.5 sm:px-3 py-1 shadow-clayPressed">
              <Globe className="w-3.5 h-3.5 text-[#7C3AED] mr-1 sm:mr-1.5 shrink-0" aria-hidden="true" />
              <select
                id="language-select"
                aria-label="Select Interface Language"
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-[#332F3A] font-bold text-xs focus:outline-hidden cursor-pointer max-w-[90px] sm:max-w-none"
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

            {/* Authenticated Clinician Pill (Compact) */}
            {isAuthenticated && user && (
              <div className="hidden sm:flex items-center space-x-1.5 bg-[#EFEBF5] rounded-full px-2.5 py-1 shadow-clayPressed text-xs font-bold text-[#332F3A]">
                <User className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span className="text-[11px] font-heading font-black truncate max-w-[80px]">
                  {user.fullName.split(' ')[0]}
                </span>
                <span className="text-[10px] text-[#7C3AED] font-black uppercase">
                  ({user.role === 'clinician' ? 'MD' : user.role})
                </span>
              </div>
            )}

            {/* Claymorphic Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="clay-btn-secondary px-3.5 sm:px-4 py-2 rounded-2xl flex items-center space-x-2 text-xs font-black font-heading text-[#332F3A] shadow-clayButton active:scale-90"
              aria-label={drawerOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              title="Menu & Portals"
            >
              {drawerOpen ? (
                <X className="w-4 h-4 text-rose-600" />
              ) : (
                <Menu className="w-4 h-4 text-[#7C3AED]" />
              )}
              <span className="font-heading font-black text-xs">
                {drawerOpen ? 'Close' : 'Menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* High-Fidelity Claymorphic Slide-Over Drawer Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Clay Drawer Panel */}
          <div className="relative w-full max-w-md sm:max-w-lg bg-[#F5F2FA] h-full shadow-2xl overflow-y-auto p-5 sm:p-7 flex flex-col justify-between z-10 border-l border-white/80 animate-slideIn">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-purple-200/70 mb-5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center text-white shadow-clayOrb">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#332F3A] font-heading">
                      JANSAATHI <span className="text-[#7C3AED]">AI</span>
                    </h3>
                    <p className="text-[11px] font-bold text-[#635F69]">
                      Clinical Triage Navigation Hub
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="w-10 h-10 rounded-2xl bg-[#EFEBF5] text-[#635F69] hover:text-[#332F3A] flex items-center justify-center shadow-clayPressed active:scale-90"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categorized Navigation Link Cards */}
              <div className="space-y-6">
                {navItems.map((category) => (
                  <div key={category.category}>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-[#7C3AED] mb-2.5 font-heading">
                      {category.category}
                    </h4>
                    <div className="space-y-2">
                      {category.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setDrawerOpen(false)}
                            className={`group p-3 sm:p-3.5 rounded-[22px] flex items-center justify-between transition-all duration-200 active:scale-95 ${
                              active
                                ? 'bg-white shadow-clayCard border-2 border-[#7C3AED]'
                                : 'bg-white/70 hover:bg-white shadow-clayPill border border-white'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-clayOrb shrink-0`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <span
                                  className={`text-sm font-black font-heading block ${
                                    active ? 'text-[#7C3AED]' : 'text-[#332F3A]'
                                  }`}
                                >
                                  {item.label}
                                </span>
                                <span className="text-[11px] font-semibold text-[#635F69] block leading-tight">
                                  {item.description}
                                </span>
                              </div>
                            </div>
                            <ChevronRight
                              className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                                active ? 'text-[#7C3AED]' : 'text-[#A09BA8]'
                              }`}
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drawer Footer: User Profile, Role Selector & Auth Actions */}
            <div className="mt-8 pt-5 border-t border-purple-200/70">
              {isAuthenticated && user ? (
                <div className="clay-card rounded-[24px] p-4 bg-white/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-[#7C3AED]">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#332F3A] font-heading">{user.fullName}</p>
                        <p className="text-[10px] font-bold text-[#7C3AED] uppercase">{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setDrawerOpen(false);
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-1 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.nav.logout}</span>
                    </button>
                  </div>

                  {/* Testing Role Switcher */}
                  <div className="pt-2 border-t border-purple-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#635F69]">Simulate Role:</span>
                    <select
                      aria-label="Switch test role"
                      value={user.role}
                      onChange={(e) => switchTestingRole(e.target.value as any)}
                      className="bg-[#EFEBF5] text-xs font-bold text-[#332F3A] rounded-xl px-2.5 py-1 shadow-clayPressed cursor-pointer"
                    >
                      <option value="clinician">Clinician (MD)</option>
                      <option value="health_worker">Health Worker</option>
                      <option value="facility_admin">Facility Admin</option>
                      <option value="system_admin">System Admin</option>
                      <option value="patient">Patient</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setDrawerOpen(false)}
                    className="clay-btn-secondary text-xs py-3 text-center rounded-[20px] font-heading font-black"
                  >
                    <LogIn className="w-3.5 h-3.5 mr-1 inline" />
                    <span>{t.nav.login}</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setDrawerOpen(false)}
                    className="clay-btn-primary text-xs py-3 text-center rounded-[20px] font-heading font-black"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1 inline" />
                    <span>{t.nav.register}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
