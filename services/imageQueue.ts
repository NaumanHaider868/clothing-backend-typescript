import { prisma } from '../config';
import { deleteStoredImage, keyFromPublicUrl, listStoredImages } from '../utils/r2';

const GRACE_MS = 30 * 60 * 1000;
const SWEEP_MS = 10 * 60 * 1000;

type ImageJob = {
  key: string;
  lastModified?: Date;
  immediate: boolean;
};

const waiting: ImageJob[] = [];
const seen = new Set<string>();
let working = false;

const enqueueImage = (key: string, options?: { lastModified?: Date; immediate?: boolean }) => {
  if (!key.startsWith('products/') || seen.has(key)) return;
  seen.add(key);
  waiting.push({
    key,
    lastModified: options?.lastModified,
    immediate: Boolean(options?.immediate),
  });
  void drain();
};

const enqueueImageUrl = (url: string) => {
  try {
    const key = keyFromPublicUrl(url);
    if (key) enqueueImage(key, { immediate: true });
  } catch {
    // Storage is not configured, so there is nothing to remove.
  }
};

const imageIsUsed = (key: string) =>
  prisma.productImage.findFirst({
    where: { imageUrl: { contains: key } },
    select: { id: true },
  });

const drain = async () => {
  if (working) return;
  working = true;
  try {
    while (waiting.length) {
      const job = waiting.shift();
      if (!job) break;
      seen.delete(job.key);
      const age = job.lastModified ? Date.now() - job.lastModified.getTime() : GRACE_MS;
      if (!job.immediate && age < GRACE_MS) continue;
      if (await imageIsUsed(job.key)) continue;
      await deleteStoredImage(job.key);
      console.log('Removed unused image', job.key);
    }
  } catch (error) {
    console.error('Image cleanup failed', error);
  } finally {
    working = false;
    if (waiting.length) void drain();
  }
};

const sweepUnusedImages = async () => {
  try {
    const objects = await listStoredImages();
    objects.forEach((object) => enqueueImage(object.key, { lastModified: object.lastModified }));
  } catch (error) {
    console.error('Image sweep failed', error);
  }
};

const startImageCleanup = () => {
  setTimeout(() => {
    void sweepUnusedImages();
  }, 20_000);
  setInterval(() => {
    void sweepUnusedImages();
  }, SWEEP_MS);
};

export { enqueueImageUrl, startImageCleanup };
