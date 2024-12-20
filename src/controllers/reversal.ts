import apiClient from '../utils/apiClient.js';

interface ReversalPayload {
  initiatorName: string;
  securityCredential: string;
  commandID: string; // 'TransactionReversal'
  transactionID: string;
  amount: number;
  receiverParty: string;
  remarks: string;
  queueTimeOutURL: string;
  resultURL: string;
}

export default async function reversal(
  token: string,
  payload: ReversalPayload
): Promise<any> {
  const headers = { Authorization: `Bearer ${token}` };
  const response = await apiClient.post('/mpesa/reversal/v1/request', payload, { headers });
  return response.data;
}
