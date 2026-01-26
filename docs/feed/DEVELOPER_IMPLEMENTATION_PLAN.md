# SelsiFeed Feature Enhancement Plan

> **For Developers**: Complete implementation guide for enhancing SelsiFeed with advanced features

---

## 📋 Overview

This document outlines planned enhancements to SelsiFeed to add:

- 📸 Image upload & display
- #️⃣ Hashtag trending system
- 🔗 Social media sharing
- 👥 Follow/unfollow functionality
- 🏅 Enhanced badge display
- 💬 Improved comment system

---

## 🎯 Feature 1: Image Upload & Display

### Goal

Allow users to attach up to 4 images per post with responsive grid display.

### Database Changes

```sql
-- Already exists, just use it
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls text[];
```

### Implementation Steps

#### 1.1 Backend - Storage Setup

**File**: N/A (Supabase Console)

1. Verify bucket `public-files` exists in Supabase Storage
2. Set bucket to **public**
3. Add RLS policies:

```sql
-- Allow public uploads
CREATE POLICY "Public upload to public-files"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'public-files');

-- Allow public reads
CREATE POLICY "Public read from public-files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'public-files');
```

#### 1.2 Backend - Save Image URLs

**File**: `apps/web/app/feed/actions.ts`

Update `createPost` function:

```typescript
export async function createPost(
  content: string,
  projectId?: string,
  imageUrls?: string[], // Add this param
) {
  // ... existing auth checks ...

  // Insert with images
  const { data: newPost, error } = await supabase
    .from("posts")
    .insert({
      author_id: session.userId,
      content,
      project_id: projectId,
      type: "POST",
      image_urls: imageUrls || [], // Add this
    })
    .select()
    .single();

  // Return with images
  return {
    // ... existing fields ...
    image_urls: newPost.image_urls || [],
  };
}
```

#### 1.3 Frontend - Upload UI

**File**: `apps/web/src/components/feed/PostComposer.tsx`

Add image upload functionality:

```typescript
const [images, setImages] = useState<string[]>([]);
const [uploading, setUploading] = useState(false);

const handleImageUpload = async (files: FileList) => {
  setUploading(true);
  const uploadedUrls: string[] = [];

  for (const file of Array.from(files)) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error } = await supabase.storage
      .from("public-files")
      .upload(filePath, file);

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("public-files").getPublicUrl(filePath);
      uploadedUrls.push(publicUrl);
    }
  }

  setImages([...images, ...uploadedUrls]);
  setUploading(false);
};
```

UI for image picker:

```tsx
<input
  type="file"
  accept="image/*"
  multiple
  max={4}
  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
/>
```

#### 1.4 Frontend - Display Images

**File**: `apps/web/src/components/feed/FeedPost.tsx`

Add to Post interface:

```typescript
interface FeedPostProps {
  post: {
    // ... existing fields ...
    image_urls?: string[];
  };
}
```

Display grid:

```tsx
{
  post.image_urls && post.image_urls.length > 0 && (
    <div
      className={`mt-3 grid gap-2 ${
        post.image_urls.length === 1
          ? "grid-cols-1"
          : post.image_urls.length === 2
            ? "grid-cols-2"
            : "grid-cols-2"
      }`}
    >
      {post.image_urls.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`Post image ${index + 1}`}
          className="rounded-2xl border border-border-subtle object-cover h-64 w-full"
        />
      ))}
    </div>
  );
}
```

#### 1.5 Data Layer

**File**: `apps/web/src/lib/data/feed.ts`

Add to Post type:

```typescript
export interface Post {
  // ... existing fields ...
  image_urls?: string[];
}
```

Query with images:

```typescript
const { data } = await supabase
  .from("posts")
  .select("id, author_id, content, created_at, image_urls");
// ... rest of query
```

Map to frontend:

```typescript
return {
  // ... existing fields ...
  image_urls: post.image_urls || [],
};
```

---

## 🎯 Feature 2: Hashtag Trending System

### Goal

Extract hashtags from posts, require minimum 20 hashtags, calculate trending based on 24hr usage.

### Database Changes

```sql
-- Add hashtags column
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags text[];

-- Add GIN index for fast search
CREATE INDEX IF NOT EXISTS idx_posts_hashtags
ON posts USING GIN (hashtags);
```

### Implementation Steps

#### 2.1 Backend - Hashtag Extraction

**File**: `apps/web/app/feed/actions.ts`

Add extraction function:

```typescript
function extractHashtags(text: string): string[] {
  const matches = text.match(/#\w+/g);
  return matches ? [...new Set(matches.map((tag) => tag.toLowerCase()))] : [];
}
```

