// scripts/deploy_hostinger.ts
// Justification: Hostinger deployment automation connecting Hostinger API and pushing production bundles to the deploy branch for instant Hostinger Git deployment.

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync, execSync } from 'child_process';

interface HostingerSite {
  domain: string;
  root_directory?: string;
  username?: string;
}

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...rest] = trimmed.split('=');
        const val = rest
          .join('=')
          .trim()
          .replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
}

async function verifyHostingerStatus(token: string, domain: string) {
  console.log(`\nVerifying Hostinger API connectivity for ${domain}...`);
  try {
    const response = await fetch('https://developers.hostinger.com/api/hosting/v1/websites', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const json = (await response.json()) as { data?: HostingerSite[] };
      const site = json.data?.find((website) => website.domain === domain);
      if (site) {
        console.log(`✓ Confirmed website ${domain} active on Hostinger account.`);
        console.log(`  Root Directory: ${site.root_directory}`);
        console.log(`  Account User: ${site.username}`);
        return site;
      }
    }
  } catch (e) {
    console.warn('Hostinger status check warning:', e);
  }
  return null;
}

function deployToGitBranch() {
  console.log('\n========================================');
  console.log('Building and Pushing to "deploy" branch...');
  console.log('========================================\n');

  // Step 1: Build
  console.log('Step 1: Running production build...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Push dist to deploy branch
  console.log('\nStep 2: Preparing static assets deployment branch...');
  const tempDir = path.join(os.tmpdir(), `deploy-${Date.now()}`);
  const repositoryUrl = process.env.DEPLOY_REPOSITORY_URL || 'https://github.com/GeekatplayStudio/clipline.git';
  fs.mkdirSync(tempDir, { recursive: true });

  const distDir = path.resolve(process.cwd(), 'dist');
  fs.cpSync(distDir, tempDir, { recursive: true });

  console.log(`Created deployment staging at: ${tempDir}`);

  try {
    execSync('git init', { cwd: tempDir, stdio: 'ignore' });
    execFileSync('git', ['remote', 'add', 'origin', repositoryUrl], { cwd: tempDir, stdio: 'ignore' });
    execSync('git checkout -b deploy', { cwd: tempDir, stdio: 'ignore' });
    execSync('git add .', { cwd: tempDir, stdio: 'ignore' });
    execSync('git commit -m "deploy: automated static build for Hostinger"', {
      cwd: tempDir,
      stdio: 'ignore',
    });
    console.log('Pushing production build to GitHub deploy branch...');
    execSync('git push origin deploy --force', { cwd: tempDir, stdio: 'inherit' });
    console.log('✓ Successfully pushed to GitHub "deploy" branch!');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function main() {
  loadEnv();
  const token = process.env.HOSTINGER_API_TOKEN;
  const domain = process.env.HOSTINGER_DOMAIN;

  if (!domain) {
    throw new Error('HOSTINGER_DOMAIN is required.');
  }

  if (token) {
    await verifyHostingerStatus(token, domain);
  }

  deployToGitBranch();

  console.log('\n========================================');
  console.log('Hostinger Deployment Setup Complete!');
  console.log('========================================');
  console.log(`Domain: https://${domain}/`);
  console.log('In Hostinger hPanel -> Advanced -> Git:');
  console.log(`  1. Repository: ${process.env.DEPLOY_REPOSITORY_URL}`);
  console.log('  2. Branch: deploy');
  console.log('  3. Directory: public_html');
  console.log('========================================\n');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
