import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout';
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
    <div className="min-h-screen bg-bg-page pb-20">
      <PageHeader title="Edit Profile" showBack />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <ProfileEditForm
          initialNickname={profile?.nickname}
          initialAvatarUrl={profile?.avatar_url}
        />
      </div>
    </div>
  );
}
