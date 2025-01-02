import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ProductFilter } from '../interface/product-filter.interface';

@Injectable()
export class ParseProductFilterPipe
  implements PipeTransform<ProductFilter, ProductFilter>
{
  transform(value: ProductFilter, metadata: ArgumentMetadata): ProductFilter {
    let { title, minPrice, maxPrice }: ProductFilter = value;

    minPrice = minPrice !== undefined ? Number(minPrice) : undefined;
    maxPrice = maxPrice !== undefined ? Number(maxPrice) : undefined;

    return { title, minPrice, maxPrice };
  }
}
