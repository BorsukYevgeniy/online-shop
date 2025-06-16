export const enum CategoryErrorMessages {
  CategoryNotFound = 'Category not found',
  CategoryAlreadyExists = 'Category already exists',

  InvalidName = 'Name must be from 3 to 50 characters length',
  InvalidDescription = 'Description must be from 10 to 150 characters length',
  InvalidSortFields = 'Sorting is allowed only by "name", "id" and "description" fields',
}
