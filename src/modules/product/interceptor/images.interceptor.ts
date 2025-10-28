import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export function ImagesInterceptor(
  fieldName: string = 'images',
  maxCount: number = 4,
): ReturnType<typeof FilesInterceptor> {
  const multerOptions: MulterOptions = {
    limits: { files: maxCount },
    fileFilter: (
      req,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile: boolean) => void,
    ): void => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(
          new BadRequestException('Only JPG, JPEG, and PNG files are allowed'),
          false,
        );
      }
      callback(null, true);
    },
  };

  return FilesInterceptor(fieldName, maxCount, multerOptions);
}
