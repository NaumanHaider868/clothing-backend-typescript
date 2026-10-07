import { Request, Response } from 'express';
import { prisma } from '../config';
import { asyncHandler, sendSuccessResponse } from '../utils';

const listDeletions = asyncHandler(async (_req: Request, res: Response) => {
  const records = await prisma.deletionRecord.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      deletedBy: {
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
      },
    },
  });
  sendSuccessResponse(res, 200, records, 'Deletion records loaded');
});

export { listDeletions };
