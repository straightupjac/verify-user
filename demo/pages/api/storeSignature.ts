// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { verifyUserClient } from '@utils/VerifyUserClient';
import type { NextApiRequest, NextApiResponse } from 'next'
import { IReturn, Status } from 'verify-user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IReturn>
) {
  if (req.method !== 'POST') {
    res.status(500).json({ status: 'Error' as Status.Error, msg: 'this is a POST method' })
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');

  const { signature, username } = req.body;
  if (!signature || !username) {
    res.status(500).json({ status: 'Error' as Status.Error, msg: "signature and username are required" });
    return;
  }

  try {
    const data = await verifyUserClient.storeSignature(signature, username)
    if (data.status !== 'Success') {
      console.log(`err @ /storeSignature : ${data.msg}`)
      res.status(500).json(data)
      return;
    } else {
      res.json(data);
    }
  }
  catch (err) {
    console.log(`err @ /storeSignature : ${err}`)
    res.status(500).json({ status: 'Error' as Status.Error, msg: `err @ /storeSignature : ${err}` })
    return;
  };
}
