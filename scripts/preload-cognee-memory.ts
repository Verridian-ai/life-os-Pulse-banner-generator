/**
 * Preload Cognee Global Memory
 *
 * Loads essential project documentation into Cognee's global memory namespace.
 * Run once at startup or when documentation changes significantly.
 *
 * Usage: npm run preload-memory
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

// Import from backend service
// Note: Adjust path if needed based on your project structure
const COGNEE_API_URL = process.env.COGNEE_API_URL || 'http://localhost:8000';
const COGNEE_API_KEY = process.env.COGNEE_API_KEY;

const GLOBAL_NAMESPACE = 'nanobanna_global';
const PROJECT_ROOT = process.cwd();

interface CogneeDocument {
  filePath: string;
  type: 'documentation' | 'code' | 'design' | 'configuration';
  priority: 'critical' | 'high' | 'medium';
}

const DOCUMENTS_TO_PRELOAD: CogneeDocument[] = [
  // Critical project documentation
  {
    filePath: 'CLAUDE.md',
    type: 'documentation',
    priority: 'critical'
  },
  {
    filePath: '.claude/rules/shared_contract.md',
    type: 'documentation',
    priority: 'critical'
  },
  {
    filePath: 'docs/ops/ROUTES.md',
    type: 'documentation',
    priority: 'high'
  },
  {
    filePath: 'docs/design/LIFE_OS_DESIGN_SYSTEM.md',
    type: 'design',
    priority: 'critical'
  },
  {
    filePath: 'docs/ops/AGENT_CONTEXT.md',
    type: 'documentation',
    priority: 'high'
  },
  {
    filePath: 'README.md',
    type: 'documentation',
    priority: 'high'
  },
  {
    filePath: 'package.json',
    type: 'configuration',
    priority: 'medium'
  },
  {
    filePath: '.claude/tool-allocation-matrix.json',
    type: 'configuration',
    priority: 'high'
  },
  {
    filePath: '.claude/skills-config.json',
    type: 'configuration',
    priority: 'high'
  },
  // Coding Standards Documentation (NEW)
  {
    filePath: 'docs/design/Coding standards/HIGH_END_WEB_TECH_STACK.md',
    type: 'design',
    priority: 'critical'
  },
  {
    filePath: 'docs/design/Coding standards/ANTI_SLOP_DESIGN_PROTOCOL.md',
    type: 'design',
    priority: 'critical'
  },
  {
    filePath: 'docs/design/Coding standards/BOLD_UX_HEATMAPS_DESIGN.md',
    type: 'design',
    priority: 'critical'
  },
  // UI Agent Definitions (NEW)
  {
    filePath: '.claude/agents/depth-ui-engineer.md',
    type: 'documentation',
    priority: 'high'
  },
  {
    filePath: '.claude/agents/code-standards-auditor.md',
    type: 'documentation',
    priority: 'high'
  },
  {
    filePath: '.claude/agents/ux-heatmap-analyst.md',
    type: 'documentation',
    priority: 'high'
  },
  {
    filePath: '.claude/agents/chrome-ui-browser-agent.md',
    type: 'documentation',
    priority: 'high'
  }
];

/**
 * Cognee API client (simple wrapper)
 */
class CogneeClient {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  async addText(dataset: string, content: string, metadata: Record<string, unknown>): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        dataset,
        content,
        metadata
      })
    });

    if (!response.ok) {
      throw new Error(`Cognee add failed: ${response.statusText}`);
    }
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
      throw new Error(`Cognee cognify failed: ${response.statusText}`);
    }
  }

  async memify(dataset: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/memify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ dataset })
    });

    if (!response.ok) {
      throw new Error(`Cognee memify failed: ${response.statusText}`);
    }
  }

  async health(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseURL}/health`);
    return await response.json();
  }
}

/**
 * Main preload function
 */
async function preloadGlobalMemory() {
  console.log('🧠 Cognee Memory Preload Script');
  console.log('================================\n');

  // Check environment variables
  if (!COGNEE_API_KEY) {
    console.error('❌ COGNEE_API_KEY environment variable not set');
    console.error('   Set it in .env file or export COGNEE_API_KEY=your_key');
    process.exit(1);
  }

  const cognee = new CogneeClient(COGNEE_API_URL, COGNEE_API_KEY);

  // Check Cognee server health
  console.log(`📡 Checking Cognee server at ${COGNEE_API_URL}...`);
  try {
    const health = await cognee.health();
    console.log(`✅ Cognee server is ${health.status}\n`);
  } catch {
    console.error(`❌ Cannot connect to Cognee server at ${COGNEE_API_URL}`);
    console.error('   Make sure Cognee is running:');
    console.error('   docker run -d -p 8000:8000 topoteretes/cognee');
    process.exit(1);
  }

  // Load documents
  console.log(`📚 Loading ${DOCUMENTS_TO_PRELOAD.length} documents into "${GLOBAL_NAMESPACE}"...\n`);

  let successCount = 0;
  let errorCount = 0;

  // BATCH ADD (efficient)
  for (const doc of DOCUMENTS_TO_PRELOAD) {
    const fullPath = join(PROJECT_ROOT, doc.filePath);

    try {
      const content = await readFile(fullPath, 'utf-8');

      await cognee.addText(GLOBAL_NAMESPACE, content, {
        filename: doc.filePath,
        type: doc.type,
        priority: doc.priority,
        loaded_at: new Date().toISOString()
      });

      console.log(`  ✅ Queued: ${doc.filePath} (${doc.priority})`);
      successCount++;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Failed: ${doc.filePath} - ${errorMessage}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Batch Add Complete:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}\n`);

  if (successCount === 0) {
    console.error('❌ No documents loaded. Aborting.');
    process.exit(1);
  }

  // COGNIFY ONCE (efficient)
  console.log('🔄 Running cognify (this will take 1-3 minutes)...');
  console.log('   Processing:');
  console.log('   - Entity extraction');
  console.log('   - Relationship mapping');
  console.log('   - Graph construction');
  console.log('   - Vector embeddings');
  console.log('   - Index building\n');

  try {
    const startTime = Date.now();
    await cognee.cognify(GLOBAL_NAMESPACE);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✅ Cognify complete (${duration}s)\n`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Cognify failed: ${errorMessage}`);
    process.exit(1);
  }

  // MEMIFY (optional advanced processing)
  console.log('🧠 Running memify (advanced pattern discovery)...');
  console.log('   This may take another 1-2 minutes...\n');

  try {
    const startTime = Date.now();
    await cognee.memify(GLOBAL_NAMESPACE);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✅ Memify complete (${duration}s)\n`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  Memify failed (optional): ${errorMessage}\n`);
  }

  // Success summary
  console.log('================================');
  console.log('✅ Global Memory Ready!');
  console.log('================================\n');
  console.log('📊 Summary:');
  console.log(`   Dataset: ${GLOBAL_NAMESPACE}`);
  console.log(`   Documents: ${successCount}`);
  console.log(`   Status: Ready for agent queries\n`);
  console.log('🧠 All agent skills can now query global memory for:');
  console.log('   - Project standards (shared_contract.md)');
  console.log('   - Routing patterns (ROUTES.md)');
  console.log('   - Design system (LIFE_OS_DESIGN_SYSTEM.md)');
  console.log('   - Architecture (CLAUDE.md)');
  console.log('   - Tool allocation (tool-allocation-matrix.json)\n');
  console.log('🚀 Next: Test with "Find authentication patterns"\n');
}

// Run preload
preloadGlobalMemory().catch((error) => {
  console.error('❌ Preload failed:', error);
  process.exit(1);
});