Validate and save:

```typescript
export async function createPost(content: string, ...) {
  // Extract hashtags
  const hashtags = extractHashtags(content);

  // Validate minimum 20
  if (hashtags.length < 20) {
    throw new Error(`Minimum 20 hashtags required (found ${hashtags.length})`);
  }

  // Save with hashtags
  const { data: newPost } = await supabase
    .from('posts')
    .insert({
      // ... other fields ...
      hashtags: hashtags,
    })
    .select()
    .single();
}
```

#### 2.2 Frontend - Hashtag Counter

**File**: `apps/web/src/components/feed/PostComposer.tsx`

Real-time counter:

```typescript
const extractHashtags = (text: string): string[] => {
  const matches = text.match(/#\w+/g);
  return matches ? [...new Set(matches.map((tag) => tag.toLowerCase()))] : [];
};

const hashtags = extractHashtags(content);
const hashtagCount = hashtags.length;
const hasEnoughHashtags = hashtagCount >= 20;
```

Display counter:

```tsx
<div className="flex items-center gap-2">
  <span className="text-xs text-text-secondary">#</span>
  <span
    className={`text-sm font-semibold ${
      hashtagCount >= 20 ? "text-green-500" : "text-orange-500"
    }`}
  >
    {hashtagCount}/20
  </span>
</div>
```

Disable post if insufficient:

```typescript
const canPost = content.trim() && !isOverLimit && hasEnoughHashtags;
```

#### 2.3 Backend - Trending API

**File**: `apps/web/app/api/feed/trending/route.ts` (NEW)

```typescript
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();

  // Get posts from last 24 hours with hashtags
  const { data: posts } = await supabase
    .from("posts")
    .select("hashtags, created_at, project_id")
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .not("hashtags", "is", null);

  // Count hashtag occurrences
  const hashtagCounts: Record<
    string,
    { count: number; projectIds: Set<string> }
  > = {};

  posts?.forEach((post) => {
    post.hashtags?.forEach((tag: string) => {
      if (!hashtagCounts[tag]) {
        hashtagCounts[tag] = { count: 0, projectIds: new Set() };
      }
      hashtagCounts[tag].count++;
      if (post.project_id) {
        hashtagCounts[tag].projectIds.add(post.project_id);
      }
    });
  });

  // Sort and return top 10
  const trending = Object.entries(hashtagCounts)
    .map(([hashtag, data]) => ({
      hashtag,
      post_count_24h: data.count,
      project_count: data.projectIds.size,
      score: data.count + data.projectIds.size * 2,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return Response.json({ trending });
}
```

#### 2.4 Frontend - Clickable Hashtags

**File**: `apps/web/src/components/feed/FeedPost.tsx`

Display hashtags as links:

```tsx
{
  post.hashtags && post.hashtags.length > 0 && (
    <div className="mt-2 flex flex-wrap gap-2">
      {post.hashtags.map((tag, index) => (
        <a
          key={index}
          href={`/projects?search=${encodeURIComponent(tag.replace("#", ""))}`}
          className="text-sm text-primary-main hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {tag}
        </a>
      ))}
    </div>
  );
}
```

#### 2.5 Frontend - Trending Widget

**File**: `apps/web/src/components/trending/TrendingWidget.tsx`

Update to show hashtags:

```typescript
useEffect(() => {
  fetch("/api/feed/trending")
    .then((res) => res.json())
    .then((data) => setTrending(data.trending || []));
}, []);
```

Display:

```tsx
{
  trending.map((item) => (
    <div key={item.hashtag} className="p-3 hover:bg-gray-800">
      <div className="font-bold text-blue-400">{item.hashtag}</div>
      <div className="text-xs text-gray-500">
        {item.post_count_24h} posts · {item.project_count} projects
      </div>
    </div>
  ));
}
```

---

## 🎯 Feature 3: Follow/Unfollow System

### Goal

Allow users to follow/unfollow other users, with status persistence.

### Database Changes

```sql
-- Table already exists, add RLS policies
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can follow others"
ON user_follows FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can view follows"
ON user_follows FOR SELECT TO public USING (true);

CREATE POLICY "Users can unfollow"
ON user_follows FOR DELETE TO public USING (true);
```

### Implementation Steps

#### 3.1 Backend - Follow API

**File**: `apps/web/app/api/feed/follow/[userId]/route.ts` (NEW)

