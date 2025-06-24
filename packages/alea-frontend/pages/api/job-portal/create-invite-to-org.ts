import { Action, ResourceName } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { orgId, email } = req.body;
  const inviterId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL_ORG,
    Action.CREATE_JOB_POST,
    { orgId }
  );
  if (!inviterId) return;
  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Invalid or missing email' });
    return;
  }
  const result = await executeAndEndSet500OnError(
    `INSERT INTO orgInvitations (inviteruserId, inviteeEmail,organizationId) VALUES (?, ?, ?)`,
    [inviterId, email, orgId],
    res
  );

  if (!result) return;
  res.status(201).end();
}
