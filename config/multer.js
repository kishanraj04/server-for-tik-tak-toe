import multer from 'multer';

// Memory storage (no files saved on disk)
const storage = multer.memoryStorage();

export const upload = multer({ storage });
