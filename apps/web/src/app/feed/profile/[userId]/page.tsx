import { FeedProfileClientContent } from './FeedProfileClientContent';

export default async function FeedProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  return <FeedProfileClientContent userId={userId} />;
}
