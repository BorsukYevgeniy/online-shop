import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ProductFilterDto } from '../dto/product-filter.dto';

@Injectable()
export class ParseProductFilterPipe
  implements PipeTransform<ProductFilterDto, ProductFilterDto>
{
  transform(
    value: ProductFilterDto,
    metadata: ArgumentMetadata,
  ): ProductFilterDto {
    const { minPrice, maxPrice }: ProductFilterDto = value;

    if (maxPrice < minPrice) {
      throw new BadRequestException('Max price must be greater than min price');
    }

    return value;
  }
}
