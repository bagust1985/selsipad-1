const hre = require('hardhat');

/**
 * Verification Service for Fairlaunch Ecosystem Contracts
 *
 * Automatically verifies Fairlaunch, Token, and TeamVesting contracts
 * on BSCScan after deployment.
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extract constructor arguments from deployed contracts
 */
async function extractConstructorArgs(contractAddress, contractType, provider) {
  switch (contractType) {
    case 'fairlaunch':
      return extractFairlaunchArgs(contractAddress, provider);
    case 'token':
      return extractTokenArgs(contractAddress, provider);
    case 'vesting':
      return extractVestingArgs(contractAddress, provider);
    default:
      throw new Error(`Unknown contract type: ${contractType}`);
  }
}

/**
 * Extract Fairlaunch constructor arguments
 */
async function extractFairlaunchArgs(address, provider) {
  const abi = require('../artifacts/contracts/fairlaunch/Fairlaunch.sol/Fairlaunch.json').abi;
  const contract = new hre.ethers.Contract(address, abi, provider);

  // Admin executor is known constant
  const ADMIN_EXECUTOR = '0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A';

  const [
    projectToken,
    paymentToken,
    softcap,
    tokensForSale,
    minContribution,
    maxContribution,
    startTime,
    endTime,
    listingPremiumBps,
    feeSplitter,
    teamVesting,
    projectOwner,
    liquidityPercent,
    lpLockMonths,
    dexId,
  ] = await Promise.all([
    contract.projectToken(),
    contract.paymentToken(),
    contract.softcap(),
    contract.tokensForSale(),
    contract.minContribution(),
    contract.maxContribution(),
    contract.startTime(),
    contract.endTime(),
    contract.listingPremiumBps(),
    contract.feeSplitter(),
    contract.teamVesting(),
    contract.projectOwner(),
    contract.liquidityPercent(),
    contract.lpLockMonths(),
    contract.dexId(),
  ]);

  return [
    projectToken,
    paymentToken,
    softcap,
    tokensForSale,
    minContribution,
    maxContribution,
    startTime,
    endTime,
    listingPremiumBps,
    feeSplitter,
    teamVesting,
    projectOwner,
    ADMIN_EXECUTOR,
    liquidityPercent,
    lpLockMonths,
    dexId,
  ];
}

/**
 * Extract Token (SimpleToken) constructor arguments
 */
async function extractTokenArgs(address, provider) {
  const abi =
    require('../artifacts/contracts/fairlaunch/SimpleTokenFactory.sol/SimpleToken.json').abi;
  const contract = new hre.ethers.Contract(address, abi, provider);

  const [name, symbol, totalSupply] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.totalSupply(),
  ]);

  return [name, symbol, totalSupply];
}

/**
 * Extract TeamVesting constructor arguments
 * Note: TeamVesting has 6 params, need to handle properly
 */
async function extractVestingArgs(address, provider) {
  const abi = require('../artifacts/contracts/fairlaunch/TeamVesting.sol/TeamVesting.json').abi;
  const contract = new hre.ethers.Contract(address, abi, provider);

  const token = await contract.token();

  // TODO: Extract other 5 params
  // For now, return minimal args
  return [token];
}

/**
 * Verify a single contract on BSCScan
 */
async function verifySingleContract({
  address,
  contractPath, // e.g., "contracts/fairlaunch/Fairlaunch.sol:Fairlaunch"
  constructorArgs,
  network = 'bscTestnet',
  maxRetries = 3,
}) {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await hre.run('verify:verify', {
        address,
        contract: contractPath,
        constructorArguments: constructorArgs,
        network,
      });

      return {
        success: true,
        verified: true,
        url: `https://testnet.bscscan.com/address/${address}#code`,
      };
    } catch (error) {
      // Already verified
      if (error.message.includes('Already Verified')) {
        return {
          success: true,
          verified: true,
          alreadyVerified: true,
          url: `https://testnet.bscscan.com/address/${address}#code`,
        };
      }

      // Rate limit - wait and retry
      if (error.message.includes('rate limit')) {
        attempt++;
        if (attempt < maxRetries) {
          console.log(`Rate limited, waiting 30s before retry ${attempt}/${maxRetries}...`);
          await sleep(30000);
          continue;
        }
      }

      // Contract not indexed yet - wait and retry
      if (
        error.message.includes('does not have bytecode') ||
        error.message.includes('Unable to locate')
      ) {
        attempt++;
        if (attempt < maxRetries) {
          console.log(`Contract not indexed, waiting 30s before retry ${attempt}/${maxRetries}...`);
          await sleep(30000);
          continue;
        }
      }

      // Other error - fail
      throw error;
    }
  }

  throw new Error(`Failed to verify after ${maxRetries} attempts`);
}

/**
 * Main verification function for all Fairlaunch ecosystem contracts
 */
async function verifyFairlaunchContracts({
  fairlaunchAddress,
  tokenAddress,
  vestingAddress,
  network = 'bscTestnet',
}) {
  const results = {
    fairlaunch: { success: false },
    token: { success: false },
    vesting: { success: false },
  };

  const provider = hre.ethers.provider;

  console.log('Starting contract verification...');
  console.log('Network:', network);
  console.log('');

  // Wait initial 30s for BSCScan indexing
  console.log('Waiting 30s for BSCScan to index contracts...');
  await sleep(30000);
  console.log('');

  // Verify Fairlaunch
  if (fairlaunchAddress && fairlaunchAddress !== hre.ethers.ZeroAddress) {
    console.log('Verifying Fairlaunch contract:', fairlaunchAddress);
    try {
      const args = await extractConstructorArgs(fairlaunchAddress, 'fairlaunch', provider);
      results.fairlaunch = await verifySingleContract({
        address: fairlaunchAddress,
        contractPath: 'contracts/fairlaunch/Fairlaunch.sol:Fairlaunch',
        constructorArgs: args,
        network,
      });
      console.log('✅ Fairlaunch verified!');
    } catch (error) {
      console.error('❌ Fairlaunch verification failed:', error.message);
      results.fairlaunch = {
        success: false,
        error: error.message,
      };
    }
    console.log('');
  }

  // Verify Token
  if (tokenAddress && tokenAddress !== hre.ethers.ZeroAddress) {
    console.log('Verifying Token contract:', tokenAddress);
    try {
      const args = await extractConstructorArgs(tokenAddress, 'token', provider);
      results.token = await verifySingleContract({
        address: tokenAddress,
        contractPath: 'contracts/fairlaunch/SimpleTokenFactory.sol:SimpleToken',
        constructorArgs: args,
        network,
      });
      console.log('✅ Token verified!');
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      results.token = {
        success: false,
        error: error.message,
      };
    }
    console.log('');
  }

  // Verify Vesting
  if (vestingAddress && vestingAddress !== hre.ethers.ZeroAddress) {
    console.log('Verifying Vesting contract:', vestingAddress);
    try {
      const args = await extractConstructorArgs(vestingAddress, 'vesting', provider);
      results.vesting = await verifySingleContract({
        address: vestingAddress,
        contractPath: 'contracts/fairlaunch/TeamVesting.sol:TeamVesting',
        constructorArgs: args,
        network,
      });
      console.log('✅ Vesting verified!');
    } catch (error) {
      console.error('❌ Vesting verification failed:', error.message);
      results.vesting = {
        success: false,
        error: error.message,
      };
    }
    console.log('');
  }

  return results;
}

module.exports = {
  verifyFairlaunchContracts,
  verifySingleContract,
  extractConstructorArgs,
};
