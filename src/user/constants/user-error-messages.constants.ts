export const UserErrorMessages = {
  UserNotFound: 'User not found',
  UserAlreadyExists: (field: string): string =>
    `User with this ${field} already exists`,
} as const;
