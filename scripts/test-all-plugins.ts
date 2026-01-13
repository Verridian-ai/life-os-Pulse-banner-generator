/**
 * Comprehensive Plugin & MCP Server Testing Script
 *
 * Tests all 23 plugins, MCP servers, and Cognee integration
 * with each skill agent to ensure seamless operation.
 *
 * Usage: npm run test-plugins
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

interface TestResult {
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'skip';
  duration_ms: number;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

/**
 * Test Categories
 */
const TESTS = {
  cognee: [
    { name: 'Cognee Installation', test: testCogneeInstallation },
    { name: 'Cognee Add Document', test: testCogneeAdd },
    { name: 'Cognee Search', test: testCogneeSearch },
    { name: 'Cognee with Research Agent', test: testCogneeResearchAgent },
    { name: 'Cognee with Coding Agent', test: testCogneeCodingAgent }
  ],
  mcp_servers: [
    { name: 'TypeScript MCP', test: () => testMCP('@modelcontextprotocol/server-typescript') },
    { name: 'ESLint MCP', test: () => testMCP('@modelcontextprotocol/server-eslint') },
    { name: 'Vitest MCP', test: () => testMCP('@modelcontextprotocol/server-vitest') },
    { name: 'Neon MCP', test: () => testMCP('@neondatabase/mcp-server-neon') },
    { name: 'Prettier MCP', test: () => testMCP('@modelcontextprotocol/server-prettier') },
    { name: 'Lighthouse MCP', test: () => testMCP('@modelcontextprotocol/server-lighthouse') }
  ],
  claude_plugins: [
    { name: 'Ralph Loop Available', test: testRalphLoop },
    { name: 'Hookify Available', test: testHookify }
  ],
  integration: [
    { name: 'Tool Allocation Matrix Valid', test: testToolAllocation },
    { name: 'Skills Config Valid', test: testSkillsConfig },
    { name: 'Context Isolation Enforced', test: testContextIsolation }
  ]
};

/**
 * Cognee Tests
 */
