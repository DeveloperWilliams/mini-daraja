import axios from 'axios';

interface c2bPayload {
  shortCode: string;
  commandID: string;
  amount: number;
  msisdn: string;
  billRefNumber: string;
  passKey: string;
}

const SANDBOX_ENDPOINT = '/mpesa/c2b/v1/simulate';
const PRODUCTION_ENDPOINT = '/mpesa/c2b/v1/';

/**
 * Determines the correct base URL for the environment (sandbox or production).
 * @param isSandbox - Boolean indicating whether to use sandbox environment.
 * @returns The base URL.
 */
const getBaseUrl = (isSandbox: boolean): string =>
  isSandbox ? 'https://sandbox.safaricom.co.ke' : 'https://api.safaricom.co.ke';


/**
 * Initiates a C2B transaction with Safaricom API.
 * @param token - The OAuth access token.
 * @param isSandbox - Boolean indicating the environment to use (sandbox or production).
 * @param payload - The payload containing transaction details.
 * @returns Response data from the C2B simulation request.
 */
export default async function c2b(
  token: string,
  isSandbox: boolean,
  { shortCode, commandID, amount, msisdn, billRefNumber, passKey }: c2bPayload
): Promise<any> {
  const baseUrl = getBaseUrl(isSandbox);
  const endpoint = isSandbox ? SANDBOX_ENDPOINT : PRODUCTION_ENDPOINT;
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);

  const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString(
    'base64'
  );

  const requestBody = {
    ShortCode: shortCode,
    CommandID: commandID,
    Amount: amount,
    Msisdn: msisdn,
    BillRefNumber: billRefNumber,
    Timestamp: timestamp,
    Password: password,
  };

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.post(`${baseUrl}${endpoint}`, requestBody, {
      headers,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error processing C2B transaction:', error.message);
    throw error;
  }
}
