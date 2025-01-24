import axios from 'axios';

interface B2CPayload {
  commandID: string; // e.g., 'SalaryPayment', 'BusinessPayment'
  amount: number;
  partyA: string; // ShortCode of the business
  partyB: string; // Phone number of the customer
  remarks: string;
  initiatorName: string;
  securityCredential: string;
  queueTimeOutURL: string;
  resultURL: string;
}

/**
 * Determines the correct base URL for the environment (sandbox or production).
 * @param isSandbox - Boolean indicating whether to use the sandbox environment.
 * @returns The base URL.
 */
const getBaseUrl = (isSandbox: boolean): string =>
  isSandbox
    ? 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest'
    : 'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest';

/**
 * Initiates a B2C transaction with the Safaricom API.
 * @param token - The OAuth access token.
 * @param isSandbox - Boolean indicating the environment to use (sandbox or production).
 * @param payload - The payload containing transaction details.
 * @returns Response data from the B2C transaction request.
 */
export default async function b2c(
  token: string,
  isSandbox: boolean,
  payload: B2CPayload
): Promise<any> {
  const baseUrl = getBaseUrl(isSandbox);

  const requestBody = {
    InitiatorName: payload.initiatorName,
    SecurityCredential: payload.securityCredential,
    CommandID: payload.commandID,
    Amount: payload.amount,
    PartyA: payload.partyA,
    PartyB: payload.partyB,
    Remarks: payload.remarks,
    QueueTimeOutURL: payload.queueTimeOutURL,
    ResultURL: payload.resultURL,
  };

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.post(baseUrl, requestBody, { headers });
    return response.data;
  } catch (error: any) {
    console.error('Error processing B2C transaction:', error.message);
    throw error;
  }
}
