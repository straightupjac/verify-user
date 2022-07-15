

import { VerifyUserClient } from 'verify-user';

if (!process.env.BEARER_TOKEN) {
  console.log("twitter config is required");
}

if (!process.env.ARWEAVE_ADDRESS || !process.env.ARWEAVE_KEY) {
  console.log("arweave config is required");
}

const adminAddress = process.env.ARWEAVE_ADDRESS || "";
const arweaveKey = process.env.ARWEAVE_KEY || "";

const TWEET_TEMPLATE = "I am verifying for verify-user. signature:"

const options = {
  twitterMessage: TWEET_TEMPLATE,
  projectName: 'verify_user_template'
}

const twitterConfig = {
  bearer_token: process.env.BEARER_TOKEN || "",
};

export const verifyUserClient = new VerifyUserClient(twitterConfig, adminAddress, arweaveKey, options);

