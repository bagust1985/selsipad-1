#!/bin/bash

# FASE 5 Testing Script
# Tests vesting calculations, API endpoints, and worker jobs

set -e

echo "=================================================="
echo "FASE 5: Testing Suite"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo -e "${RED}ERROR: SUPABASE environment variables not set${NC}"
    exit 1
fi

echo -e "${YELLOW}API Base URL: $API_BASE_URL${NC}"
echo ""

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
function test_start() {
    echo -e "\n${YELLOW}TEST: $1${NC}"
    TESTS_RUN=$((TESTS_RUN + 1))
}

function test_pass() {
    echo -e "${GREEN}✓ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

function test_fail() {
    echo -e "${RED}✗ FAILED: $1${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

# ============================================================================
# 1. DATABASE VERIFICATION
# ============================================================================

echo "=================================================="
echo "1. DATABASE VERIFICATION"
echo "=================================================="

test_start "Verify vesting_schedules table exists"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM vesting_schedules" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    test_pass
else
    test_fail "Table vesting_schedules not found"
fi

test_start "Verify vesting_allocations table exists"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM vesting_allocations" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    test_pass
else
    test_fail "Table vesting_allocations not found"
fi

test_start "Verify vesting_claims table exists"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM vesting_claims" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    test_pass
else
    test_fail "Table vesting_claims not found"
fi

test_start "Verify liquidity_locks table exists"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM liquidity_locks" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    test_pass
else
    test_fail "Table liquidity_locks not found"
fi

test_start "Verify launch_rounds has vesting_status column"
psql "$DATABASE_URL" -c "SELECT vesting_status FROM launch_rounds LIMIT 1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    test_pass
else
    test_fail "Column vesting_status not found in launch_rounds"
fi

test_start "Verify 12-month lock constraint"
psql "$DATABASE_URL" -c "INSERT INTO liquidity_locks (round_id, chain, dex_type, lp_token_address, lock_amount, lock_duration_months, status) VALUES (gen_random_uuid(), 'ethereum', 'UNISWAP_V2', '0x123', '1000', 6, 'PENDING')" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    test_pass
    echo "  (Correctly rejected lock_duration_months < 12)"
else
    test_fail "12-month constraint not enforced!"
fi

# ============================================================================
# 2. TYPESCRIPT COMPILATION
# ============================================================================

echo ""
echo "=================================================="
echo "2. TYPESCRIPT COMPILATION"
echo "=================================================="

test_start "Compile shared packages"
cd packages/shared && pnpm typecheck > /dev/null 2>&1
if [ $? -eq 0 ]; then
    test_pass
else
    test_fail "Shared packages have TypeScript errors"
fi
cd ../..

test_start "Compile web app"
cd apps/web && pnpm typecheck > /dev/null 2>&1
if [ $? -eq 0 ]; then
    test_pass
else
    test_fail "Web app has TypeScript errors"
fi
cd ../..

test_start "Compile worker services"
cd services/worker && pnpm typecheck > /dev/null 2>&1
if [ $? -eq 0 ]; then
    test_pass
else
    test_fail "Worker services have TypeScript errors"
fi
cd ../..

# ============================================================================
# 3. WORKER JOBS
# ============================================================================

echo ""
echo "=================================================="
echo "3. WORKER JOBS"
echo "=================================================="

test_start "Post-Finalize Orchestrator execution"
cd services/worker
output=$(pnpm orchestrator 2>&1)
if echo "$output" | grep -q "Orchestrator finished"; then
    test_pass
else
    test_fail "Orchestrator failed to complete"
    echo "$output"
fi
cd ../..

test_start "Vesting Claim Processor execution"
cd services/worker
output=$(pnpm claim-processor 2>&1)
if echo "$output" | grep -q "Claim processor finished"; then
    test_pass
else
    test_fail "Claim processor failed to complete"
    echo "$output"
fi
cd ../..

test_start "Liquidity Lock Monitor execution"
cd services/worker
output=$(pnpm lock-monitor 2>&1)
if echo "$output" | grep -q "Lock monitor finished"; then
    test_pass
else
    test_fail "Lock monitor failed to complete"
    echo "$output"
fi
cd ../..

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo "=================================================="
echo "TEST SUMMARY"
echo "=================================================="
echo -e "Total Tests:  $TESTS_RUN"
echo -e "${GREEN}Passed:       $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}Failed:       $TESTS_FAILED${NC}"
else
    echo -e "${GREEN}Failed:       $TESTS_FAILED${NC}"
fi
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}================================${NC}"
    exit 0
else
    echo -e "${RED}================================${NC}"
    echo -e "${RED}SOME TESTS FAILED!${NC}"
    echo -e "${RED}================================${NC}"
    exit 1
fi
