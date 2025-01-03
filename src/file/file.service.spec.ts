import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileService],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
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

    expect(result).toEqual(expect.any(Array<string>));
  });
});
