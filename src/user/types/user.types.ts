import { User } from '@prisma/client';
import { Paginated } from 'src/types/pagination.type';

/**
 * Represents a user with roles but without the `password` field for security reasons.
 */
export type UserNoPassword = Omit<User, 'password'>;

/**
 * Represents a user with roles but without `products` ,`password` and `email` field for security reasons.
 */
export type UserNoCred = Omit<UserNoPassword, 'email'>;

/**
 * Represents a user with roles and a list of products they own.
 * The `password` field is omitted for security reasons.
 */
export type UserProductNoPassword = Omit<User, 'password'> & {
  products: {
    id: number;
    userId: number;
    description: string;
    title: string;
    price: number;
  }[];
};

/**
 * Represents a user with roles and products, but without sensitive fields (`password` and `email`).
 */
export type UserProductNoCreds = Omit<UserProductNoPassword, 'email'>;

/**
 * Represents a users with products and pagination ,but without sensitive fields (`password` and `email`).
 */
export type PaginatedUserNoCreds = Paginated<UserNoCred, 'users'>;
