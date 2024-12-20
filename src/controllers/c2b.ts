// File: services/safaricomC2BService.ts
import axios from 'axios';
import apiClient from '../utils/apiClient.js';

const BASE_URL = 'https://sandbox.safaricom.co.ke'; // Use production URL when deploying
const RESULT_URL = 'https://bde2-2c0f-fe38-2018-1508-d826-f787-89fe-fc06.ngrok-free.app/confirmation'; // Replace with your confirmation URL
const QUEUE_TIMEOUT_URL = 'https://bde2-2c0f-fe38-2018-1508-d826-f787-89fe-fc06.ngrok-free.app/validation'; // Replace with your validation URL

// Payload interface for C2B transactions
interface c2bPayload {
  shortCode: string;
  commandID: string;
  amount: number;
  msisdn: string;
  billRefNumber: string;
  passKey: string;
}

/**
 * Registers the C2B URL with Safaricom API.
 * @param accessToken - The OAuth access token.
 * @param shortCode - The short code to register.
 * @returns Response data from the registration request.
 */
export const registerC2BUrl = async (
  accessToken: string,
  shortCode: string
): Promise<any> => {
  const requestBody = {
    ShortCode: shortCode,
    ResponseType: 'Completed',
    ConfirmationURL: RESULT_URL,
    ValidationURL: QUEUE_TIMEOUT_URL,
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/mpesa/c2b/v1/registerurl`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error registering C2B URL:', error.message);
    throw error;
  }
};

/**
 * Initiates a C2B transaction.
 * @param token - The OAuth access token.
 * @param payload - The payload containing transaction details.
 * @returns Response data from the C2B simulation request.
 */
export default async function c2b(
  token: string,
  { shortCode, commandID, amount, msisdn, billRefNumber, passKey }: c2bPayload
): Promise<any> {
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
    const response = await apiClient.post(
      '/mpesa/c2b/v1/simulate',
      requestBody,
      {
        headers,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error processing C2B transaction:', error.message);
    throw error;
  }
};
