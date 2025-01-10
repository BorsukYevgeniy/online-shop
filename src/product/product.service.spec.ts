import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileService } from '../file/file.service';

const mockFiles: Express.Multer.File[] = [
  {
    fieldname: 'image',
    originalname: 'file1.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('mockImageData'), // Моковані дані
    size: 12345,
    stream: null,
    destination: '',
    filename: 'file1.jpg',
    path: '',
  },
  {
    fieldname: 'image',
    originalname: 'file2.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('mockImageData'),
    size: 12345,
    stream: null,
    destination: '',
    filename: 'file2.jpg',
    path: '',
  },
];

describe('ProductService', () => {
  let service: ProductService;
  let repository: ProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {
            count: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findUserProducts: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            createImages: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<ProductRepository>(ProductRepository);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should return all products without filters', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'title',
        price: 50,
        userId: 1,
        description: 'description',
        images: ['1', '2'],
      },
      {
        id: 2,
        title: 'title2',
        price: 100,
        userId: 2,
        description: 'description2',
        images: ['3', '4'],
      },
    ];

    jest.spyOn(repository, 'count').mockResolvedValue(2);
    jest.spyOn(repository, 'findAll').mockResolvedValue(mockProducts);

    const products = await service.findAll({}, { pageSize: 10, page: 1 });

    expect(repository.findAll).toHaveBeenCalledWith({}, 0, 10);
    expect(products).toEqual({
      products: mockProducts,
      total: 2,
      pageSize: 10,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });
  });

  it('should filter products by title', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'title',
        price: 50,
        description: 'description',
        userId: 2,
        images: ['9', '10'],
      },
    ];

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findAll').mockResolvedValue(mockProducts);

    const products = await service.findAll(
      { title: 'Test' },
      { pageSize: 1, page: 1 },
    );

    expect(repository.findAll).toHaveBeenCalledWith({ title: 'Test' }, 0, 1);
    expect(products).toEqual({
      products: mockProducts,
      total: 1,
      pageSize: 1,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });
  });

  it('should filter products by price range', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Product A',
        price: 150,
        userId: 4,
        description: 'Test description',
        images: ['7', '8'],
      },
    ];

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findAll').mockResolvedValue(mockProducts);

    const products = await service.findAll(
      { minPrice: 100, maxPrice: 200 },
      { page: 1, pageSize: 10 },
    );

    expect(repository.findAll).toHaveBeenCalledWith(
      {
        minPrice: 100,
        maxPrice: 200,
      },
      0,
      10,
    );

    expect(products).toEqual({
      products: mockProducts,
      total: 1,
      pageSize: 10,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });
  });

  it('should filter products by title and price range', async () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Test Product',
        price: 150,
        userId: 3,
        images: ['5', '6'],
        description: 'Test description',
      },
    ];

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findAll').mockResolvedValue(mockProducts);

    const products = await service.findAll(
      {
        title: 'Test',
        minPrice: 100,
        maxPrice: 200,
      },
      { pageSize: 2, page: 1 },
    );

    expect(repository.findAll).toHaveBeenCalledWith(
      {
        title: 'Test',
        minPrice: 100,
        maxPrice: 200,
      },
      0,
      2,
    );
    expect(products).toEqual({
      products: mockProducts,
      total: 1,
      pageSize: 2,
      page: 1,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });
  });

  it('should find product by id', async () => {
    const productId = 3;
    const mockProduct = {
      id: productId,
      userId: 2,
      title: 'TEST',
      price: 52,
      description: 'Test description',
      images: ['11', '12'],
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);

    const product = await service.findById(productId);

    expect(repository.findById).toHaveBeenCalledWith(productId);

    expect(product).toEqual(mockProduct);
  });

  it('should create product', async () => {
    const userId = 1;
    const dto: CreateProductDto = {
      title: 'Test Product',
      description: 'Test Description',
      price: 100,
    };
    const imagesNames = ['1', '2'];
    const mockProduct = { id: 1, userId, ...dto, images: imagesNames };

    jest.spyOn(repository, 'create').mockResolvedValue(mockProduct);

    const product = await service.create(userId, dto, mockFiles);

    expect(product).toEqual(mockProduct);
  });

  it('should update all fields in product', async () => {
    const productId = 2;
    const userId = 1;
    const imageNames = ['image1.jpg', 'image2.jpg'];
    const dto: UpdateProductDto = {
      title: 'Updated Title',
      description: 'Updated Description',
      price: 100,
    };

    const mockProduct = {
      id: productId,
      userId,
      title: dto.title,
      description: dto.description,
      price: dto.price,
      images: imageNames,
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);
    jest.spyOn(repository, 'update').mockResolvedValue(mockProduct);

    const product = await service.updateProduct(
      userId,
      productId,
      dto,
      mockFiles,
    );

    expect(product).toEqual(mockProduct);
  });

  it('should update only title in product', async () => {
    const userId = 1;
    const productId = 1;
    const imageNames = ['image1.jpg'];
    const dto: UpdateProductDto = {
      title: 'Updated Title',
    };

    const mockProduct = {
      id: productId,
      userId: 1,
      title: dto.title,
      description: 'Old Description',
      price: 50,
      images: imageNames,
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);
    jest.spyOn(repository, 'update').mockResolvedValue(mockProduct);

    const product = await service.updateProduct(userId, productId, dto);

    expect(product).toEqual(mockProduct);
  });

  it('should update only price in product', async () => {
    const userId = 1;
    const productId = 1;
    const dto: UpdateProductDto = {
      price: 52,
    };
    const imageNames = ['image1.jpg'];

    const mockProduct = {
      id: productId,
      userId: 1,
      title: 'Old title',
      description: 'Old Description',
      price: dto.price,
      images: imageNames,
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);
    jest.spyOn(repository, 'update').mockResolvedValue(mockProduct);

    const product = await service.updateProduct(userId, productId, dto);

    expect(product).toEqual(mockProduct);
  });

  it('should update images in product', async () => {
    const userId = 1;
    const productId = 1;
    const imageName = ['1.jpg'];
    const dto: UpdateProductDto = {};
    const mockProduct = {
      id: productId,
      userId: 1,
      title: 'Old title',
      description: 'Old Description',
      price: 50,
      images: imageName,
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);
    jest.spyOn(repository, 'update').mockResolvedValue(mockProduct);

    const product = await service.updateProduct(
      userId,
      productId,
      dto,
      mockFiles,
    );

    expect(product).toEqual(mockProduct);
  });

  it('should delete product by id', async () => {
    const productId = 1;
    const userId = 1;
    const mockProduct = {
      id: productId,
      userId,
      price: 22,
      title: 'TEST',
      description: 'Test',
      images: ['13', '14'],
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockProduct);
    jest.spyOn(repository, 'delete').mockResolvedValue(mockProduct);

    const product = await service.deleteProduct(userId, productId);

    expect(repository.delete).toHaveBeenCalledWith(productId);
    expect(product).toEqual(mockProduct);
  });
});
