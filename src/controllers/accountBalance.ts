import apiClient from '../utils/apiClient.js';

interface AccountBalancePayload {
  initiatorName: string;
  securityCredential: string;
  commandID: string; // 'AccountBalance'
  partyA: string; // ShortCode of the business
  remarks: string;
  queueTimeOutURL: string;
  resultURL: string;
}

export default async function accountBalance(
  token: string,
  payload: AccountBalancePayload
): Promise<any> {
  const headers = { Authorization: `Bearer ${token}` };
  const response = await apiClient.post('/mpesa/accountbalance/v1/query', payload, { headers });
  return response.data;
}
