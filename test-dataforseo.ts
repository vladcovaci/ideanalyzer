/**
 * Test script to verify DataForSEO integration
 */

// Load environment variables using dotenv/config which auto-loads
import 'dotenv/config';

import { getDataForSEOClient } from './src/lib/research/dataforseo-client';

async function testDataForSEO() {
  console.log('Testing DataForSEO connection...\n');

  try {
    const client = getDataForSEOClient();
    console.log('✅ Client initialized successfully');

    // Test 1: Get keyword data
    console.log('\n📊 Test 1: Fetching keyword data for "personal finance app"...');
    const keywords = await client.getKeywordData(['personal finance app', 'budgeting app', 'finance tracker']);

    console.log(`✅ Found ${keywords.length} keywords`);
    keywords.forEach(kw => {
      console.log(`  - "${kw.keyword}": Volume=${kw.search_volume}, CPC=$${kw.cpc}, Competition=${kw.competition}`);
    });

    // Test 2: Get trends
    console.log('\n📈 Test 2: Fetching trend data...');
    const trends = await client.getTrendData(['personal finance app']);
    console.log(`✅ Found trend data for ${trends.size} keywords`);

    trends.forEach((data, keyword) => {
      console.log(`  - "${keyword}": ${data.length} data points`);
    });

    console.log('\n✅ All tests passed! DataForSEO is working correctly.');
  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

testDataForSEO();
