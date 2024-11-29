import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
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
      const fileNames = [];

      const filePath = resolvePath(__dirname, '..', 'static');

      if (!existsSync(filePath)) {
        mkdirSync(filePath, { recursive: true });
      }

      images.forEach((file) => {
        const fileName = uuidV4() + fileExtname(file.originalname);
        writeFileSync(joinPath(filePath, fileName), file.buffer);
        fileNames.push(fileName);
      });

      return fileNames;
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Error writing files to disk');
    }
  }
}
