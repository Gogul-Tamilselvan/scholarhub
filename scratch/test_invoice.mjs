import fetch from 'node-fetch';

const MAIL_SERVER_URL = "https://scholar-hub-server-seven.vercel.app";
const MAIL_API_KEY = "scholar_india_mail_secret_2026";

async function sendTestInvoice() {
  try {
    console.log('Sending test invoice to gogultamilselvan@gmail.com...');
    const res = await fetch(`${MAIL_SERVER_URL}/send/payment-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MAIL_API_KEY
      },
      body: JSON.stringify({
        name: 'Gogul Tamilselvan',
        email: 'gogultamilselvan@gmail.com',
        manuscriptId: 'MAN-TEST-123',
        title: 'Evaluating the Test Invoice Logo Integration',
        amount: '1500',
        paymentMode: 'UPI / Online Transfer',
        transactionRef: 'TXN-987654321',
        paymentDate: new Date().toLocaleDateString('en-GB'),
        invoiceNo: 'INV-TEST-001'
      })
    });
    
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

sendTestInvoice();
