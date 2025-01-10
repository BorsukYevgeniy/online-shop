import { Transform, TransformFnParams } from 'class-transformer';

export function ToDate(): PropertyDecorator {
  return Transform(({ value }: TransformFnParams) => {
    return new Date(value);
  });
}
