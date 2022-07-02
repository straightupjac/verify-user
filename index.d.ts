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

  export interface IReturn {
    msg: string;
    salt?: string;
    signature?: string;
    name?: string
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
    createTwitterVerification(handle: string, address: string): string

    // get salt associated with a hashedAddress (keccak256 with 0x prefix), create a new one if one does not exist
    getSalt(hashedAddress: string): Promise<IReturn>

    // store encrypted signedMessage and name on Arweave
    storeSignature(signedMessage: string, username: string): Promise<IReturn>

    // get user from Arweave with signed message
    getUser(signedMessage: string): Promise<IReturn>

    // twitter handle and signature required
    // optional: name, to display
    verifyTwitter(twitterHandle: string, signature: string, name?: string): Promise<IReturn>

    isVerifiedTwitter(handle: string): Promise<IReturn>
  }
}