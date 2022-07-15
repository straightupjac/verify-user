declare module "verify-user" {
  type ArweaveClient = import("ar-wrapper").ArweaveClient;
  type TwitterClient = import('twitter-api-v2').TwitterApi;

  enum Status {
    Success = "Success",
    Error = "Error"
  }

  export interface IOptions {
    projectName: string
    twitterMessage: string
  }

  export interface ITwitterConfig {
    bearer_token: string;
  }

  // return type for storeSignature and getUser
  export interface IReturn {
    status: Status;
    msg: string;
    username?: string
  }

  // return type for createTwitterVerificationHash
  export interface ITwitterVerificationReturn {
    status: Status;
    msg: string;
    hash: string;
  }

  // return type for verifyTwitter
  export interface IVerifyTwitterReturn {
    status: Status;
    msg: string;
    data: string;
  }

  export interface IGenerateMessageReturn {
    status: Status;
    msg: string;
    messageToSign?: string
  }

  export class VerifyUserClient {
    // underlying twitter client
    twitterClient: TwitterClient;
    // underlying ar-wrapper client
    arweaveClient: ArweaveClient
    // custom options
    options: IOptions

    // Construct a new client given Twitter Developer API config and arweave account data
    constructor(twitterConfig: ITwitterConfig, adminAddress: string, arweaveKeyfile: string, options?: IOptions)

    // create a signature to use for Twitter verification
    // optional usage - can generate client side as well
    createTwitterVerificationHash(signature: string): ITwitterVerificationReturn

    // twitter handle and signature required
    // optional: name, to display
    verifyTwitter(handle: string, verificationHash: string): Promise<IVerifyTwitterReturn>

    // store encrypted signedMessage and name on Arweave
    storeSignature(signedMessage: string, username: string): Promise<IReturn>

    // get user from Arweave with signed message
    getUser(signedMessage: string): Promise<IReturn>

    // generate a message to sign
    // optionally generated on client-side
    generateMessageToSign(handle: string, messageTemplate?: string): Promise<IGenerateMessageReturn>
  }
}