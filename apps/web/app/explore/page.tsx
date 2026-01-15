import Link from 'next/link';
import {
  Card,
  CardContent,
  StatusBadge,
  ProgressBar,
  EmptyState,
  EmptyIcon,
} from '@/components/ui';
import { PageHeader, PageContainer } from '@/components/layout';
import { getAllProjects } from '@/lib/data/projects';
import { ExploreClientContent } from './ExploreClientContent';

export default async function ExplorePage() {
  // Fetch data server-side
  const initialProjects = await getAllProjects();

  return <ExploreClientContent initialProjects={initialProjects} />;
}
