// Reversal Controller

import axios from 'axios';

interface ReversalPayLoad {
  initiatorName: string;
  securityCredential: string;
  commandID: string;
  transactionID: string;
  amount: number;
  receiverParty: string;
  recieverIdentifierType: string;
  resultURL: string;
  queueTimeOutURL: string;
  remarks: string;
  ocassion: string;
}

/**
 * Determines the correct base URL for the environment (sandbox or production).
 * @param isSandbox - Boolean indicating whether to use the sandbox environment.
 * @returns The base URL.
 */

const getBaseUrl = (isSandbox: boolean): string =>
  isSandbox
    ? 'https://sandbox.safaricom.co.ke/mpesa/reversal/v1/request'
    : 'https://api.safaricom.co.ke/mpesa/reversal/v1/request';

/**
 * Initiates a reversal request with the Safaricom API.
 * @param token - The OAuth access token.
 * @param isSandbox - Boolean indicating the environment to use (sandbox or production).
 * @param payload - The payload containing transaction details.
 * @returns Response data from the reversal request.
 * @throws An error if the request fails.
 * */

export default async function reversal(
  token: string,
  isSandbox: boolean,
  payload: ReversalPayLoad
): Promise<any> {
  const baseUrl = getBaseUrl(isSandbox);

  const requestBody = {
    Initiator: payload.initiatorName,
    SecurityCredential: payload.securityCredential,
    CommandID: payload.commandID,
    TransactionID: payload.transactionID,
    Amount: payload.amount,
    ReceiverParty: payload.receiverParty,
    RecieverIdentifierType: payload.recieverIdentifierType,
    ResultURL: payload.resultURL,
    QueueTimeOutURL: payload.queueTimeOutURL,
    Remarks: payload.remarks,
    Occasion: payload.ocassion,
  };

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.post(baseUrl, requestBody, { headers });
    return response.data;
  } catch (error: any) {
    console.error('Error processing reversal request:', error.message);
    throw error;
  }
}

