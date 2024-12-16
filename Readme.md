
# Mini Daraja

Mini-Daraja is the most popular and widely used Node.js library for seamless integration with the Safaricom Daraja API. It simplifies handling M-Pesa operations like STK Push, B2C, C2B, transaction status, and balance inquiries, with modern ES6 module support and robust error handling.

# Installation

To install the module, run:

```bash
npm install mini-daraja
```

# Usage

Usage example for STK push:

```javascript
import Daraja from 'mini-daraja';

const daraja = new Daraja({
    consumerKey: 'yourKey',
    consumerSecret: 'yourSecret',
    shortCode: '174379',
    passKey: 'your_pass_key_here',
    callbackUrl: 'https://example.com/callback',
});

(async () => {
    const response = await daraja.stkPushRequest({
        phoneNumber: '254700000000',
        amount: 100,
        accountReference: 'TestPayment',
    });
    console.log(response);
})();
```

# Contact

Feel free to contact me via:

- Email: [archywilliams2@gmail.com](mailto:archywilliams2@gmail.com)
- X: [@yourhandle](https://x.com/dev_williee)
- LinkedIn: [William Achuchi Wanyama](https://linkedin.com/in/achuchi)