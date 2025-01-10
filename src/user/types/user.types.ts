import { User } from '@prisma/client';

/**
 * Represents a user with their assigned roles.
 * Includes the `roles` field containing an array of role objects.
 */
export type UserRoles = User & {
  roles: {
    id: number;
    value: string;
    description: string;
  }[];
};

/**
 * Represents a user with roles but without the `password` field for security reasons.
 */
export type UserRolesNoPassword = Omit<UserRoles, 'password'>;

/**
 * Represents a user with roles but without `products` ,`password` and `email` field for security reasons.
 */
export type UserRolesNoProductsCreds = Omit<UserRolesNoPassword, 'email'>;

/**
 * Represents a user with roles and a list of products they own.
 * The `password` field is omitted for security reasons.
 */
export type UserProductsRolesNoPassword = Omit<UserRoles, 'password'> & {
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
export type UserProductsRolesNoCreds = Omit<
  UserProductsRolesNoPassword,
  'email'
>;
