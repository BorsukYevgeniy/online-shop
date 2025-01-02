import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { PaginationDto } from '../../dto/pagination.dto';

@Injectable()
export class ParsePaginationDtoPipe
  implements PipeTransform<PaginationDto, PaginationDto>
{
  transform(value: PaginationDto, metadata: ArgumentMetadata): PaginationDto {
    let { page, pageSize }: PaginationDto = value;

    page = Number(page ?? 1);
    pageSize = Number(pageSize ?? 10);

    return { page, pageSize };
  }
}
