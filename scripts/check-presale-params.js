// Check per-buyer contributions from presale contract
const hre = require('hardhat');
const { ethers } = require('hardhat');

async function main() {
  const presaleAddress = '0xE637092053ad9b9EB523Cd73E996c861858484E9';

  const buyers = [
    { name: 'Buyer 1', address: '0x115c71Ded2f5d0cD2750c425e6102B3798f41342' },
    { name: 'Buyer 2', address: '0xccE8F9f9EcBeBfe7314dAc0ef16adf221049C3e7' },
    { name: 'Buyer 3', address: '0x5ccBD29020B5cf7f9F3E8f9a900f5cBda66B6b37' },
  ];

  const presale = await ethers.getContractAt('PresaleRound', presaleAddress);

  const totalRaised = await presale.totalRaised();
  console.log('Total Raised:', ethers.formatEther(totalRaised), 'BNB\n');

  for (const buyer of buyers) {
    try {
      const contribution = await presale.contributions(buyer.address);
      console.log(`${buyer.name} (${buyer.address}):`);
      console.log(`  Contribution: ${ethers.formatEther(contribution)} BNB`);
    } catch (e) {
      console.log(`${buyer.name}: Error reading - ${e.message}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
