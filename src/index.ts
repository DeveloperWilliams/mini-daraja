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
/*
 *Module to Simplfy Mpesa Integration
 */
class Mpesa {
  private token: string | null = null;

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
  }

  async authenticate(): Promise<string> {
    if (this.token) return this.token;
    this.token = await authenticate(
      this.options.consumerKey,
      this.options.consumerSecret
    );
    return this.token;
  }

  /*
   * Function for Stkpush Initializatio
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
    });
  }

  /*
   * Function for bussiness to client
   */
  async b2c({
    phoneNumber,
    amount,
  }: {
    phoneNumber: string;
    amount: number;
  }): Promise<any> {
    await this.ensureToken();
    return b2c(this.token!, {
      commandID: 'BusinessPayment', // Default value
      amount,
      partyA: this.options.shortCode, // Automatically added
      partyB: phoneNumber, // Attached internally
      remarks: 'Salary Payment', // Default value
      initiatorName: this.options.initiatorName!,
      securityCredential: this.options.securityCredential!,
      queueTimeOutURL: this.options.queueTimeOutURL!,
      resultURL: this.options.resultURL!,
    });
  }

  /*
   * Function for client to  bussiness
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
    return c2b(this.token!, {
      shortCode: this.options.shortCode,
      commandID: 'CustomerPayBillOnline', // Default value
      amount,
      msisdn: phoneNumber, // Properly mapped here
      billRefNumber,
      passKey: this.options.passKey,
    });
  }
  
  

  /*
   * Function for reversal back to client
   */
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

  /*
   * Function for account Balance check
   */
  async accountBalance(): Promise<any> {
    await this.ensureToken();
    return accountBalance(this.token!, {
      commandID: 'AccountBalance', // Default value
      partyA: this.options.shortCode, // Automatically added
      remarks: 'Balance Inquiry', // Default value
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
