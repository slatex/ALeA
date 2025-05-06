import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  executeDontEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { CURRENT_TERM } from '@stex-react/utils';
import { JobCategoryInfo } from '@stex-react/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  let instanceId = req.query.instanceId as string;
  if (!instanceId) instanceId = CURRENT_TERM;
  const results: any = await executeDontEndSet500OnError(
    `SELECT id,jobCategory,internshipPeriod,startDate,endDate
    FROM jobCategories 
    WHERE instanceId = ?`,
    [instanceId],
    res
  );
  if (!results) return;
  if (!results.length) return res.status(404).send('No job created yet');

  res.status(200).json(results);
}
