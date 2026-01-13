#!/bin/bash
# FASE 3 Manual API Testing Script
# Tests all Project Lifecycle endpoints

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration - Update these with your actual values
API_BASE_URL="${API_BASE_URL:-http://localhost:3000/api}"
AUTH_TOKEN="${AUTH_TOKEN:-}"
USER_ID="${USER_ID:-}"

# Test results tracking
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
    TESTS_RUN=$((TESTS_RUN + 1))
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

check_response() {
    local response=$1
    local expected_status=$2
    local description=$3
    
    # Extract HTTP status from response
    status=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status" == "$expected_status" ]; then
        print_success "$description (Status: $status)"
        echo "$body"
        return 0
    else
        print_error "$description (Expected: $expected_status, Got: $status)"
        echo "$body"
        return 1
    fi
}

make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_header=""
    
    if [ -n "$AUTH_TOKEN" ]; then
        auth_header="Authorization: Bearer $AUTH_TOKEN"
    fi
    
    if [ -n "$data" ]; then
        curl -s -w "\n%{http_code}" -X "$method" \
            "${API_BASE_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -H "$auth_header" \
            -d "$data"
    else
        curl -s -w "\n%{http_code}" -X "$method" \
            "${API_BASE_URL}${endpoint}" \
            -H "$auth_header"
    fi
}

# ============================================
# FASE 3 API TESTS
# ============================================

echo "================================"
echo "FASE 3 API Testing"
echo "================================"
echo "API Base URL: $API_BASE_URL"
echo ""

# Check prerequisites
if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${YELLOW}WARNING:${NC} AUTH_TOKEN not set. Authentication tests will fail."
    echo "Set it with: export AUTH_TOKEN='your-token-here'"
    echo ""
fi

# ============================================
# 1. Badge Definitions
# ============================================

echo "--- Testing Badge System ---"

print_test "GET /api/badges/definitions - List all badge definitions"
response=$(make_request "GET" "/badges/definitions")
check_response "$response" "200" "Fetch badge definitions"
echo ""

# ============================================
# 2. Project Management
# ============================================

echo "--- Testing Project Management ---"

print_test "POST /api/projects - Create new project"
PROJECT_DATA='{
  "name": "Test Project FASE 3",
  "symbol": "TESTF3",
  "description": "Testing project lifecycle for FASE 3",
  "website": "https://example.com",
  "chains_supported": ["ethereum", "bsc"]
}'
response=$(make_request "POST" "/projects" "$PROJECT_DATA")
if check_response "$response" "201" "Create project"; then
    # Extract project ID from response
    PROJECT_ID=$(echo "$response" | head -n -1 | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "Created Project ID: $PROJECT_ID"
else
    PROJECT_ID="test-project-id"  # Fallback for remaining tests
fi
echo ""

if [ -n "$PROJECT_ID" ]; then
    print_test "GET /api/projects/$PROJECT_ID - Get project details"
    response=$(make_request "GET" "/projects/$PROJECT_ID")
    check_response "$response" "200" "Fetch project details"
    echo ""
    
    print_test "GET /api/badges/$PROJECT_ID - Get project badges"
    response=$(make_request "GET" "/badges/$PROJECT_ID")
    check_response "$response" "200" "Fetch project badges (should include FIRST_PROJECT)"
    echo ""
    
    print_test "PATCH /api/projects/$PROJECT_ID - Update project"
    UPDATE_DATA='{
      "description": "Updated description for testing",
      "twitter": "https://twitter.com/testproject"
    }'
    response=$(make_request "PATCH" "/projects/$PROJECT_ID" "$UPDATE_DATA")
    check_response "$response" "200" "Update project details"
    echo ""
    
    print_test "POST /api/projects/$PROJECT_ID/submit - Submit project for review"
    response=$(make_request "POST" "/projects/$PROJECT_ID/submit" "{}")
    check_response "$response" "200" "Submit project for review"
    echo ""
fi

print_test "GET /api/projects - List all projects"
response=$(make_request "GET" "/projects")
check_response "$response" "200" "List projects"
echo ""

# ============================================
# 3. KYC Pipeline
# ============================================

echo "--- Testing KYC Pipeline ---"

