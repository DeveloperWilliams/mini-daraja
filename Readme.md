
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

# Installation

To install, run:

```bash
npm install mini-daraja
```

# Usage

## STK Push

Usage example for STK push:

```javascript
import mpesa from 'mini-daraja';

const mpesa = mpesa({
    consumerKey: 'yourKey',
    consumerSecret: 'yourSecret',
    shortCode: '174379',
    passKey: 'your_pass_key_here',
    callbackUrl: 'https://example.com/callback',
});

async function stkPush() {
  try {
    console.log('Initiating STK Push...');
    const response = await credentials.stkPush({
      phoneNumber: '254708966189',
      amount: 1,
      accountReference: 'test',
      transactionDescription: 'test',
    });
    console.log(response);
  } catch (error) {
    console.error('STK Push Error:', error.message);
  }
}
```

# Contact

Feel free to contact me via:

- Email: [archywilliams2@gmail.com](mailto:archywilliams2@gmail.com)
- X: [@yourhandle](https://x.com/dev_williee)
- LinkedIn: [William Achuchi Wanyama](https://linkedin.com/in/achuchi)

#