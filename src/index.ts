import stkPush from './controllers/stkPush.js';
import b2c from './controllers/b2c.js';
import c2b from './controllers/c2b.js';
import reversal from './controllers/reversal.js';
import accountBalance from './controllers/accountBalance.js';
import b2b from './controllers/b2b.js';
import { authenticate } from './utils/auth.js';

export interface MpesaOptions {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passKey: string;
  callbackUrl: string;
  initiatorName?: string;
  securityCredential?: string;
  queueTimeOutURL?: string;
  resultURL?: string;
}

/**
 * This module provides a simple interface for interacting with the Safaricom M-Pesa API.
 */
class Mpesa {
  private token: string | null = null;
  private baseUrl: string;
  private currentEnvironment: 'Production' | 'Sandbox';
  private logTimer: NodeJS.Timeout | null = null;

  constructor(private options: MpesaOptions) {
    const requiredFields = [
      'consumerKey',
      'consumerSecret',
      'shortCode',
      'passKey',
      'callbackUrl',
    ];
    const missingFields = requiredFields.filter(
      (field) => !this.options[field as keyof MpesaOptions]
    );
    if (missingFields.length) {
      throw new Error(
        `Missing required Mpesa credentials: ${missingFields.join(', ')}`
      );
    }

    // Default environment is Production, but defer logging.
    this.baseUrl = 'https://api.safaricom.co.ke';
    this.currentEnvironment = 'Production';

    // Log environment only if it hasn't been switched within 100ms.
    this.logTimer = setTimeout(() => {
      if (this.currentEnvironment === 'Production') {
        console.info(
          `Daraja Environment set to Production. Call .sandbox() to switch.`
        );
      }
    }, 100);
  }

  /**
   * Switch to Sandbox environment
   */
  sandbox(): void {
    if (this.logTimer) clearTimeout(this.logTimer); // Cancel the deferred Production log
    this.baseUrl = 'https://sandbox.safaricom.co.ke';
    this.logEnvironmentChange('Sandbox');
  }

  /**
   * Switch to Production environment
   */
  production(): void {
    if (this.logTimer) clearTimeout(this.logTimer); // Cancel the deferred Production log
    this.baseUrl = 'https://api.safaricom.co.ke';
    this.logEnvironmentChange('Production'); // Always log when called
  }

  /**
   * Logs environment changes only when the function is explicitly called.
   */
  private logEnvironmentChange(newEnvironment: 'Production' | 'Sandbox'): void {
    if (this.currentEnvironment !== newEnvironment) {
      this.currentEnvironment = newEnvironment;
      console.info(`Daraja Environment set to ${newEnvironment}.`);
    } else {
      // Log explicitly if already set to the requested environment
      console.info(`Daraja Environment is already set to ${newEnvironment}.`);
    }
  }

  async authenticate(): Promise<string> {
    if (this.token) return this.token;
    this.token = await authenticate(
      this.options.consumerKey,
      this.options.consumerSecret
    );
    return this.token;
  }

  /**
   * Initiates a Lipa Na M-Pesa (STK Push) transaction.
   * @param phoneNumber - The phone number of the customer.
   * @param amount - The amount to send.
   * @returns The response from the STK Push transaction request.
   * @throws An error if the request fails.
   */
  async stkPush({
    phoneNumber,
    amount,
  }: {
    phoneNumber: string;
    amount: number;
  }): Promise<any> {
    await this.ensureToken();
    return stkPush(this.token!, {
      phoneNumber,
      amount,
      accountReference: 'TestRef', // Default value
      transactionDescription: 'Test Payment', // Default value
      shortCode: this.options.shortCode,
      passKey: this.options.passKey,
      callbackUrl: this.options.callbackUrl,
      isSandbox: this.baseUrl === 'https://sandbox.safaricom.co.ke', // Determine environment dynamically
    });
  }

  /**
   * Initiates a Business-to-Customer (B2C) transaction.
   * @param phoneNumber - The phone number of the recipient.
   * @param amount - The amount to send.
   * @returns The response from the B2C transaction request.
   * @throws An error if the request fails.
   */
  async b2c({
    phoneNumber,
    amount,
  }: {
    phoneNumber: string;
    amount: number;
  }): Promise<any> {
    await this.ensureToken();
    return b2c(this.token!, this.baseUrl.includes('sandbox'), {
      commandID: 'BusinessPayment',
      amount,
      partyA: this.options.shortCode,
      partyB: phoneNumber,
      remarks: 'Salary Payment',
      initiatorName: this.options.initiatorName!,
      securityCredential: this.options.securityCredential!,
      queueTimeOutURL: this.options.queueTimeOutURL!,
      resultURL: this.options.resultURL!,
    });
  }

  /**
   * Initiates a Client-to-Business (C2B) transaction.
   * @param phoneNumber - The phone number of the customer.
   * @param amount - The amount to send.
   * @param billRefNumber - The reference number for the bill.
   * @returns The response from the C2B transaction request.
   * @throws An error if the request fails.
   */
  async c2b({
    phoneNumber,
    amount,
    billRefNumber,
  }: {
    phoneNumber: string;
    amount: number;
    billRefNumber: string;
  }): Promise<any> {
    await this.ensureToken();
    return c2b(this.token!, this.baseUrl.includes('sandbox'), {
      shortCode: this.options.shortCode,
      commandID: 'CustomerPayBillOnline', // Default value
      amount,
      msisdn: phoneNumber, // Properly mapped here
      billRefNumber,
      passKey: this.options.passKey,
    });
  }

  async reversal({
    phoneNumber,
    amount,
    transactionID,
  }: {
    phoneNumber: string;
    amount: number;
    transactionID: string;
  }): Promise<any> {
    await this.ensureToken();
    return reversal(this.token!, {
      commandID: 'TransactionReversal', // Default value
      transactionID,
      amount,
      receiverParty: phoneNumber, // Attached internally as receiverParty
      remarks: 'Reversal Test', // Default value
      initiatorName: this.options.initiatorName!,
      securityCredential: this.options.securityCredential!,
      queueTimeOutURL: this.options.queueTimeOutURL!,
      resultURL: this.options.resultURL!,
    });
  }

  async accountBalance(): Promise<any> {
    await this.ensureToken();
    return accountBalance(this.token!, this.baseUrl.includes('sandbox'), {
      commandID: 'AccountBalance',
      partyA: this.options.shortCode,
      identifierType: '4',
      remarks: 'Balance Inquiry',
      initiatorName: this.options.initiatorName!,
      securityCredential: this.options.securityCredential!,
      queueTimeOutURL: this.options.queueTimeOutURL!,
      resultURL: this.options.resultURL!,
    });
  }
  

  async b2b({
    amount,
    partyB,
    accountReference,
  }: {
    amount: number;
    partyB: string;
    accountReference: string;
  }): Promise<any> {
    await this.ensureToken();
    return b2b(this.token!, {
      commandID: 'BusinessToBusinessTransfer', // Default value
      amount,
      partyA: this.options.shortCode, // Automatically added
      partyB,
      remarks: 'B2B Payment', // Default value
      accountReference,
      initiatorName: this.options.initiatorName!,
      securityCredential: this.options.securityCredential!,
      queueTimeOutURL: this.options.queueTimeOutURL!,
      resultURL: this.options.resultURL!,
    });
  }

  private async ensureToken(): Promise<void> {
    if (!this.token) {
      await this.authenticate();
    }
  }
}

export default function createMpesa(options: MpesaOptions): Mpesa {
  return new Mpesa(options);
}
