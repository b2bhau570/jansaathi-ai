// JANSAATHI AI - Unauthorized Access & 404 Pages
// Standard clinical system error boundaries

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, AlertCircle, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded border border-slate-300 p-8 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 border border-red-300 flex items-center justify-center mx-auto text-red-800">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Access Restricted</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          You do not have the required clinical or administrative authorization role to access this resource.
        </p>
        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-800 text-white rounded text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch Role or Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded border border-slate-300 p-8 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center mx-auto text-slate-700">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Resource Not Found</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          The requested clinical triage page or route does not exist.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
