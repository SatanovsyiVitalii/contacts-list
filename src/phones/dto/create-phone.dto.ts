import {
  IsArray,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Phone } from '../phone.entity';

export class CreatePhoneDto {
  @IsString()
  @IsPhoneNumber('UA', {
    message: 'number must be a valid phone number. Example: "+380123456789"',
  })
  number: string;
}

export class CreatePhonesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @IsPhoneNumber('UA', {
    message:
      'numbers must be an array of phone numbers. Example: ["+380123456789"]',
  })
  phones: Phone[];
}
