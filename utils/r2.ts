import { randomUUID } from 'crypto';
import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { HttpError } from './httpError';

const setting = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new HttpError(500, `Set ${name} before uploading images`);
  }
  return value;
};

const client = () =>
  new S3Client({
    region: 'auto',
    endpoint: `https://${setting('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: setting('R2_ACCESS_KEY_ID'),
      secretAccessKey: setting('R2_SECRET_ACCESS_KEY'),
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });

const uploadStoredImage = async (file: Express.Multer.File) => {
  const bucket = setting('R2_BUCKET');
  const publicBase = setting('R2_PUBLIC_URL').replace(/\/$/, '');
  let host = '';
  try {
    host = new URL(publicBase).hostname;
  } catch {
    throw new HttpError(500, 'R2_PUBLIC_URL must be a full https address');
  }
  const apiHost = host.endsWith('r2.cloudflarestorage.com');
  const devHost = host.endsWith('r2.dev') && !host.startsWith('pub-');
  if (apiHost || devHost) {
    throw new HttpError(
      500,
      'R2_PUBLIC_URL must be the Public Development URL from the bucket settings (https://pub-....r2.dev), or a domain you connected to the bucket.'
    );
  }
  const key = `products/${randomUUID()}.jpg`;
  let body: Buffer;
  try {
    body = await sharp(file.buffer)
      .rotate()
      .resize({ width: 1200, height: 1440, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch {
    throw new HttpError(400, 'That file is not a usable image');
  }

  try {
    await client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=31536000',
      })
    );
  } catch (error) {
    const code = error && typeof error === 'object' && 'Code' in error ? String(error.Code) : '';
    if (code === 'AccessDenied') {
      throw new HttpError(
        403,
        'R2 refused the upload. The API token needs Object Read & Write on this bucket.'
      );
    }
    throw error;
  }

  return `${publicBase}/${key}`;
};

const listStoredImages = async () => {
  const bucket = setting('R2_BUCKET');
  const objects: { key: string; lastModified?: Date }[] = [];
  let token: string | undefined;

  do {
    const page = await client().send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: 'products/',
        ContinuationToken: token,
      })
    );
    for (const item of page.Contents || []) {
      if (item.Key) objects.push({ key: item.Key, lastModified: item.LastModified });
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);

  return objects;
};

const deleteStoredImage = async (key: string) => {
  if (!key.startsWith('products/')) return;
  await client().send(
    new DeleteObjectCommand({
      Bucket: setting('R2_BUCKET'),
      Key: key,
    })
  );
};

const keyFromPublicUrl = (url: string) => {
  const publicBase = setting('R2_PUBLIC_URL').replace(/\/$/, '');
  const clean = url.split('?')[0];
  if (!clean.startsWith(`${publicBase}/`)) return null;
  const key = clean.slice(publicBase.length + 1);
  return key.startsWith('products/') ? key : null;
};

export { uploadStoredImage, listStoredImages, deleteStoredImage, keyFromPublicUrl };
