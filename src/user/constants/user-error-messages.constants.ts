export const UserErrorMessages = {
  UserNotFound: 'User not found',
  UserAlreadyExists: (field: string): string =>
    `User with this ${field} already exists`,

  InvalidNickname: 'Nickname must from 3 to 15 characters lenght',
  InvalidDate: 'Date must in YYYY-MM-DD format',
  InvalidSortFields:
    'Sorting is allowed only by "id", "isVerified", "role", "nickname", "createdAt" and "verifiedAt" fields',
} as const;
