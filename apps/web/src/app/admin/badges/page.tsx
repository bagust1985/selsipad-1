import { Award, Users, FolderKanban, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function BadgesOverviewPage() {
  return (
    <div>
      {/* Back Button */}
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Badge Management</h1>
            <p className="text-gray-400">Manage user badges and project badges separately</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Badges Card */}
        <Link
          href="/admin/badges/user"
          className="group bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 hover:shadow-2xl hover:shadow-blue-500/20 transition-all"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 bg-white/10 rounded-xl">
              <Users className="w-12 h-12 text-white" />
            </div>
            <ArrowRight className="w-6 h-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">User Badges</h2>
          <p className="text-blue-100 mb-6">
            Manage badges that attach to user profiles - team badges, achievements, milestones
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
              TEAM_ADMIN
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
              WHALE
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
              REFERRAL_PRO
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
              +9 more
            </span>
          </div>
        </Link>

        {/* Project Badges Card */}
        <Link
          href="/admin/badges/project"
          className="group bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 hover:shadow-2xl hover:shadow-purple-500/20 transition-all"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 bg-white/10 rounded-xl">
              <FolderKanban className="w-12 h-12 text-white" />
            </div>
            <ArrowRight className="w-6 h-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">Project Badges</h2>
          <p className="text-purple-100 mb-6">
            Manage badges that attach to projects - KYC verified, security audited, achievements
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
              KYC_VERIFIED
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
              SC_AUDIT_PASSED
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
              FIRST_PROJECT
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
              +6 more
            </span>
          </div>
        </Link>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Badge System Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-purple-400 font-medium mb-2">User Badges</h4>
            <ul className="text-gray-400 space-y-1">
              <li>• Attach to user profiles permanently</li>
              <li>• Include team roles, achievements, status</li>
              <li>• Can be revoked by admin</li>
              <li>• Visible across all user activities</li>
            </ul>
          </div>
          <div>
            <h4 className="text-blue-400 font-medium mb-2">Project Badges</h4>
            <ul className="text-gray-400 space-y-1">
              <li>• Attach to specific projects</li>
              <li>• Include KYC, security audits, milestones</li>
              <li>• Auto-awarded via triggers</li>
              <li>• May expire when project ends</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
