import { User } from '@prisma/client';
import { Paginated } from '../../common/types/pagination.type';

/**
 * Represents a user without the `verificationLink` field for security reasons.
 */
type UserNoVLink = Omit<User, 'verificationLink'>;

/**
 * Represents a user but without the `password` but with verification link.
 */
export type UserNoPassword = Omit<User, 'password'>;

/**
 * Represents a user with roles but without the `password` and `verificationLink` fields for security reasons.
 */
export type UserNoPasswordVLink = Omit<UserNoVLink, 'password'>;

/**
 * Represents a user with roles but without `verificationLink` ,`password` and `email` field for security reasons.
 */
export type UserNoCred = Omit<
  UserNoPasswordVLink,
  'email' | 'verificationLink'
>;

/**
 * Represents a users with pagination ,but without sensitive fields (`password`, `email` and `verificationLink`).
 */
export type PaginatedUserNoCreds = Paginated<UserNoCred[], 'users'>;
