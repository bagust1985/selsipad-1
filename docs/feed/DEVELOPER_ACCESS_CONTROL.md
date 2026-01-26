# Developer Access Control System

## Overview

Implementasi sistem kontrol akses khusus developer yang hanya bisa diakses oleh user dengan badge `DEV_KYC_VERIFIED`.

---

## 🎯 Features

- ✅ Badge-based access control
- ✅ Protected developer dashboard
- ✅ Protected API endpoints
- ✅ Access verification utility
- ✅ User-friendly error pages

---

## 🔐 Access Control Logic

### Badge Requirement

- **Badge Key**: `DEV_KYC_VERIFIED`
- **Badge Display**: 🔐
- **Required Status**: Active

### Verification Flow

```
User Request → Authentication Check → Badge Verification → Grant/Deny Access
```

---

## 📁 Files Created

### 1. Access Control Utility

**File**: [src/lib/auth/devAccess.ts](file:///home/selsipad/final-project/selsipad/apps/web/src/lib/auth/devAccess.ts)

```typescript
// Check if user has developer badge
export async function hasDevBadge(userId: string): Promise<boolean>;

// Verify and throw error if no access
export async function verifyDevAccess(userId: string): Promise<void>;
```

**Usage:**

```typescript
import { verifyDevAccess } from "@/lib/auth/devAccess";

// In API route
const session = await getServerSession();
await verifyDevAccess(session.userId); // Throws if no access
```

---

### 2. Developer Status API

**File**: [app/api/developer/status/route.ts](file:///home/selsipad/final-project/selsipad/apps/web/app/api/developer/status/route.ts)

**Endpoint**: `GET /api/developer/status`

**Response:**

```json
{
  "hasDeveloperAccess": true,
  "userId": "user-id"
}
```

**Usage in Frontend:**

```typescript
const response = await fetch("/api/developer/status");
const { hasDeveloperAccess } = await response.json();
```

---

### 3. Developer Dashboard

**File**: [app/developer/page.tsx](file:///home/selsipad/final-project/selsipad/apps/web/app/developer/page.tsx)

**Route**: `/developer`

**Features:**

- Auto-check access on page load
- Beautiful access denied page
- Developer tools dashboard
- Quick stats

**Access Denied UI:**

```
┌─────────────────────────────┐
│    🚫 Access Denied        │
│                             │
│  Developer Verified Badge   │
│  Required                   │
│                             │
│  [Go to Profile]            │
└─────────────────────────────┘
```

**Developer Dashboard UI:**

```
┌─────────────────────────────────────┐
│  🛡️ Developer Dashboard            │
│  Verified Developer Access          │
├─────────────────────────────────────┤
│  📚 API Docs  │  💾 Database        │
│  📊 Analytics │  🔒 Contracts       │
│  🧪 Sandbox   │  ⚡ Webhooks        │
└─────────────────────────────────────┘
```

---

### 4. Protected Analytics API (Example)

**File**: [app/api/developer/analytics/route.ts](file:///home/selsipad/final-project/selsipad/apps/web/app/api/developer/analytics/route.ts)

**Endpoint**: `GET /api/developer/analytics`

**Protection**: Requires DEV_KYC_VERIFIED badge

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalPosts": 5430,
    "apiCalls24h": 12340,
    "performance": {
      "avgResponseTime": "145ms",
      "uptime": "99.9%"
    }
  }
}
```

---

## 🔨 How to Protect Routes

### Method 1: API Routes

```typescript
import { getServerSession } from "@/lib/auth/session";
import { verifyDevAccess } from "@/lib/auth/devAccess";

export async function GET(request: NextRequest) {
  // 1. Check auth
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Verify developer access
  try {
    await verifyDevAccess(session.userId);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  // 3. Protected logic here
  return NextResponse.json({ data: "Developer-only data" });
}
```

### Method 2: Page Components

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function ProtectedPage() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/developer/status')
      .then(res => res.json())
      .then(data => setHasAccess(data.hasDeveloperAccess));
  }, []);

  if (hasAccess === null) return <LoadingSpinner />;
  if (!hasAccess) return <AccessDenied />;

  return <YourProtectedContent />;
}
```

### Method 3: Server Actions

```typescript
"use server";

import { getServerSession } from "@/lib/auth/session";
import { verifyDevAccess } from "@/lib/auth/devAccess";

export async function developerOnlyAction() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  await verifyDevAccess(session.userId);

  // Protected action logic
  return { success: true };
}
```

---

## 🎨 UI Components

### Access Denied Component

```tsx
function AccessDenied({ error }: { error?: string }) {
  return (
    <div className="text-center p-8">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-6">
        {error || "Developer verification required"}
      </p>
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <Shield className="w-8 h-8 mx-auto mb-2 text-blue-500" />
        <p className="font-semibold">Developer Verified Badge Required</p>
      </div>
      <a href="/profile" className="btn-primary">
        Go to Profile
      </a>
    </div>
  );
}
```

---

## 🧪 Testing

### Test Developer Access

1. **Create test user with DEV_KYC_VERIFIED badge:**

```sql
-- Grant developer badge to user
INSERT INTO user_badges (user_id, badge_key, awarded_at)
VALUES ('your-user-id', 'DEV_KYC_VERIFIED', NOW());
```

2. **Test access check:**

```bash
curl http://localhost:3000/api/developer/status \
  -H "Cookie: your-session-cookie"
```

3. **Test protected endpoint:**

```bash
curl http://localhost:3000/api/developer/analytics \
  -H "Cookie: your-session-cookie"
```

### Expected Results

**With DEV_KYC_VERIFIED badge:**

- ✅ Can access `/developer` page
- ✅ Can call developer APIs
- ✅ See full dashboard

**Without badge:**

- ❌ See "Access Denied" page
- ❌ Get 403 error from APIs
- ❌ Friendly error message

---

## 🚀 Future Enhancements

### 1. Rate Limiting

Add rate limits for developer APIs:

```typescript
const rateLimit = new Map();

function checkRateLimit(userId: string) {
  const count = rateLimit.get(userId) || 0;
  if (count > 100) throw new Error("Rate limit exceeded");
  rateLimit.set(userId, count + 1);
}
```

### 2. API Key System

Generate API keys for developers:

```typescript
interface DeveloperKey {
  key: string;
  userId: string;
  permissions: string[];
  rateLimit: number;
}
```

### 3. Usage Analytics

Track developer API usage:

```sql
CREATE TABLE developer_api_usage (
  id uuid PRIMARY KEY,
  user_id uuid,
  endpoint text,
  called_at timestamp,
  response_time_ms integer
);
```

### 4. Tiered Access

Different developer tiers:

```typescript
enum DeveloperTier {
  BASIC = "basic", // 100 calls/day
  PRO = "pro", // 1000 calls/day
  ENTERPRISE = "enterprise", // Unlimited
}
```

---

## 📊 Security Considerations

### 1. Badge Verification

- ✅ Check badge on every request
- ✅ Don't cache badge status client-side
- ✅ Verify badge is active, not revoked

### 2. API Protection

- ✅ Always check auth first
- ✅ Then verify developer badge
- ✅ Return 403 (not 404) for unauthorized

### 3. Error Messages

- ✅ Don't leak system info in errors
- ✅ User-friendly messages
- ✅ Log detailed errors server-side

---

## 🔗 Related Files

- [Badge System](file:///home/selsipad/final-project/selsipad/apps/web/src/components/badges)
- [Badge API](file:///home/selsipad/final-project/selsipad/apps/web/app/api/badges)
- [Session Management](file:///home/selsipad/final-project/selsipad/apps/web/src/lib/auth/session.ts)

---

## 📝 Usage Examples

### Protect New Developer Feature

```typescript
// 1. Create protected API
// app/api/developer/your-feature/route.ts
import { verifyDevAccess } from '@/lib/auth/devAccess';

export async function POST(req: Request) {
  const session = await getServerSession();
  await verifyDevAccess(session.userId);

  // Your feature logic
  return Response.json({ success: true });
}

// 2. Add to dashboard
// app/developer/page.tsx
<DeveloperTool
  title="Your Feature"
  description="Description here"
  icon={YourIcon}
  href="/developer/your-feature"
/>
```

### Client-Side Access Check

```typescript
'use client';

function useDevAccess() {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    fetch('/api/developer/status')
      .then(r => r.json())
      .then(d => setHasAccess(d.hasDeveloperAccess));
  }, []);

  return hasAccess;
}

// Usage
function MyComponent() {
  const hasDevAccess = useDevAccess();

  if (!hasDevAccess) return <AccessDenied />;

  return <DeveloperFeature />;
}
```

---

## ✅ Implementation Checklist

- [x] Create `devAccess.ts` utility
- [x] Create developer status API
- [x] Create developer dashboard page
- [x] Create example protected API
- [x] Add access denied UI
- [x] Test with/without badge

---

## 🎯 Status: Production Ready

All developer access control features implemented and tested! 🎉

Users need `DEV_KYC_VERIFIED` badge to access:

- `/developer` dashboard
- `/api/developer/*` endpoints
- Any protected developer features
