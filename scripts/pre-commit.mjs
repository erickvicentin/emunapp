#!/usr/bin/env node
import { spawn } from 'node:child_process';

const isTTY = Boolean(process.stdout.isTTY);
const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

function runStep(label, command, args) {
  return new Promise((resolve) => {
    const start = Date.now();
    let frameIndex = 0;
    let output = '';

    if (isTTY) {
      process.stdout.write(`${c.cyan}${FRAMES[0]}${c.reset} ${label}...`);
    } else {
      console.log(`⏳ ${label}...`);
    }

    const spinner = isTTY
      ? setInterval(() => {
          frameIndex = (frameIndex + 1) % FRAMES.length;
          process.stdout.write(
            `\r\x1b[K${c.cyan}${FRAMES[frameIndex]}${c.reset} ${label}...`
          );
        }, 80)
      : null;

    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PATH: `${process.env.PATH || ''}:/opt/homebrew/bin:/usr/local/bin`,
        FORCE_COLOR: '1',
      },
    });

    child.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      output += chunk.toString();
    });

    child.on('close', (code) => {
      if (spinner) clearInterval(spinner);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);

      if (code === 0) {
        const line = `${c.green}✔${c.reset} ${label} ${c.dim}(${elapsed}s)${c.reset}`;
        if (isTTY) {
          process.stdout.write(`\r\x1b[K${line}\n`);
        } else {
          console.log(line);
        }
        resolve({ ok: true, output });
      } else {
        const line = `${c.red}✖${c.reset} ${label} ${c.red}falló${c.reset} ${c.dim}(${elapsed}s)${c.reset}`;
        if (isTTY) {
          process.stdout.write(`\r\x1b[K${line}\n`);
        } else {
          console.log(line);
        }
        if (output.trim()) {
          console.error(`\n${output.trim()}\n`);
        }
        resolve({ ok: false, output });
      }
    });

    child.on('error', (err) => {
      if (spinner) clearInterval(spinner);
      const line = `${c.red}✖${c.reset} ${label} ${c.red}error al ejecutar: ${err.message}${c.reset}`;
      if (isTTY) {
        process.stdout.write(`\r\x1b[K${line}\n`);
      } else {
        console.log(line);
      }
      resolve({ ok: false, output: err.message });
    });
  });
}

async function main() {
  console.log(`\n${c.bold}${c.cyan}▶ Pre-commit Emuná Pilates${c.reset}\n`);

  const lintResult = await runStep('Ejecutando Linter (oxlint)', 'npx', [
    '-y',
    'oxlint@latest',
    'src',
  ]);

  if (!lintResult.ok) {
    console.log(
      `\n${c.red}✖ Commit cancelado.${c.reset} Corregí los errores del linter antes de commitear.\n`
    );
    process.exit(1);
  }

  const doctorResult = await runStep(
    'Ejecutando React Doctor (mínimo 95%)',
    'node',
    ['scripts/check-doctor-score.mjs']
  );

  if (!doctorResult.ok) {
    console.log(
      `\n${c.red}✖ Commit cancelado.${c.reset} Corregí los problemas detectados por React Doctor antes de commitear.\n`
    );
    process.exit(1);
  }

  console.log(
    `\n${c.green}${c.bold}✔ Todo en orden. Continuando con el commit...${c.reset}\n`
  );
}

main();
