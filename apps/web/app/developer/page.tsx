'use client';

import { useEffect, useState } from 'react';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

export default function DeveloperPage() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkDeveloperAccess();
  }, []);

  const checkDeveloperAccess = async () => {
    try {
      const response = await fetch('/api/developer/status');
      const data = await response.json();

      if (data.hasDeveloperAccess) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
        setError(data.error || 'Developer verification required');
      }
    } catch (err: any) {
      setHasAccess(false);
      setError('Failed to verify developer status');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-main" />
          <p className="text-text-secondary">Verifying developer access...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page p-4">
        <div className="max-w-md w-full bg-bg-elevated border border-border-subtle rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-status-error-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-status-error-text" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
          <p className="text-text-secondary mb-6">
            {error || 'This page is only accessible to verified developers.'}
          </p>
          <div className="bg-bg-page border border-border-subtle rounded-lg p-4 mb-6">
            <p className="text-sm text-text-secondary mb-2">
              To access developer features, you need:
            </p>
            <div className="flex items-center justify-center gap-2 text-primary-main">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Developer Verified Badge</span>
            </div>
          </div>
          <a
            href="/profile"
            className="inline-block px-6 py-2 bg-primary-main text-primary-text rounded-full hover:bg-primary-hover transition-colors"
          >
            Go to Profile
          </a>
        </div>
      </div>
    );
  }

  // Developer dashboard (has access)
  return (
    <div className="min-h-screen bg-bg-page">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Developer Dashboard</h1>
              <p className="text-white/80">Verified Developer Access</p>
            </div>
          </div>
        </div>

        {/* Developer Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* API Tools */}
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6 hover:border-primary-main transition-colors">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">API Documentation</h3>
            <p className="text-text-secondary text-sm mb-4">
              Access complete API docs and integration guides
            </p>
            <a href="/developer/api-docs" className="text-primary-main hover:underline text-sm font-semibold">
              View Docs →
            </a>
          </div>

          {/* Database Tools */}
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6 hover:border-primary-main transition-colors">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Database Schema</h3>
            <p className="text-text-secondary text-sm mb-4">
              Explore database schema and run custom queries
            </p>
            <a href="/developer/database" className="text-primary-main hover:underline text-sm font-semibold">
              View Schema →
            </a>
          </div>

          {/* Analytics */}
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6 hover:border-primary-main transition-colors">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Analytics</h3>
            <p className="text-text-secondary text-sm mb-4">
              View platform analytics and metrics
            </p>
            <a href="/developer/analytics" className="text-primary-main hover:underline text-sm font-semibold">
              View Analytics →
            </a>
          </div>

          {/* Smart Contracts */}
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6 hover:border-primary-main transition-colors">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Contract Templates</h3>
            <p className="text-text-secondary text-sm mb-4">
              Deploy verified smart contract templates
            </p>
            <a href="/developer/contracts" className="text-primary-main hover:underline text-sm font-semibold">
              View Templates →
            </a>
          </div>

          {/* Testing Tools */}
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6 hover:border-primary-main transition-colors">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Testing Sandbox</h3>
            <p className="text-text-secondary text-sm mb-4">
              Test features in isolated environment
            </p>
            <a href="/developer/sandbox" className="text-primary-main hover:underline text-sm font-semibold">
              Open Sandbox →
            </a>
          </div>

          {/* Webhooks */}
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6 hover:border-primary-main transition-colors">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Webhooks</h3>
            <p className="text-text-secondary text-sm mb-4">
              Configure webhooks for real-time events
            </p>
            <a href="/developer/webhooks" className="text-primary-main hover:underline text-sm font-semibold">
              Manage Webhooks →
            </a>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
            <p className="text-text-secondary text-sm mb-1">API Calls (24h)</p>
            <p className="text-2xl font-bold text-text-primary">1,234</p>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
            <p className="text-text-secondary text-sm mb-1">Active Projects</p>
            <p className="text-2xl font-bold text-text-primary">5</p>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
            <p className="text-text-secondary text-sm mb-1">Rate Limit</p>
            <p className="text-2xl font-bold text-text-primary">85%</p>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
            <p className="text-text-secondary text-sm mb-1">Status</p>
            <p className="text-2xl font-bold text-green-500">Healthy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
