import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FileStorageService } from '../../../infra/file-storage/file-storage.service';
import { ProductImagesService } from './product-images.service';

import { v4 as uuidV4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('ProductImagesService', () => {
  let service: ProductImagesService;

  const fileService = {
    mkdir: jest.fn(),
    write: jest.fn(),
  };

  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductImagesService,
        {
          provide: FileStorageService,
          useValue: fileService,
        },
      ],
    }).compile();

    service = module.get(ProductImagesService);

    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('onModuleInit', () => {
    it('should create images directory', async () => {
      fileService.mkdir.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(fileService.mkdir).toHaveBeenCalledTimes(1);
    });
  });

  describe('createImages', () => {
    it('should return undefined when images are undefined', async () => {
      await expect(
        service.createImages(undefined as any),
      ).resolves.toBeUndefined();

      expect(fileService.write).not.toHaveBeenCalled();
    });

    it('should return undefined when images array is empty', async () => {
      await expect(service.createImages([])).resolves.toBeUndefined();

      expect(fileService.write).not.toHaveBeenCalled();
    });

    it('should write all images', async () => {
      (uuidV4 as jest.Mock)
        .mockReturnValueOnce('id-1')
        .mockReturnValueOnce('id-2');

      fileService.write.mockResolvedValue(undefined);

      const images = [
        {
          originalname: 'a.png',
          buffer: Buffer.from('1'),
        },
        {
          originalname: 'b.jpg',
          buffer: Buffer.from('2'),
        },
      ] as Express.Multer.File[];

      const result = await service.createImages(images);

      expect(result).toEqual(['id-1.png', 'id-2.jpg']);

      expect(fileService.write).toHaveBeenCalledTimes(2);

      expect(logSpy).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when write fails', async () => {
      (uuidV4 as jest.Mock).mockReturnValue('id');

      fileService.write.mockRejectedValue(new Error('disk error'));

      const images = [
        {
          originalname: 'a.png',
          buffer: Buffer.from('1'),
        },
      ] as Express.Multer.File[];

      await expect(service.createImages(images)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );

      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
