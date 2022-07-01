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

    // get salt associated with an address, create a new one if one does not exist
    getSalt(address: string): Promise<IReturn>

    // create a signature to use for Twitter verification
    createTwitterSignature(twitterHandle: string, address: string): string

    // store signature and name on Arweave
    storeSignature(signature: string, name?: string): Promise<IReturn>

    // get signature from Arweave
    getSignature(signature: string, name?: string): Promise<IReturn>

    // twitter handle and account address required
    // optional: name, to display
    verifyTwitter(twitterHandle: string, address: string, name?: string): Promise<IReturn>
  }
}