#!/usr/bin/env node

/**
 * FASE 7: Bonding Curve Unit Tests (Standalone)
 * No external dependencies - runs with vanilla Node.js
 *
 * Run: node tests/unit/bonding-curve-tests.js
 */

// Simple test framework
const tests = [];
const suites = [];
let currentSuite = tests;

function describe(name, fn) {
  const newSuite = [];
  const oldSuite = currentSuite;
  currentSuite = newSuite;
  fn();
  suites.push({ name, tests: newSuite });
  currentSuite = oldSuite;
}

function it(name, fn) {
  currentSuite.push({ name, fn });
}

function expect(value) {
  return {
    toBe: (expected) => {
      if (value !== expected) {
        throw new Error(`Expected ${value} to be ${expected}`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(value) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(value)} to equal ${JSON.stringify(expected)}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (!(value > expected)) {
        throw new Error(`Expected ${value} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual: (expected) => {
      if (!(value >= expected)) {
        throw new Error(`Expected ${value} to be greater than or equal to ${expected}`);
      }
    },
    toBeTruthy: () => {
      if (!value) {
        throw new Error(`Expected ${value} to be truthy`);
      }
    },
    toBeFalsy: () => {
      if (value) {
        throw new Error(`Expected ${value} to be falsy`);
      }
    },
  };
}

// ============================================
// BONDING CURVE IMPLEMENTATIONS
// ============================================
// No need for interface declarations in plain JS

function calculateAMMSwap(swapType, inputAmount, virtualSol, virtualTokens, swapFeeBps = 150) {
  const swapFee = (inputAmount * BigInt(swapFeeBps)) / 10000n;
  const treasuryFee = swapFee / 2n;
  const referralFee = swapFee - treasuryFee;
  const inputAfterFee = inputAmount - swapFee;
  const k = virtualSol * virtualTokens;

  let outputAmount;

  if (swapType === 'BUY') {
    const newX = virtualSol + inputAfterFee;
    const newY = k / newX;
    outputAmount = virtualTokens - newY;
  } else {
    const newY = virtualTokens + inputAfterFee;
    const newX = k / newY;
    outputAmount = virtualSol - newX;
  }

  return {
    output_amount: outputAmount,
    fee_amount: swapFee,
    treasury_fee: treasuryFee,
    referral_fee: referralFee,
  };
}

function checkGraduationThreshold(actualSol, thresholdSol) {
  const progress = thresholdSol > 0n ? (actualSol * 100n) / thresholdSol : 0n;
  const isGraduating = actualSol >= thresholdSol;
  const remaining = thresholdSol > actualSol ? thresholdSol - actualSol : 0n;

  return {
    is_graduating: isGraduating,
    progress_percentage: Number(progress),
    sol_remaining: remaining,
  };
}

function validateFeeSplit(swapFee, treasuryFee, referralFee) {
  return treasuryFee + referralFee === swapFee;
}

// ============================================
// TESTS
// ============================================

describe('Bonding Curve - AMM Math', () => {
  it('should calculate BUY quote correctly', () => {
    const virtualSol = 10n * 10n ** 9n;
    const virtualTokens = 1000n * 10n ** 9n;
    const inputAmount = 1n * 10n ** 9n;

    const quote = calculateAMMSwap('BUY', inputAmount, virtualSol, virtualTokens);

    expect(quote.fee_amount).toBe(15000000n);
    expect(quote.output_amount).toBeGreaterThan(0n);
  });

  it('should calculate SELL quote correctly', () => {
    const virtualSol = 10n * 10n ** 9n;
    const virtualTokens = 1000n * 10n ** 9n;
    const inputAmount = 100n * 10n ** 9n;

    const quote = calculateAMMSwap('SELL', inputAmount, virtualSol, virtualTokens);

    expect(quote.fee_amount).toBe(1500000000n);
    expect(quote.output_amount).toBeGreaterThan(0n);
  });
});

describe('Bonding Curve - Fee Calculations', () => {
  it('should calculate 1.5% swap fee correctly', () => {
    const inputAmount = 100n * 10n ** 9n;
    const quote = calculateAMMSwap('BUY', inputAmount, 10n * 10n ** 9n, 1000n * 10n ** 9n);

    expect(quote.fee_amount).toBe(1500000000n);
  });

  it('should split fee 50:50 treasury and referral', () => {
    const quote = calculateAMMSwap('BUY', 100n * 10n ** 9n, 10n * 10n ** 9n, 1000n * 10n ** 9n);

    expect(quote.treasury_fee).toBe(quote.referral_fee);
    expect(quote.treasury_fee + quote.referral_fee).toBe(quote.fee_amount);
  });

  it('should validate fee split', () => {
    const quote = calculateAMMSwap('BUY', 100n * 10n ** 9n, 10n * 10n ** 9n, 1000n * 10n ** 9n);

    const isValid = validateFeeSplit(quote.fee_amount, quote.treasury_fee, quote.referral_fee);

    expect(isValid).toBeTruthy();
  });
});

describe('Bonding Curve - Graduation Detection', () => {
  it('should detect graduation when threshold reached', () => {
    const thresholdSol = 50n * 10n ** 9n;
    const actualSol = 50n * 10n ** 9n;

    const status = checkGraduationThreshold(actualSol, thresholdSol);

    expect(status.is_graduating).toBeTruthy();
    expect(status.progress_percentage).toBe(100);
    expect(status.sol_remaining).toBe(0n);
  });

  it('should NOT graduate when below threshold', () => {
    const thresholdSol = 50n * 10n ** 9n;
    const actualSol = 30n * 10n ** 9n;

    const status = checkGraduationThreshold(actualSol, thresholdSol);

    expect(status.is_graduating).toBeFalsy();
    expect(status.progress_percentage).toBe(60);
    expect(status.sol_remaining).toBe(20n * 10n ** 9n);
  });

  it('should calculate progress percentage correctly', () => {
    const thresholdSol = 100n * 10n ** 9n;
    const actualSol = 25n * 10n ** 9n;

    const status = checkGraduationThreshold(actualSol, thresholdSol);

    expect(status.progress_percentage).toBe(25);
  });
});

// ============================================
// RUN TESTS
// ============================================

let passCount = 0;
let failCount = 0;
const failedTests = [];

for (const suite of suites) {
  console.log(`\n✓ ${suite.name}`);

  for (const test of suite.tests) {
    try {
      test.fn();
      console.log(`  ✅ ${test.name}`);
      passCount++;
    } catch (err) {
      console.log(`  ❌ ${test.name}`);
      console.log(`     Error: ${err.message}`);
      failCount++;
      failedTests.push(`${suite.name} > ${test.name}`);
    }
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Test Results: ${passCount} passed, ${failCount} failed`);
console.log('='.repeat(50));

if (failCount > 0) {
  console.log('\nFailed tests:');
  failedTests.forEach((test) => console.log(`  - ${test}`));
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}
