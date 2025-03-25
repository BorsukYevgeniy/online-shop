import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { SearchUserDto } from '../dto/search-user.dto';

@Injectable()
export class ValidateUserFilterPipe
  implements PipeTransform<SearchUserDto, SearchUserDto>
{
  transform(value: SearchUserDto, metadata: ArgumentMetadata): SearchUserDto {
    const { minDate, maxDate }: SearchUserDto = value;

    if (minDate > maxDate) {
      throw new BadRequestException('Max date must be greater than min date');
    }

    return value;
  }
}
