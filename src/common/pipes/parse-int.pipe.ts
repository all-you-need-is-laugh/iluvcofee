import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform (value: string, metadata: ArgumentMetadata): number {
    const parsed = Number(value);

    if (isNaN(parsed)) {
      throw new BadRequestException(`Wrong ${metadata.type} "${metadata.data}": ${value}`);
    }

    return parsed;
  }
}
