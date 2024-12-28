import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import {
  join as joinPath,
  resolve as resolvePath,
  extname as fileExtname,
} from 'path';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class FilesService {
  async createImages(images: Express.Multer.File[]): Promise<string[]> {
    try {
      const fileNames: string[] = [];
      const filePath = resolvePath(__dirname, '..', '..', 'static');

      try {
        await fsPromises.access(filePath);
      } catch {
        await fsPromises.mkdir(filePath, { recursive: true });
      }

      for (const file of images) {
        const fileName = uuidV4() + fileExtname(file.originalname);
        await fsPromises.writeFile(joinPath(filePath, fileName), file.buffer);

        fileNames.push(fileName);
      }

      return fileNames;
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Error writing files to disk');
    }
  }
}
