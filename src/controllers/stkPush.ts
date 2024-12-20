import apiClient from '../utils/apiClient.js';

interface StkPushPayload {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDescription: string; // Added this field
  shortCode: string;
  passKey: string;
  callbackUrl: string;
}

export default async function stkPush(
  token: string,
  { phoneNumber, amount, accountReference, transactionDescription, shortCode, passKey, callbackUrl }: StkPushPayload
): Promise<any> {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: shortCode,
    PhoneNumber: phoneNumber,
    CallBackURL: callbackUrl,
    AccountReference: accountReference,
    TransactionDesc: transactionDescription, // Use the transactionDescription field
  };

  const headers = { Authorization: `Bearer ${token}` };

  const response = await apiClient.post('/mpesa/stkpush/v1/processrequest', payload, { headers });
  return response.data;
}
