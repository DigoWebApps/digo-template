#!/usr/bin/env node
/**
 * DIGO Agent Test Runner
 *
 * CLI tool to run agent tests and save results.
 * Usage: npm run test:agent <agent-type> "<prompt>"
 */

import {
  AgentType,
  TestResult,
  getNextTestNumber,
  saveTestResults,
  parseAgentResponse,
  validateArtifact,
  printTestSummary
} from './test-harness';

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: npm run test:agent <agent-type> "<prompt>"');
    console.error('Agent types: data-agent, visuals-agent, links-agent, orchestrator');
    process.exit(1);
  }

  const agentType = args[0] as AgentType;
  const prompt = args[1];

  const validAgents: AgentType[] = ['data-agent', 'visuals-agent', 'links-agent', 'orchestrator'];
  if (!validAgents.includes(agentType)) {
    console.error(`Invalid agent type: ${agentType}`);
    console.error(`Valid types: ${validAgents.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n🚀 Running test for ${agentType}...`);
  console.log(`Prompt: ${prompt}\n`);

  // Get next test number
  const testNumber = getNextTestNumber(agentType);
  const description = prompt.substring(0, 50); // Use first 50 chars as description

  try {
    // NOTE: This is a placeholder for the actual agent invocation
    // In practice, this would use the Claude Code Task tool to invoke the agent
    // For now, we'll just create the structure and you'll manually add the response

    console.log('⏳ Waiting for agent response...');
    console.log('📝 NOTE: This is a manual test runner.');
    console.log('   Please invoke the agent manually and paste the response when prompted.\n');

    // Prompt for response (in a real implementation, this would invoke the agent)
    console.log('Paste the agent response (JSON format) and press Enter twice:');

    const response = await readMultilineInput();

    // Parse response
    const parsed = parseAgentResponse(response);

    if (!parsed) {
      console.error('❌ Failed to parse agent response as [TEXT, ARTIFACT] format');
      process.exit(1);
    }

    // Validate artifact
    const validation = validateArtifact(parsed.artifact, agentType);

    // Create test result
    const testResult: TestResult = {
      agentType,
      testNumber,
      description,
      request: prompt,
      response: parsed,
      artifact: parsed.artifact,
      passed: validation.valid,
      errors: validation.errors,
      timestamp: new Date().toISOString()
    };

    // Save results
    const testDir = saveTestResults(testResult);

    // Print summary
    printTestSummary(testResult, validation);

    console.log(`✅ Test results saved to: ${testDir}\n`);

    if (!validation.valid) {
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

/**
 * Read multiline input from stdin
 */
function readMultilineInput(): Promise<string> {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    let lines: string[] = [];
    let emptyLineCount = 0;

    rl.on('line', (line: string) => {
      if (line.trim() === '') {
        emptyLineCount++;
        if (emptyLineCount >= 2) {
          rl.close();
          resolve(lines.join('\n'));
        }
      } else {
        emptyLineCount = 0;
        lines.push(line);
      }
    });
  });
}

main().catch(console.error);
