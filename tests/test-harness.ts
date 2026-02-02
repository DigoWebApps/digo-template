/**
 * DIGO Agent Test Harness
 *
 * Utilities for testing DIGO agents by simulating chat requests
 * and validating their outputs against the expected schemas.
 */

import * as fs from 'fs';
import * as path from 'path';

export type AgentType = 'data-agent' | 'visuals-agent' | 'links-agent' | 'orchestrator';

export interface TestResult {
  agentType: AgentType;
  testNumber: string;
  description: string;
  request: string;
  response: any;
  artifact: any;
  passed: boolean;
  errors: string[];
  timestamp: string;
}

export interface ArtifactValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Get the next test number for an agent
 */
export function getNextTestNumber(agentType: AgentType): string {
  const resultsDir = path.join(process.cwd(), 'tests', 'results', agentType);

  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
    return '001';
  }

  const existingTests = fs.readdirSync(resultsDir)
    .filter(dir => /^\d{3}-/.test(dir))
    .map(dir => parseInt(dir.substring(0, 3)))
    .sort((a, b) => b - a);

  const nextNum = existingTests.length > 0 ? existingTests[0] + 1 : 1;
  return String(nextNum).padStart(3, '0');
}

/**
 * Create a test directory and save all test files
 */
export function saveTestResults(testResult: TestResult): string {
  const { agentType, testNumber, description, request, response, artifact } = testResult;

  // Create sanitized directory name
  const sanitizedDesc = description
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const testDir = path.join(
    process.cwd(),
    'tests',
    'results',
    agentType,
    `${testNumber}-${sanitizedDesc}`
  );

  fs.mkdirSync(testDir, { recursive: true });

  // Save request
  fs.writeFileSync(
    path.join(testDir, 'request.txt'),
    request,
    'utf-8'
  );

  // Save full response
  fs.writeFileSync(
    path.join(testDir, 'response.json'),
    JSON.stringify(response, null, 2),
    'utf-8'
  );

  // Save artifact(s)
  if (artifact) {
    saveArtifact(testDir, artifact, agentType);
  }

  // Save test metadata
  const metadata = {
    agentType,
    testNumber,
    description,
    timestamp: testResult.timestamp,
    passed: testResult.passed,
    errors: testResult.errors
  };

  fs.writeFileSync(
    path.join(testDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2),
    'utf-8'
  );

  return testDir;
}

/**
 * Save artifact based on type
 */
