Badge Display Enhancement - Implementation Plan
Overview
Enhance badge visibility across user profile and social feed by:

User Profile: Replace "Verification Status" with "Badge Collection"
User Profile: Rename "KYC Verification" to "Developer KYC Verification"
Social Feed: Display user badges next to nicknames in posts/comments
User Review Required
IMPORTANT

UX Changes:

Profile section heading changes from technical status to user-facing collection
KYC is explicitly scoped as "Developer" verification (project creators only)
Feed shows visual badges for social proof (similar to Twitter blue check)
Current State Analysis
User Profile
File:
ProfileClientContent.tsx

Current Structure (lines 56-120):

<h3>Verification Status</h3>
{/* Blue Check Status */}
<Link href="/profile/blue-check">
  <Card>Blue Check + status badge</Card>
</Link>
{/* KYC Status */}
<Link href="/profile/kyc">
  <Card>KYC + status badge</Card>
</Link>
Social Feed
File: 
FeedPost.tsx

Current Badge Display (lines 93-95):

<span>{post.author.username}</span>
{post.author.bluecheck && <span>✓</span>}
Only shows: Blue Check badge
Missing: Other user badges (KYC, REFERRAL*PRO, WHALE, TEAM*\*, etc.)

Database
Table: user_badges (migration 20260117103000) Table: badge_definitions (21 badge types defined)

Proposed Changes

1. User Profile Enhancement
   [MODIFY] ProfileClientContent.tsx
   Change 1: Section Title

// FROM:

<h3>Verification Status</h3>
// TO:
<h3>Badge Collection</h3>
<p className="text-sm text-gray-400">
  Your earned badges and achievements
</p>
Change 2: KYC Card Title

// FROM:

<h4>KYC Verification</h4>
<p>Identity verification</p>
// TO:
<h4>Developer KYC</h4>
<p>Required for project creators</p>
Change 3: Add Badge Grid Display After Blue Check and KYC cards, add:

{/_ All Other Badges _/}
{userBadges && userBadges.length > 0 && (
<Card>
<CardContent>
<h4>Achievement Badges</h4>
<div className="grid grid-cols-3 gap-3 mt-3">
{userBadges.map(badge => (
<BadgeDisplay key={badge.key} badge={badge} />
))}
</div>
</CardContent>
</Card>
)} 2. Social Feed Enhancement
[MODIFY] FeedPost.tsx
Change: Author Header Section (lines 93-95)

// FROM:

<div className="flex items-center gap-2">
  <span>{post.author.username}</span>
  {post.author.bluecheck && <span>✓</span>}
</div>
// TO:
<div className="flex items-center gap-2">
  <span>{post.author.username}</span>
  <UserBadges 
    userId={post.author.id} 
    compact 
    maxDisplay={3}
  />
</div>
3. New Components
[CREATE] BadgeDisplay Component
File: src/components/badges/BadgeDisplay.tsx

Purpose: Display single badge with icon/emoji

interface BadgeDisplayProps {
badge: {
key: string;
display_name: string;
icon_url: string;
};
size?: 'sm' | 'md' | 'lg';
}
// Renders badge with tooltip on hover
[CREATE] UserBadges Component
File: src/components/badges/UserBadges.tsx

Purpose: Fetch and display user's badges

interface UserBadgesProps {
userId: string;
compact?: boolean; // Show icons only
maxDisplay?: number; // Limit shown (e.g., top 3)
}
// Fetches from /api/badges/[userId]
// Shows inline badges next to username 4. API Endpoint
[CREATE] GET /api/badges/[userId]
File: app/api/badges/[userId]/route.ts

Purpose: Fetch user's active badges

Query:

SELECT bd.\*
FROM user_badges ub
JOIN badge_definitions bd ON ub.badge_key = bd.key
WHERE ub.user_id = $1
AND ub.status = 'ACTIVE'
ORDER BY
CASE bd.category
WHEN 'VERIFICATION' THEN 1
WHEN 'MILESTONE' THEN 2
WHEN 'TEAM' THEN 3
WHEN 'SEASONAL' THEN 4
END,
ub.granted_at DESC
LIMIT $2
Response:

