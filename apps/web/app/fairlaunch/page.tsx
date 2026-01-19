import { createClient } from '@/lib/supabase/server';
import { FairlaunchList } from './FairlaunchList';

export const metadata = {
  title: 'Fairlaunch | SELSIPAD',
  description: 'Browse and participate in fair launch token sales',
};

export default async function FairlaunchPage() {
  const supabase = createClient();

  // Fetch all fairlaunch rounds (public data)
  const { data: fairlaunches, error } = await supabase
    .from('launch_rounds')
    .select('*')
    .eq('sale_type', 'fairlaunch')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch fairlaunches:', error);
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <FairlaunchList fairlaunches={fairlaunches || []} />
      </div>
    </div>
  );
}
