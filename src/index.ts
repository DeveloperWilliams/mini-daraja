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

/**
 * Initiates a Business-to-Business (B2B) transaction.
 * @param amount - The amount to send.
 * @param partyB - The phone number of the recipient.
 * @param accountReference - The reference number for the transaction.
 * @param requester - The Phone number of the sender requesting the transaction.
 */
async b2b ({
  amount,
  partyB,
  accountReference,
  requester,
}: {
  amount: number;
  partyB: string;
  accountReference: string;
  requester: string;
}): Promise<any> {
  await this.ensureToken();
  return b2b(this.token!, this.baseUrl.includes('sandbox'), {
    initiatorName: this.options.initiatorName!,
    securityCredential: this.options.securityCredential!,
    commandID: 'BusinessPayBill',
    senderIdentifierType: '4',
    recieverIdentifierType: '4',
    amount,
    partyA: this.options.shortCode,
    partyB,
    accountReference,
    requester,
    remarks: 'Business Payment',
    queueTimeOutURL: this.options.queueTimeOutURL!,
    resultURL: this.options.resultURL!,
  });
}



  /**
   * Initiates a account balance request.
   * @returns The response from the account balance request.
   * @throws An error if the request fails.
   */
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

  /**
   * Initiates Business-to-Business (B2B) transaction.
   * @param amount - The amount to send.
   * @param partyB - The phone number of the recipient.
   * @param accountReference - The reference number for the transaction.
   */
 

  /**
   * Initiates a reversal request.
   * @param transactionID - The transaction ID to reverse.
   * @param amount - The amount to reverse.
   * @param receiverParty - The recipient of the reversed funds.
   * @param receiverIdentifierType - The type of identifier for the receiver.Default value is 11 (MSISDN). Use 4 for short code.
   * @throws An error if the request fails.
   */

  async reversal({
    transactionID,
    amount,
    receiverParty,
  }: {
    transactionID: string;
    amount: number;
    receiverParty: string;
  }): Promise<any> {
    await this.ensureToken();
    return reversal(this.token!, this.baseUrl.includes('sandbox'), {
      initiatorName: this.options.initiatorName!,
      securityCredential: this.options.securityCredential!,
      commandID: 'TransactionReversal',
      transactionID,
      amount,
      receiverParty,
      recieverIdentifierType: '11',
      resultURL: this.options.resultURL!,
      queueTimeOutURL: this.options.queueTimeOutURL!,
      remarks: 'Reversal',
      ocassion: 'Reversal',
    });
  }

  private async ensureToken(): Promise<void> {
    if (!this.token) {
      await this.authenticate();
    }
  }
}

/**
 * Creates an instance of the Mpesa class.
 * @param options - The Mpesa configuration options.
 * @returns An instance of the Mpesa class.
 */

export default function createMpesa(options: MpesaOptions): Mpesa {
  return new Mpesa(options);
}
