import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../enum/order.enum';
import { IsOptional, IsEnum, IsString } from 'class-validator';

export class SortDto {
  @ApiProperty({
    type: String,
    enum: Order,
    enumName: 'Order',
    default: Order.DESC,
    description: 'In which order (ASCending or DESCending)',
    example: Order.ASC
  })
  @IsOptional()
  @IsString()
  @IsEnum(Order)
  readonly order?: Order = Order.DESC;
}
