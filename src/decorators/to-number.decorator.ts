import { Transform, TransformFnParams } from 'class-transformer';

export function ToNumber(): PropertyDecorator {
  return Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return Number(value);
    }

    return value;
  });
}