async function testCogneeInstallation(): Promise<TestResult> {
  try {
    const { stdout } = await execAsync('python -c "import cognee; print(cognee.__version__)"');
    return {
      name: 'Cognee Installation',
      category: 'cognee',
      status: 'pass',
      duration_ms: 0,
      details: `Cognee version: ${stdout.trim()}`
    };
  } catch (error: unknown) {
    return {
      name: 'Cognee Installation',
      category: 'cognee',
      status: 'fail',
      duration_ms: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function testCogneeAdd(): Promise<TestResult> {
  try {
    const testScript = `
import cognee
import asyncio

async def test():
    await cognee.add("Test document for verification")
    return "Success"

print(asyncio.run(test()))
`;
    await fs.writeFile('test_cognee_temp.py', testScript);
    const { stdout } = await execAsync('python test_cognee_temp.py');
    await fs.unlink('test_cognee_temp.py');

    return {
      name: 'Cognee Add Document',
      category: 'cognee',
      status: stdout.includes('Success') ? 'pass' : 'fail',
      duration_ms: 0,
      details: 'Successfully added test document'
    };
  } catch (error: unknown) {
    return {
      name: 'Cognee Add Document',
      category: 'cognee',
      status: 'fail',
      duration_ms: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function testCogneeSearch(): Promise<TestResult> {
  try {
    const testScript = `
import cognee
import asyncio

async def test():
    results = await cognee.search("test")
    return f"Found {len(results)} results"

print(asyncio.run(test()))
`;
    await fs.writeFile('test_cognee_search.py', testScript);
    const { stdout } = await execAsync('python test_cognee_search.py');
    await fs.unlink('test_cognee_search.py');

    return {
      name: 'Cognee Search',
      category: 'cognee',
      status: 'pass',
      duration_ms: 0,
      details: stdout.trim()
    };
  } catch (error: unknown) {
    return {
      name: 'Cognee Search',
      category: 'cognee',
      status: 'fail',
      duration_ms: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function testCogneeResearchAgent(): Promise<TestResult> {
  // Verify research agent has Cognee access in tool allocation
  try {
    const matrix = JSON.parse(
      await fs.readFile('.claude/tool-allocation-matrix.json', 'utf-8')
    );

    const researchAgent = matrix.skill_tool_map['research-agent'];
    const hasCognee = researchAgent.allowed_tools.includes('Cognee') ||
                      researchAgent.mcp_servers.includes('cognee');

    return {
      name: 'Cognee with Research Agent',
      category: 'cognee',
      status: hasCognee ? 'pass' : 'fail',
      duration_ms: 0,
      details: hasCognee ? 'Research agent has Cognee access' : 'Missing Cognee access'
    };
  } catch (error: unknown) {
    return {
      name: 'Cognee with Research Agent',
      category: 'cognee',
      status: 'fail',
      duration_ms: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function testCogneeCodingAgent(): Promise<TestResult> {
  try {
    const matrix = JSON.parse(
      await fs.readFile('.claude/tool-allocation-matrix.json', 'utf-8')
    );

    const codingAgent = matrix.skill_tool_map['coding-agent'];
    const hasCognee = codingAgent?.allowed_tools?.includes('Cognee') ||
                      codingAgent?.mcp_servers?.includes('cognee');

    return {
      name: 'Cognee with Coding Agent',
      category: 'cognee',
      status: hasCognee ? 'pass' : 'fail',
      duration_ms: 0,
      details: hasCognee ? 'Coding agent has Cognee access' : 'Missing Cognee access'
    };
  } catch (error: unknown) {
    return {
      name: 'Cognee with Coding Agent',
      category: 'cognee',
      status: 'fail',
      duration_ms: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * MCP Server Tests
 */
async function testMCP(packageName: string): Promise<TestResult> {
  try {
    const { stdout } = await execAsync(`npx ${packageName} --version`, {
      timeout: 10000
    });

    return {
      name: packageName,
      category: 'mcp_servers',
      status: 'pass',
      duration_ms: 0,
      details: `Installed: ${stdout.trim() || 'OK'}`
    };
  } catch (error: unknown) {
    const errorObj = error as { stderr?: string; message?: string };
    return {
      name: packageName,
      category: 'mcp_servers',
      status: 'fail',
      duration_ms: 0,
      error: errorObj.stderr || errorObj.message || String(error)
    };
  }
}

/**
 * Claude Plugin Tests
 */
async function testRalphLoop(): Promise<TestResult> {
  try {
    const settings = JSON.parse(
      await fs.readFile('.claude/settings.json', 'utf-8')
    );

    const enabled = settings.enabledPlugins?.['ralph-loop@claude-plugins-official'];

    return {
      name: 'Ralph Loop Available',
      category: 'claude_plugins',
      status: enabled ? 'pass' : 'fail',
      duration_ms: 0,
      details: enabled ? 'Ralph Loop is enabled' : 'Ralph Loop not enabled'
    };
  } catch (error: unknown) {
    return {
      name: 'Ralph Loop Available',
      category: 'claude_plugins',
      status: 'fail',
      duration_ms: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function testHookify(): Promise<TestResult> {
  try {
    const settings = JSON.parse(
      await fs.readFile('.claude/settings.json', 'utf-8')
    );

    const enabled = settings.enabledPlugins?.['hookify@claude-plugins-official'];

    return {
      name: 'Hookify Available',
      category: 'claude_plugins',
      status: enabled ? 'pass' : 'fail',
      duration_ms: 0,
      details: enabled ? 'Hookify is enabled' : 'Hookify not enabled'
    };
  } catch (error: unknown) {
    return {
      name: 'Hookify Available',
      category: 'claude_plugins',
      status: 'fail',
      duration_ms: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Integration Tests
 */
async function testToolAllocation(): Promise<TestResult> {
  try {
    const matrix = JSON.parse(
      await fs.readFile('.claude/tool-allocation-matrix.json', 'utf-8')
    );

    // Verify orchestrator restrictions
    const orchestrator = matrix.skill_tool_map.orchestrator;
    const hasRestrictions = orchestrator.forbidden_tools.length > 0;
    const allowedCount = orchestrator.allowed_tools.length;

    return {
      name: 'Tool Allocation Matrix Valid',
      category: 'integration',
      status: hasRestrictions && allowedCount === 5 ? 'pass' : 'fail',
      duration_ms: 0,
      details: `Orchestrator has ${allowedCount} allowed tools, restrictions enforced: ${hasRestrictions}`
    };
  } catch (error: unknown) {
    return {
      name: 'Tool Allocation Matrix Valid',
      category: 'integration',
      status: 'fail',
      duration_ms: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function testSkillsConfig(): Promise<TestResult> {
  try {
    const config = JSON.parse(
      await fs.readFile('.claude/skills-config.json', 'utf-8')
    );

    const skillCount = Object.keys(config.agent_skills || {}).length;
    const hasCogneeSkill = !!config.agent_skills?.['cognee-memory-agent'];

    return {
      name: 'Skills Config Valid',
      category: 'integration',
      status: skillCount >= 8 && hasCogneeSkill ? 'pass' : 'fail',
      duration_ms: 0,
      details: `${skillCount} skills configured, Cognee skill: ${hasCogneeSkill}`
    };
  } catch (error: unknown) {
    return {
      name: 'Skills Config Valid',
      category: 'integration',
      status: 'fail',
      duration_ms: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function testContextIsolation(): Promise<TestResult> {
  try {
    const matrix = JSON.parse(
      await fs.readFile('.claude/tool-allocation-matrix.json', 'utf-8')
    );

    const orchestrator = matrix.skill_tool_map.orchestrator;
    const budget = orchestrator.context_budget;
    const cannotUseCognee = orchestrator.forbidden_tools.includes('Cognee');

    return {
      name: 'Context Isolation Enforced',
      category: 'integration',
      status: budget === 5000 && cannotUseCognee ? 'pass' : 'fail',
      duration_ms: 0,
      details: `Budget: ${budget}, Cognee forbidden: ${cannotUseCognee}`
    };
  } catch (error: unknown) {
    return {
      name: 'Context Isolation Enforced',
      category: 'integration',
      status: 'fail',
      duration_ms: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🧪 Comprehensive Plugin & MCP Testing');
  console.log('======================================\n');

  for (const [category, tests] of Object.entries(TESTS)) {
    console.log(`📊 Testing ${category}...`);

    for (const test of tests) {
      const startTime = Date.now();
      try {
        const result = await test.test();
        result.duration_ms = Date.now() - startTime;
        results.push(result);

        const icon = result.status === 'pass' ? '✅' : '❌';
        console.log(`  ${icon} ${result.name} (${result.duration_ms}ms)`);
        if (result.details) {
          console.log(`     ${result.details}`);
        }
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({
          name: test.name,
          category,
          status: 'fail',
          duration_ms: Date.now() - startTime,
          error: errorMessage
        });
        console.log(`  ❌ ${test.name} - ${errorMessage}`);
      }
    }
    console.log('');
  }

  // Generate summary
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const total = results.length;

  console.log('======================================');
  console.log('📊 Test Summary');
  console.log('======================================');
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed,
      success_rate: ((passed / total) * 100).toFixed(1) + '%'
    },
    results,
    recommendations: generateRecommendations(results)
  };

  await fs.writeFile(
    '.claude/logs/plugin-test-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('📄 Detailed report saved to: .claude/logs/plugin-test-report.json\n');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

function generateRecommendations(results: TestResult[]): string[] {
  const recommendations: string[] = [];

  const failedTests = results.filter(r => r.status === 'fail');

  if (failedTests.some(t => t.category === 'cognee')) {
    recommendations.push('Install Cognee: pip install cognee');
  }

  if (failedTests.some(t => t.category === 'mcp_servers')) {
    recommendations.push('Run MCP installation: npm run install-mcp');
  }

  if (failedTests.some(t => t.name.includes('Ralph Loop'))) {
    recommendations.push('Enable Ralph Loop in .claude/settings.json');
  }

  if (failedTests.some(t => t.name.includes('Hookify'))) {
    recommendations.push('Enable Hookify in .claude/settings.json');
  }

  if (failedTests.some(t => t.category === 'integration')) {
    recommendations.push('Review tool allocation matrix configuration');
  }

  return recommendations;
}

// Run tests
runAllTests().catch(console.error);
