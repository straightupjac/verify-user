// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { verifyUserClient } from '@utils/VerifyUserClient';
import type { NextApiRequest, NextApiResponse } from 'next'
import { IReturn, Status } from 'verify-user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IReturn>
) {
  if (req.method !== 'POST') {
    res.status(500).json({ status: Status.Error, msg: 'this is a POST method' })
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');

  const { signature, username } = req.body;
  if (!signature || !username) {
    res.status(500).json({ status: Status.Error, msg: "signature and username are required" })
  }

  try {
    const data = await verifyUserClient.storeSignature(signature, username)
    if (data.status !== 'Success') {
      console.log(`err @ /storeSignature : ${data.msg}`)
      res.status(500)
      return;
    } else {
      res.json(data);
    }
  }
  catch (err) {
    console.log(`err @ /storeSignature : ${err}`)
    res.status(500)
    return;
  };
}
