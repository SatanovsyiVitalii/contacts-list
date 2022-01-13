import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class GetContactsFilterDto {
  @IsOptional()
  @IsNotEmpty()
  search?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @Transform((o) => {
    if (o.value === 'true') return true;
    if (o.value === 'false') return false;
    return o;
  })
  favorites?: boolean;
}
