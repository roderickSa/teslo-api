import { NotFoundException } from '@nestjs/common';

export const FILES_MAX_COUNT = 3;

export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (...args: any[]) => any,
) => {
  const fileExptension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

  if (!validExtensions.includes(fileExptension)) {
    return callback(
      new NotFoundException(
        `file's extensions valid: ${validExtensions.join(', ')}`,
      ),
      false,
    );
  }

  callback(null, true);
};
