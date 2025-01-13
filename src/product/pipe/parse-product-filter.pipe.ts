import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { SearchProductDto } from '../dto/search-product.dto';

@Injectable()
export class ParseProductDtoPipe
  implements PipeTransform<SearchProductDto, SearchProductDto>
{
  transform(
    value: SearchProductDto,
    metadata: ArgumentMetadata,
  ): SearchProductDto {
    const { minPrice, maxPrice }: SearchProductDto = value;

    if (maxPrice < minPrice) {
      throw new BadRequestException('Max price must be greater than min price');
    }

    return value;
  }
}
