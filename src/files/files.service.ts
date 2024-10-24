import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';

@Injectable()
export class FilesService {
  async createFiles(files: Express.Multer.File[]): Promise<string[]> {
    try {
      const fileNames = [];

      const filePath = path.resolve(__dirname, '..', 'static');

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      console.log(files.toString())


      files.forEach(file => {
        const fileName = uuid.v4() + path.extname(file.originalname);
        fs.writeFileSync(path.join(filePath, fileName), file.buffer);
        fileNames.push(fileName);
      })

      return fileNames;
    } catch (e) {
      console.error(e)
      throw new InternalServerErrorException('Error writing files to disk');
    }
  }
}