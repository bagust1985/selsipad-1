import Link from 'next/link';
import { ArrowLeft, Settings, Plus, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { TemplateAuditTable } from './TemplateAuditTable';
import { AddTemplateForm } from './AddTemplateForm';

export default async function TemplateAuditsPage() {
  const supabase = createClient();

  const { data: templates, error } = await supabase
    .from('template_audits')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Back Button */}
      <Link
        href="/admin/contracts"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Contract Management
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">Template Audit Registry (STRICT Mode)</h1>
        </div>
        <p className="text-gray-400">
          Manage audited template versions for PROJECT_AUDITED badge inheritance
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-950/30 border border-blue-800/40 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-300 font-medium mb-1">STRICT Inheritance Policy</p>
            <p className="text-blue-200/80">
              Projects using launchpad templates will only receive PROJECT_AUDITED badge if the
              template version exists in this registry with VALID status. Templates without audit
              records show "Factory Verified" instead.
            </p>
          </div>
        </div>
      </div>

      {/* Add Template Form */}
      <AddTemplateForm />

      {/* Templates Table */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">Audited Templates</h2>
        {templates && templates.length > 0 ? (
          <TemplateAuditTable templates={templates} />
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <Plus className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No Template Audits</h3>
            <p className="text-gray-500 text-sm">
              Add audited template versions above to enable PROJECT_AUDITED badge inheritance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
