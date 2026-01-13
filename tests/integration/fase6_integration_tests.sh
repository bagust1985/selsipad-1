#!/bin/bash
# FASE 6 Integration Tests
# Manual tests for critical user flows

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SUPABASE_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

echo "======================================"
echo "FASE 6 INTEGRATION TESTS"
echo "======================================"
echo "Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function
test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local expected_status="$4"
  local data="$5"
  local headers="$6"
  
  echo -n "Testing: $name... "
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" $headers)
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      $headers \
      -d "$data")
  fi
  
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$status_code" = "$expected_status" ]; then
    echo -e "${GREEN}✅ PASS${NC} (Status: $status_code)"
    PASSED=$((PASSED + 1))
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  else
    echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
    FAILED=$((FAILED + 1))
    echo "$body"
  fi
  echo ""
}

echo "======================================"
echo "TEST 1: Blue Check Purchase Flow"
echo "======================================"

# 1.1 Get Blue Check price
test_endpoint \
  "Get Blue Check price" \
  "GET" \
  "/api/v1/bluecheck/price" \
  "200"

# 1.2 Check Blue Check status (unauthorized - should work)
test_endpoint \
  "Check Blue Check status (no auth)" \
  "GET" \
  "/api/v1/bluecheck/status" \
  "401"

echo "======================================"
echo "TEST 2: Social Feed (Public Access)"
echo "======================================"

# 2.1 Get public feed
test_endpoint \
  "Get public feed" \
  "GET" \
  "/api/v1/feed?limit=5" \
  "200"

# 2.2 Try to create post without auth (should fail)
test_endpoint \
  "Create post (no auth)" \
  "POST" \
  "/api/v1/posts" \
  "401" \
  '{"content":"Test post","type":"POST"}'

echo "======================================"
echo "TEST 3: Referral System"
echo "======================================"

# 3.1 Get referral leaderboard
test_endpoint \
  "Get referral leaderboard" \
  "GET" \
  "/api/v1/referral/leaderboard" \
  "200"

# 3.2 Try to register referral without auth
test_endpoint \
  "Register referral (no auth)" \
  "POST" \
  "/api/v1/referral/register" \
  "401"

echo "======================================"
echo "TEST 4: AMA Sessions"
echo "======================================"

# 4.1 List public AMA sessions
test_endpoint \
  "List AMA sessions" \
  "GET" \
  "/api/v1/ama?status=APPROVED" \
  "200"

# 4.2 Try to create AMA without auth
test_endpoint \
  "Create AMA (no auth)" \
  "POST" \
  "/api/v1/ama" \
  "401" \
  '{"project_id":"test","title":"Test AMA","type":"TEXT","scheduled_at":"2026-01-20T10:00:00Z"}'

echo "======================================"
echo "TEST 5: Validation Tests"
echo "======================================"

# 5.1 Invalid post type
test_endpoint \
  "Create post with invalid type" \
  "POST" \
  "/api/v1/posts" \
  "401" \
  '{"content":"Test","type":"INVALID"}'

# 5.2 Empty content
test_endpoint \
  "Create post with empty content" \
  "POST" \
  "/api/v1/posts" \
  "401" \
  '{"content":"","type":"POST"}'

echo "======================================"
echo "TEST 6: Pagination Tests"
echo "======================================"

# 6.1 Feed with cursor
test_endpoint \
  "Get feed with limit" \
  "GET" \
  "/api/v1/feed?limit=2" \
  "200"

# 6.2 Get project feed (invalid project should return 404 or empty)
test_endpoint \
  "Get non-existent project feed" \
  "GET" \
  "/api/v1/projects/00000000-0000-0000-0000-000000000000/feed" \
  "404"

echo "======================================"
echo "RESULTS"
echo "======================================"
echo -e "${GREEN}PASSED: $PASSED${NC}"
echo -e "${RED}FAILED: $FAILED${NC}"
echo "TOTAL: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  exit 1
fi
