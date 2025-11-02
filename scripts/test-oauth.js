#!/usr/bin/env node

/**
 * OAuth 2.0 Test Script
 * 
 * This script helps test your OAuth implementation.
 * Usage: node scripts/test-oauth.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testOAuth() {
  console.log('\n🔐 OAuth 2.0 Test Script\n');
  console.log('This script will help you test your OAuth implementation.\n');

  const baseUrl = await question('Enter your base URL (e.g., http://localhost:3000): ');
  const clientId = await question('Enter your Client ID: ');
  const clientSecret = await question('Enter your Client Secret: ');
  const redirectUri = await question('Enter your Redirect URI: ');

  console.log('\n📋 Test Steps:\n');
  
  console.log('1. Authorization URL:');
  const authUrl = `${baseUrl}/api/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read&state=test123`;
  console.log(`   ${authUrl}\n`);
  console.log('   Open this URL in your browser to authorize.\n');

  const code = await question('2. Enter the authorization code from the callback: ');

  console.log('\n3. Exchanging code for token...\n');

  try {
    const tokenResponse = await fetch(`${baseUrl}/api/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code.trim(),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('❌ Token exchange failed:', error);
      rl.close();
      return;
    }

    const tokens = await tokenResponse.json();
    console.log('✅ Token received successfully!\n');
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Expires In:', tokens.expires_in, 'seconds\n');

    console.log('4. Verifying access token...\n');

    const verifyResponse = await fetch(`${baseUrl}/api/oauth/verify`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json();
      console.error('❌ Token verification failed:', error);
      rl.close();
      return;
    }

    const userData = await verifyResponse.json();
    console.log('✅ Token verified successfully!\n');
    console.log('User Data:', JSON.stringify(userData, null, 2));

    console.log('\n5. Testing token refresh...\n');

    const refreshResponse = await fetch(`${baseUrl}/api/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token,
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    if (!refreshResponse.ok) {
      const error = await refreshResponse.json();
      console.error('❌ Token refresh failed:', error);
      rl.close();
      return;
    }

    const newTokens = await refreshResponse.json();
    console.log('✅ Token refreshed successfully!\n');
    console.log('New Access Token:', newTokens.access_token);
    console.log('New Refresh Token:', newTokens.refresh_token);

    console.log('\n🎉 All tests passed! Your OAuth implementation is working correctly.\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  rl.close();
}

testOAuth();
