// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');

  const { handle } = req.body;

  const twitterConfig = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    bearer_token: process.env.BEARER_TOKEN,
  };

  const adminAddress = process.env.ARWEAVE_ADDRESS;
  const arweaveKey = process.env.ARWEAVE_KEY;

  const TWEET_TEMPLATE = "I am verifying for verify-user. signature:"

  const options = {
    twitterMessage: TWEET_TEMPLATE,
    projectName: 'verify_user_template'
  }

  const VerifyUserClient = require('verify-user');
  const verifyUserClient = new VerifyUserClient(twitterConfig, adminAddress, arweaveKey, options);

  verifyUserClient.generateMessageToSign(handle).then((data: any) => {
    if (data.msg !== 'success') {
      console.log(`err @ /verify : ${data.msg}`)
      res.status(500)
      return;
    } else {
      res.json(data);
    }
  }).catch((e: any) => {
    console.log(`err @ /verify : ${e}`)
    res.status(500)
    return;
  });
}
