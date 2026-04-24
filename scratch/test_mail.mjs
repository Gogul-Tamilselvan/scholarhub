import fetch from 'node-fetch';

const MAIL_SERVER_URL = "https://scholar-hub-server-seven.vercel.app";
const MAIL_API_KEY = "scholar_india_mail_secret_2026";

async function testMail(endpoint, payload) {
  try {
    console.log(`Testing endpoint: ${endpoint} with status: ${payload.status}`);
    const res = await fetch(`${MAIL_SERVER_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MAIL_API_KEY
      },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);
    console.log('-----------------------------------');
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

async function run() {
  await testMail('/send/status-update', {
    name: 'Test Author',
    email: 'test@example.com',
    status: 'accepted',
    details: {
      mID: 'MAN123',
      mTitle: 'Test Title',
      journal: 'SJCM',
      doi: 'Pending',
      reason: ''
    }
  });
}

run();
