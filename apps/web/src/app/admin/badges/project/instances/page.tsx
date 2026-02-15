import { createClient } from '@/lib/supabase/server';
import { BadgeInstancesClient } from './BadgeInstancesClient';

async function getBadgeInstances() {
  const supabase = createClient();

  const { data: instances, error } = await supabase
    .from('project_badges')
    .select(
      `
      *,
      badge_definitions(badge_key, name, badge_type, icon_url),
      projects(id, name, owner_user_id)
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch badge instances:', error);
    return [];
  }

  return instances || [];
}

export default async function BadgeInstancesPage() {
  const instances = await getBadgeInstances();

  return <BadgeInstancesClient instances={instances} />;
}
