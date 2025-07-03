import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SearchUserDto } from '../dto/search-user.dto';

@Injectable()
export class ValidateUserFilterPipe
  implements PipeTransform<SearchUserDto, SearchUserDto>
{
  private readonly logger: Logger = new Logger(ValidateUserFilterPipe.name);

  transform(value: SearchUserDto, metadata: ArgumentMetadata): SearchUserDto {
    const { minDate, maxDate }: SearchUserDto = value;

    if (minDate > maxDate) {
      this.logger.warn(
        `Invalid date range: maxDate (${maxDate}) is less than minDate (${minDate}).`,
      );
      throw new BadRequestException('Max date must be greater than min date');
    }

    return value;
  }
}
