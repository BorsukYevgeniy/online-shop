import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { UserFilter } from '../types/user-filter.type';
import { SearchUserDto } from '../dto/search-user.dto';

@Injectable()
export class ParseUserFilterPipe
  implements PipeTransform<SearchUserDto, UserFilter>
{
  transform(value: SearchUserDto, metadata: ArgumentMetadata): UserFilter {
    const { minDate, maxDate }: SearchUserDto = value;

    if (minDate > maxDate) {
      throw new BadRequestException('Max date must be greater than min date');
    }

    return value;
  }
}
