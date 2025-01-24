import apiClient from '../utils/apiClient.js';

interface StkPushPayload {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDescription: string;
  shortCode: string;
  passKey: string;
  callbackUrl: string;
  isSandbox: boolean; // Added flag to determine environment
}

export default async function stkPush(
  token: string,
  {
    phoneNumber,
    amount,
    accountReference,
    transactionDescription,
    shortCode,
    passKey,
    callbackUrl,
    isSandbox, // Accept the environment flag
  }: StkPushPayload
): Promise<any> {
  const baseUrl = isSandbox
    ? 'https://sandbox.safaricom.co.ke'
    : 'https://api.safaricom.co.ke';

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
    TransactionDesc: transactionDescription,
  };

  const headers = { Authorization: `Bearer ${token}` };

  const response = await apiClient.post(
    `${baseUrl}/mpesa/stkpush/v1/processrequest`, // Use the dynamic base URL
    payload,
    { headers }
  );

  return response.data;
}
