import { User } from '@prisma/client';

export type UserWithRoles = User & {
  roles: { id: number; value: string; description: string }[];
};

export type UserWithProductsAndRolesWithoutPassword = Omit<
  UserWithRoles,
  'password'
> & {
  products: {
    id: number;
    userId: number;
    description: string;
    title: string;
    price: number;
    images: string[];
  }[];
};

export type UsersWithProductsAndRolesWithoutPassword =
  UserWithProductsAndRolesWithoutPassword[];
