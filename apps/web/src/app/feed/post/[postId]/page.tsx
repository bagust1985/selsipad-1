import { getPostById, getPostComments } from '@/lib/data/feed';
import { getUserProfile } from '@/lib/data/profile';
import PostDetailClient from './PostDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { postId: string };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { postId } = params;

  const [post, comments, profile] = await Promise.all([
    getPostById(postId),
    getPostComments(postId),
    getUserProfile(),
  ]);

  const bluecheckStatus = profile?.bluecheck_status?.toUpperCase();
  const userEligible = bluecheckStatus === 'VERIFIED' || bluecheckStatus === 'ACTIVE';

  return (
    <PostDetailClient
      post={post}
      initialComments={comments}
      userProfile={profile}
      userEligible={userEligible}
    />
  );
}
