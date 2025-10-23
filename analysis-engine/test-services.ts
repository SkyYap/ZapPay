import dotenv from 'dotenv';
import { getWalletDataFromBasescan, isSmartContract, detectUnusualPatterns } from './src/services/onChainAnalyzer';
import { getMetaSleuthRisk } from './src/services/metasleuthProvider';

dotenv.config();

const TEST_ADDRESS = '0xd60e2F289ff4E54eAC21e30C2bDD78C47aa466E7';

async function testServices() {
  console.log('='.repeat(60));
  console.log('Testing Analysis Engine Services');
  console.log('='.repeat(60));
  console.log(`Test Address: ${TEST_ADDRESS}`);
  console.log('');

  // Test 1: getWalletDataFromBasescan
  console.log('📊 TEST 1: getWalletDataFromBasescan');
  console.log('-'.repeat(60));
  try {
    const walletData = await getWalletDataFromBasescan(TEST_ADDRESS);

    console.log('✅ Success!');
    console.log(`   Address: ${walletData.address}`);
    console.log(`   Balance: ${walletData.balance} wei`);
    console.log(`   Transaction Count: ${walletData.transactionCount}`);

    if (walletData.firstTransaction) {
      console.log(`   First TX: ${new Date(parseInt(walletData.firstTransaction.timeStamp) * 1000).toISOString()}`);
    }

    if (walletData.lastTransaction) {
      console.log(`   Last TX: ${new Date(parseInt(walletData.lastTransaction.timeStamp) * 1000).toISOString()}`);
    }

    if (walletData.transactions.length > 0) {
      console.log(`   Sample Transaction Hash: ${walletData.transactions[0].hash}`);
    }
  } catch (error: any) {
    console.log('❌ Failed!');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Test 2: isSmartContract
  console.log('🔍 TEST 2: isSmartContract');
  console.log('-'.repeat(60));
  try {
    const isContract = await isSmartContract(TEST_ADDRESS);
    console.log(`✅ Success!`);
    console.log(`   Is Contract: ${isContract}`);
  } catch (error: any) {
    console.log('❌ Failed!');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Test 3: getMetaSleuthRisk
  console.log('🛡️  TEST 3: getMetaSleuthRisk');
  console.log('-'.repeat(60));
  try {
    const amlData = await getMetaSleuthRisk(TEST_ADDRESS, 84532); // Base Sepolia

    if (amlData) {
      console.log('✅ Success!');
      console.log(`   Risk Score: ${amlData.risk_score}`);
      console.log(`   Risk Indicators: ${amlData.risk_indicators?.length || 0}`);

      if (amlData.risk_indicators && amlData.risk_indicators.length > 0) {
        console.log(`   Sample Indicator: ${amlData.risk_indicators[0].indicator.name}`);
      }
    } else {
      console.log('⚠️  MetaSleuth is disabled or returned no data');
      console.log(`   ENABLE_METASLEUTH: ${process.env.ENABLE_METASLEUTH}`);
    }
  } catch (error: any) {
    console.log('❌ Failed!');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  console.log('='.repeat(60));
  console.log('Test Complete');
  console.log('='.repeat(60));
}

testServices()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test script failed:', error);
    process.exit(1);
  });