{
"badges": [
{
"key": "BLUE_CHECK",
"display_name": "Blue Check",
"icon_url": "/badges/blue-check.svg",
"category": "VERIFICATION"
},
{
"key": "REFERRAL_PRO",
"display_name": "Referral Pro",
"icon_url": "/badges/referral-pro.svg",
"category": "MILESTONE"
}
]
}
UI Mockups
Profile - Badge Collection Section
┌─────────────────────────────────────────┐
│ Badge Collection │
│ Your earned badges and achievements │
├─────────────────────────────────────────┤
│ [✓] Blue Check │
│ Lifetime verification ACTIVE │
│ │
│ [📋] Developer KYC │
│ Required for project creators │
│ │
│ Achievement Badges │
│ ┌───────┬───────┬───────┐ │
│ │ 👥 │ 🐋 │ ⭐ │ │
│ │ Ref. │ Whale │ Early │ │
│ │ Pro │ │ Bird │ │
│ └───────┴───────┴───────┘ │
└─────────────────────────────────────────┘
Feed - Post Header with Badges
┌─────────────────────────────────────────┐
│ [🎨] JohnDoe ✓ 👥 🐋 │
│ 2 hours ago │
├─────────────────────────────────────────┤
│ This is my post content... │
│ │
│ 💬 5 👍 12 🔄 3 📤 │
└─────────────────────────────────────────┘
Legend:
✓ = Blue Check
👥 = Referral Pro
🐋 = Whale
Verification Plan
Manual Testing
Test 1: Profile Badge Collection

1. Login as user with multiple badges
2. Navigate to /profile
3. Expected:
   - Section title: "Badge Collection"
   - Subtitle visible
   - Blue Check card displays
   - KYC card shows "Developer KYC"
   - Grid of achievement badges below
   - Each badge shows icon + name
     Test 2: Feed Badge Display

4. Grant test user 3+ badges via admin:
   INSERT INTO user_badges
   VALUES (user_id, 'BLUE_CHECK', 'ACTIVE', ...),
   (user_id, 'REFERRAL_PRO', 'ACTIVE', ...),
   (user_id, 'WHALE', 'ACTIVE', ...);
5. Go to /feed
6. Post something
7. Expected:
   - Username shown
   - Badges display inline (✓ 👥 🐋)
   - Max 3 badges shown
   - Hover shows tooltip
     Test 3: Comments Badge Display

8. Same user adds comment to a post
9. Expected:
   - Comment header shows username + badges
   - Same badge display as posts
     Test 4: No Badges User

10. Login as new user (no badges)
11. View profile
12. Expected:
    - Badge Collection section empty or shows earning tips
13. Post on feed
14. Expected:
    - Only username shown, no badges
      Files to Create/Modify
      File Action Purpose
      app/profile/ProfileClientContent.tsx
      MODIFY Update section title + KYC label
      src/components/badges/BadgeDisplay.tsx CREATE Single badge display
      src/components/badges/UserBadges.tsx CREATE Fetch + display user badges
      app/api/badges/[userId]/route.ts CREATE Badge fetching API
      src/components/feed/FeedPost.tsx
      MODIFY Add badges to author header
      src/components/feed/CommentSection.tsx MODIFY Add badges to comments (if exists)
      Implementation Order
      ✅ Create BadgeDisplay component
      ✅ Create UserBadges component
      ✅ Create GET /api/badges/[userId] endpoint
      ✅ Update Profile: section title + KYC label
      ✅ Update Profile: add badge grid
      ✅ Update FeedPost: add UserBadges to header
      ✅ Update Comments: add UserBadges (if comment component exists)
      ✅ Test all scenarios
      Estimated Time: 3-4 hours
      Priority: Medium (UX enhancement, non-breaking)
