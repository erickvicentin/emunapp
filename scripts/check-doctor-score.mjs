#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const MIN_SCORE = 95;
const env = {
  ...process.env,
  PATH: `${process.env.PATH || ''}:/opt/homebrew/bin:/usr/local/bin`,
};

try {
  const rawScore = execFileSync(
    'npx',
    ['-y', 'react-doctor@latest', '.', '-y', '--score'],
    { env, encoding: 'utf8' }
  ).trim();

  const score = Number(rawScore);

  if (Number.isNaN(score)) {
    console.error(`✖ No se pudo interpretar el puntaje de React Doctor: "${rawScore}"`);
    process.exit(1);
  }

  if (score < MIN_SCORE) {
    console.error(
      `✖ React Doctor score es ${score}/100, por debajo del mínimo obligatorio de ${MIN_SCORE}/100.`
    );
    try {
      execFileSync(
        'npx',
        ['-y', 'react-doctor@latest', '.', '-y', '--verbose'],
        { env, stdio: 'inherit' }
      );
    } catch {
      // Ignore verbose exit code; failing with code 1 below
    }
    process.exit(1);
  }

  console.log(`✔ React Doctor score: ${score}/100 (mínimo obligatorio: ${MIN_SCORE}/100)`);
} catch (err) {
  console.error('✖ Error al ejecutar React Doctor:', err.message);
  process.exit(1);
}
