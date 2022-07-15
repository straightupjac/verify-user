// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { verifyUserClient } from '@utils/VerifyUserClient';
import type { NextApiRequest, NextApiResponse } from 'next'
import { ITwitterVerificationReturn, IVerifyTwitterReturn, Status } from 'verify-user';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ITwitterVerificationReturn>
) {
  if (req.method !== 'GET') {
    res.status(500).json({ status: Status.Error, msg: 'this is a GET method', hash: 'undefined' })
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');

  const { signature } = req.body;

  try {
    const data = verifyUserClient.createTwitterVerificationHash(signature)
    if (data.msg !== 'success') {
      console.log(`err @ /verify : ${data.msg}`)
      res.status(500)
      return;
    } else {
      res.json(data);
    }
  }
  catch (err) {
    console.log(`err @ /verify : ${err}`)
    res.status(500)
    return;
  };
}
