# Verify User
An experiement to verify a user's address and twitter account are linked without storing any user data.

Please don't take this too seriously and use at your own risk. I cannot guarantee anonyminity. Suggestions + PRs welcomed :)

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
- [`twitter`](https://github.com/desmondmorris/node-twitter)
- [`@ethersproject`](https://github.com/ethers-io/ethers.js)
