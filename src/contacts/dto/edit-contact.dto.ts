import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsBoolean, IsOptional, IsString } from 'class-validator';
import { Phone } from 'src/phones/phone.entity';

export class EditContactDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  favorite: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @ArrayUnique()
  phones: Phone[];
}
