import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create files and return file names', async () => {
    const mockImages = [
      {
        fieldname: 'image',
        originalname: 'file1.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('mockImageData'),
        size: 12345,
        stream: null,
        destination: '',
        filename: 'file1.jpg',
        path: '',
      },
    ];

    const result = await service.createImages(mockImages);

    expect(result).toEqual([expect.any(String)]);
  });
});
