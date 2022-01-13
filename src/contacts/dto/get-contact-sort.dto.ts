import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { SortOptions } from '../sort-options';

export class GetContactSortDto {
  @IsOptional()
  @IsEnum(SortOptions)
  @IsNotEmpty()
  sort: SortOptions = SortOptions.ASC;
}
