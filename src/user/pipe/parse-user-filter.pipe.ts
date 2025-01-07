import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { RawUserFilter, UserFilter } from '../types/user-filter.type';

@Injectable()
export class ParseUserFilterPipe
  implements PipeTransform<RawUserFilter, UserFilter>
{
  transform(value: RawUserFilter, metadata: ArgumentMetadata): UserFilter {
    const { nickname, minDate, maxDate }: RawUserFilter = value;

    const newMinDate: Date = minDate ? new Date(minDate) : undefined;
    const newMaxDate: Date = maxDate ? new Date(maxDate) : undefined;

    return { nickname, minDate: newMinDate, maxDate: newMaxDate };
  }
}
