import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { UserFilter } from '../types/user-filter.type';
import { UserFilterDto } from '../dto/user-filter.dto';

@Injectable()
export class ParseUserFilterPipe
  implements PipeTransform<UserFilterDto, UserFilter>
{
  transform(value: UserFilterDto, metadata: ArgumentMetadata): UserFilter {
    const { nickname, minDate, maxDate }: UserFilterDto = value;

    const newMinDate: Date = minDate ? new Date(minDate) : undefined;
    const newMaxDate: Date = maxDate ? new Date(maxDate) : undefined;

    const newFilter = { nickname, minDate: newMinDate, maxDate: newMaxDate };
    console.log(newFilter)

    return { nickname, minDate: newMinDate, maxDate: newMaxDate };
  }
}
