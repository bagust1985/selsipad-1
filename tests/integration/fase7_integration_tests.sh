#!/bin/bash

# FASE 7: Bonding Curve Integration Tests
# Tests full API flows: deploy, swap, migration

set -e

echo "====================================="
echo "FASE 7 Integration Tests"
echo "====================================="
echo ""

# Configuration
API_BASE="${API_BASE:-http://localhost:3000}"
TEST_USER_TOKEN="${TEST_USER_TOKEN:-test_token_123}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Helper functions
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"

    echo -n "Testing: $name... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Authorization: Bearer $TEST_USER_TOKEN" \
            -H "Content-Type: application/json" \
            "$API_BASE$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Authorization: Bearer $TEST_USER_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE$endpoint")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $http_code)"
        ((PASSED++))
        echo "Response: $body" | head -n 1
    else
        echo -e "${RED}FAIL${NC} (Expected HTTP $expected_status, got $http_code)"
        ((FAILED++))
        echo "Response: $body"
    fi
    echo ""
}

# ===========================================
# TEST 1: Deploy Flow
# ===========================================
echo "TEST SUITE 1: Deploy Flow"
echo "-------------------------------------------"

# Create test pool ID (would come from database in real scenario)
POOL_ID="test-pool-$(date +%s)"

# 1.1: Generate deploy intent
test_api "Generate deploy intent" \
    "POST" \
    "/api/v1/bonding/$POOL_ID/deploy/intent" \
    "" \
    "200"

# 1.2: Confirm deploy (with mock tx_hash)
test_api "Confirm deploy" \
    "POST" \
    "/api/v1/bonding/$POOL_ID/deploy/confirm" \
    '{"intent_id":"deploy_test_123","fee_tx_hash":"TX_DEPLOY_123"}' \
    "200"

# ===========================================
# TEST 2: Swap Flow
# ===========================================
echo "TEST SUITE 2: Swap Flow"
echo "-------------------------------------------"

# 2.1: Generate BUY intent
test_api "Generate BUY swap intent" \
    "POST" \
    "/api/v1/bonding/$POOL_ID/swap/intent" \
    '{"swap_type":"BUY","input_amount":"100000000","slippage_tolerance_bps":100}' \
    "200"

# 2.2: Confirm BUY swap
test_api "Confirm BUY swap" \
    "POST" \
    "/api/v1/bonding/$POOL_ID/swap/confirm" \
    '{"intent_id":"swap_test_123","tx_hash":"TX_BUY_123"}' \
    "200"

# 2.3: Generate SELL intent
test_api "Generate SELL swap intent" \
    "POST" \
    "/api/v1/bonding/$POOL_ID/swap/intent" \
    '{"swap_type":"SELL","input_amount":"5000000000","slippage_tolerance_bps":100}' \
    "200"

# 2.4: Confirm SELL swap
test_api "Confirm SELL swap" \
    "POST" \
    "/api/v1/bonding/$POOL_ID/swap/confirm" \
    '{"intent_id":"swap_test_456","tx_hash":"TX_SELL_123"}' \
    "200"

# ===========================================
# TEST 3: Graduation Gates
# ===========================================
echo "TEST SUITE 3: Graduation Gates"
echo "-------------------------------------------"

# 3.1: Check graduation gates
test_api "Get graduation gates" \
    "GET" \
    "/api/v1/bonding/$POOL_ID/graduation-gates" \
    "" \
    "200"

# ===========================================
# TEST 4: Migration Flow
# ===========================================
echo "TEST SUITE 4: Migration Flow"
echo "-------------------------------------------"

# 4.1: Generate migration intent
test_api "Generate migration intent" \
    "POST" \
    "/api/v1/bonding/$POOL_ID/migrate/intent" \
    '{"target_dex":"RAYDIUM"}' \
    "200"

# 4.2: Confirm migration
test_api "Confirm migration" \
    "POST" \
    "/api/v1/bonding/$POOL_ID/migrate/confirm" \
    '{"intent_id":"migrate_test_123","fee_tx_hash":"TX_MIGRATE_123"}' \
    "200"

# ===========================================
# TEST 5: Input Validation
# ===========================================
echo "TEST SUITE 5: Input Validation"
echo "-------------------------------------------"

# 5.1: Invalid swap type
test_api "Reject invalid swap type" \
    "POST" \
    "/api/v1/bonding/$POOL_ID/swap/intent" \
    '{"swap_type":"INVALID","input_amount":"100000000"}' \
    "400"

# 5.2: Missing required fields
test_api "Reject missing swap amount" \
    "POST" \
    "/api/v1/bonding/$POOL_ID/swap/intent" \
    '{"swap_type":"BUY"}' \
    "400"

# 5.3: Invalid DEX
test_api "Reject invalid DEX" \
    "POST" \
    "/api/v1/bonding/$POOL_ID/migrate/intent" \
    '{"target_dex":"INVALID_DEX"}' \
    "400"

# ===========================================
# TEST 6: Authentication
# ===========================================
echo "TEST SUITE 6: Authentication"
echo "-------------------------------------------"

# 6.1: Unauthorized request (no token)
echo -n "Testing: Require authentication... "
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    "$API_BASE/api/v1/bonding/$POOL_ID/deploy/intent")

http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "401" ]; then
    echo -e "${GREEN}PASS${NC} (HTTP $http_code)"
    ((PASSED++))
else
    echo -e "${RED}FAIL${NC} (Expected HTTP 401, got $http_code)"
    ((FAILED++))
fi
echo ""

# ===========================================
# SUMMARY
# ===========================================
echo "====================================="
echo "TEST SUMMARY"
echo "====================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
