import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreatePhoneDto } from './dto/create-phone.dto';
import { Phone } from './phone.entity';
import { PhonesService } from './phones.service';

@Controller('phones')
export class PhonesController {
  constructor(private phoneService: PhonesService) {}

  @Get()
  getPhones(): Promise<Phone[]> {
    return this.phoneService.getPhones();
  }

  @Get('/:id')
  getPhone(@Param('id') id: string) {
    return this.phoneService.getPhone(id);
  }

  @Post()
  createPhone(@Body() createPhoneDto: CreatePhoneDto): Promise<Phone> {
    return this.phoneService.createPhone(createPhoneDto);
  }

  @Delete('/:id')
  deletePhone(@Param('id') id: string): Promise<void> {
    return this.phoneService.deletePhone(id);
  }
}
