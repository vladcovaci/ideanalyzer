/**
 * Test script to verify Deep Research integration
 */

// Load environment variables
import { config } from 'dotenv';
config();

import { performDeepResearch } from './src/lib/research/deep-research';

async function testDeepResearch() {
  console.log('Testing Deep Research...\n');

  const summary = "Personal finance app for young professionals in Romania. Aggregates bank accounts, provides budgeting insights, and helps manage shared expenses for couples.";

  try {
    console.log('🔍 Running deep research (this will take a few minutes)...\n');
    console.log('Summary:', summary, '\n');

    const result = await performDeepResearch(summary, { timeoutMs: 5 * 60 * 1000 });

    console.log('✅ Deep Research completed!\n');
    console.log('Summary:', result.summary);
    console.log('Market Stage:', result.marketStage);
    console.log(`Found ${result.proofSignals.length} proof signals:\n`);

    result.proofSignals.forEach((signal, index) => {
      console.log(`${index + 1}. ${signal.description}`);
      console.log(`   Evidence: ${signal.evidence.substring(0, 100)}...`);
      console.log(`   Sources: ${signal.sources.join(', ')}`);
      console.log('');
    });

    if (result.usage) {
      console.log('Token usage:', result.usage);
    }

  } catch (error) {
    console.error('\n❌ Deep Research failed:');
    if (error instanceof Error) {
      console.error('Error:', error.message);

      // Check for specific error types
      if (error.message.includes('model') || error.message.includes('404')) {
        console.error('\n💡 This might be a model access issue.');
        console.error('Make sure your OpenAI API key has access to Deep Research models.');
        console.error('Check: https://platform.openai.com/account/limits');
      }

      if (error.message.includes('credentials')) {
        console.error('\n💡 Check your OPENAI_API_KEY in .env file');
      }
    }
  }
}

testDeepResearch();
