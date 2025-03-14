import { Product, Category } from '@prisma/client';
import { Paginated } from 'src/types/pagination.type';

/*
  Respresents type Product with Category fields
*/
export type ProductCategory = Product & { categories: Category[] };

/**
 * Represents products with pagination
 */
export type PaginatedProducts = Paginated<Product, 'products'>;
