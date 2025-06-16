export const enum ProductErrorMessages {
  ProductNotFound = 'Product not found',

  InvalidTitle = 'Title must be from 3 to 100 characters length',
  InvalidDescription = 'Title must be from 10 to 500 characters length',
  InvalidPrice = 'Price must be greater or equalts than 0',
  InvalidSortFields = 'Sorting is allowed only by "title", "id", or "price" fields',
}
