// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { verifyUserClient } from '@utils/VerifyUserClient';
import type { NextApiRequest, NextApiResponse } from 'next'
import { IReturn, Status } from 'verify-user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IReturn>
) {

  if (req.method !== 'GET') {
    res.status(500).json({ status: 'Error' as Status.Error, msg: 'this is a GET method' })
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');

  const { signature } = req.query;

  if (!signature || typeof signature !== 'string') {
    res.status(400).json({ status: 'Error' as Status.Error, msg: "signature is required" });
    return;
  }

  try {
    const data = await verifyUserClient.getUser(signature);
    if (data.status !== 'Success') {
      console.log(`err @ /getUser : ${data.msg}`)
      res.status(500).json(data)
      return;
    } else {
      res.json(data);
    }
  }
  catch (err) {
    console.log(`err @ /getUser : ${err}`)
    res.status(500).json({ status: 'Error' as Status.Error, msg: `err @ /getUser : ${err}` })
    return;
  };
}
