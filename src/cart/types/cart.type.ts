import { Cart, Product } from '@prisma/client';

export type CartProduct = Cart & { products: Product[] };
