// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { verifyTweet } from '@utils/Testing';
import { verifyUserClient } from '@utils/VerifyUserClient';
import type { NextApiRequest, NextApiResponse } from 'next'
import { IVerifyTwitterReturn, Status } from 'verify-user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {

  if (req.method !== 'POST') {
    res.status(500).json({ status: 'Error' as Status.Error, msg: 'this is a POST method', data: 'undefined' });
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');

  const { handle, verificationHash } = req.body;

  try {
    const data = await verifyTweet(handle, verificationHash);
    res.json(data);
  } catch (err) {
    console.log(`err @ /verify : ${err}`)
    res.status(500)
    return;
  }
}
