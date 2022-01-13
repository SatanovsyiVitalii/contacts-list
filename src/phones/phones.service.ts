import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import { CreatePhoneDto } from './dto/create-phone.dto';
import { Phone } from './phone.entity';
import { PhonesRepository } from './phones.repository';

@Injectable()
export class PhonesService {
  constructor(
    @InjectRepository(PhonesRepository)
    private phonesRepository: PhonesRepository,
  ) {}

  async getPhone(id: string): Promise<Phone> {
    const phone = await this.phonesRepository.findOne({
      relations: ['contact'],
      where: { id },
    });
    if (!phone) {
      throw new NotFoundException();
    }

    return phone;
  }

  async createPhone(createPhoneDto: CreatePhoneDto): Promise<Phone> {
    return this.phonesRepository.createPhone(createPhoneDto);
  }

  async getPhones(): Promise<Phone[]> {
    return this.phonesRepository.find();
  }

  async deletePhone(id: string): Promise<void> {
    const result = await this.phonesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Phone with ID ${id} not found`);
    }
  }

  arePhonesArraysTheSame(phones1: Phone[], phones2: Phone[]) {
    const phones1Prepared = phones1.map((_phone) => _phone.number);
    const phones2Prepared = phones2.map((_phone) => _phone.number);
    const currentPhones = _.sortBy(phones1Prepared, ['number']);
    const newPhones = _.sortBy(phones2Prepared, ['number']);
    return _.isEqual(newPhones, currentPhones);
  }

  async deletePhones(phones: Phone[]): Promise<void> {
    const deletePhones = phones.map((_phone) =>
      this.phonesRepository.delete(_phone),
    );
    await Promise.all(deletePhones);
  }
}