print_test "POST /api/kyc/submit - Submit KYC documents"
KYC_DATA='{
  "submission_type": "INDIVIDUAL",
  "project_id": "'"$PROJECT_ID"'",
  "documents_url": "https://example.com/kyc/documents.pdf",
  "metadata": {
    "full_name": "Test User",
    "country": "US"
  }
}'
response=$(make_request "POST" "/kyc/submit" "$KYC_DATA")
if check_response "$response" "201" "Submit KYC"; then
    KYC_ID=$(echo "$response" | head -n -1 | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "Created KYC Submission ID: $KYC_ID"
fi
echo ""

print_test "GET /api/kyc/status - Check KYC status"
response=$(make_request "GET" "/kyc/status")
check_response "$response" "200" "Fetch KYC status"
echo ""

# Admin KYC Review (requires admin permissions)
if [ -n "$KYC_ID" ]; then
    print_test "POST /api/admin/kyc/$KYC_ID/review - Admin review KYC (requires admin role)"
    REVIEW_DATA='{
      "status": "APPROVED"
    }'
    response=$(make_request "POST" "/admin/kyc/$KYC_ID/review" "$REVIEW_DATA")
    # This will likely fail with 403 if not admin
    if check_response "$response" "200" "Approve KYC submission"; then
        echo "Note: KYC approved, KYC_VERIFIED badge should be auto-awarded"
    else
        echo "Note: Admin KYC review failed (expected if not admin)"
    fi
    echo ""
fi

# ============================================
# 4. Smart Contract Scanning
# ============================================

echo "--- Testing Smart Contract Scanning ---"

if [ -n "$PROJECT_ID" ]; then
    print_test "POST /api/sc-scan/request - Request smart contract scan"
    SCAN_REQUEST='{
      "project_id": "'"$PROJECT_ID"'",
      "contract_address": "0x1234567890123456789012345678901234567890",
      "chain": "ethereum",
      "scan_provider": "CERTIK"
    }'
    response=$(make_request "POST" "/sc-scan/request" "$SCAN_REQUEST")
    if check_response "$response" "201" "Request SC scan"; then
        SCAN_ID=$(echo "$response" | head -n -1 | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        echo "Created Scan ID: $SCAN_ID"
    fi
    echo ""
    
    print_test "GET /api/sc-scan/$PROJECT_ID - Get scan results"
    response=$(make_request "GET" "/sc-scan/$PROJECT_ID")
    check_response "$response" "200" "Fetch SC scan results"
    echo ""
fi

# Webhook test (simulating external scan provider)
if [ -n "$SCAN_ID" ]; then
    print_test "POST /api/webhooks/sc-scan - Webhook: Scan results (simulated)"
    WEBHOOK_DATA='{
      "scan_id": "'"$SCAN_ID"'",
      "status": "PASSED",
      "score": 95,
      "report_url": "https://certik.com/report/12345",
      "findings_summary": {
        "critical": 0,
        "high": 0,
        "medium": 1,
        "low": 3,
        "informational": 5
      }
    }'
    response=$(make_request "POST" "/webhooks/sc-scan" "$WEBHOOK_DATA")
    if check_response "$response" "200" "Process scan webhook"; then
        echo "Note: Scan passed, SC_AUDIT_PASSED badge should be auto-awarded"
    fi
    echo ""
fi

# ============================================
# 5. Badge Award (Manual)
# ============================================

echo "--- Testing Manual Badge Award ---"

if [ -n "$PROJECT_ID" ]; then
    print_test "POST /api/admin/badges/award - Award special badge (requires admin role)"
    BADGE_DATA='{
      "project_id": "'"$PROJECT_ID"'",
      "badge_key": "EARLY_ADOPTER",
      "reason": "Testing manual badge award"
    }'
    response=$(make_request "POST" "/admin/badges/award" "$BADGE_DATA")
    if check_response "$response" "200" "Award manual badge"; then
        echo "Note: Manual badge awarded successfully"
    else
        echo "Note: Manual badge award failed (expected if not admin)"
    fi
    echo ""
fi

# ============================================
# 6. Verify Badge Awards
# ============================================

echo "--- Verifying Badge Awards ---"

if [ -n "$PROJECT_ID" ]; then
    print_test "GET /api/badges/$PROJECT_ID - Verify all badges awarded"
    response=$(make_request "GET" "/badges/$PROJECT_ID")
    if check_response "$response" "200" "Fetch final badge list"; then
        echo "Expected badges: FIRST_PROJECT (auto), KYC_VERIFIED (if approved), SC_AUDIT_PASSED (if scan passed)"
    fi
    echo ""
fi

# ============================================
# Test Summary
# ============================================

echo "================================"
echo "Test Summary"
echo "================================"
echo "Total Tests: $TESTS_RUN"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "================================"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Check output above.${NC}"
    exit 1
fi
