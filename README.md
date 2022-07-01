# Verify Identity
An experiement to verify a user's address and twitter account are linked without storing any user data.

Use at your own risk. I cannot guarantee anonyminity.

## Prerequisites
- Arweave public and private keys
- Twitter Developer API access

To install:
```bash
yarn add verify-web3-identity
```
or
```bash
npm install verify-web3-identity
```

Get started:
```ts
const twitterConfig = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  bearer_token: process.env.BEARER_TOKEN,
}

const adminAddress = process.env.ARWEAVE_ADDRESS;
const arweaveKeyfile = process.env.ARWEAVE_KEY;

const client = new VerifyIdentityClient(twitterConfig, adminAddress, arweaveKeyfile);
```

### Customize Options
```ts
const options = {
  projectName: 'verify_identity', // used for arweave document naming
  twitterMessage: 'I am verifying my Twitter' // used for verifying tweets
}
```
