import apiClient from './apiClient.js';

export async function authenticate(consumerKey: string, consumerSecret: string): Promise<string> {
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const headers = { Authorization: `Basic ${credentials}` };

  const response = await apiClient.get('/oauth/v1/generate?grant_type=client_credentials', { headers });
  return response.data.access_token;
}
