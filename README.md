# Verify User
An experiment to verify a user's crypto address and twitter account are linked without storing any user data using [ZK-proofs](https://en.wikipedia.org/wiki/Zero-knowledge_proof). No identifiable data will be stored. All hashes are stored publicly on Arweave.

Use at your own risk. Suggestions welcomed :)

Demo here: [verify-user-web3.vercel.app](https://verify-user-web3.vercel.app/)

## Prerequisites
- Arweave public and private keys
- Twitter Developer API access

To install:
```bash
yarn add verify-user
```
or
```bash
npm install verify-user
```

Get started:
```ts
const twitterConfig = {
  bearer_token: process.env.BEARER_TOKEN,
}

const adminAddress = process.env.ARWEAVE_ADDRESS;
const arweaveKeyfile = process.env.ARWEAVE_KEY;

const client = new VerifyUserClient(twitterConfig, adminAddress, arweaveKeyfile);
```

### Customize Options
```ts
const options = {
  projectName: 'verify_user', // used for arweave document naming
  twitterMessage: 'I am verifying my Twitter' // used for verifying tweets
}
```

## Dependencies
- [`ar-wrapper`](https://github.com/verses-xyz/ar-wrapper)
- [`twitter-api-v2`](https://github.com/plhery/node-twitter-api-v2)
- [`@ethersproject`](https://github.com/ethers-io/ethers.js)
