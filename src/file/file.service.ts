import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import {
  join as joinPath,
  resolve as resolvePath,
  extname as fileExtname,
} from 'path';
import { v4 as uuidV4 } from 'uuid';
import { FileErrorMessages as FileErrMsg } from './enum/file-error-messages.enum';

@Injectable()
export class FileService {
  private readonly logger: Logger = new Logger(FileService.name);

  async createImages(
    images: Express.Multer.File[],
  ): Promise<string[] | undefined> {
    if (!images || images.length < 1) return undefined;

    try {
      const fileNames: string[] = [];
      const filePath: string = resolvePath(__dirname, '..', '..', 'images');

      try {
        await fsPromises.access(filePath);
      } catch {
        this.logger.debug(`Directory does not exist, creating: ${filePath}`);
        await fsPromises.mkdir(filePath, { recursive: true });
      }

      const writePromises: Promise<void>[] = images.map(
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

      this.logger.log(`Files written to disk: ${fileNames.join(', ')}`);
      return fileNames;
    } catch (e: unknown) {
      this.logger.error('Error writing files to disk', e);

      throw new InternalServerErrorException(FileErrMsg.ErrorWritingOnDisk);
    }
  }
}
