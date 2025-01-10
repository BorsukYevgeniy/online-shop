import { Transform } from 'class-transformer';

export function Trim(): PropertyDecorator {
  return Transform(({ value }: { value: string }) => {
    if (typeof value !== 'string') {
      return value;
    }

    return value.trim();
  });
}
