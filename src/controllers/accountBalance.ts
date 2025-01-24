// Account Balance Controller

import axios from 'axios';

interface AccountBalancePayload {
  commandID: string;
  partyA: string;
  identifierType: string;
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
    ? 'https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query'
    : 'https://api.safaricom.co.ke/mpesa/accountbalance/v1/query';

/**
 * Initiates an account balance request with the Safaricom API.
 * @param token - The OAuth access token.
 * @param isSandbox - Boolean indicating the environment to use (sandbox or production).
 * @param payload - The payload containing transaction details.
 * @returns Response data from the account balance request.
 * @throws An error if the request fails.
 */

export default async function accountBalance(
  token: string,
  isSandbox: boolean,
  payload: AccountBalancePayload
): Promise<any> {
  const baseUrl = getBaseUrl(isSandbox);

  const requestBody = {
    Initiator: payload.initiatorName,
    SecurityCredential: payload.securityCredential,
    CommandID: payload.commandID,
    PartyA: payload.partyA,
    IdentifierType: payload.identifierType,
    Remarks: payload.remarks,
    QueueTimeOutURL: payload.queueTimeOutURL,
    ResultURL: payload.resultURL,
  };

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.post(baseUrl, requestBody, { headers });
    return response.data;
  } catch (error: any) {
    console.error('Error processing account balance request:', error.message);
    throw error;
  }
}

