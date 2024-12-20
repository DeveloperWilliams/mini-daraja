import apiClient from '../utils/apiClient.js';


interface B2CPayload {
  initiatorName: string;
  securityCredential: string;
  commandID: string; // e.g., 'SalaryPayment', 'BusinessPayment'
  amount: number;
  partyA: string; // ShortCode of the business
  partyB: string; // Phone number of the customer
  remarks: string;
  queueTimeOutURL: string;
  resultURL: string;
}

export default async function b2c(
  token: string,
  payload: B2CPayload
): Promise<any> {
  const headers = { Authorization: `Bearer ${token}` };
  const response = await apiClient.post('/mpesa/b2c/v1/paymentrequest', payload, { headers });
  return response.data;
}
