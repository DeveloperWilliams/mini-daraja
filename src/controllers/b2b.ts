// B2B Initiator Controller

import axios from 'axios';

interface B2BPayLoad {
  initiatorName: string;
  securityCredential: string;
  commandID: string;
  senderIdentifierType: string;
  recieverIdentifierType: string;
  amount: number;
  partyA: string;
  partyB: string;
  accountReference: string;
  requester: string;
  remarks: string;
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
    ? 'https://sandbox.safaricom.co.ke/mpesa/b2b/v1/paymentrequest'
    : 'https://api.safaricom.co.ke/mpesa/b2b/v1/paymentrequest';

/**
 * Initiates a B2B transaction with the Safaricom API.
 * @param token - The OAuth access token.
 * @param isSandbox - Boolean indicating the environment to use (sandbox or production).
 * @param payload - The payload containing transaction details.
 * @returns Response data from the B2B transaction request.
 * @throws An error if the request fails.
 * */

export default async function b2b (
  token: string,
  isSandbox: boolean,
  payload: B2BPayLoad
): Promise<any> {
  const baseUrl = getBaseUrl(isSandbox);

  const requestBody = {
    Initiator: payload.initiatorName,
    SecurityCredential: payload.securityCredential,
    CommandID: payload.commandID,
    SenderIdentifierType: payload.senderIdentifierType,
    RecieverIdentifierType: payload.recieverIdentifierType,
    Amount: payload.amount,
    PartyA: payload.partyA,
    PartyB: payload.partyB,
    AccountReference: payload.accountReference,
    Remarks: payload.remarks,
    QueueTimeOutURL: payload.queueTimeOutURL,
    ResultURL: payload.resultURL,
  };

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.post(baseUrl, requestBody, { headers });
    return response.data;
  } catch (error: any) {
    console.error('Error processing B2B transaction:', error.message);
    throw error;
  }
}
