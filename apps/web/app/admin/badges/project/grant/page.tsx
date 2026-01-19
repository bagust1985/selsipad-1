import { createClient } from '@/lib/supabase/server';
import { GrantBadgeClient } from './GrantBadgeClient';

async function getBadgeDefinitions() {
  const supabase = createClient();

  const { data: badges, error } = await supabase
    .from('badge_definitions')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch badges:', error);
    return [];
  }

  return badges || [];
}

async function getProjects() {
  const supabase = createClient();

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, owner_user_id')
    .order('created_at', { ascending: false })
    .limit(100); // Limit for performance

  if (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }

  return projects || [];
}

export default async function GrantBadgePage() {
  const [badges, projects] = await Promise.all([getBadgeDefinitions(), getProjects()]);

  return <GrantBadgeClient badges={badges} projects={projects} />;
}
