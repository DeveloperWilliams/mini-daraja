# **Mini-Daraja**
**Seamless M-Pesa Integration for Node.js**

Mini-Daraja is the most popular and widely used Node.js library for seamless integration with the Safaricom Daraja API. It simplifies handling M-Pesa operations like STK Push, B2C, C2B, transaction status, and balance inquiries, with modern ES6 module support and robust error handling.

---

## **Features**
- 🚀 Simple and clean API to integrate M-Pesa operations
- 🔒 Modern ES6+ module support
- ⚙️ Handles STK Push, B2C, C2B, Transaction Status, and Balance Inquiries
- 🛡️ Robust error handling with clear error messages  

---

## Installation

To install, run:

```bash
npm install mini-daraja
```

---

## Usage

Usage example for STK push:

```javascript
import mpesa from 'mini-daraja';

// Initialize Daraja API instance with credentials
const daraja = mpesa({
  consumerKey: 'your_consumer_key',        // Replace with your Consumer Key
  consumerSecret: 'your_consumer_secret',  // Replace with your Consumer Secret
  shortCode: '174379',                     // Replace with your M-Pesa Shortcode
  passKey: 'your_pass_key_here',           // Replace with your PassKey
  callbackUrl: 'https://example.com/callback', // Replace with your Callback URL
});

// Function to perform STK Push
async function stkPush() {
  try {
    console.log('🔄 Initiating STK Push...');

    const response = await daraja.stkPush({
      phoneNumber: '254708966189',           // Customer's phone number (E.164 format)
      amount: 100,                          // Transaction amount
      accountReference: 'Invoice123',        // Custom account reference
      transactionDescription: 'Test Payment', // Transaction description
    });

    console.log('✅ STK Push Response:', response);
  } catch (error) {
    console.error('❌ STK Push Error:', error.message);
  }
}

stkPush();

```

---

## Contact

Designed by *William Achuchi Wanyama*
            - Email: [archywilliams2@gmail.com](mailto:archywilliams2@gmail.com)
            - X: [@dev_williee](https://x.com/dev_williee)
            - LinkedIn: [William Achuchi Wanyama](https://linkedin.com/in/achuchi)


            