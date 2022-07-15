// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { verifyUserClient } from '@utils/VerifyUserClient';
import type { NextApiRequest, NextApiResponse } from 'next'
import { IGenerateMessageReturn, Status } from 'verify-user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IGenerateMessageReturn>
) {
  if (req.method !== 'GET') {
    res.status(500).json({ status: Status.Error, msg: 'this is a GET method', messageToSign: 'undefined' })
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');

  const { handle } = req.query;
  if (!handle || typeof handle !== 'string') {
    res.status(400).json({ status: Status.Error, msg: "handle is required", messageToSign: 'undefined' });
    return;
  }

  try {
    const data = await verifyUserClient.generateMessageToSign(handle);
    if (data.status !== 'Success') {
      console.log(`err @ /generateMessageToSign : ${data.msg}`)
      res.status(500)
      return;
    } else {
      res.json(data);
      return;
    }
  } catch (err) {
    console.log(`err @ /generateMessageToSign : ${err}`)
    res.status(500);
    return;
  };
}
