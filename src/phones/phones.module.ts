import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhonesController } from './phones.controller';
import { PhonesRepository } from './phones.repository';
import { PhonesService } from './phones.service';

@Module({
  imports: [TypeOrmModule.forFeature([PhonesRepository])],
  controllers: [PhonesController],
  providers: [PhonesService],
  exports: [PhonesService],
})
export class PhonesModule {}
