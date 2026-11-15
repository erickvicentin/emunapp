#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const functionsDir = path.resolve(__dirname, '../functions');
const require = createRequire(import.meta.url);

const { initializeApp, cert } = require(
  require.resolve('firebase-admin/app', { paths: [functionsDir] })
);
const { getAuth } = require(
  require.resolve('firebase-admin/auth', { paths: [functionsDir] })
);

const ALLOWED_ROLES = new Set(['staff', 'administradora', 'customer']);

function printUsage() {
  console.error(
    'Uso: GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/serviceAccount.json node scripts/set-staff-claim.mjs <email|uid> [rol]'
  );
  console.error('Roles permitidos: staff (default), administradora, customer');
}

const [, , target, requestedRol = 'staff'] = process.argv;

if (!target || target === '--help' || target === '-h') {
  printUsage();
  process.exit(target ? 0 : 1);
}

if (!ALLOWED_ROLES.has(requestedRol)) {
  console.error(`✖ Rol inválido: "${requestedRol}".`);
  printUsage();
  process.exit(1);
}

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialsPath) {
  console.error('✖ Falta la variable de entorno GOOGLE_APPLICATION_CREDENTIALS.');
  printUsage();
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(readFileSync(credentialsPath, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });

  const auth = getAuth();
  const userRecord = target.includes('@')
    ? await auth.getUserByEmail(target.trim().toLowerCase())
    : await auth.getUser(target.trim());

  const nextClaims = {
    ...(userRecord.customClaims || {}),
    rol: requestedRol,
  };

  await auth.setCustomUserClaims(userRecord.uid, nextClaims);
  const updated = await auth.getUser(userRecord.uid);

  console.log(`✔ Custom claims actualizados para ${updated.email || updated.uid}:`);
  console.log(`  UID: ${updated.uid}`);
  console.log(`  Claims: ${JSON.stringify(updated.customClaims)}`);
  console.log('ℹ Cerrá sesión y volvé a iniciar sesión en la web para refrescar el token.');
} catch (err) {
  console.error('✖ Error al asignar custom claims:', err?.message || err);
  process.exit(1);
}
