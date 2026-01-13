/**
 * Batch Cognify All Agent Datasets
 *
 * Nightly batch processing of agent-specific memory datasets.
 * Runs cognify on all agent memory namespaces to process accumulated learnings.
 *
 * Usage: npm run batch-cognify
 * Schedule: Daily at 3 AM via cron
 */

const COGNEE_API_URL = process.env.COGNEE_API_URL || 'http://localhost:8000';
const COGNEE_API_KEY = process.env.COGNEE_API_KEY;

interface CognifyStats {
  dataset: string;
  nodeCount: number;
  edgeCount: number;
  lastProcessed: string;
}

const AGENT_DATASETS = [
  'agent_research',
  'agent_coding',
  'agent_debugging',
  'agent_qa',
  'agent_chrome_ui',
  'agent_security',
  'agent_database',
  'agent_release',
  'agent_safety'
];

/**
 * Cognee API client
 */
class CogneeClient {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  async cognify(dataset: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/cognify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ dataset })
    });

    if (!response.ok) {
      throw new Error(`Cognify failed: ${response.statusText}`);
    }
  }

  async stats(dataset: string): Promise<CognifyStats> {
    const response = await fetch(`${this.baseURL}/api/stats/${dataset}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Stats fetch failed: ${response.statusText}`);
    }

    return await response.json();
  }
}

/**
 * Main batch cognify function
 */
async function batchCognifyAllAgents() {
  console.log('🧠 Cognee Batch Cognify Script');
  console.log('================================\n');
  console.log(`⏰ Scheduled run: ${new Date().toISOString()}\n`);

  // Check environment
  if (!COGNEE_API_KEY) {
    console.error('❌ COGNEE_API_KEY not set');
    process.exit(1);
  }

  const cognee = new CogneeClient(COGNEE_API_URL, COGNEE_API_KEY);

  // Check server health
  console.log('📡 Checking Cognee server...');
  try {
    await cognee.health();
    console.log('✅ Cognee server healthy\n');
  } catch {
    console.error('❌ Cognee server unreachable');
    process.exit(1);
  }

  // Process each agent dataset
  console.log('🔄 Starting batch cognify for all agent datasets...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const dataset of AGENT_DATASETS) {
    console.log(`📊 Processing ${dataset}...`);

    try {
      const startTime = Date.now();
      await cognee.cognify(dataset);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`  ✅ ${dataset} cognified (${duration}s)`);
      successCount++;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ ${dataset} failed: ${errorMessage}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Batch Cognify Complete:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}\n`);

  // Summary
  console.log('================================');
  console.log('✅ Nightly Batch Cognify Complete!');
  console.log('================================\n');
  console.log('📊 Processed Datasets:');
  console.log(`   - agent_research`);
  console.log(`   - agent_coding`);
  console.log(`   - agent_debugging`);
  console.log(`   - agent_chrome_ui`);
  console.log(`   - agent_qa`);
  console.log(`   - agent_security\n`);
  console.log('🧠 Memory graphs updated with today\'s learnings\n');
  console.log('🚀 All agent skills can now access latest memories\n');
}

// Run batch cognify
batchCognifyAllAgents().catch((error) => {
  console.error('❌ Batch cognify failed:', error);
  process.exit(1);
});
