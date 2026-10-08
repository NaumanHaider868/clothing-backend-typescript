import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { sendErrorResponse } from '../utils';

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

const xmlUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const name = file.originalname.toLowerCase();
    const xmlType = file.mimetype === 'text/xml' || file.mimetype === 'application/xml';
    if (!xmlType && !name.endsWith('.xml')) {
      cb(new Error('Only an XML file can be imported'));
      return;
    }
    cb(null, true);
  },
});

const acceptUpload =
  (upload: ReturnType<multer.Multer['single']> | ReturnType<multer.Multer['array']>) =>
  (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (error: unknown) => {
      if (!error) return next();
      const message = error instanceof Error ? error.message : 'Upload failed';
      return sendErrorResponse(res, 400, message);
    });
  };

const uploadImages = acceptUpload(imageUpload.array('images', 12));
const uploadXml = acceptUpload(xmlUpload.single('file'));

export { uploadImages, uploadXml };
