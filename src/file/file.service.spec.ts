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

  it('Should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('Should create files and return file names', async () => {
    const mockImages = [
      {
        fieldname: 'file',
        originalname: 'TradeHistory.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        buffer: Buffer.from(__dirname),
        size: 51828,
      } as Express.Multer.File,
      {
        fieldname: 'file',
        originalname: 'TradeHistory.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        buffer: Buffer.from(__dirname),
        size: 51828,
      } as Express.Multer.File,
      {
        fieldname: 'file',
        originalname: 'TradeHistory.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        buffer: Buffer.from(__dirname),
        size: 51828,
      } as Express.Multer.File,
    ];

    const result = await service.createImages(mockImages);

    expect(result).toEqual(expect.any(Array<string>));
  });
});
