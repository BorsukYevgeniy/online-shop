import { Category } from '@prisma/client';
import { Paginated } from 'src/common/types/pagination.type';

export type PaginatedCategory = Paginated<Category[], 'categories'>;