function saveArtifact(testDir: string, artifact: any, agentType: AgentType): void {
  if (agentType === 'visuals-agent' && artifact.CODE_FILES) {
    // Save CODE_FILES as separate files
    const codeDir = path.join(testDir, 'artifact');
    fs.mkdirSync(codeDir, { recursive: true });

    for (const [filename, content] of Object.entries(artifact.CODE_FILES)) {
      const filepath = path.join(codeDir, filename.replace(/^\//, ''));
      fs.writeFileSync(filepath, content as string, 'utf-8');
    }
  } else {
    // Save as single JSON file
    fs.writeFileSync(
      path.join(testDir, 'artifact.json'),
      JSON.stringify(artifact, null, 2),
      'utf-8'
    );
  }
}

/**
 * Parse agent response and extract artifact
 */
export function parseAgentResponse(responseText: string): { text: string; artifact: any } | null {
  try {
    // Try to parse as JSON array [TEXT, ARTIFACT]
    const parsed = JSON.parse(responseText);

    if (Array.isArray(parsed)) {
      const textEntry = parsed.find((item: any) => item.type === 'TEXT');
      const artifactEntry = parsed.find((item: any) => item.type === 'ARTIFACT');

      return {
        text: textEntry?.value || '',
        artifact: artifactEntry?.value || null
      };
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Validate artifact structure based on agent type
 */
export function validateArtifact(artifact: any, agentType: AgentType): ArtifactValidationResult {
  const result: ArtifactValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  if (!artifact) {
    result.valid = false;
    result.errors.push('Artifact is null or undefined');
    return result;
  }

  switch (agentType) {
    case 'data-agent':
      return validateDataArtifact(artifact);
    case 'visuals-agent':
      return validateVisualsArtifact(artifact);
    case 'links-agent':
      return validateLinksArtifact(artifact);
    case 'orchestrator':
      return validateOrchestratorArtifact(artifact);
    default:
      result.errors.push(`Unknown agent type: ${agentType}`);
      result.valid = false;
      return result;
  }
}

function validateDataArtifact(artifact: any): ArtifactValidationResult {
  const result: ArtifactValidationResult = { valid: true, errors: [], warnings: [] };

  if (!artifact.DATA_TABLE_DEFINITION) {
    result.valid = false;
    result.errors.push('Missing DATA_TABLE_DEFINITION');
    return result;
  }

  const def = artifact.DATA_TABLE_DEFINITION;

  // Check required fields
  if (!Array.isArray(def.timeArray)) {
    result.errors.push('timeArray must be an array');
    result.valid = false;
  }

  if (!Array.isArray(def.columns)) {
    result.errors.push('columns must be an array');
    result.valid = false;
  }

  if (!Array.isArray(def.rows)) {
    result.errors.push('rows must be an array');
    result.valid = false;
  }

  // Check column structure
  def.columns?.forEach((col: any, idx: number) => {
    if (!col.id) result.errors.push(`Column ${idx} missing 'id'`);
    if (!col.name) result.warnings.push(`Column ${idx} missing 'name'`);
    if (!col.type) result.errors.push(`Column ${idx} missing 'type'`);
    if (!col.definition) result.warnings.push(`Column ${idx} missing 'definition'`);

    // Check time series consistency
    if (def.timeArray?.length > 0 && col.isArray) {
      // This is a time series column - should have arrays in rows
    } else if (def.timeArray?.length > 0 && !col.isArray) {
      result.warnings.push(`Column ${col.id} might need isArray:true for time series data`);
    }
  });

  // Check row structure
  def.rows?.forEach((row: any, idx: number) => {
    if (!row.id) result.errors.push(`Row ${idx} missing 'id'`);
    if (!row.name) result.warnings.push(`Row ${idx} missing 'name'`);
    if (row.hidden === undefined) result.warnings.push(`Row ${idx} missing 'hidden' property`);
  });

  if (result.errors.length > 0) {
    result.valid = false;
  }

  return result;
}

function validateVisualsArtifact(artifact: any): ArtifactValidationResult {
  const result: ArtifactValidationResult = { valid: true, errors: [], warnings: [] };

  if (!artifact.CODE_FILES) {
    result.valid = false;
    result.errors.push('Missing CODE_FILES');
    return result;
  }

  const files = artifact.CODE_FILES;
  const requiredFiles = ['/asset.tsx', '/package.json', '/styles.css', '/definition.json'];

  requiredFiles.forEach(file => {
    if (!files[file]) {
      result.errors.push(`Missing required file: ${file}`);
      result.valid = false;
    }
  });

  // Validate package.json structure
  if (files['/package.json']) {
    try {
      const pkg = JSON.parse(files['/package.json']);
      if (!pkg.dependencies) {
        result.errors.push('package.json missing dependencies');
        result.valid = false;
      }

      if (!pkg.dependencies?.['@digo-org/digo-api']) {
        result.errors.push('package.json missing @digo-org/digo-api dependency');
        result.valid = false;
      }

      if (!pkg.dependencies?.['react']) {
        result.errors.push('package.json missing react dependency');
        result.valid = false;
      }

      if (pkg.main !== '/index.tsx') {
        result.warnings.push('package.json main should be /index.tsx');
      }
    } catch (e) {
      result.errors.push('package.json is not valid JSON');
      result.valid = false;
    }
  }

  // Validate definition.json structure
  if (files['/definition.json']) {
    try {
      const def = JSON.parse(files['/definition.json']);
      if (!Array.isArray(def)) {
        result.errors.push('definition.json must be an array of VizParameter objects');
        result.valid = false;
      } else {
        def.forEach((param: any, idx: number) => {
          if (!param.id) result.errors.push(`Parameter ${idx} missing 'id'`);
          if (!param.name) result.warnings.push(`Parameter ${idx} missing 'name'`);
          if (!param.group) result.errors.push(`Parameter ${idx} missing 'group'`);
          if (param.isGlobal === undefined) result.errors.push(`Parameter ${idx} missing 'isGlobal'`);
          if (!param.type) result.errors.push(`Parameter ${idx} missing 'type'`);
          if (!param.definition) result.errors.push(`Parameter ${idx} missing 'definition'`);
        });
      }
    } catch (e) {
      result.errors.push('definition.json is not valid JSON');
      result.valid = false;
    }
  }

  // Check asset.tsx contains DigoAsset
  if (files['/asset.tsx']) {
    const assetCode = files['/asset.tsx'];
    if (!assetCode.includes('DigoAsset')) {
      result.warnings.push('asset.tsx does not reference DigoAsset');
    }
    if (!assetCode.includes('extends DigoAsset')) {
      result.errors.push('asset.tsx must extend DigoAsset class');
      result.valid = false;
    }
  }

  if (result.errors.length > 0) {
    result.valid = false;
  }

  return result;
}

function validateLinksArtifact(artifact: any): ArtifactValidationResult {
  const result: ArtifactValidationResult = { valid: true, errors: [], warnings: [] };

  if (!artifact.LINKS) {
    result.valid = false;
    result.errors.push('Missing LINKS object');
    return result;
  }

  const links = artifact.LINKS;

  if (typeof links !== 'object') {
    result.valid = false;
    result.errors.push('LINKS must be an object');
    return result;
  }

  // Check that it's a simple key-value mapping
  Object.entries(links).forEach(([key, value]) => {
    if (typeof value !== 'string') {
      result.errors.push(`Link '${key}' must map to a string value (data column ID)`);
      result.valid = false;
    }
  });

  if (Object.keys(links).length === 0) {
    result.warnings.push('LINKS object is empty - no parameter mappings defined');
  }

  return result;
}

function validateOrchestratorArtifact(artifact: any): ArtifactValidationResult {
  const result: ArtifactValidationResult = { valid: true, errors: [], warnings: [] };

  // Orchestrator can return any of the artifact types
  if (artifact.DATA_TABLE_DEFINITION) {
    return validateDataArtifact(artifact);
  } else if (artifact.CODE_FILES) {
    return validateVisualsArtifact(artifact);
  } else if (artifact.LINKS) {
    return validateLinksArtifact(artifact);
  } else {
    result.errors.push('Unknown artifact type from orchestrator');
    result.valid = false;
  }

  return result;
}

/**
 * Print a formatted test summary
 */
export function printTestSummary(testResult: TestResult, validationResult: ArtifactValidationResult): void {
  console.log('\n' + '='.repeat(80));
  console.log(`TEST: ${testResult.testNumber} - ${testResult.description}`);
  console.log('='.repeat(80));
  console.log(`Agent: ${testResult.agentType}`);
  console.log(`Time: ${testResult.timestamp}`);
  console.log('\nREQUEST:');
  console.log(testResult.request);
  console.log('\nRESPONSE TEXT:');
  console.log(testResult.response?.text || 'N/A');

  console.log('\nVALIDATION:');
  if (validationResult.valid) {
    console.log('✅ PASSED - Artifact is valid');
  } else {
    console.log('❌ FAILED - Artifact validation errors:');
    validationResult.errors.forEach(err => console.log(`  - ${err}`));
  }

  if (validationResult.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    validationResult.warnings.forEach(warn => console.log(`  - ${warn}`));
  }

  console.log('\n' + '='.repeat(80) + '\n');
}
