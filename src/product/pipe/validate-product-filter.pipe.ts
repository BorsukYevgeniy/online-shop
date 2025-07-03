import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SearchProductDto } from '../dto/search-product.dto';

@Injectable()
export class ValidateProductDtoPipe
  implements PipeTransform<SearchProductDto, SearchProductDto>
{
  private readonly logger: Logger = new Logger(ValidateProductDtoPipe.name);

  transform(
    value: SearchProductDto,
    metadata: ArgumentMetadata,
  ): SearchProductDto {
    const { minPrice, maxPrice }: SearchProductDto = value;

    if (maxPrice < minPrice) {
      this.logger.warn(
        `Invalid price range: maxPrice (${maxPrice}) is less than minPrice (${minPrice}).`,
      );

      throw new BadRequestException('Max price must be greater than min price');
    }

    return value;
  }
}
