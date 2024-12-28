import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TokenService } from '../token/token.service';
import { AuthRequest } from '../interface/express-requests.interface';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const req: AuthRequest = { user: { id: 1, roles: ['1'] } } as any;
  const mockFiles: Express.Multer.File[] = [
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findUserProducts: jest.fn(),
            create: jest.fn(),
            updateProduct: jest.fn(),
            deleteProduct: jest.fn(),
          },
        },
        { provide: TokenService, useValue: { verifyAccessToken: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all products without filters', async () => {
    const productId = 1;
    const mockProducts = [
      {
        id: productId,
        userId: 1,
        title: 'title',
        price: 50,
        description: 'description',
        images: ['1.png','2.png'],
      },
    ];
    jest.spyOn(service, 'findAll').mockResolvedValue(mockProducts);

    const products = await controller.getAllProducts();

    expect(products).toEqual(mockProducts);
  });

  it('should filter products by title', async () => {
    const productId = 1;
    const mockProducts = [
      {
        id: productId,
        userId: 1,
        title: 'title',
        price: 50,
        description: 'description',
        images: ['1.png','2.png'],
      },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue(mockProducts);

    const products = await controller.getAllProducts('Test');
    expect(products).toEqual(mockProducts);
  });

  it('should filter products by price range', async () => {
    const productId = 1;
    const mockProducts = [
      {
        id: productId,
        userId: 1,
        title: 'title',
        price: 50,
        description: 'description',
        images: ['1.png','2.png'],
      },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue(mockProducts);

    const products = await controller.getAllProducts(null, '100', '200');

    expect(service.findAll).toHaveBeenCalledWith({
      title: null,
      minPrice: 100,
      maxPrice: 200,
    });
    expect(products).toEqual(mockProducts);
  });

  it('should filter products by title and price range', async () => {
    const productId = 1;
    const mockProducts = [
      {
        id: productId,
        userId: 1,
        title: 'title',
        price: 50,
        description: 'description',
        images: ['1.png','2.png'],
      },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue(mockProducts);

    const products = await controller.getAllProducts(
      'Test',
      '25',
      '75',
    );

    expect(service.findAll).toHaveBeenCalledWith({
      title: 'Test',
      minPrice: 25,
      maxPrice: 75,
    });
    expect(products).toEqual(mockProducts);
  });

  it('should find product by id', async () => {
    const productId = 1;
    const mockProduct = {
      id: productId,
      userId: 1,
      title: 'title',
      price: 50,
      description: 'description',
      images: ['1.png','2.png'],
    };

    jest.spyOn(service, 'findById').mockResolvedValue(mockProduct);

    const product = await controller.getProductById(productId);

    expect(service.findById).toHaveBeenCalledWith(productId);
    expect(product).toEqual(mockProduct);
  });

  it('should create product', async () => {
    const productId = 1;
    const mockProduct = {
      id: productId,
      userId: 1,
      title: 'title',
      price: 50,
      description: 'description',
      images: ['1.png','2.png'],
    };

    const createProductDto: CreateProductDto = {
      title: 'title',
      description: 'title',
      price: 100,
    };
    jest.spyOn(service, 'create').mockResolvedValue(mockProduct);

    const product = await controller.createProduct(
      req,
      createProductDto,
      mockFiles,
    );

    expect(service.create).toHaveBeenCalledWith(
      req.user.id,
      createProductDto,
      mockFiles,
    );
    expect(product).toEqual(mockProduct);
  });

  it('should update all fields in product', async () => {
    const productId = 1;
    const userId = 1;
    const updateProductDto: UpdateProductDto = {
      title: 'updated title',
      description: 'new description',
      price: 200,
    };
    const mockUpdatedAllProduct = {
      id: productId,
      userId,
      title: updateProductDto.title,
      description: updateProductDto.description,
      price: updateProductDto.price,
      images: ['1.png', '2.png'],
    };

    jest.spyOn(service, 'findById').mockResolvedValue(mockUpdatedAllProduct);
    jest
      .spyOn(service, 'updateProduct')
      .mockResolvedValue(mockUpdatedAllProduct);

    const product = await controller.updateProduct(
      req,
      productId,
      updateProductDto,
      mockFiles,
    );

    expect(service.updateProduct).toHaveBeenCalledWith(
      req.user.id,
      productId,
      updateProductDto,
      mockFiles,
    );
    expect(product).toEqual(mockUpdatedAllProduct);
  });

  it('should update only title in product', async () => {
    const productId = 1;
    const userId = 1;
    const updateProductTitleDto: UpdateProductDto = {
      title: 'updated title',
    };
    const mockUpdatedTitleProduct = {
      id: productId,
      userId,
      title: updateProductTitleDto.title,
      description: 'Old Description',
      price: 50,
      images: ['1.png', '2.png'],
    };

    jest.spyOn(service, 'findById').mockResolvedValue(mockUpdatedTitleProduct);
    jest
      .spyOn(service, 'updateProduct')
      .mockResolvedValue(mockUpdatedTitleProduct);

    const product = await controller.updateProduct(
      req,
      productId,
      updateProductTitleDto,
    );

    expect(service.updateProduct).toHaveBeenCalledWith(
      req.user.id,
      productId,
      updateProductTitleDto,
      undefined,
    );
    expect(product).toEqual(mockUpdatedTitleProduct);
  });

  it('should update only price in product', async () => {
    const productId = 1;
    const userId = 1;
    const updateProductPriceDto: UpdateProductDto = {
      price: 52,
    };
    const mockUpdatedPriceProduct = {
      id: productId,
      userId,
      title: 'Old title',
      description: 'Old Description',
      price: updateProductPriceDto.price,
      images: ['1.png', '2.png'],
    };

    jest.spyOn(service, 'findById').mockResolvedValue(mockUpdatedPriceProduct);
    jest
      .spyOn(service, 'updateProduct')
      .mockResolvedValue(mockUpdatedPriceProduct);

    const product = await controller.updateProduct(
      req,
      productId,
      updateProductPriceDto,
    );

    expect(product).toEqual(mockUpdatedPriceProduct);
  });

  it('should update images in product', async () => {
    const productId = 1;
    const userId = 1;
    const dto: UpdateProductDto = {};
    const mockProduct = {
      id: productId,
      userId,
      title: 'Old title',
      description: 'Old Description',
      price: 50,
      images: ['1.png', '2.png'],
    };
    jest.spyOn(service, 'findById').mockResolvedValue(mockProduct);
    jest.spyOn(service, 'updateProduct').mockResolvedValue(mockProduct);

    const product = await controller.updateProduct(
      req,
      productId,
      dto,
      mockFiles,
    );

    expect(service.updateProduct).toHaveBeenCalledWith(
      req.user.id,
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
    const req: AuthRequest = { user: { id: 1, roles: ['1'] } } as any;

    jest.spyOn(service, 'findById').mockResolvedValue(mockProduct);
    jest.spyOn(service, 'deleteProduct').mockResolvedValue(mockProduct);

    const product = await controller.deleteProduct(req, productId);

    expect(service.deleteProduct).toHaveBeenCalledWith(req.user.id, productId);
    expect(product).toEqual(mockProduct);
  });
});
