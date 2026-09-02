// scripts/hostinger_api_deploy.ts
// Justification: Direct static site deployment using Hostinger OpenAPI specification:
// 1. Generate upload URL via POST /api/hosting/v1/files/upload-urls
// 2. Upload zip archive via TUS protocol POST & PATCH with X-Auth and X-Auth-Rest headers
// 3. Trigger extraction via POST /api/hosting/v1/accounts/{username}/websites/{domain}/deploy

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...rest] = trimmed.split('=');
        const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
}

async function runDirectDeploy() {
  loadEnv();

  const token = process.env.HOSTINGER_API_TOKEN;
  const domain = process.env.HOSTINGER_DOMAIN || 'clipline.xyz';
  const username = 'u909878422';

  if (!token) {
    console.error('HOSTINGER_API_TOKEN is required in .env');
    process.exit(1);
  }

  console.log(`\n========================================`);
  console.log(`Direct Hostinger API Deployment: ${domain}`);
  console.log(`========================================\n`);

  // 1. Build dist
  console.log('Step 1: Compiling production build...');
  execSync('npm run build', { stdio: 'inherit' });

  // 2. Package dist into app.zip
  console.log('\nStep 2: Packaging dist/ into app.zip...');
  const zipPath = path.resolve(process.cwd(), 'dist', 'app.zip');
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

  // Compress contents of dist folder
  execSync('powershell -Command "Compress-Archive -Path dist/* -DestinationPath dist/app.zip -Force"', {
    stdio: 'inherit',
  });

  const zipBuffer = fs.readFileSync(zipPath);
  const zipSize = zipBuffer.length;
  console.log(`Created app.zip (${zipSize} bytes)`);

  // 3. Request Upload URL
  console.log('\nStep 3: Requesting upload URL from Hostinger API...');
  let uploadCredentials: { url: string; auth_key: string; rest_auth_key: string } | null = null;

  // Try domain directly, fallback if needed
  for (const targetDomain of [domain, 'geekatplay.com']) {
    try {
      console.log(`Trying upload-urls for domain: ${targetDomain}...`);
      const res = await fetch('https://developers.hostinger.com/api/hosting/v1/files/upload-urls', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          domain: targetDomain,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (res.ok) {
        uploadCredentials = await res.json();
        console.log(`✓ Got upload credentials using ${targetDomain}`);
        break;
      } else {
        console.warn(`Response from ${targetDomain}: ${res.status} ${await res.text()}`);
      }
    } catch (err) {
      console.warn(`Error trying ${targetDomain}:`, err);
    }
  }

  if (!uploadCredentials) {
    throw new Error('Unable to obtain Hostinger upload credentials.');
  }

  const { url, auth_key, rest_auth_key } = uploadCredentials;
  console.log(`TUS Base URL: ${url}`);

  // 4. Upload app.zip via TUS
  console.log('\nStep 4: Uploading app.zip via TUS protocol...');
  const uploadUrl = `${url}/app.zip?override=true`;

  console.log(`4a. Sending TUS creation POST to ${uploadUrl}...`);
  const createRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'X-Auth': auth_key,
      'X-Auth-Rest': rest_auth_key,
      'Tus-Resumable': '1.0.0',
      'Upload-Length': zipSize.toString(),
      'Upload-Offset': '0',
    },
    signal: AbortSignal.timeout(30000),
  });

  console.log(`TUS Create Status: ${createRes.status} ${createRes.statusText}`);
  if (createRes.status !== 201 && createRes.status !== 200) {
    const errBody = await createRes.text();
    console.warn(`Create response: ${errBody}`);
  }

  console.log(`4b. Sending TUS data PATCH...`);
  const patchRes = await fetch(uploadUrl, {
    method: 'PATCH',
    headers: {
      'X-Auth': auth_key,
      'X-Auth-Rest': rest_auth_key,
      'Tus-Resumable': '1.0.0',
      'Content-Type': 'application/offset+octet-stream',
      'Upload-Offset': '0',
    },
    body: zipBuffer,
    signal: AbortSignal.timeout(60000),
  });

  console.log(`TUS Patch Status: ${patchRes.status} ${patchRes.statusText}`);
  if (!patchRes.ok && patchRes.status !== 204) {
    console.warn(`Patch response: ${await patchRes.text()}`);
  } else {
    console.log(`✓ app.zip uploaded successfully to server!`);
  }

  // 5. Trigger Static Site Deployment
  console.log('\nStep 5: Triggering Hostinger deploy endpoint...');
  const deployRes = await fetch(`https://developers.hostinger.com/api/hosting/v1/accounts/${username}/websites/${domain}/deploy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      archive_path: 'app.zip',
    }),
    signal: AbortSignal.timeout(30000),
  });

  console.log(`Deploy Status: ${deployRes.status} ${deployRes.statusText}`);
  const deployBody = await deployRes.text();
  console.log('Deploy Response:', deployBody);

  if (deployRes.ok) {
    console.log(`\n🎉 SUCCESS! Site has been deployed to https://${domain}/`);
  } else {
    console.log(`Deploy response note: ${deployBody}`);
  }
}

runDirectDeploy().catch(console.error);
