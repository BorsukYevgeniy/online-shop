import { Category } from '@prisma/client';
import { Paginated } from '../../../common/types/pagination.type';

export type PaginatedCategory = Paginated<Category[], 'categories'>;
