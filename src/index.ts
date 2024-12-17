import stkPush from './stkPush.js';
import { authenticate } from './utils/auth.js';

export interface MpesaOptions {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passKey: string;
  callbackUrl: string;
}

export interface StkPushRequestOptions {
  phoneNumber: string;
  amount: number;
  accountReference: string;
}

class Mpesa {
  private token: string | null = null;

  constructor(private options: MpesaOptions) {
    if (!options.consumerKey || !options.consumerSecret || !options.shortCode || !options.passKey || !options.callbackUrl) {
      throw new Error('Missing required Mpesa credentials during initialization');
    }
  }

  async authenticate(): Promise<string> {
    console.log('Authenticating with consumerKey and consumerSecret...');
    try {
      this.token = await authenticate(this.options.consumerKey, this.options.consumerSecret);
      if (!this.token) {
        throw new Error('Authentication failed, received null token');
      }
      console.log('Authentication successful');
      return this.token;
    } catch (error) {
      console.error('Error during authentication:', (error as Error).message);
      throw error;
    }
  }

  async stkPush(options: StkPushRequestOptions): Promise<any> {
    this.validateStkPushOptions(options);

    if (!this.token) {
      console.log('Token missing, attempting to authenticate...');
      await this.authenticate();
    }

    try {
      console.log('Sending STK Push request...');
      const response = await stkPush(this.token as string, {
        ...options,
        shortCode: this.options.shortCode,
        passKey: this.options.passKey,
        callbackUrl: this.options.callbackUrl,
      });
      console.log('STK Push request sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Error during STK Push request:', (error as Error).message);
      throw error;
    }
  }

  private validateStkPushOptions(options: StkPushRequestOptions): void {
    const missingFields = [];
    if (!options.phoneNumber) missingFields.push('phoneNumber');
    if (!options.amount) missingFields.push('amount');
    if (!options.accountReference) missingFields.push('accountReference');

    if (missingFields.length) {
      throw new Error(`Missing required fields in StkPushRequestOptions: ${missingFields.join(', ')}`);
    }
  }
}

// Factory function to avoid `new` keyword
function createMpesa(options: MpesaOptions): Mpesa {
  return new Mpesa(options);
}

export default createMpesa;
