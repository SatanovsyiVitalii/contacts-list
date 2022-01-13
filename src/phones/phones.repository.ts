import { EntityRepository, Repository } from 'typeorm';
import { CreatePhoneDto, CreatePhonesDto } from './dto/create-phone.dto';
import { Phone } from './phone.entity';

@EntityRepository(Phone)
export class PhonesRepository extends Repository<Phone> {
  async createPhone(createPhoneDto: CreatePhoneDto): Promise<Phone> {
    const { number } = createPhoneDto;
    const phone = this.create({
      number,
    });
    await this.save(phone);
    return phone;
  }

  async createPhones(createPhonesDto: CreatePhonesDto): Promise<Phone[]> {
    const newPhones = createPhonesDto.phones.map((_phone: Phone) => {
      return this.createPhone(_phone);
    });
    return await Promise.all(newPhones);
  }
}
