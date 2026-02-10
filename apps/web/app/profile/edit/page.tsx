import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProfileEditForm } from './ProfileEditForm';

export const metadata = {
  title: 'Edit Profile | SELSIPAD',
  description: 'Edit your profile information',
};

export default async function EditProfilePage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/');
  }

  // Get current profile data
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, avatar_url')
    .eq('user_id', session.userId)
    .single();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">Edit Profile</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <ProfileEditForm
          initialNickname={profile?.nickname}
          initialAvatarUrl={profile?.avatar_url}
        />
      </div>
    </div>
  );
}
