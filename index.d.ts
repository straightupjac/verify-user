declare module "verify-user" {
  type ArweaveClient = import("ar-wrapper").ArweaveClient;
  type Twitter = import('twitter');

  export interface IOptions {
    projectName: string
    twitterMessage: string
  }

  export interface ITwitterConfig {
    consumerKey: string;
    consumer_secret: string;
    bearer_token: string;
  }

  // return type for storeSignature and getUser
  export interface IReturn {
    msg: string;
    username?: string
  }

  // return type for createTwitterVerificationHash
  export interface ITwitterVerificationReturn {
    msg: string;
    hash: string;
  }

  // return type for isVerifiedTwitter

  export interface IIsVerifiedTwitterReturn {
    msg: string;
    hash?: string;
  }

  // return type for verifyTwitter
  export interface IVerifyTwitterReturn {
    msg: string;
    data: string;
  }

  export class VerifyUserClient {
    // underlying twitter client
    twitterClient: Twitter;
    // underlying ar-wrapper client
    arweaveClient: ArweaveClient
    // custom options
    options: IOptions

    // Construct a new client given Twitter Developer API config and arweave account data
    constructor(twitterConfig: ITwitterConfig, adminAddress: string, arweaveKeyfile: string, options?: IOptions)

    // create a signature to use for Twitter verification
    // optional usage - can generate client side as well
    createTwitterVerificationHash(handle: string, address: string): ITwitterVerificationReturn

    // twitter handle and signature required
    // optional: name, to display
    verifyTwitter(handle: string, verificationHash: string): Promise<IVerifyTwitterReturn>

    // check if given handle has been previously verified
    isVerifiedTwitter(handle: string): Promise<IIsVerifiedTwitterReturn>

    // store encrypted signedMessage and name on Arweave
    storeSignature(signedMessage: string, username: string): Promise<IReturn>

    // get user from Arweave with signed message
    getUser(signedMessage: string): Promise<IReturn>
  }
}