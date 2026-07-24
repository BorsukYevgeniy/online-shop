import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { FileStorageService } from './file-storage.service';

jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
  unlink: jest.fn(),
  mkdir: jest.fn(),
}));

describe('FileStorageService', () => {
  let service: FileStorageService;

  let debugSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let fatalSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileStorageService],
    }).compile();

    service = module.get(FileStorageService);

    debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    fatalSpy = jest.spyOn(Logger.prototype, 'fatal').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('write', () => {
    it('should write file', async () => {
      (writeFile as jest.Mock).mockResolvedValue(undefined);

      const buffer = Buffer.from('test');

      await service.write('test.txt', '/uploads', buffer);

      expect(writeFile).toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalledWith(
        { fileName: 'test.txt', path: '/uploads' },
        'File written',
      );
    });

    it('should log error and rethrow', async () => {
      const err = new Error('write failed');
      (writeFile as jest.Mock).mockRejectedValue(err);

      await expect(
        service.write('test.txt', '/uploads', Buffer.alloc(0)),
      ).rejects.toThrow(err);

      expect(errorSpy).toHaveBeenCalledWith(
        { fileName: 'test.txt', path: '/uploads' },
        'Cannot write file',
      );
    });
  });

  describe('unlink', () => {
    it('should delete file', async () => {
      (unlink as jest.Mock).mockResolvedValue(undefined);

      await service.unlink('test.txt', '/uploads');

      expect(unlink).toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalledWith(
        { fileName: 'test.txt' },
        'File deleted',
      );
    });

    it('should log error and rethrow', async () => {
      const err = new Error('unlink failed');
      (unlink as jest.Mock).mockRejectedValue(err);

      await expect(service.unlink('test.txt', '/uploads')).rejects.toThrow(err);

      expect(errorSpy).toHaveBeenCalledWith(
        { fileName: 'test.txt' },
        'Cannot delete file',
      );
    });
  });

  describe('mkdir', () => {
    it('should create directory', async () => {
      (mkdir as jest.Mock).mockResolvedValue(undefined);

      await service.mkdir('/uploads');

      expect(mkdir).toHaveBeenCalledWith('/uploads', {
        recursive: true,
      });

      expect(debugSpy).toHaveBeenCalledWith(
        { path: '/uploads' },
        'Directory created',
      );
    });

    it('should log fatal and rethrow', async () => {
      const err = new Error('mkdir failed');
      (mkdir as jest.Mock).mockRejectedValue(err);

      await expect(service.mkdir('/uploads')).rejects.toThrow(err);

      expect(fatalSpy).toHaveBeenCalledWith(
        { path: '/uploads' },
        'Cannot create directory',
      );
    });
  });
});
