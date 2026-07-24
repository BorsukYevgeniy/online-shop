import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { FileStorageService } from '../../../infra/file-storage/file-storage.service';

import { extname as fileExtname, resolve as resolvePath } from 'path';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class ProductImagesService implements OnModuleInit {
  private readonly logger: Logger = new Logger(ProductImagesService.name);

  constructor(private readonly fileService: FileStorageService) {}

  private readonly PRODUCT_IMAGES_PATH: string = resolvePath(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    '..',
    'images',
  );

  async onModuleInit() {
    return this.fileService.mkdir(this.PRODUCT_IMAGES_PATH);
  }

  async createImages(
    images: Express.Multer.File[],
  ): Promise<string[] | undefined> {
    if (!images || images.length < 1) return undefined;

    try {
      const fileNames: string[] = [];

      const writePromises: Promise<void>[] = images.map(
        (file: Express.Multer.File): Promise<void> => {
          const fileName: string = uuidV4() + fileExtname(file.originalname);

          fileNames.push(fileName);

          return this.fileService.write(
            fileName,
            this.PRODUCT_IMAGES_PATH,
            file.buffer,
          );
        },
      );

      await Promise.all(writePromises);

      this.logger.log(`Files written to disk: ${fileNames.join(', ')}`);
      return fileNames;
    } catch (e: unknown) {
      this.logger.error('Error writing files to disk', e);

      throw new InternalServerErrorException('Error writing files to disk');
    }
  }
}
