// scripts/deploy_hostinger.ts
// Justification: Deployment script to connect Hostinger API, verify authentication, and prepare build deployment per PRD Section 1 target (vladimirchopine.com).

import fs from 'fs';
import path from 'path';

interface HostingerAccountInfo {
  id?: string;
  email?: string;
  domain?: string;
  status?: string;
}

async function testHostingerConnection(apiToken: string) {
  console.log('Testing Hostinger API authentication...');

  try {
    const response = await fetch('https://api.hostinger.com/v1/domains', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✓ Hostinger API Connected Successfully!');
      console.log('Hostinger Domains response:', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.warn(`Hostinger API responded with status ${response.status}: ${errorText}`);
      return { success: false, status: response.status, error: errorText };
    }
  } catch (err) {
    console.error('Error connecting to Hostinger API:', err);
    return { success: false, error: String(err) };
  }
}

async function main() {
  const token = process.env.HOSTINGER_API_TOKEN;
  if (!token) {
    console.log('\n[HOSTINGER CONNECTOR]');
    console.log('Please provide your HOSTINGER_API_TOKEN either in .env or as an environment variable.');
    console.log('Example: HOSTINGER_API_TOKEN="your-token" npm run deploy:hostinger\n');
    return;
  }

  const result = await testHostingerConnection(token);
  if (result.success) {
    console.log('\nReady to deploy production build to Hostinger.');
    console.log('Run `npm run build` to generate dist/ output for your Hostinger public_html folder.');
  }
}

main().catch(console.error);
