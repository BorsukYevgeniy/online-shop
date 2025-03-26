import { Order } from '../enum/order.enum';
import { IsOptional, IsEnum, IsString } from 'class-validator';

export class SortDto {
  @IsOptional()
  @IsString()
  @IsEnum(Order)
  readonly order?: Order = Order.DESC;
}