```typescript
import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "@/lib/auth/session";

// POST - Follow user
export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const session = await getServerSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { userId: targetUserId } = params;

  // Can't follow yourself
  if (session.userId === targetUserId) {
    return Response.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const supabase = createClient();

  const { error } = await supabase.from("user_follows").insert({
    follower_id: session.userId,
    following_id: targetUserId,
  });

  if (error) {
    return Response.json({ error: "Failed to follow" }, { status: 500 });
  }

  return Response.json({ success: true, following: true });
}

// DELETE - Unfollow user
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const session = await getServerSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient();

  const { error } = await supabase
    .from("user_follows")
    .delete()
    .eq("follower_id", session.userId)
    .eq("following_id", params.userId);

  if (error) {
    return Response.json({ error: "Failed to unfollow" }, { status: 500 });
  }

  return Response.json({ success: true, following: false });
}

// GET - Check follow status
export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const session = await getServerSession();
  if (!session) return Response.json({ following: false });

  const supabase = createClient();

  const { data } = await supabase
    .from("user_follows")
    .select("id")
    .eq("follower_id", session.userId)
    .eq("following_id", params.userId)
    .single();

  return Response.json({ following: !!data });
}
```

#### 3.2 Frontend - Follow Button

**File**: `apps/web/src/components/feed/FeedPost.tsx`

Add state:

```typescript
const [isFollowing, setIsFollowing] = useState(false);
const [followLoading, setFollowLoading] = useState(false);

// Check follow status on mount
useEffect(() => {
  if (!currentUserId || isAuthor) return;

  fetch(`/api/feed/follow/${post.author.id}`)
    .then((res) => res.json())
    .then((data) => setIsFollowing(data.following));
}, [post.author.id, currentUserId, isAuthor]);
```

Handle follow/unfollow:

```typescript
const handleFollow = async () => {
  if (!currentUserId || followLoading) return;

  setFollowLoading(true);
  const method = isFollowing ? "DELETE" : "POST";

  const response = await fetch(`/api/feed/follow/${post.author.id}`, {
    method,
  });

  if (response.ok) {
    setIsFollowing(!isFollowing);
  }

  setFollowLoading(false);
};
```

Display button:

```tsx
{
  !isAuthor && currentUserId && (
    <button
      onClick={handleFollow}
      disabled={followLoading}
      className={`px-3 py-1 text-xs rounded-full ${
        isFollowing
          ? "border border-gray-500 hover:border-red-600 hover:text-red-600"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
```

---

## 🎯 Feature 4: Social Media Share

### Goal

Enable sharing posts to Twitter, Telegram, WhatsApp, and clipboard.

### Implementation Steps

#### 4.1 Frontend - Share Menu

**File**: `apps/web/src/components/feed/FeedPost.tsx`

Add state:

```typescript
const [showShareMenu, setShowShareMenu] = useState(false);
const shareMenuRef = useRef<HTMLDivElement>(null);

// Close menu when clicking outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      shareMenuRef.current &&
      !shareMenuRef.current.contains(event.target as Node)
    ) {
      setShowShareMenu(false);
    }
  };

  if (showShareMenu) {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }
}, [showShareMenu]);
```

Share handlers:

```typescript
const handleShareTo = (platform: "twitter" | "telegram" | "whatsapp") => {
  const postUrl = `${window.location.origin}/feed?post=${post.id}`;
  const text = `Check out this post: ${post.content.slice(0, 100)}`;

  const urls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + postUrl)}`,
  };

  window.open(urls[platform], "_blank");
  setShowShareMenu(false);
};

const handleCopyLink = async () => {
  const postUrl = `${window.location.origin}/feed?post=${post.id}`;
  await navigator.clipboard.writeText(postUrl);
  alert("Link copied!");
  setShowShareMenu(false);
};
```

UI:

```tsx
<div className="relative" ref={shareMenuRef}>
  <button onClick={() => setShowShareMenu(!showShareMenu)}>
    <Share2 className="w-4 h-4" />
  </button>

  {showShareMenu && (
    <div className="absolute bottom-full right-0 mb-2 bg-white border rounded-xl shadow-lg py-2 w-48">
      <button
        onClick={() => handleShareTo("twitter")}
        className="w-full px-4 py-2 text-left hover:bg-gray-100"
      >
        Share to Twitter
      </button>
      <button
        onClick={() => handleShareTo("telegram")}
        className="w-full px-4 py-2 text-left hover:bg-gray-100"
      >
        Share to Telegram
      </button>
      <button
        onClick={() => handleShareTo("whatsapp")}
        className="w-full px-4 py-2 text-left hover:bg-gray-100"
      >
        Share to WhatsApp
      </button>
      <div className="border-t my-1"></div>
      <button
        onClick={handleCopyLink}
        className="w-full px-4 py-2 text-left hover:bg-gray-100"
      >
        Copy Link
      </button>
    </div>
  )}
</div>
```

