import { Product, Category } from '@prisma/client';
import { Paginated } from '../../common/types/pagination.type';

/*
  Respresents type Product with Category fields
*/
export type ProductCategory = Product & { categories: Category[] };

/**
 * Represents products with pagination
 */
export type PaginatedProduct = Paginated<Product[], 'products'>;
