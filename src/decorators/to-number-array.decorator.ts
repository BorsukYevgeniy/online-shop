import { Transform, TransformFnParams } from 'class-transformer';

export function ToNumberArray(): PropertyDecorator {
  return Transform(({ value }: TransformFnParams) => {
    if (Array.isArray(value)) {
      return value.map((v) => Number(v));
    }

    return value;
  });
}
