export const enum UserDtoErrorMessages {
  InvalidNickname = 'Nickname must be from 3 to 15 characters in length',
  InvalidDate = 'Date must be in YYYY-MM-DD format',
  InvalidSortFields = 'Sorting is allowed only by "id", "isVerified", "role", "nickname", "createdAt" and "verifiedAt" fields',
}