---

## 🎯 Feature 5: Enhanced Badge Display

### Goal

Display blue check badge with icon image instead of emoji.

### Implementation Steps

#### 5.1 Update BadgeDisplay Component

**File**: `apps/web/src/components/badges/BadgeDisplay.tsx`

Add icon support:

```typescript
export function BadgeDisplay({ badge, size = 'md', showTooltip = true }) {
  const emoji = BADGE_EMOJI_MAP[badge.key] || '🏅';

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // If icon_url provided, show image
  if (badge.icon_url) {
    return (
      <img
        src={badge.icon_url}
        alt={badge.display_name}
        className={`inline-flex ${sizeClasses[size]}`}
        title={showTooltip ? badge.display_name : undefined}
      />
    );
  }

  // Fallback to emoji
  return (
    <span className="inline-flex items-center" title={showTooltip ? badge.display_name : undefined}>
      {emoji}
    </span>
  );
}
```

#### 5.2 Use Badge Component in Feed

**File**: `apps/web/src/components/feed/FeedPost.tsx`

Import and use:

```typescript
import { BadgeDisplay } from '@/components/badges/BadgeDisplay';

// Replace simple checkmark with:
{post.author.bluecheck && (
  <BadgeDisplay
    badge={{
      key: 'BLUE_CHECK',
      display_name: 'Verified',
      icon_url: '/bluecheck-badge.png', // Icon file in public folder
    }}
    size="sm"
  />
)}
```

---

## 🎯 Feature 6: Improved Comments

### Goal

Show comment count before opening modal, fetch comments dynamically.

### Implementation Steps

#### 6.1 Frontend - Fetch Comment Count

**File**: `apps/web/src/components/feed/FeedPost.tsx`

Add state and fetch:

```typescript
const [commentCount, setCommentCount] = useState(post.replies || 0);

useEffect(() => {
  const fetchCommentCount = async () => {
    const response = await fetch(`/api/feed/comments/${post.id}`);
    const data = await response.json();
    setCommentCount(data.comments?.length || 0);
  };
  fetchCommentCount();
}, [post.id]);
```

Display count:

```tsx
<button onClick={() => setCommentModalOpen(true)}>
  <MessageCircle className="w-4 h-4" />
  <span>{commentCount > 0 ? commentCount : ""}</span>
</button>
```

---

## 📝 Implementation Checklist

### Priority 1: Essential Features

- [ ] Image upload & display
- [ ] Badge icon display

### Priority 2: Social Features

- [ ] Follow/Unfollow system
- [ ] Social media share menu
- [ ] Comment count display

### Priority 3: Advanced Features

- [ ] Hashtag trending system (20 min requirement)
- [ ] Trending widget integration

---

## 🧪 Testing Requirements

### For Each Feature

1. **Unit Tests**
   - Test hashtag extraction logic
   - Test image upload validation
   - Test follow/unfollow state management

2. **Integration Tests**
   - Test entire post creation flow with images
   - Test trending calculation accuracy
   - Test follow status persistence

3. **Manual Testing**
   - Upload images → verify display
   - Create post with hashtags → verify trending updates
   - Follow user → refresh → verify status persists
   - Share post → verify all platforms work

---

## 🚀 Deployment Notes

### Database Migrations

Run in order:

1. Add `image_urls` column
2. Add `hashtags` column + GIN index
3. Add RLS policies for `user_follows`
4. Add RLS policies for `storage.objects`

### Environment Setup

Ensure Supabase storage bucket `public-files` configured with public access.

---

## 📊 Performance Considerations

1. **Image Upload**: Compress images before upload (max 5MB per file)
2. **Hashtag Indexing**: GIN index enables fast hashtag search
3. **Trending Cache**: Consider caching trending results for 5-10 minutes
4. **Follow Status**: Batch fetch follow statuses for feed views

---

## 🔒 Security Notes

1. **Storage RLS**: Ensure public policies only on `public-files` bucket
2. **Follow Validation**: Prevent self-follows in API
3. **Hashtag Sanitization**: Validate hashtag format before saving
4. **XSS Protection**: Sanitize user content before displaying

---

## 📞 Questions?

Contact technical lead for clarification on:

- Hashtag minimum requirement (current: 20)
- Image upload limits (current: 4 images, 5MB each)
- Trending calculation weights
- Badge icon design assets

---

**Status**: Ready for Development
**Last Updated**: 2026-01-26
**Version**: 1.0
