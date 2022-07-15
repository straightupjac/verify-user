// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { verifyUserClient } from '@utils/VerifyUserClient';
import type { NextApiRequest, NextApiResponse } from 'next'
import { ITwitterVerificationReturn, IVerifyTwitterReturn, Status } from 'verify-user';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ITwitterVerificationReturn>
) {
  if (req.method !== 'GET') {
    res.status(500).json({ status: 'Error' as Status.Error, msg: 'this is a GET method', hash: 'undefined' })
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');

  const { signature } = req.query;
  if (!signature || typeof signature !== 'string') {
    res.status(400).json({ status: 'Error' as Status.Error, msg: "signature is required", hash: 'undefined' });
    return;
  }

  try {
    const data = verifyUserClient.createTwitterVerificationHash(signature)
    if (data.msg !== 'success') {
      console.log(`err @ /createTwitterVerificationHash : ${data.msg}`)
      res.status(500).json(data);
      return;
    } else {
      res.json(data);
    }
  }
  catch (err) {
    console.log(`err @ /createTwitterVerificationHash : ${err}`)
    res.status(500).json({ status: 'Error' as Status.Error, msg: `err @ /createTwitterVerificationHash : ${err}`, hash: 'undefined' });
    return;
  };
}
