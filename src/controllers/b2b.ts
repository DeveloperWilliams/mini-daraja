import apiClient from '../utils/apiClient.js';

interface B2BPayload {
  initiatorName: string;
  securityCredential: string;
  commandID: string; // 'BusinessPayBill', 'BusinessToBusinessTransfer', etc.
  amount: number;
  partyA: string; // ShortCode of the sending business
  partyB: string; // ShortCode of the receiving business
  remarks: string;
  accountReference: string;
  queueTimeOutURL: string;
  resultURL: string;
}

export default async function b2b(
  token: string,
  payload: B2BPayload
): Promise<any> {
  const headers = { Authorization: `Bearer ${token}` };
  const response = await apiClient.post('/mpesa/b2b/v1/paymentrequest', payload, { headers });
  return response.data;
}
