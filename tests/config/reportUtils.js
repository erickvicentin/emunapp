import fs from 'node:fs';
import path from 'node:path';

function splitStepsIntoAttempts(steps = []) {
  const attempts = [];
  let current = [];

  for (const step of steps) {
    if (step.keyword === 'Before' && current.length > 0) {
      attempts.push(current);
      current = [];
    }
    current.push(step);
  }

  if (current.length > 0) {
    attempts.push(current);
  }

  return attempts;
}

function areAllStepsPassed(steps = []) {
  return (
    steps.length > 0 &&
    steps.every((step) => step.result?.status === 'passed')
  );
}

function keepWinningAttemptSteps(steps = []) {
  const attempts = splitStepsIntoAttempts(steps);
  if (attempts.length <= 1) return steps;

  const passingAttempt = attempts.findLast((attempt) =>
    areAllStepsPassed(attempt)
  );
  return passingAttempt || attempts[attempts.length - 1];
}

/**
 * Cleans retried Cucumber scenario attempts in JSON report files before HTML generation.
 * `wdio-cucumberjs-json-reporter` appends retry attempts (`Before`..`After`) to the same
 * `element.steps` array; this keeps only the passing attempt when a retry succeeds,
 * or the final attempt if all retries fail.
 */
export function deduplicateRetriedScenarios(jsonDir) {
  if (!fs.existsSync(jsonDir)) return;

  const files = fs
    .readdirSync(jsonDir)
    .filter((file) => file.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(jsonDir, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) continue;

    const features = JSON.parse(raw);
    if (!Array.isArray(features)) continue;

    for (const feature of features) {
      if (!Array.isArray(feature.elements)) continue;
      for (const element of feature.elements) {
        element.steps = keepWinningAttemptSteps(element.steps);
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(features));
  }
}
