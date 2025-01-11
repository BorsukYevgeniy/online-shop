import { Product, Category } from '@prisma/client';

/*
  Respresents type Product with Category fields
*/
export type ProductCategory = Product & { categories: Category[] };
