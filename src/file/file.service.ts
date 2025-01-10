import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import {
  join as joinPath,
  resolve as resolvePath,
  extname as fileExtname,
} from 'path';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class FileService {
  async createImages(images: Express.Multer.File[]): Promise<string[]> {
    try {
      const fileNames: string[] = [];
      const filePath: string = resolvePath(__dirname, '..', '..', 'static');

      try {
        await fsPromises.access(filePath);
      } catch {
        await fsPromises.mkdir(filePath, { recursive: true });
      }

      const writePromises = images.map(
        (file: Express.Multer.File): Promise<void> => {
          const fileName: string = uuidV4() + fileExtname(file.originalname);

          fileNames.push(fileName);

          return fsPromises.writeFile(
            joinPath(filePath, fileName),
            file.buffer,
          );
        },
      );

      await Promise.all(writePromises);

      return fileNames;
    } catch (e: unknown) {
      console.error(e);
      throw new InternalServerErrorException('Error writing files to disk');
    }
  }
}
