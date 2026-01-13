# FASE 6 E2E Testing Guide

## Prerequisites

1. **Staging Environment Deployed**
   - Frontend: `https://staging.selsipad.com`
   - Backend API: Running and accessible
   - Database: Populated with test data

2. **Test Accounts**
   - Regular user (no Blue Check)
   - Blue Check user (active)
   - Blue Check user with active referrals
   - Project owner
   - Admin user

## Setup

```bash
cd tests/e2e
pnpm install
```

## Running Tests

### All E2E Tests

```bash
pnpm test
```

### FASE 6 Tests Only

```bash
pnpm test:fase6
```

### Headed Mode (Watch tests run)

```bash
pnpm test:headed
```

### Debug Mode

```bash
pnpm test:debug
```

### Specific Test

```bash
pnpm test tests/fase6/bluecheck.spec.ts
```

## Environment Variables

Create `.env` file:

```
BASE_URL=https://staging.selsipad.com
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
TEST_BLUECHECK_EMAIL=bluecheck@example.com
TEST_BLUECHECK_PASSWORD=password123
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=password123
```

## Test Coverage

### Blue Check Flow (bluecheck.spec.ts)

- ✅ Display pricing page
- ✅ Require authentication
- ✅ Generate payment intent
- ✅ Submit tx_hash
- ✅ Verify Blue Check activation
- ✅ Test posting gating (403 without Blue Check)
- ✅ Test posting success (with Blue Check)

### Referral System (referral.spec.ts)

- ✅ Generate unique referral code
- ✅ Display referral stats
- ✅ Apply referral code on signup
- ✅ Show pending referrals
- ✅ Activation after qualifying event
- ✅ Claim gating (Blue Check + active referrals)
- ✅ Successful claim flow
- ✅ Leaderboard display

### AMA Sessions (ama.spec.ts)

- ✅ Create AMA (project owner)
- ✅ List AMAs with filters
- ✅ Display AMA status flow
- ✅ Generate join token (VOICE/VIDEO only)
- ✅ Join token TTL enforcement (5-15 min)
- ✅ Join token one-time use
- ✅ Join token user binding

### Social Feed (feed.spec.ts)

- ✅ Display public feed
- ✅ Cursor pagination
- ✅ Create post (Blue Check required)
- ✅ Reply to post
- ✅ Quote post
- ✅ Repost
- ✅ Delete own post
- ✅ View post interactions

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd tests/e2e && pnpm install
      - name: Install Playwright
        run: cd tests/e2e && npx playwright install --with-deps
      - name: Run E2E tests
        run: cd tests/e2e && pnpm test
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: tests/e2e/playwright-report/
```

## Test Data Management

### Reset Test Data

```bash
# Run before each test suite
psql $DATABASE_URL < tests/e2e/fixtures/reset_fase6_test_data.sql
```

### Seed Test Data

```bash
# Populate with test accounts and data
psql $DATABASE_URL < tests/e2e/fixtures/seed_fase6_test_data.sql
```

## Known Limitations

1. **Payment Verification** - Uses mock Tx Manager (not real blockchain)
2. **Time Manipulation** - Join token expiry tests need time mocking
3. **Live Streaming** - VOICE/VIDEO AMA tests are placeholders

## Troubleshooting

### Tests Timeout

- Increase timeout in `playwright.config.ts`
- Check staging server is responsive

### Authentication Issues

- Verify test account credentials
- Check cookie/session handling

### Flaky Tests

- Add explicit waits for animations
- Use `waitForLoadState('networkidle')`

## Reporting

After tests run:

```bash
pnpm report
```

Opens HTML report with:

- Test results
- Screenshots of failures
- Execution traces
- Performance metrics

---

**Last Updated:** 2026-01-13T20:30:00Z  
**Status:** Ready for staging deployment testing
