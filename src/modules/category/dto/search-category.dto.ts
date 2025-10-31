import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class SearchCategoryDto extends PartialType(
  OmitType(CreateCategoryDto, ['description']),
) {}
