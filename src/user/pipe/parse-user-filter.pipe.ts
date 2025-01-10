import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { UserFilter } from '../types/user-filter.type';
import { UserFilterDto } from '../dto/user-filter.dto';

@Injectable()
export class ParseUserFilterPipe
  implements PipeTransform<UserFilterDto, UserFilter>
{
  transform(value: UserFilterDto, metadata: ArgumentMetadata): UserFilter {
    const { minDate, maxDate }: UserFilterDto = value;

    if (minDate > maxDate) {
      throw new BadRequestException('Max date must be greater than min date');
    }

    return value;
  }
}
