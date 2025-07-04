import {
  Action,
  LectureEntry,
  CoverageTimeline,
  CURRENT_TERM,
  ResourceName,
} from '@stex-react/utils';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdIfAuthorizedOrSetError } from './access-control/resource-utils';
import { checkIfPostOrSetError } from './comment-utils';
import { CURRENT_SEM_FILE } from './get-coverage-timeline';

function backupFileName() {
  return (
    process.env.RECORDED_SYLLABUS_DIR + '/backups/' + CURRENT_SEM_FILE + `_bkp_${Date.now()}.json`
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;

  const courseId = req.body.courseId as string;
  const action = req.body.action || 'upsert';
  if (action !== 'upsert' && action !== 'delete') {
    return res
      .status(400)
      .json({ message: 'Invalid action. Must be either "upsert" or "delete".' });
  }

  try {
    const userId = await getUserIdIfAuthorizedOrSetError(
      req,
      res,
      ResourceName.COURSE_SYLLABUS,
      Action.MUTATE,
      {
        courseId,
        instanceId: CURRENT_TERM,
      }
    );
    if (!userId) return;

    const filePath = process.env.RECORDED_SYLLABUS_DIR + '/' + CURRENT_SEM_FILE;

    // Read the current file contents
    let existingData: CoverageTimeline = {};
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      existingData = JSON.parse(fileData);
    }

    // Backup before changing anything
    fs.writeFileSync(backupFileName(), JSON.stringify(existingData, null, 2));

    const currentSnaps = existingData[courseId] || [];

    // Replace the row with the same timestamp or add it if new
    let newSnaps: LectureEntry[];

    if (action === 'upsert') {
      const updatedEntry = req.body.updatedEntry as LectureEntry;

      newSnaps = [
        ...currentSnaps.filter((entry) => entry.timestamp_ms !== updatedEntry.timestamp_ms),
        updatedEntry,
      ].sort((a, b) => a.timestamp_ms - b.timestamp_ms);
    } else if (action === 'delete') {
      const timestamp = req.body.timestamp_ms;
      newSnaps = currentSnaps.filter((entry) => entry.timestamp_ms !== timestamp);
    }
    existingData[courseId] = newSnaps;
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    return res.status(200).end();
  } catch (error) {
    console.error('Error updating row:', error);
    res.status(500).json({ message: 'Error updating row' });
  }
}
